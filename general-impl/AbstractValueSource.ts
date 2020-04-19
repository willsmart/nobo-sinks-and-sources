import {
  AbstractValue_constructorArgs,
  ValueSink_asSeenByIts_source as ValueSink,
  AbstractValueSource_asSeenByIts_subclass,
  ValueSource_asSeenByIts_abstractBase,
  ValueSourceOwner_asSeenByIts_sources,
  ValueSource_asSeenByIts_sinks,
  ValueSource_asSeenByIts_owner,
} from '../interfaces/sinks-and-sources/sinks-and-sources';
import { CallbackRequester, DependentCallbackRequester } from './CallbackRequester';

export default abstract class AbstractValueSource<T> {
  baseValidationRequest = new CallbackRequester<void>();
  sinkValidationRequests: DependentCallbackRequester<void>[] = [];
  baseSetValueRequest = new CallbackRequester<void>();
  sinkSetValueRequests: DependentCallbackRequester<void>[] = [];
  setValueRequests: CallbackRequester<void>[] = [];
  cachedValue: T;
  valid: boolean;
  sinks: Map<
    ValueSink<T>,
    {
      validationRequest: DependentCallbackRequester<void>;
      setValueRequest: DependentCallbackRequester<void>;
    }
  > = new Map();
  newValueQueue: T[] = [];
  newValueCallbacks:
    | {
        resolve: (value: void) => void;
        reject: (error: Error) => void;
      }
    | undefined;
  waitingForSetValue = false;

  owner: ValueSourceOwner_asSeenByIts_sources<T>;

  constructor({ interfaceExchange, value, valid }: AbstractValue_constructorArgs<T>) {
    this.cachedValue = value;
    this.valid = valid;
    this.owner = interfaceExchange.owner;

    interfaceExchange.source = this.interfaceForOwner;
  }

  private _verifyPrivateInterfaces(): AbstractValueSource_asSeenByIts_subclass<T> &
    ValueSource_asSeenByIts_abstractBase<T> {
    return {
      subclassValueWasInvalidated: this.subclassValueWasInvalidated,
      subclassHasNewValue: this.subclassHasNewValue,
      validateInSubclass: this.validateInSubclass,
      setValuesInSubclass: this.setValuesInSubclass,
    };
  }

  // --> subclass
  protected abstract validateInSubclass(): Promise<void> | undefined;
  protected abstract setValuesInSubclass(v: T[]): Promise<void> | undefined;

  // <-- subclass
  protected subclassValueWasInvalidated() {
    const { sinks } = this;
    this.valid = false;
    sinks.forEach((_, sink) => {
      sink.sourceHasInvalidatedValue?.(sink.key);
    });
    this.baseValidationRequest?.renewIfFulfilled();
  }

  protected subclassHasNewValue(value: T) {
    const { sinks } = this;
    this.valid = true;
    this.cachedValue = value;
    sinks.forEach((_, sink) => {
      sink.sourceHasNewValue?.({ value, key: sink.key });
    });

    this.baseValidationRequest?.resolve();
  }

  // <-- Sink
  private interfaceForSink(sink: ValueSink<T>): ValueSource_asSeenByIts_sinks<T> {
    return {
      detach: this.detach.bind(this, sink),
      setValue: this.setValue.bind(this, sink),
      validate: this.validate.bind(this, sink),
    };
  }
  private detach(sink: ValueSink<T>): Promise<void> | undefined {
    const { sinks, owner, valid } = this,
      sinkInfo = sinks.get(sink);
    if (!sinkInfo) throw new Error('Unkown sink');
    const { validationRequest, setValueRequest } = sinkInfo;

    if (valid) sink.sourceHasInvalidatedValue?.(sink.key);

    validationRequest.cancel();
    setValueRequest.cancel();

    sinks.delete(sink);

    return sinks.size > 0 ? undefined : owner.didDetachLastSink?.();
  }

  private setValue(sink: ValueSink<T>, v: T): Promise<void> | undefined {
    const source = this,
      { sinks, owner, valid, baseSetValueRequest, waitingForSetValue } = source,
      sinkInfo = sinks.get(sink);
    if (!sinkInfo) throw new Error('Unkown sink');

    this.newValueQueue.push(v);

    const { setValueRequest } = sinkInfo;
    if (setValueRequest.existingPromise) return setValueRequest.existingPromise;
    if (!waitingForSetValue) this.setValuesInSubclassAndWait();
    return setValueRequest.promise;
  }

  setValuesInSubclassAndWait(): Promise<void> | undefined {
    if (this.waitingForSetValue) return;

    const source = this,
      { sinks, owner, valid, baseSetValueRequest, waitingForSetValue } = source;

    const newValues = this.newValueQueue;
    this.newValueQueue = [];

    const callbacks = baseSetValueRequest.clear();
    const promise = source.setValuesInSubclass(newValues);
    if (!promise) {
      callbacks?.resolve();
      return;
    } else {
      this.newValueCallbacks = callbacks;
      this.waitingForSetValue = true;
      return promise.then(
        (_) => handleResult(),
        (error) => handleResult(error)
      );
    }

    async function handleResult(error?: Error) {
      while (true) {
        const callbacks = source.newValueCallbacks;
        if (error) callbacks?.reject(error);
        else callbacks?.resolve();
        source.newValueCallbacks = undefined;

        const newValues = source.newValueQueue;
        if (!newValues.length) {
          source.waitingForSetValue = false;
          return;
        }

        source.newValueQueue = [];

        source.newValueCallbacks = baseSetValueRequest.clear();
        const promise = source.setValuesInSubclass(newValues);
        if (!promise) error = undefined;
        else {
          try {
            await promise;
            error = undefined;
          } catch (err) {
            error = err;
          }
        }
      }
    }
  }

  validate(sink: ValueSink<T>): Promise<void> | undefined {
    const source = this;

    if (this.valid) return;

    const sinkInfo = this.sinks.get(sink);
    if (!sinkInfo) throw new Error('Unkown sink');

    if (!this.baseValidationRequest.existingPromise) source.validateInSubclass();

    return sinkInfo.validationRequest.promise;
  }

  // <-- Owner
  private interfaceForOwner: ValueSource_asSeenByIts_owner<T> = {
    attachSink: this.attachSink.bind(this),
    prepareToBeDestroyed: this.prepareToBeDestroyed.bind(this),
  };
  private async attachSink(sink: ValueSink<T>) {
    const { valid, cachedValue, sinks } = this;

    sinks.set(sink, {
      validationRequest: new DependentCallbackRequester<void>(this.baseValidationRequest),
      setValueRequest: new DependentCallbackRequester<void>(this.baseSetValueRequest),
    });

    await sink.didAttachSource?.({
      source: this.interfaceForSink(sink),
      key: sink.key,
    });

    if (!valid) sink.sourceHasInvalidatedValue?.(sink.key);
    else sink.sourceHasNewValue?.({ value: cachedValue, key: sink.key });
  }

  private prepareToBeDestroyed() {
    const { sinks } = this;
    this.valid = false;
    sinks.forEach((_, sink) => {
      sink.sourceHasInvalidatedValue?.(sink.key);
    });

    this.baseSetValueRequest.reject(new Error('Source destroyed'));
    this.baseValidationRequest.reject(new Error('Source destroyed'));

    sinks.clear();
  }
}
