import { useState } from 'react';
import { LabeledInput, LabeledTextarea } from '@/components/ui/FormField';
import type { Condition } from '@/types/game';

interface Props {
  initial?: Partial<Condition>;
  onSave: (condition: Omit<Condition, 'id'>) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

const PRESET_COLORS = [
  '#e06c75', '#d19a66', '#e5c07b', '#98c379',
  '#56b6c2', '#61afef', '#c678dd', '#abb2bf',
];

export function ConditionForm({ initial, onSave, onCancel, isSaving }: Props) {
  const [name, setName]               = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [effectsText, setEffectsText] = useState((initial?.effects ?? []).join('\n'));
  const [icon, setIcon]               = useState(initial?.icon ?? '');
  const [color, setColor]             = useState(initial?.color ?? '#e06c75');

  function handleSave() {
    if (!name.trim()) return alert('Condition name is required.');
    onSave({
      name: name.trim(),
      description: description.trim(),
      effects: effectsText.split('\n').map(l => l.trim()).filter(Boolean),
      icon: icon.trim() || undefined,
      color: color || undefined,
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Name + icon row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px', gap: 10 }}>
        <LabeledInput
          label="Name *"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          placeholder="e.g. Blinded"
        />
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>
            Icon
          </label>
          <input
            value={icon}
            onChange={e => setIcon(e.target.value)}
            placeholder="🙈"
            style={{ textAlign: 'center', fontSize: 20 }}
          />
        </div>
      </div>

      {/* Color picker */}
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>
          Badge Colour
        </label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {PRESET_COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              style={{
                width: 28, height: 28, borderRadius: '50%', background: c,
                border: color === c ? '3px solid var(--text-0)' : '2px solid transparent',
                cursor: 'pointer', flexShrink: 0,
              }}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={e => setColor(e.target.value)}
            style={{ width: 36, height: 28, padding: 2, cursor: 'pointer', borderRadius: 4 }}
          />
          {/* Live badge preview */}
          <span style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '3px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700,
            background: color, color: '#fff', marginLeft: 8,
          }}>
            {icon || '●'} {name || 'Preview'}
          </span>
        </div>
      </div>

      <LabeledTextarea
        label="Description"
        value={description}
        rows={3}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
        placeholder="What this condition means narratively…"
      />

      {/* Effects — one per line */}
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>
          Mechanical Effects
          <span style={{ fontWeight: 400, textTransform: 'none', marginLeft: 6, fontSize: 11 }}>
            — one per line, shown as bullet points in the sheet tooltip
          </span>
        </label>
        <textarea
          value={effectsText}
          onChange={e => setEffectsText(e.target.value)}
          rows={5}
          placeholder={
            'Attacks against this creature have advantage.\nThis creature\'s attacks have disadvantage.\nThis creature automatically fails STR/DEX saves.'
          }
          style={{ width: '100%', fontSize: 13, resize: 'vertical' }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSave}
          disabled={isSaving || !name.trim()}
        >
          {isSaving ? 'Saving…' : 'Save Condition'}
        </button>
      </div>
    </div>
  );
}
