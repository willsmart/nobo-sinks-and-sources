import {
  SourceGenerator_forTheWorld as SourceGenerator,
  SourceName,
  ValueSource_asSeenByIts_owner as ValueSource,
  CollectiveSourceGenerator_forTheWorld,
  ValueSourceOwner_asSeenByIts_sources,
} from '../../interfaces/sinks-and-sources/sinks-and-sources';

export class CollectiveSourceGenerator<T> implements CollectiveSourceGenerator_forTheWorld<T> {
  static create<T>(generators: { [key: string]: SourceGenerator<T> }): CollectiveSourceGenerator<T> {
    const collectiveGenerator = new CollectiveSourceGenerator<T>();
    Object.assign(collectiveGenerator.generators, generators);
    return collectiveGenerator;
  }

  generators: { [key: string]: SourceGenerator<T> } = {};

  has(source: SourceName<T>): boolean {
    return Object.values(this.generators).some((generator) => generator.has(source));
  }
  create(arg: { source: SourceName<T>; owner: ValueSourceOwner_asSeenByIts_sources<T> }): ValueSource<T> {
    const { source } = arg,
      generator = Object.values(this.generators).find((generator) => generator.has(source));
    if (!generator) throw new Error(`No source generator found for ${source}`);
    return generator.create(arg);
  }
}
