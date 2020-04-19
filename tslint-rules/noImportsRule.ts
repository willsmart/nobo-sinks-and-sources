import * as Lint from 'tslint';
import * as ts from 'typescript';

export class Rule extends Lint.Rules.AbstractRule {
  public static FAILURE_STRING = 'import statement forbidden';

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new NoImportsWalker(sourceFile, this.getOptions()));
  }
}

const locations = ['interfaces', 'general-impl', 'impl', 'specific-impl'];

// The walker takes care of all the work.
class NoImportsWalker extends Lint.RuleWalker {
  public visitImportDeclaration(node: ts.ImportDeclaration) {
    do {
      const sourceFile = this.getSourceFile(),
        { fileName: sourceFileName } = sourceFile,
        importedFileName = node.moduleSpecifier.getText(),
        sourceLocationIndex = locations.findIndex((rx) => new RegExp(`/${rx}/`).test(sourceFileName)),
        importedLocationIndex = locations.findIndex((rx) => new RegExp(`\.(?:/\.\.)*/${rx}/`).test(importedFileName));

      if (sourceLocationIndex === -1 || importedLocationIndex === -1) break;
      if (importedLocationIndex <= sourceLocationIndex) break;

      switch (locations[sourceLocationIndex]) {
        case 'interfaces':
          this.addFailure(
            this.createFailure(
              node.getStart(),
              node.getWidth(),
              'importing an impl resource from an interface file is forbidden'
            )
          );
          break;
        default:
          this.addFailure(
            this.createFailure(
              node.getStart(),
              node.getWidth(),
              'importing a specific impl resource from a more general impl file is forbidden'
            )
          );
          break;
      }
    } while (false);

    // call the base version of this visitor to actually parse this node
    super.visitImportDeclaration(node);
  }
}

function nocircle(): (v: string, k: any) => any {
  const seen = new Set<any>();
  return (k: string, v: any) => {
    if (k === 'parent') return null;
    if (typeof v === 'object' && seen.has(v)) return '◉';
    seen.add(v);
    return v;
  };
}
