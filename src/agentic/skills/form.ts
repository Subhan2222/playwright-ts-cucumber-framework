import { createReadOnlyCapabilitySkill, type ReadOnlyCapabilityPort } from './read-only-capability';

export type FormSkillPort = ReadOnlyCapabilityPort;

export function createFormSkill(port: FormSkillPort) {
  return createReadOnlyCapabilitySkill(
    'form.inspect',
    'Inspect an explicitly approved form state without submitting or editing it.',
    port
  );
}
