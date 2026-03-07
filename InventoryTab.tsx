import { useState } from 'react';
import type { Feature, ActionType } from '@/types/game';
import { LabeledInput, LabeledSelect, LabeledTextarea } from './FormField';

interface FeatureEditorProps {
  features: Feature[];
  onChange: (features: Feature[]) => void;
}

const BLANK_FEATURE = (): Feature => ({
  id: crypto.randomUUID(),
  name: '',
  description: '',
  tags: [],
});

const ACTION_TYPE_LABELS: Record<ActionType, string> = {
  action:       'Action',
  bonus_action: 'Bonus',
  reaction:     'Reaction',
  passive:      'Passive',
};

const ACTION_TYPE_COLORS: Record<ActionType, string> = {
  action:       '#e06c75',
  bonus_action: '#d19a66',
  reaction:     '#61afef',
  passive:      '#98c379',
};

export function FeatureEditor({ features, onChange }: FeatureEditorProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function add() {
    const f = BLANK_FEATURE();
    onChange([...features, f]);
    setExpandedId(f.id);
  }

  function update(id: string, patch: Partial<Feature>) {
    onChange(features.map(f => f.id === id ? { ...f, ...patch } : f));
  }

  function remove(id: string) {
    onChange(features.filter(f => f.id !== id));
    if (expandedId === id) setExpandedId(null);
  }

  function move(id: string, dir: -1 | 1) {
    const idx = features.findIndex(f => f.id === id);
    if (idx < 0) return;
    const next = [...features];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    onChange(next);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {features.length === 0 && (
        <p style={{ fontSize: 12, color: 'var(--text-2)', fontStyle: 'italic' }}>No features added yet.</p>
      )}

      {features.map((f, idx) => (
        <div key={f.id} style={{ border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: 'var(--bg-2)' }}>
            <button type="button" onClick={() => move(f.id, -1)} disabled={idx === 0}
              style={{ fontSize: 12, color: 'var(--text-2)', opacity: idx === 0 ? 0.3 : 1 }}>↑</button>
            <button type="button" onClick={() => move(f.id, 1)} disabled={idx === features.length - 1}
              style={{ fontSize: 12, color: 'var(--text-2)', opacity: idx === features.length - 1 ? 0.3 : 1 }}>↓</button>
            <button
              type="button"
              onClick={() => setExpandedId(expandedId === f.id ? null : f.id)}
              style={{ flex: 1, textAlign: 'left', fontSize: 13, fontWeight: f.name ? 600 : 400, color: f.name ? 'var(--text-0)' : 'var(--text-2)' }}
            >
              {f.name || '(unnamed feature)'}
              {f.actionType && (
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
                  background: ACTION_TYPE_COLORS[f.actionType],
                  color: '#fff', borderRadius: 3, padding: '1px 5px', marginLeft: 6,
                }}>
                  {ACTION_TYPE_LABELS[f.actionType]}
                </span>
              )}
            </button>
            <button type="button" onClick={() => remove(f.id)}
              style={{ fontSize: 16, color: 'var(--accent-2)', lineHeight: 1, padding: '0 2px' }}>×</button>
          </div>

          {expandedId === f.id && (
            <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <LabeledInput
                label="Name"
                value={f.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => update(f.id, { name: e.target.value })}
                placeholder="e.g. Darkvision"
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <LabeledSelect
                  label="Action Type"
                  value={f.actionType ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    update(f.id, { actionType: (e.target.value || undefined) as ActionType | undefined })}
                  options={[
                    { value: '', label: '— None (informational) —' },
                    { value: 'action',       label: 'Action' },
                    { value: 'bonus_action', label: 'Bonus Action' },
                    { value: 'reaction',     label: 'Reaction' },
                    { value: 'passive',      label: 'Passive' },
                  ]}
                />
                <LabeledInput
                  label="Cost (optional)"
                  value={f.cost ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    update(f.id, { cost: e.target.value || undefined })}
                  placeholder="e.g. 1 EC, 1 use, free"
                />
              </div>
              <LabeledTextarea
                label="Description"
                value={f.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => update(f.id, { description: e.target.value })}
                placeholder="Describe what this feature does…"
                rows={4}
              />
              <UsesEditor uses={f.uses} onChange={uses => update(f.id, { uses })} />
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>
                  Tags (optional)
                </label>
                <input
                  value={(f.tags ?? []).join(', ')}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => update(f.id, { tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                  placeholder="e.g. passive, combat, magic"
                />
              </div>
            </div>
          )}
        </div>
      ))}

      <button type="button" onClick={add} className="btn btn-ghost" style={{ alignSelf: 'flex-start', fontSize: 12 }}>
        + Add Feature
      </button>
    </div>
  );
}

type UsesShape = NonNullable<Feature['uses']>;
type RechargeOn = UsesShape['rechargeOn'];

function UsesEditor({ uses, onChange }: { uses?: UsesShape; onChange: (uses: UsesShape | undefined) => void }) {
  if (!uses) {
    return (
      <button type="button" className="btn btn-ghost" style={{ fontSize: 12, alignSelf: 'flex-start' }}
        onClick={() => onChange({ max: { type: 'flat', value: 1 }, rechargeOn: 'long_rest' })}>
        + Add limited uses
      </button>
    );
  }

  const maxVal = uses.max.type === 'flat' ? uses.max.value : 1;

  return (
    <div style={{ background: 'var(--bg-0)', borderRadius: 4, padding: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-2)' }}>Limited Uses</span>
        <button type="button" onClick={() => onChange(undefined)} style={{ fontSize: 12, color: 'var(--accent-2)' }}>Remove</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div>
          <label style={{ fontSize: 11, color: 'var(--text-2)', display: 'block', marginBottom: 3 }}>Max Uses</label>
          <input
            type="number" min={1}
            value={maxVal}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...uses, max: { type: 'flat', value: Number(e.target.value) } })}
            placeholder="e.g. 3"
          />
        </div>
        <div>
          <label style={{ fontSize: 11, color: 'var(--text-2)', display: 'block', marginBottom: 3 }}>Recharges On</label>
          <select
            value={uses.rechargeOn}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange({ ...uses, rechargeOn: e.target.value as RechargeOn })}
          >
            <option value="short_rest">Short Rest</option>
            <option value="long_rest">Long Rest</option>
            <option value="dawn">Dawn</option>
            <option value="never">Never (single use)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
