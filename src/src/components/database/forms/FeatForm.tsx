import { useState } from 'react';
import type { Feat } from '@/types/game';
import { LabeledInput, LabeledTextarea, FormSection } from '@/components/ui/FormField';
import { FeatureEditor } from '@/components/ui/FeatureEditor';

interface FeatFormProps {
  initial?: Partial<Feat>;
  onSave: (feat: Omit<Feat, 'id'>) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function FeatForm({ initial, onSave, onCancel, isSaving }: FeatFormProps) {
  const [feat, setFeat] = useState<Partial<Feat>>(() => ({
    name: '',
    description: '',
    prerequisites: '',
    repeatable: false,
    features: [],
    choices: [],
    ...initial,
  }));

  const patch = (changes: Partial<Feat>) => setFeat(prev => ({ ...prev, ...changes }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!feat.name?.trim()) return;
    onSave({
      name: feat.name!.trim(),
      description: feat.description ?? '',
      prerequisites: feat.prerequisites || undefined,
      repeatable: feat.repeatable,
      features: feat.features ?? [],
      choices: feat.choices ?? [],
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <FormSection title="Identity">
        <LabeledInput label="Name" value={feat.name ?? ''} onChange={e => patch({ name: e.target.value })} required placeholder="e.g. Alert" />
        <LabeledTextarea label="Description" value={feat.description ?? ''} rows={4}
          onChange={e => patch({ description: e.target.value })} placeholder="What does this feat do?" required />
        <LabeledInput label="Prerequisites" value={feat.prerequisites ?? ''} onChange={e => patch({ prerequisites: e.target.value })}
          placeholder="e.g. Spellcasting feature (optional)" />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
          <input type="checkbox" checked={feat.repeatable ?? false} onChange={e => patch({ repeatable: e.target.checked })}
            style={{ accentColor: 'var(--accent)' }} />
          Can be taken more than once
        </label>
      </FormSection>

      <FormSection title="Features">
        <FeatureEditor features={feat.features ?? []} onChange={features => patch({ features })} />
      </FormSection>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8 }}>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={isSaving || !feat.name?.trim()}>
          {isSaving ? 'Saving…' : 'Save Feat'}
        </button>
      </div>
    </form>
  );
}
