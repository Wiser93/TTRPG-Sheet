/**
 * DbSourcedChoicePicker
 *
 * Renders a Choice whose options come from the live game database
 * (items filtered by tag/category, feats, spells, etc.) rather than
 * being hardcoded in the class definition.
 *
 * Used on the character sheet anywhere a class/species/background grants
 * a proficiency or other pick from a dynamic subset of the game DB.
 */
import { useDbSourceOptions } from '@/hooks/useGameDatabase';
import type { Choice } from '@/types/game';
import type { ResolvedChoice } from '@/types/character';

interface Props {
  /** The choice definition from the class/species/background */
  choice: Choice;
  /** Current selections for this choice (may be undefined if never resolved) */
  resolved: ResolvedChoice | undefined;
  /** Called when the player changes their selection */
  onChange: (updated: ResolvedChoice) => void;
  /** If true, render a compact read-only summary instead of a picker */
  readOnly?: boolean;
  /** Context ids needed to build the ResolvedChoice key */
  context: {
    sourceType: 'class' | 'species' | 'background' | 'feat';
    sourceId: string;
    level?: number;
  };
}

export function DbSourcedChoicePicker({ choice, resolved, onChange, readOnly, context }: Props) {
  const options = useDbSourceOptions(choice.dbSource);
  const selected = resolved?.selectedValues ?? [];
  const isLoading = options === undefined;
  const isEmpty = !isLoading && options?.length === 0;

  function toggle(optionId: string) {
    if (readOnly) return;
    let next: string[];
    if (selected.includes(optionId)) {
      next = selected.filter(id => id !== optionId);
    } else if (selected.length < choice.count) {
      next = [...selected, optionId];
    } else if (choice.count === 1) {
      // Single-pick: replace
      next = [optionId];
    } else {
      // Already at max selections
      return;
    }

    onChange({
      sourceType: context.sourceType,
      sourceId: context.sourceId,
      level: context.level,
      choiceId: choice.id,
      selectedValues: next,
    });
  }

  // Labels for already-selected items (works even when list isn't loaded yet)
  const selectedLabels = selected.map(id =>
    options?.find(o => o.id === id)?.name ?? id
  );

  if (readOnly) {
    return (
      <div style={{ fontSize: 13 }}>
        <span style={{ fontWeight: 600, color: 'var(--text-2)', marginRight: 6 }}>{choice.label}:</span>
        {selected.length === 0
          ? <span style={{ color: 'var(--text-2)', fontStyle: 'italic' }}>None chosen</span>
          : <span>{selectedLabels.join(', ')}</span>
        }
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontWeight: 700, fontSize: 14 }}>{choice.label}</span>
        <span style={{ fontSize: 12, color: 'var(--text-2)' }}>
          Choose {choice.count} · {selected.length}/{choice.count} selected
        </span>
      </div>

      {/* Source badge */}
      {choice.dbSource && (
        <div style={{
          fontSize: 11, color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 12%, var(--bg-1))',
          border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
          borderRadius: 4, padding: '3px 8px', alignSelf: 'flex-start',
        }}>
          {buildSourceBadge(choice.dbSource)}
        </div>
      )}

      {/* Loading / empty states */}
      {isLoading && (
        <p style={{ fontSize: 13, color: 'var(--text-2)', fontStyle: 'italic' }}>
          Loading options from database…
        </p>
      )}
      {isEmpty && (
        <div style={{
          padding: 12, background: 'var(--bg-2)', borderRadius: 6,
          border: '1px solid var(--border)', fontSize: 13,
        }}>
          <p style={{ color: 'var(--text-2)', marginBottom: 4 }}>
            No matching entries in the database yet.
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-2)' }}>
            {buildEmptyHint(choice.dbSource)}
          </p>
        </div>
      )}

      {/* Option list */}
      {!isLoading && (options?.length ?? 0) > 0 && (
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 4,
          maxHeight: 300, overflowY: 'auto',
          border: '1px solid var(--border)', borderRadius: 6,
          background: 'var(--bg-0)',
        }}>
          {options!.map(opt => {
            const isSelected = selected.includes(opt.id);
            const isDisabled = !isSelected && selected.length >= choice.count;
            return (
              <button
                key={opt.id}
                onClick={() => toggle(opt.id)}
                disabled={isDisabled}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', textAlign: 'left',
                  background: isSelected
                    ? 'color-mix(in srgb, var(--accent) 18%, var(--bg-1))'
                    : 'transparent',
                  borderBottom: '1px solid var(--border)',
                  opacity: isDisabled ? 0.45 : 1,
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  transition: 'background 100ms',
                }}
              >
                {/* Checkbox indicator */}
                <div style={{
                  width: 18, height: 18, borderRadius: choice.count === 1 ? '50%' : 3,
                  flexShrink: 0,
                  background: isSelected ? 'var(--accent)' : 'var(--bg-2)',
                  border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isSelected && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: isSelected ? 600 : 400 }}>{opt.name}</div>
                  {opt.description && (
                    <div style={{
                      fontSize: 11, color: 'var(--text-2)', marginTop: 1,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {opt.description}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Selected summary below the list */}
      {selected.length > 0 && (
        <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
          Selected: <span style={{ color: 'var(--text-0)', fontWeight: 600 }}>{selectedLabels.join(', ')}</span>
        </div>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────

function buildSourceBadge(source: NonNullable<Choice['dbSource']>): string {
  const parts: string[] = [];
  if (source.filterTag) parts.push(`tag: ${source.filterTag}`);
  if (source.filterCategory) parts.push(`category: ${source.filterCategory}`);
  parts.push(`from ${source.entity}`);
  return parts.join(' · ');
}

function buildEmptyHint(source: Choice['dbSource']): string {
  if (!source) return 'Add items to the database to populate this list.';
  if (source.entity === 'items') {
    const tag = source.filterTag ? `tagged "${source.filterTag}"` : '';
    const cat = source.filterCategory ? `in category "${source.filterCategory}"` : '';
    const filter = [tag, cat].filter(Boolean).join(' and ');
    return `Add items ${filter} to the Items database — they will appear here automatically.`;
  }
  if (source.entity === 'feats') return 'Add feats to the Feats database.';
  if (source.entity === 'spells') return 'Add spells to the Spells database.';
  return 'Add entries to the database to populate this list.';
}
