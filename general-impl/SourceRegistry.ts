import {
  SourceRegistry_forTheWorld,
  SourceName,
  SourceGenerator_forTheWorld as SourceGenerator,
  ValueSource_asSeenByIts_owner as ValueSource,
  ValueSink_asSeenByIts_source,
} from '../interfaces/sinks-and-sources/sinks-and-sources';
import SourceCleaningPolicy from '../interfaces/sinks-and-sources/cleaning-policy';

export default class SourceRegistry<T> implements SourceRegistry_forTheWorld<T> {
  generator: SourceGenerator<T>;
  cleaningPolicy: SourceCleaningPolicy;
  sources: { [key: string]: ValueSource<T> } = {};

  constructor({ generator, cleaningPolicy }: { generator: SourceGenerator<T>; cleaningPolicy: SourceCleaningPolicy }) {
    this.generator = generator;
    this.cleaningPolicy = cleaningPolicy;
  }

  has(name: SourceName<T>): boolean {
    return name.toString() in this.sources || this.generator.has(name);
  }

  attachSink({
    source: sourceName,
    sink,
  }: {
    source: SourceName<T>;
    sink: ValueSink_asSeenByIts_source<T>;
  }): Promise<void> | undefined {
    const registry = this,
      { generator, sources, cleaningPolicy } = registry;
    let source = sources[sourceName.toString()];
    if (source) {
      cleaningPolicy.cancelCleanup(sourceName.toString());
    } else
      source = sources[sourceName.toString()] = generator.create({
        source: sourceName,
        owner: {
          didDetachLastSink: () => {
            cleaningPolicy.queueCleanup({
              key: sourceName.toString(),
              cleanupCallback: async () => {
                delete sources[sourceName.toString()];
                await source.prepareToBeDestroyed();
              },
            });
            return undefined;
          },
        },
      });

    return source.attachSink(sink);
  }
}
