// interface
import { StandardSourceRegistries_forTheWorld } from '../interfaces/sinks-and-sources/standard-registries';

// implementation
import SourceRegistry from '../general-impl/SourceRegistry';
import {
  SourceGenerator_forTheWorld,
  SourceRegistry_forTheWorld,
} from '../interfaces/sinks-and-sources/sinks-and-sources';
import { anyValue } from '../interfaces/general/any';
import SourceCleaningPolicy_forTheWorld from '../interfaces/sinks-and-sources/cleaning-policy';

export default class StandardSourceRegistries implements StandardSourceRegistries_forTheWorld {
  optStrings: SourceRegistry<string | undefined>;
  strings: SourceRegistry<string>;
  optNumbers: SourceRegistry<number | undefined>;
  numbers: SourceRegistry<number>;
  htmlElements: SourceRegistry<HTMLElement>;
  all: SourceRegistry_forTheWorld<anyValue>;

  constructor() {
    (this.optStrings = new SourceRegistry<string | undefined>({generator:})),
      (this.strings = new SourceRegistry<string>(arg)),
      (this.optNumbers = new SourceRegistry<number | undefined>(arg)),
      (this.numbers = new SourceRegistry<number>(arg)),
      (this.htmlElements = new SourceRegistry<HTMLElement>(arg));
  }

}
