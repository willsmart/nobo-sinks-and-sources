import { SinksAndSourcesSingleton_forTheWorld } from '../interfaces/sinks-and-sources/singleton';
import {
  SourceGenerator_forTheWorld,
  SourceRegistry_forTheWorld,
} from '../interfaces/sinks-and-sources/sinks-and-sources';
import {
  HandlePromise,
  PromiseOrPromiseGenerator,
  PromiseHandlerOwner_asSeenByIts_promiseHandlers,
} from '../interfaces/general/promise-handler';
import SourceCleaningPolicy from '../interfaces/sinks-and-sources/cleaning-policy';
import { generalSingleton } from '../interfaces/general/singleton';
import SourceRegistry from '../general-impl/SourceRegistry';
import DelayedCleaningPolicy from './source-cleaning-policies/DelayedCleaningPolicy';

export class SinksAndSourcesSingleton implements SinksAndSourcesSingleton_forTheWorld {
  createSourceRegistry<T>({
    sourceGenerator: generator,
    SourceCleaningPolicy: cleaningPolicy,
  }: {
    sourceGenerator: SourceGenerator_forTheWorld<T>;
    SourceCleaningPolicy: SourceCleaningPolicy;
  }): SourceRegistry_forTheWorld<T> {
    return new SourceRegistry<T>({ generator, cleaningPolicy });
  }

  createSourceCleaningPolicy({
    handlePromise,
    delayMs,
    sliceMs,
  }: {
    handlePromise: HandlePromise;
    delayMs: number;
    sliceMs: number;
  }): SourceCleaningPolicy {
    return new DelayedCleaningPolicy({
      handlePromise: handlePromise || generalSingleton.handlePromise,
      delayMs,
      sliceMs,
    });
  }
}

export var sinksAndSourcesSingleton = new SinksAndSourcesSingleton();
