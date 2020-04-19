export default CallbackRequester;
export class CallbackRequester<T> {
  callbacks:
    | {
        resolve: (value: T) => void;
        reject: (error: Error) => void;
      }
    | undefined;

  existingPromise: Promise<T> | undefined;
  get promise(): Promise<T> {
    return (
      this.existingPromise ||
      (this.existingPromise = new Promise<T>((resolve, reject) => {
        this.callbacks = { resolve, reject };
      }))
    );
  }

  resolve(value: T) {
    const { callbacks } = this;
    this.callbacks = undefined;
    if (!callbacks) throw new Error('Request is already resolved');
    callbacks.resolve(value);
  }

  reject(error: Error) {
    const { callbacks } = this;
    this.callbacks = undefined;
    callbacks?.reject(error);
  }

  renewIfFulfilled() {
    const { existingPromise, callbacks } = this;
    if (existingPromise && !callbacks) {
      this.existingPromise = undefined;
    }
  }

  clear():
    | {
        resolve: (value: T) => void;
        reject: (error: Error) => void;
      }
    | undefined {
    const { callbacks } = this;
    this.callbacks = undefined;
    this.existingPromise = undefined;
    return callbacks;
  }
}

export class DependentCallbackRequester<T> {
  callbacks:
    | {
        reject: (error: Error) => void;
      }
    | undefined;

  _existingPromise: Promise<T> | undefined;
  basePromise: Promise<T> | undefined;
  parent: CallbackRequester<T>;

  constructor(parent: CallbackRequester<T>) {
    this.parent = parent;
  }

  get existingPromise(): Promise<T> | undefined {
    if (this.parent.existingPromise !== this.basePromise) this._existingPromise = this.basePromise = undefined;
    return this._existingPromise;
  }

  get promise(): Promise<T> {
    const ret = this.existingPromise;
    if (ret) return ret;

    const base = (this.basePromise = this.parent.promise);
    return (this._existingPromise = new Promise<T>(async (resolve, reject) => {
      this.callbacks = { reject };
      try {
        const value = await base;
        this.callbacks = undefined;
        resolve(value);
      } catch (err) {
        this.callbacks = undefined;
        reject(err);
      }
    }));
  }

  cancel(error: Error = new Error('Cancelled')) {
    const { callbacks } = this;
    this.callbacks = undefined;
    callbacks?.reject(error);
  }
}
