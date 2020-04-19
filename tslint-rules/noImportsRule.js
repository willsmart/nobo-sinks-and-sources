"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var Lint = require("tslint");
var Rule = /** @class */ (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new NoImportsWalker(sourceFile, this.getOptions()));
    };
    Rule.FAILURE_STRING = 'import statement forbidden';
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var locations = ['interfaces', 'general-impl', 'impl', 'specific-impl'];
// The walker takes care of all the work.
var NoImportsWalker = /** @class */ (function (_super) {
    __extends(NoImportsWalker, _super);
    function NoImportsWalker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NoImportsWalker.prototype.visitImportDeclaration = function (node) {
        var _loop_1 = function () {
            var sourceFile = this_1.getSourceFile(), sourceFileName = sourceFile.fileName, importedFileName = node.moduleSpecifier.getText(), sourceLocationIndex = locations.findIndex(function (rx) { return new RegExp("/" + rx + "/").test(sourceFileName); }), importedLocationIndex = locations.findIndex(function (rx) { return new RegExp(".(?:/..)*/" + rx + "/").test(importedFileName); });
            if (sourceLocationIndex === -1 || importedLocationIndex === -1)
                return "break";
            if (importedLocationIndex <= sourceLocationIndex)
                return "break";
            switch (locations[sourceLocationIndex]) {
                case 'interfaces':
                    this_1.addFailure(this_1.createFailure(node.getStart(), node.getWidth(), 'importing an impl resource from an interface file is forbidden'));
                    break;
                default:
                    this_1.addFailure(this_1.createFailure(node.getStart(), node.getWidth(), 'importing a specific impl resource from a more general impl file is forbidden'));
                    break;
            }
        };
        var this_1 = this;
        do {
            var state_1 = _loop_1();
            if (state_1 === "break")
                break;
        } while (false);
        // call the base version of this visitor to actually parse this node
        _super.prototype.visitImportDeclaration.call(this, node);
    };
    return NoImportsWalker;
}(Lint.RuleWalker));
function nocircle() {
    var seen = new Set();
    return function (k, v) {
        if (k === 'parent')
            return null;
        if (typeof v === 'object' && seen.has(v))
            return '◉';
        seen.add(v);
        return v;
    };
}
