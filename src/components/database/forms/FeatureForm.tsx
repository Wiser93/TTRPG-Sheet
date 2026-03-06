import { useState } from 'react';
import { LabeledInput, LabeledSelect, LabeledTextarea } from '@/components/ui/FormField';
import type { Feature, ActionType } from '@/types/game';

const ACTION_TYPE_OPTIONS = [
  { value: '',             label: '— None (informational) —' },
  { value: 'action',       label: 'Action' },
  { value: 'bonus_action', label: 'Bonus Action' },
  { value: 'reaction',     label: 'Reaction' },
  { value: 'passive',      label: 'Passive' },
];

const RECHARGE_OPTIONS = [
  { value: 'short_rest', label: 'Short Rest' },
  { value: 'long_rest',  label: 'Long Rest' },
  { value: 'dawn',       label: 'Dawn' },
  { value: 'never',      label: 'Never (single use)' },
];

const SOURCE_TYPE_OPTIONS = [
  { value: '',           label: '— None —' },
  { value: 'class',      label: 'Class' },
  { value: 'subclass',   label: 'Subclass' },
  { value: 'background', label: 'Background' },
  { value: 'feat',       label: 'Feat' },
  { value: 'species',    label: 'Species' },
];

type Recharge = 'short_rest' | 'long_rest' | 'dawn' | 'never';

interface Props {
  initial?: Partial<Feature>;
  onSave: (feature: Omit<Feature, 'id'>) => void;
  isSaving?: boolean;
}

export function FeatureForm({ initial, onSave, isSaving }: Props) {
  // Local string for tags so user can type commas without them being eaten
  const [tagsText, setTagsText] = useState((initial?.tags ?? []).join(', '));

  const [f, setF] = useState<Omit<Feature, 'id'>>({
    name:        initial?.name        ?? '',
    description: initial?.description ?? '',
    actionType:  initial?.actionType,
    cost:        initial?.cost        ?? '',
    tags:        initial?.tags        ?? [],
    sourceType:  initial?.sourceType,
    sourceId:    initial?.sourceId    ?? '',
    uses:        initial?.uses,
  });

  function patch(changes: Partial<Omit<Feature, 'id'>>) {
    setF(prev => ({ ...prev, ...changes }));
  }

  function handleSave() {
    if (!f.name.trim()) return alert('Feature name is required.');
    onSave({
      ...f,
      cost: f.cost?.trim() || undefined,
      sourceId: f.sourceId?.trim() || undefined,
      sourceType: f.sourceType || undefined,
      actionType: (f.actionType || undefined) as ActionType | undefined,
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      <LabeledInput label="Name *" value={f.name}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ name: e.target.value })}
        placeholder="e.g. Riptide Step" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <LabeledSelect label="Action Type" value={f.actionType ?? ''}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            patch({ actionType: (e.target.value || undefined) as ActionType | undefined })}
          options={ACTION_TYPE_OPTIONS} />
        <LabeledInput label="Cost" value={f.cost ?? ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ cost: e.target.value })}
          placeholder="e.g. 1 EC, 1 use, free" />
      </div>

      <LabeledTextarea label="Description *" value={f.description} rows={5}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => patch({ description: e.target.value })}
        placeholder="Describe what this feature does. Include trigger, effect, range, duration..." />

      {/* Uses */}
      <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 6, padding: 10 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Limited Uses (optional)
        </p>
        {f.uses ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <LabeledInput label="Max uses" type="number" min={1}
                value={f.uses.max.type === 'flat' ? String(f.uses.max.value) : '1'}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  patch({ uses: { ...f.uses!, max: { type: 'flat', value: Math.max(1, Number(e.target.value)) } } })} />
              <LabeledSelect label="Recharge on" value={f.uses.rechargeOn}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  patch({ uses: { ...f.uses!, rechargeOn: e.target.value as Recharge } })}
                options={RECHARGE_OPTIONS} />
            </div>
            <button className="btn btn-ghost" style={{ fontSize: 12, alignSelf: 'flex-start' }}
              onClick={() => patch({ uses: undefined })}>
              Remove uses limit
            </button>
          </div>
        ) : (
          <button className="btn btn-ghost" style={{ fontSize: 12 }}
            onClick={() => patch({ uses: { max: { type: 'flat', value: 1 }, rechargeOn: 'long_rest' } })}>
            + Add uses limit
          </button>
        )}
      </div>

      {/* Source */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <LabeledSelect label="Source type" value={f.sourceType ?? ''}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            patch({ sourceType: (e.target.value || undefined) as Feature['sourceType'] })}
          options={SOURCE_TYPE_OPTIONS} />
        <LabeledInput label="Source ID (optional)" value={f.sourceId ?? ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ sourceId: e.target.value })}
          placeholder="e.g. elemental-shaper" />
      </div>

      {/* Tags — use local string so commas can be typed; flush to array on blur */}
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>
          Tags (comma-separated)
        </label>
        <input
          value={tagsText}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTagsText(e.target.value)}
          onBlur={() => patch({ tags: tagsText.split(',').map(t => t.trim()).filter(Boolean) })}
          placeholder="e.g. water, reaction, elemental, combat"
        />
        <p style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 3 }}>
          Press Tab or click away to apply. Current: {f.tags?.length ? f.tags.join(', ') : '(none)'}
        </p>
      </div>

      <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}
        style={{ marginTop: 4 }}>
        {isSaving ? 'Saving…' : 'Save Feature'}
      </button>
    </div>
  );
}
