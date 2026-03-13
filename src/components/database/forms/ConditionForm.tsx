import { useState } from 'react';
import { LabeledInput, LabeledTextarea } from '@/components/ui/FormField';
import type { Condition, ConditionLevel } from '@/types/game';

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

type Tab = 'base' | 'levels';

// ─── small helpers ────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label style={{
      fontSize: 11, fontWeight: 700, letterSpacing: '0.07em',
      textTransform: 'uppercase', color: 'var(--text-2)',
      display: 'block', marginBottom: 4,
    }}>
      {children}
    </label>
  );
}

// ─── Level row editor ─────────────────────────────────────────

function LevelRow({
  level, data, onChange, onRemove,
}: {
  level: number;
  data: ConditionLevel;
  onChange: (patch: Partial<ConditionLevel>) => void;
  onRemove: () => void;
}) {
  const [effectsText, setEffectsText] = useState(data.effects.join('\n'));

  return (
    <div style={{
      border: '1px solid var(--border)', borderRadius: 8,
      overflow: 'hidden', marginBottom: 6,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '6px 10px', background: 'var(--bg-1)',
      }}>
        <span style={{
          width: 22, height: 22, borderRadius: '50%',
          background: 'var(--accent)', color: '#fff',
          fontSize: 12, fontWeight: 700, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{level}</span>
        <input
          value={data.label ?? ''}
          onChange={e => onChange({ label: e.target.value || undefined })}
          placeholder={`Level ${level} label (optional)`}
          style={{ flex: 1, fontSize: 12, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-1)' }}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, cursor: 'pointer', flexShrink: 0 }}>
          <input
            type="checkbox"
            checked={data.cumulative !== false}
            onChange={e => onChange({ cumulative: e.target.checked ? undefined : false })}
            style={{ accentColor: 'var(--accent)' }}
          />
          cumulative
        </label>
        <button
          type="button"
          onClick={onRemove}
          style={{ color: 'var(--accent-2)', fontSize: 16, padding: '0 4px', lineHeight: 1, flexShrink: 0 }}
        >×</button>
      </div>
      {/* Effects textarea */}
      <div style={{ padding: '8px 10px' }}>
        <Label>Effects (one per line)</Label>
        <textarea
          value={effectsText}
          onChange={e => setEffectsText(e.target.value)}
          onBlur={() => onChange({ effects: effectsText.split('\n').map(l => l.trim()).filter(Boolean) })}
          rows={3}
          placeholder="e.g. Speed halved."
          style={{ width: '100%', fontSize: 12, resize: 'vertical' }}
        />
      </div>
    </div>
  );
}

// ─── Main form ────────────────────────────────────────────────

export function ConditionForm({ initial, onSave, onCancel, isSaving }: Props) {
  const [tab, setTab]                 = useState<Tab>('base');
  const [name, setName]               = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [effectsText, setEffectsText] = useState((initial?.effects ?? []).join('\n'));
  const [icon, setIcon]               = useState(initial?.icon ?? '');
  const [color, setColor]             = useState(initial?.color ?? '#e06c75');
  const [isLevelled, setIsLevelled]   = useState(!!(initial?.levels?.length));
  const [levels, setLevels]           = useState<ConditionLevel[]>(
    initial?.levels ?? []
  );

  function patchLevel(idx: number, patch: Partial<ConditionLevel>) {
    setLevels(prev => prev.map((l, i) => i === idx ? { ...l, ...patch } : l));
  }

  function addLevel() {
    const next = (levels[levels.length - 1]?.level ?? 0) + 1;
    setLevels(prev => [...prev, { level: next, effects: [], cumulative: true }]);
  }

  function removeLevel(idx: number) {
    setLevels(prev => prev.filter((_, i) => i !== idx));
  }

  function handleSave() {
    if (!name.trim()) return alert('Condition name is required.');
    onSave({
      name:        name.trim(),
      description: description.trim(),
      effects:     !isLevelled
        ? effectsText.split('\n').map(l => l.trim()).filter(Boolean)
        : undefined,
      levels:      isLevelled && levels.length ? levels : undefined,
      maxLevel:    isLevelled && levels.length ? levels.length : undefined,
      icon:        icon.trim() || undefined,
      color:       color || undefined,
    });
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '7px 14px', fontSize: 12, fontWeight: active ? 700 : 400,
    color: active ? 'var(--accent)' : 'var(--text-2)',
    borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
    cursor: 'pointer',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── Identity row ────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px', gap: 10 }}>
        <LabeledInput
          label="Name *"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          placeholder="e.g. Exhaustion"
        />
        <div>
          <Label>Icon</Label>
          <input
            value={icon}
            onChange={e => setIcon(e.target.value)}
            placeholder="😵"
            style={{ textAlign: 'center', fontSize: 20 }}
          />
        </div>
      </div>

      {/* ── Colour picker ───────────────────────────────────── */}
      <div>
        <Label>Badge Colour</Label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {PRESET_COLORS.map(c => (
            <button
              key={c} type="button" onClick={() => setColor(c)}
              style={{
                width: 28, height: 28, borderRadius: '50%', background: c,
                border: color === c ? '3px solid var(--text-0)' : '2px solid transparent',
                cursor: 'pointer', flexShrink: 0,
              }}
            />
          ))}
          <input
            type="color" value={color} onChange={e => setColor(e.target.value)}
            style={{ width: 36, height: 28, padding: 2, cursor: 'pointer', borderRadius: 4 }}
          />
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
        rows={2}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
        placeholder="What this condition means narratively…"
      />

      {/* ── Levelled toggle ─────────────────────────────────── */}
      <label style={{
        display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
        padding: '10px 12px', background: 'var(--bg-2)', borderRadius: 8,
        border: `1px solid ${isLevelled ? 'color-mix(in srgb,var(--accent) 40%,var(--border))' : 'var(--border)'}`,
      }}>
        <div
          style={{
            width: 38, height: 22, borderRadius: 11, flexShrink: 0,
            background: isLevelled ? 'var(--accent)' : 'var(--bg-3)',
            border: `1px solid ${isLevelled ? 'var(--accent)' : 'var(--border)'}`,
            position: 'relative', transition: 'background 150ms', cursor: 'pointer',
          }}
          onClick={() => setIsLevelled(v => !v)}
        >
          <div style={{
            position: 'absolute', top: 3, left: isLevelled ? 19 : 3,
            width: 14, height: 14, borderRadius: '50%', background: '#fff',
            transition: 'left 150ms',
          }} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Levelled condition</div>
          <div style={{ fontSize: 11, color: 'var(--text-2)' }}>
            Each severity level has its own bullet-point effects (e.g. Exhaustion 1–6)
          </div>
        </div>
      </label>

      {/* ── Tabs: base effects / levels ─────────────────────── */}
      {isLevelled ? (
        <div>
          {/* Tab bar */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 12 }}>
            <button type="button" style={tabStyle(tab === 'base')} onClick={() => setTab('base')}>
              Base Effects
            </button>
            <button type="button" style={tabStyle(tab === 'levels')} onClick={() => setTab('levels')}>
              Levels {levels.length > 0 && `(${levels.length})`}
            </button>
          </div>

          {tab === 'base' && (
            <div>
              <Label>
                Shared Effects
                <span style={{ fontWeight: 400, textTransform: 'none', marginLeft: 6, fontSize: 11 }}>
                  — applied at all levels, one per line
                </span>
              </Label>
              <textarea
                value={effectsText}
                onChange={e => setEffectsText(e.target.value)}
                rows={4}
                placeholder="e.g. Concentration checks are made with disadvantage."
                style={{ width: '100%', fontSize: 12, resize: 'vertical' }}
              />
              <p style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 4 }}>
                These appear in the tooltip regardless of level. Leave blank if every level is fully self-contained.
              </p>
            </div>
          )}

          {tab === 'levels' && (
            <div>
              {levels.map((lv, idx) => (
                <LevelRow
                  key={lv.level}
                  level={lv.level}
                  data={lv}
                  onChange={patch => patchLevel(idx, patch)}
                  onRemove={() => removeLevel(idx)}
                />
              ))}
              <button
                type="button"
                className="btn btn-ghost"
                style={{ fontSize: 12, marginTop: 4 }}
                onClick={addLevel}
              >
                + Add Level {levels.length + 1}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <Label>
            Mechanical Effects
            <span style={{ fontWeight: 400, textTransform: 'none', marginLeft: 6, fontSize: 11 }}>
              — one per line, shown as bullet points in the tooltip
            </span>
          </Label>
          <textarea
            value={effectsText}
            onChange={e => setEffectsText(e.target.value)}
            rows={5}
            placeholder={'Attacks against this creature have advantage.\nThis creature\'s attacks have disadvantage.'}
            style={{ width: '100%', fontSize: 13, resize: 'vertical' }}
          />
        </div>
      )}

      {/* ── Footer ──────────────────────────────────────────── */}
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
