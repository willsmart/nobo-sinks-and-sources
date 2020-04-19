import { ValueRef_forTheWorld as ValueSink } from '../../interfaces/sinks-and-sources/sinks-and-sources';
import { HTMLElementSinkManager_asSeenByIts_childs as HTMLElementSinkManager } from './dom-element';
import sourceRegistries, {
  HTMLElementName,
  NumberName,
  OptStringName,
} from '../../interfaces/sinks-and-sources/standard-registries';

export class DomAttributeSinkManager {
  elementSinkManager: HTMLElementSinkManager;
  name: string;
  private value?: string;
  private sinks: {
    value: ValueSink<string | undefined>;
  };

  constructor({ elementSinkManager, name }: { elementSinkManager: HTMLElementSinkManager; name: string }) {
    const me = this;
    this.elementSinkManager = elementSinkManager;
    this.name = name;

    this.sinks = {
      value: {
        sourceHasNewValue(v: string | undefined): undefined {
          me.value = v;
          me.refresh();
          return;
        },
      },
    };
  }

  kill() {
    this.sinks.value.detachFromSource && this.sinks.value.detachFromSource();
  }

  refresh() {
    const { element, name, value } = this;
    if (!element || name === undefined) return;
    if (value !== undefined) element.setAttribute(name, value);
    else element.removeAttribute(name);
  }
}
