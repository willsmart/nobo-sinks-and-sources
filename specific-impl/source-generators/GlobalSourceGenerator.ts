import {
  SourceGenerator_forTheWorld,
  SourceName,
  ValueSourceOwner_asSeenByIts_sources,
  ValueSource_asSeenByIts_owner,
  ValueSink_asSeenByIts_source,
} from '../../interfaces/sinks-and-sources/sinks-and-sources';
import { Type } from '../../interfaces/general/type';

class GlobalSourceGenerator<T> implements SourceGenerator_forTheWorld<T> {
  type: Type<T>;
  keyRegex: RegExp;
  constructor({ type }: { type: Type<T> }) {
    this.type = type;
    this.keyRegex = new RegExp(`^global-${type.abbrev}_`);
  }

  has(source: SourceName<T>): boolean {
    return this.keyRegex.test(source.toString());
  }
  create(_: {
    source: SourceName<T>;
    owner: ValueSourceOwner_asSeenByIts_sources<T>;
  }): ValueSource_asSeenByIts_owner<T> {
    return {
      async attachSink(sink: ValueSink_asSeenByIts_source<T>) {},
      prepareToBeDestroyed() {},
    };
  }
}
