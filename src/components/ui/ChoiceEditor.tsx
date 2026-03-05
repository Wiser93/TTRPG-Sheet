/**
 * ChoiceEditor
 *
 * Lets a game designer add/edit/remove Choice objects in a form.
 * Supports both static options (hand-typed list) and DB-sourced options
 * (populated live from items/spells/feats filtered by tag or category).
 */
import { useState } from 'react';
import type { Choice, ChoiceType, ChoiceDbSource } from '@/types/game';
import { LabeledInput, LabeledSelect, FormRow } from '@/components/ui/FormField';

const CHOICE_TYPES: { value: ChoiceType; label: string }[] = [
  { value: 'skill_proficiency',  label: 'Skill Proficiency' },
  { value: 'weapon_proficiency', label: 'Weapon Proficiency' },
  { value: 'armor_proficiency',  label: 'Armor Proficiency' },
  { value: 'tool_proficiency',   label: 'Tool Proficiency' },
  { value: 'language',           label: 'Language' },
  { value: 'stat_increase',      label: 'Stat Increase' },
  { value: 'feat',               label: 'Feat' },
  { value: 'spell_known',        label: 'Spell Known' },
  { value: 'subclass',           label: 'Subclass' },
  { value: 'custom_feature',     label: 'Custom Feature' },
];

const DB_ENTITIES: { value: ChoiceDbSource['entity']; label: string }[] = [
  { value: 'items',  label: 'Items' },
  { value: 'spells', label: 'Spells' },
  { value: 'feats',  label: 'Feats' },
];

const GRANTS_TYPES: { value: NonNullable<ChoiceDbSource['grantsType']>; label: string }[] = [
  { value: 'weapon_proficiency', label: 'Weapon Proficiency' },
  { value: 'armor_proficiency',  label: 'Armor Proficiency' },
  { value: 'tool_proficiency',   label: 'Tool Proficiency' },
  { value: 'language',           label: 'Language' },
];

interface ChoiceEditorProps {
  choices: Choice[];
  onChange: (choices: Choice[]) => void;
}

function blankChoice(): Choice {
  return {
    id: crypto.randomUUID(),
    label: '',
    type: 'custom_feature',
    count: 1,
    unique: true,
  };
}

export function ChoiceEditor({ choices, onChange }: ChoiceEditorProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function add() {
    const c = blankChoice();
    onChange([...choices, c]);
    setExpandedId(c.id);
  }

  function update(id: string, patch: Partial<Choice>) {
    onChange(choices.map(c => c.id === id ? { ...c, ...patch } : c));
  }

  function remove(id: string) {
    onChange(choices.filter(c => c.id !== id));
    if (expandedId === id) setExpandedId(null);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {choices.length === 0 && (
        <p style={{ fontSize: 12, color: 'var(--text-2)', fontStyle: 'italic' }}>No choices defined.</p>
      )}

      {choices.map(choice => {
        const isOpen = expandedId === choice.id;
        const hasDbSource = !!choice.dbSource;
        return (
          <div key={choice.id} style={{ border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: 'var(--bg-2)' }}>
              <button type="button"
                onClick={() => setExpandedId(isOpen ? null : choice.id)}
                style={{ flex: 1, textAlign: 'left', fontSize: 13, fontWeight: choice.label ? 600 : 400, color: choice.label ? 'var(--text-0)' : 'var(--text-2)' }}
              >
                {choice.label || '(unnamed choice)'}
                <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-2)', marginLeft: 8 }}>
                  {choice.type.replace('_', ' ')} · choose {choice.count}
                  {hasDbSource ? ` · from DB (${choice.dbSource!.entity}${choice.dbSource!.filterTag ? ` [${choice.dbSource!.filterTag}]` : ''})` : ''}
                </span>
              </button>
              <button type="button" onClick={() => remove(choice.id)}
                style={{ fontSize: 16, color: 'var(--accent-2)', lineHeight: 1, padding: '0 2px' }}>×</button>
            </div>

            {/* Expanded editor */}
            {isOpen && (
              <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <FormRow>
                  <LabeledInput label="Choice Label" value={choice.label}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => update(choice.id, { label: e.target.value })}
                    placeholder="e.g. Martial Weapon Proficiency" />
                  <LabeledSelect label="Type" value={choice.type}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => update(choice.id, { type: e.target.value as ChoiceType })}
                    options={CHOICE_TYPES} />
                </FormRow>
                <FormRow>
                  <LabeledInput label="Count (how many to pick)" type="number" min={1} value={choice.count}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => update(choice.id, { count: Number(e.target.value) })} />
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', paddingTop: 20 }}>
                    <input type="checkbox" checked={choice.unique ?? true}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => update(choice.id, { unique: e.target.checked })}
                      style={{ accentColor: 'var(--accent)' }} />
                    No duplicates
                  </label>
                </FormRow>

                {/* DB source toggle */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', marginBottom: 10 }}>
                    <input type="checkbox" checked={hasDbSource}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        if (e.target.checked) {
                          update(choice.id, { dbSource: { entity: 'items', filterTag: '', grantsType: 'weapon_proficiency' } });
                        } else {
                          const { dbSource: _, ...rest } = choice;
                          onChange(choices.map(c => c.id === choice.id ? rest : c));
                        }
                      }}
                      style={{ accentColor: 'var(--accent)' }} />
                    <span>
                      <strong>Populate options from game database</strong>
                      <span style={{ fontSize: 11, color: 'var(--text-2)', marginLeft: 6 }}>
                        (dynamic list — options auto-update when DB changes)
                      </span>
                    </span>
                  </label>

                  {hasDbSource && (
                    <DbSourceEditor
                      source={choice.dbSource!}
                      onChange={dbSource => update(choice.id, { dbSource })}
                    />
                  )}
                </div>

                {/* Static options (only shown when not DB-sourced) */}
                {!hasDbSource && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-2)', marginBottom: 8 }}>
                      Static Options
                    </p>
                    <StaticOptionsEditor
                      options={choice.options ?? []}
                      onChange={options => update(choice.id, { options })}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      <button type="button" onClick={add} className="btn btn-ghost" style={{ alignSelf: 'flex-start', fontSize: 12 }}>
        + Add Choice
      </button>
    </div>
  );
}

