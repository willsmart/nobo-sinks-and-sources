import { HandlePromise } from '../../interfaces/general/promise-handler';
import SourceCleaningPolicy_forTheWorld from '../../interfaces/sinks-and-sources/cleaning-policy';

export default ({ handlePromise }: { handlePromise: HandlePromise }): SourceCleaningPolicy_forTheWorld => ({
  queueCleanup({ cleanupCallback }: { cleanupCallback: () => Promise<void> }) {
    handlePromise(cleanupCallback());
  },
  cancelCleanup(_name: string): void {},
});
