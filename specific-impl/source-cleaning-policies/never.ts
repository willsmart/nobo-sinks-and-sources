import SourceCleaningPolicy_forTheWorld from '../../interfaces/sinks-and-sources/cleaning-policy';

const policy: SourceCleaningPolicy_forTheWorld = {
  queueCleanup() {},
  cancelCleanup(): void {},
};
export default policy;