// ── DB source sub-editor ──────────────────────────────────────

function DbSourceEditor({ source, onChange }: {
  source: ChoiceDbSource;
  onChange: (s: ChoiceDbSource) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 8, borderLeft: '2px solid var(--accent)', paddingTop: 4 }}>
      <FormRow>
        <LabeledSelect label="Entity type"
          value={source.entity}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange({ ...source, entity: e.target.value as ChoiceDbSource['entity'] })}
          options={DB_ENTITIES} />
        <LabeledSelect label="Grants proficiency type"
          value={source.grantsType ?? ''}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange({ ...source, grantsType: (e.target.value || undefined) as ChoiceDbSource['grantsType'] })}
          options={[{ value: '', label: '(none / informational)' }, ...GRANTS_TYPES]} />
      </FormRow>
      <FormRow>
        <LabeledInput label="Filter by tag"
          value={source.filterTag ?? ''}
          placeholder="e.g. martial  (leave blank for all)"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...source, filterTag: e.target.value || undefined })}
          hint="Items must have this tag to appear in the list" />
        {source.entity === 'items' && (
          <LabeledInput label="Filter by category"
            value={source.filterCategory ?? ''}
            placeholder="e.g. weapon  (optional)"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...source, filterCategory: e.target.value || undefined })}
            hint="Items must match this category" />
        )}
      </FormRow>
      {/* Live preview hint */}
      <div style={{ fontSize: 12, color: 'var(--text-2)', background: 'var(--bg-2)', borderRadius: 4, padding: '6px 10px' }}>
        Players will see all <strong>{source.entity}</strong>
        {source.filterTag ? <> tagged <strong>"{source.filterTag}"</strong></> : null}
        {source.filterCategory ? <> in category <strong>"{source.filterCategory}"</strong></> : null}
        {' '}in the database at the time they open their sheet.
      </div>
    </div>
  );
}

// ── Static options sub-editor ─────────────────────────────────

interface StaticOption { id: string; label: string; description?: string }

function StaticOptionsEditor({ options, onChange }: {
  options: StaticOption[];
  onChange: (opts: StaticOption[]) => void;
}) {
  function add() {
    onChange([...options, { id: crypto.randomUUID(), label: '', description: '' }]);
  }
  function update(id: string, patch: Partial<StaticOption>) {
    onChange(options.map(o => o.id === id ? { ...o, ...patch } : o));
  }
  function remove(id: string) {
    onChange(options.filter(o => o.id !== id));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {options.map(opt => (
        <div key={opt.id} style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 6 }}>
            <input value={opt.label}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => update(opt.id, { label: e.target.value })}
              placeholder="Option label" />
            <input value={opt.description ?? ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => update(opt.id, { description: e.target.value })}
              placeholder="Description (optional)" />
          </div>
          <button type="button" onClick={() => remove(opt.id)}
            style={{ fontSize: 18, color: 'var(--accent-2)', lineHeight: 1, paddingTop: 6, flexShrink: 0 }}>×</button>
        </div>
      ))}
      <button type="button" onClick={add} className="btn btn-ghost" style={{ alignSelf: 'flex-start', fontSize: 12 }}>
        + Add Option
      </button>
    </div>
  );
}
