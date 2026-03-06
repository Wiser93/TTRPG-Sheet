/**
 * ChoicePicker — runtime renderer for any Choice.
 *
 * Routes to:
 *   StaticChoicePicker    — choice.options[] (hand-authored list)
 *   DbSourcedChoicePicker — choice.dbSource (live DB query)
 *   OpenChoicePicker      — free-text fallback
 *
 * Nested grants: when a static option is selected and it has `grants[]`,
 * those child choices are rendered inline below the parent selection.
 */
import { DbSourcedChoicePicker } from './DbSourcedChoicePicker';
import type { Choice, ChoiceOption } from '@/types/game';
import type { ResolvedChoice } from '@/types/character';

export interface PickerContext {
  sourceType: 'class' | 'species' | 'background' | 'feat';
  sourceId: string;
  level?: number;
}

interface Props {
  choice: Choice;
  resolved: ResolvedChoice | undefined;
  /** All resolved choices in scope — needed to store/read nested grant resolutions */
  allResolved: ResolvedChoice[];
  onChange: (updated: ResolvedChoice) => void;
  /** Called when a nested granted choice changes */
  onNestedChange: (updated: ResolvedChoice) => void;
  readOnly?: boolean;
  context: PickerContext;
}

export function ChoicePicker({ choice, resolved, allResolved, onChange, onNestedChange, readOnly, context }: Props) {
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
  if (choice.options && choice.options.length > 0) {
    return (
      <StaticChoicePicker
        choice={choice}
        resolved={resolved}
        allResolved={allResolved}
        onChange={onChange}
        onNestedChange={onNestedChange}
        readOnly={readOnly}
        context={context}
      />
    );
  }
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

// ── Static picker ─────────────────────────────────────────────

function StaticChoicePicker({ choice, resolved, allResolved, onChange, onNestedChange, readOnly, context }: Props) {
  const selected = resolved?.selectedValues ?? [];
  const options  = choice.options ?? [];

  function toggle(optionId: string) {
    if (readOnly) return;
    let next: string[];
    if (selected.includes(optionId)) {
      next = selected.filter(id => id !== optionId);
    } else if (selected.length < choice.count) {
      next = [...selected, optionId];
    } else if (choice.count === 1) {
      next = [optionId];
    } else {
      return;
    }
    onChange(buildResolved(choice, resolved, context, next));
  }

  // Collect nested grant choices for all currently-selected options
  const selectedOpts = options.filter(o => selected.includes(o.id));
  const nestedChoices: { opt: ChoiceOption; choice: Choice }[] = selectedOpts.flatMap(opt =>
    (opt.grants ?? []).map(gc => ({ opt, choice: gc }))
  );

  if (readOnly) {
    const labels = selected.map(id => options.find(o => o.id === id)?.label ?? id);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: 13 }}>
          <span style={{ fontWeight: 600, color: 'var(--text-2)', marginRight: 6 }}>{choice.label}:</span>
          {labels.length === 0
            ? <span style={{ fontStyle: 'italic', color: 'var(--text-2)' }}>None chosen</span>
            : <span>{labels.join(', ')}</span>
          }
        </div>
        {nestedChoices.map(({ choice: gc }) => {
          const nr = allResolved.find(r => r.choiceId === gc.id);
          return (
            <div key={gc.id} style={{ marginLeft: 12, borderLeft: '2px solid var(--accent)', paddingLeft: 8 }}>
              <ChoicePicker choice={gc} resolved={nr} allResolved={allResolved}
                onChange={onNestedChange} onNestedChange={onNestedChange}
                readOnly context={context} />
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <ChoiceHeader choice={choice} selectedCount={selected.length} />

      <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden', background: 'var(--bg-0)' }}>
        {options.map(opt => {
          const isSelected  = selected.includes(opt.id);
          const isDisabled  = !isSelected && selected.length >= choice.count;
          const hasFeature  = !!opt.featureId;
          const hasNested   = (opt.grants?.length ?? 0) > 0;
          return (
            <OptionRow
              key={opt.id}
              opt={opt}
              isSelected={isSelected}
              isDisabled={isDisabled}
              isRadio={choice.count === 1}
              hasFeature={hasFeature}
              hasNested={hasNested}
              onClick={() => toggle(opt.id)}
            />
          );
        })}
      </div>

      {/* Nested grant choices — appear after selecting an option that has grants */}
      {nestedChoices.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginLeft: 12, borderLeft: '2px solid var(--accent)', paddingLeft: 10 }}>
          {nestedChoices.map(({ opt, choice: gc }) => {
            const nr = allResolved.find(r => r.choiceId === gc.id);
            return (
              <div key={`${opt.id}-${gc.id}`}>
                <ChoicePicker
                  choice={gc}
                  resolved={nr}
                  allResolved={allResolved}
                  onChange={onNestedChange}
                  onNestedChange={onNestedChange}
                  context={context}
                />
              </div>
            );
          })}
        </div>
      )}

      {selected.length > 0 && nestedChoices.length === 0 && (
        <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
          Selected: <span style={{ color: 'var(--text-0)', fontWeight: 600 }}>
            {selected.map(id => options.find(o => o.id === id)?.label ?? id).join(', ')}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Open-ended text picker ────────────────────────────────────

function OpenChoicePicker({ choice, resolved, onChange, readOnly, context }: Omit<Props, 'allResolved' | 'onNestedChange'>) {
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
        Choose {choice.count} · {selectedCount}/{choice.count} selected
      </span>
    </div>
  );
}

function OptionRow({ opt, isSelected, isDisabled, isRadio, hasFeature, hasNested, onClick }: {
  opt: ChoiceOption;
  isSelected: boolean;
  isDisabled: boolean;
  isRadio: boolean;
  hasFeature: boolean;
  hasNested: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '9px 12px', textAlign: 'left',
        background: isSelected ? 'color-mix(in srgb, var(--accent) 14%, var(--bg-1))' : 'transparent',
        borderBottom: '1px solid var(--border)',
        opacity: isDisabled ? 0.4 : 1,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        transition: 'background 100ms',
      }}
    >
      {/* Radio / checkbox */}
      <div style={{
        width: 16, height: 16, flexShrink: 0, marginTop: 2,
        borderRadius: isRadio ? '50%' : 3,
        background: isSelected ? 'var(--accent)' : 'var(--bg-2)',
        border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isSelected && (isRadio
          ? <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />
          : <svg width="9" height="9" viewBox="0 0 9 9"><path d="M1.5 4.5l2 2L7.5 2" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: isSelected ? 600 : 400, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {opt.label}
          {hasFeature && (
            <span style={{ fontSize: 10, background: 'color-mix(in srgb, var(--accent) 15%, var(--bg-2))', color: 'var(--accent)', borderRadius: 3, padding: '1px 5px', fontWeight: 700 }}>
              ⚡ grants ability
            </span>
          )}
          {hasNested && (
            <span style={{ fontSize: 10, background: 'color-mix(in srgb, var(--accent-4) 15%, var(--bg-2))', color: 'var(--accent-4)', borderRadius: 3, padding: '1px 5px', fontWeight: 700 }}>
              + sub-choice
            </span>
          )}
        </div>
        {opt.description && (
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{opt.description}</div>
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
