import {
  Value_abstract,
  Value_abstract_constructorArgPassback,
} from '../../interfaces/sinks-and-sources/value--abstract';

export type ConstantValue_constructorArgPassback<T> = Value_abstract_constructorArgPassback<T>;

export class ConstantValue<T> extends Value_abstract<T> {
  constructor({ interfacePassback, value }: { interfacePassback: ConstantValue_constructorArgPassback<T>; value: T }) {
    super({ interfacePassback, value, valid: true });
  }

  protected valueFromSubclass(): undefined {
    return undefined;
  }

  setValuesInSubclass(): undefined {
    return undefined;
  }
}
