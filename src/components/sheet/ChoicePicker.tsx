/**
 * ChoicePicker
 *
 * Single entry-point for rendering any Choice on the character sheet / builder.
 * Dispatches to:
 *   - StaticChoicePicker  when choice.options[] is defined (hand-authored list)
 *   - DbSourcedChoicePicker when choice.dbSource is defined (live DB query)
 *
 * Import this instead of DbSourcedChoicePicker wherever choices are rendered.
 */
import { DbSourcedChoicePicker } from './DbSourcedChoicePicker';
import type { Choice, ChoiceOption } from '@/types/game';
import type { ResolvedChoice } from '@/types/character';

interface PickerContext {
  sourceType: 'class' | 'species' | 'background' | 'feat';
  sourceId: string;
  level?: number;
}

interface Props {
  choice: Choice;
  resolved: ResolvedChoice | undefined;
  onChange: (updated: ResolvedChoice) => void;
  readOnly?: boolean;
  context: PickerContext;
}

export function ChoicePicker({ choice, resolved, onChange, readOnly, context }: Props) {
  // DB-sourced: delegate entirely to existing component
  if (choice.dbSource) {
    return (
      <DbSourcedChoicePicker
        choice={choice}
        resolved={resolved}
        onChange={onChange}
        readOnly={readOnly}
        context={context}
      />
    );
  }

  // Static options list
  if (choice.options && choice.options.length > 0) {
    return (
      <StaticChoicePicker
        choice={choice}
        resolved={resolved}
        onChange={onChange}
        readOnly={readOnly}
        context={context}
      />
    );
  }

  // No options and no dbSource — open-ended text entry
  return (
    <OpenChoicePicker
      choice={choice}
      resolved={resolved}
      onChange={onChange}
      readOnly={readOnly}
      context={context}
    />
  );
}

// ── Static options picker ─────────────────────────────────────

function StaticChoicePicker({ choice, resolved, onChange, readOnly, context }: Props) {
  const selected = resolved?.selectedValues ?? [];
  const options = choice.options ?? [];

  function toggle(optionId: string) {
    if (readOnly) return;
    let next: string[];
    if (selected.includes(optionId)) {
      next = selected.filter(id => id !== optionId);
    } else if (selected.length < choice.count) {
      next = [...selected, optionId];
    } else if (choice.count === 1) {
      next = [optionId];   // single-pick: replace
    } else {
      return;              // already at max
    }
    onChange(buildResolved(choice, resolved, context, next));
  }

  if (readOnly) {
    const labels = selected.map(id => options.find(o => o.id === id)?.label ?? id);
    return (
      <div style={{ fontSize: 13 }}>
        <span style={{ fontWeight: 600, color: 'var(--text-2)', marginRight: 6 }}>{choice.label}:</span>
        {labels.length === 0
          ? <span style={{ fontStyle: 'italic', color: 'var(--text-2)' }}>None chosen</span>
          : <span>{labels.join(', ')}</span>
        }
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <ChoiceHeader choice={choice} selectedCount={selected.length} />

      <div style={{
        display: 'flex', flexDirection: 'column',
        border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden',
        background: 'var(--bg-0)',
      }}>
        {options.map(opt => {
          const isSelected = selected.includes(opt.id);
          const isDisabled = !isSelected && selected.length >= choice.count;
          return (
            <OptionRow
              key={opt.id}
              opt={opt}
              isSelected={isSelected}
              isDisabled={isDisabled}
              isRadio={choice.count === 1}
              onClick={() => toggle(opt.id)}
            />
          );
        })}
      </div>

      {selected.length > 0 && (
        <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
          Selected:{' '}
          <span style={{ color: 'var(--text-0)', fontWeight: 600 }}>
            {selected.map(id => options.find(o => o.id === id)?.label ?? id).join(', ')}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Open-ended text picker ────────────────────────────────────

function OpenChoicePicker({ choice, resolved, onChange, readOnly, context }: Props) {
  const selected = resolved?.selectedValues ?? [];
  const value = selected.join(', ');

  if (readOnly) {
    return (
      <div style={{ fontSize: 13 }}>
        <span style={{ fontWeight: 600, color: 'var(--text-2)', marginRight: 6 }}>{choice.label}:</span>
        {value || <span style={{ fontStyle: 'italic', color: 'var(--text-2)' }}>Not set</span>}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <ChoiceHeader choice={choice} selectedCount={selected.length} />
      <input
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const vals = e.target.value ? [e.target.value] : [];
          onChange(buildResolved(choice, resolved, context, vals));
        }}
        placeholder={`Enter ${choice.label.toLowerCase()}…`}
      />
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────

function ChoiceHeader({ choice, selectedCount }: { choice: Choice; selectedCount: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
      <span style={{ fontWeight: 700, fontSize: 14 }}>{choice.label}</span>
      <span style={{ fontSize: 12, color: 'var(--text-2)' }}>
        Choose {choice.count} &middot; {selectedCount}/{choice.count} selected
      </span>
    </div>
  );
}

function OptionRow({ opt, isSelected, isDisabled, isRadio, onClick }: {
  opt: ChoiceOption;
  isSelected: boolean;
  isDisabled: boolean;
  isRadio: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '9px 12px', textAlign: 'left',
        background: isSelected
          ? 'color-mix(in srgb, var(--accent) 14%, var(--bg-1))'
          : 'transparent',
        borderBottom: '1px solid var(--border)',
        opacity: isDisabled ? 0.4 : 1,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        transition: 'background 100ms',
      }}
    >
      {/* Radio / checkbox indicator */}
      <div style={{
        width: 16, height: 16, flexShrink: 0, marginTop: 2,
        borderRadius: isRadio ? '50%' : 3,
        background: isSelected ? 'var(--accent)' : 'var(--bg-2)',
        border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isSelected && (
          isRadio
            ? <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />
            : <svg width="9" height="9" viewBox="0 0 9 9"><path d="M1.5 4.5l2 2L7.5 2" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: isSelected ? 600 : 400 }}>{opt.label}</div>
        {opt.description && (
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>
            {opt.description}
          </div>
        )}
      </div>
    </button>
  );
}

// ── Helper ────────────────────────────────────────────────────

function buildResolved(
  choice: Choice,
  existing: ResolvedChoice | undefined,
  context: PickerContext,
  selectedValues: string[]
): ResolvedChoice {
  return {
    id: existing?.id ?? crypto.randomUUID(),
    sourceType: context.sourceType,
    sourceId: context.sourceId,
    level: context.level ?? 0,
    choiceId: choice.id,
    selectedValues,
  };
}
