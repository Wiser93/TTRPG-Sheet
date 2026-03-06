/**
 * ChoiceEditor
 *
 * Lets a game designer add/edit/remove Choice objects in a form.
 * Supports:
 *   - Static options with optional DB feature links (featureId)
 *   - DB-sourced options (items / spells / feats / features filtered by tag)
 *   - Nested grants — choices unlocked when a static option is selected
 */
import { useState } from 'react';
import type { Choice, ChoiceType, ChoiceDbSource, ChoiceOption } from '@/types/game';
import { LabeledInput, LabeledSelect, FormRow } from '@/components/ui/FormField';
import { useFeatures } from '@/hooks/useGameDatabase';

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
  { value: 'features', label: 'Features (abilities)' },
  { value: 'feats',    label: 'Feats' },
  { value: 'spells',   label: 'Spells' },
  { value: 'items',    label: 'Items' },
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
  depth?: number;
}

function blankChoice(): Choice {
  return { id: crypto.randomUUID(), label: '', type: 'custom_feature', count: 1, unique: true };
}

export function ChoiceEditor({ choices, onChange, depth = 0 }: ChoiceEditorProps) {
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

  const indentStyle = depth > 0
    ? { borderLeft: '2px solid var(--accent)', marginLeft: depth * 8, paddingLeft: 8 }
    : {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...indentStyle }}>
      {choices.length === 0 && (
        <p style={{ fontSize: 12, color: 'var(--text-2)', fontStyle: 'italic' }}>No choices defined.</p>
      )}

      {choices.map(choice => {
        const isOpen = expandedId === choice.id;
        const hasDbSource = !!choice.dbSource;
        const optCount = choice.options?.length ?? 0;
        return (
          <div key={choice.id} style={{ border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: 'var(--bg-2)' }}>
              <button type="button"
                onClick={() => setExpandedId(isOpen ? null : choice.id)}
                style={{ flex: 1, textAlign: 'left', fontSize: 13, fontWeight: choice.label ? 600 : 400, color: choice.label ? 'var(--text-0)' : 'var(--text-2)' }}>
                {choice.label || '(unnamed choice)'}
                <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-2)', marginLeft: 8 }}>
                  {choice.type.replace(/_/g, ' ')} · choose {choice.count}
                  {hasDbSource ? ` · from ${choice.dbSource!.entity}${choice.dbSource!.filterTag ? ` [${choice.dbSource!.filterTag}]` : ''}` : ''}
                  {!hasDbSource && optCount > 0 ? ` · ${optCount} option${optCount !== 1 ? 's' : ''}` : ''}
                </span>
              </button>
              <button type="button" onClick={() => remove(choice.id)}
                style={{ fontSize: 16, color: 'var(--accent-2)', lineHeight: 1, padding: '0 2px' }}>×</button>
            </div>

            {isOpen && (
              <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <FormRow>
                  <LabeledInput label="Choice Label" value={choice.label}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => update(choice.id, { label: e.target.value })}
                    placeholder="e.g. Elemental Technique" />
                  <LabeledSelect label="Type" value={choice.type}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => update(choice.id, { type: e.target.value as ChoiceType })}
                    options={CHOICE_TYPES} />
                </FormRow>
                <FormRow>
                  <LabeledInput label="Count" type="number" min={1} value={choice.count}
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
                          update(choice.id, { dbSource: { entity: 'features' } });
                        } else {
                          const { dbSource: _, ...rest } = choice;
                          onChange(choices.map(c => c.id === choice.id ? rest : c));
                        }
                      }}
                      style={{ accentColor: 'var(--accent)' }} />
                    <span>
                      <strong>Populate from database</strong>
                      <span style={{ fontSize: 11, color: 'var(--text-2)', marginLeft: 6 }}>
                        (selecting a Feature automatically grants its abilities)
                      </span>
                    </span>
                  </label>
                  {hasDbSource && (
                    <DbSourceEditor source={choice.dbSource!}
                      onChange={dbSource => update(choice.id, { dbSource })} />
                  )}
                </div>

                {/* Static options with feature links + nested grants */}
                {!hasDbSource && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-2)', marginBottom: 8 }}>
                      Options
                    </p>
                    <StaticOptionsEditor
                      options={choice.options ?? []}
                      onChange={options => update(choice.id, { options })}
                      depth={depth}
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

function DbSourceEditor({ source, onChange }: { source: ChoiceDbSource; onChange: (s: ChoiceDbSource) => void }) {
  const isFeatures = source.entity === 'features';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 8, borderLeft: '2px solid var(--accent)', paddingTop: 4 }}>
      <FormRow>
        <LabeledSelect label="Entity type" value={source.entity}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            onChange({ entity: e.target.value as ChoiceDbSource['entity'] })}
          options={DB_ENTITIES} />
        {!isFeatures && (
          <LabeledSelect label="Grants proficiency type" value={source.grantsType ?? ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              onChange({ ...source, grantsType: (e.target.value || undefined) as ChoiceDbSource['grantsType'] })}
            options={[{ value: '', label: '(grants feature, not proficiency)' }, ...GRANTS_TYPES]} />
        )}
      </FormRow>
      <LabeledInput label="Filter by tag (optional)" value={source.filterTag ?? ''}
        placeholder="e.g. water, technique, combat"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange({ ...source, filterTag: e.target.value || undefined })}
        hint={isFeatures
          ? 'Only features tagged with this value will appear in the list'
          : 'Only records tagged with this value will appear'} />
      {source.entity === 'items' && (
        <LabeledInput label="Filter by category" value={source.filterCategory ?? ''}
          placeholder="e.g. weapon"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange({ ...source, filterCategory: e.target.value || undefined })} />
      )}
      <div style={{ fontSize: 12, color: 'var(--text-2)', background: 'var(--bg-2)', borderRadius: 4, padding: '6px 10px' }}>
        {isFeatures
          ? <>Players pick from all <strong>Features</strong>{source.filterTag ? <> tagged <strong>"{source.filterTag}"</strong></> : null}. Selecting one automatically grants that feature to the character.</>
          : <>Players see all <strong>{source.entity}</strong>{source.filterTag ? <> tagged <strong>"{source.filterTag}"</strong></> : null} in the database.</>
        }
      </div>
    </div>
  );
}

// ── Static options editor ─────────────────────────────────────

function StaticOptionsEditor({ options, onChange, depth }: {
  options: ChoiceOption[];
  onChange: (opts: ChoiceOption[]) => void;
  depth: number;
}) {
  const [expandedOptId, setExpandedOptId] = useState<string | null>(null);

  function add() {
    const opt: ChoiceOption = { id: crypto.randomUUID(), label: '' };
    onChange([...options, opt]);
  }
  function update(id: string, patch: Partial<ChoiceOption>) {
    onChange(options.map(o => o.id === id ? { ...o, ...patch } : o));
  }
  function remove(id: string) {
    onChange(options.filter(o => o.id !== id));
    if (expandedOptId === id) setExpandedOptId(null);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {options.map(opt => {
        const isExpanded = expandedOptId === opt.id;
        const hasFeature = !!opt.featureId;
        const hasGrants  = (opt.grants?.length ?? 0) > 0;
        const badge = hasFeature && hasGrants ? '⚡+nested' : hasFeature ? '⚡ feat.' : hasGrants ? '⊕ nested' : null;

        return (
          <div key={opt.id} style={{ border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden', background: 'var(--bg-1)' }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '6px 8px' }}>
              <input value={opt.label}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => update(opt.id, { label: e.target.value })}
                placeholder="Option label"
                style={{ flex: 2, margin: 0 }} />
              <input value={opt.description ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => update(opt.id, { description: e.target.value || undefined })}
                placeholder="Short description"
                style={{ flex: 2, margin: 0 }} />
              <button type="button"
                onClick={() => setExpandedOptId(isExpanded ? null : opt.id)}
                title="Link a DB feature or add nested choices"
                style={{
                  fontSize: 11, padding: '3px 8px', borderRadius: 4, flexShrink: 0,
                  background: badge ? 'var(--accent)' : 'var(--bg-2)',
                  color: badge ? '#fff' : 'var(--text-2)',
                  border: `1px solid ${badge ? 'var(--accent)' : 'var(--border)'}`,
                }}>
                {badge ?? '+ more'}
              </button>
              <button type="button" onClick={() => remove(opt.id)}
                style={{ fontSize: 18, color: 'var(--accent-2)', lineHeight: 1, flexShrink: 0 }}>×</button>
            </div>

            {isExpanded && (
              <div style={{ padding: '10px 10px 12px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Feature link */}
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-2)', marginBottom: 6 }}>
                    Linked Feature — granted automatically when this option is selected
                  </p>
                  <FeatureIdPicker
                    featureId={opt.featureId}
                    onChange={featureId => update(opt.id, { featureId: featureId || undefined })}
                  />
                </div>

                {/* Nested grants */}
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-2)', marginBottom: 6 }}>
                    Nested Choices — additional picks revealed after selecting this option
                  </p>
                  <ChoiceEditor
                    choices={opt.grants ?? []}
                    onChange={grants => update(opt.id, { grants: grants.length ? grants : undefined })}
                    depth={depth + 1}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
      <button type="button" onClick={add} className="btn btn-ghost" style={{ alignSelf: 'flex-start', fontSize: 12 }}>
        + Add Option
      </button>
    </div>
  );
}

// ── Feature ID picker ─────────────────────────────────────────

function FeatureIdPicker({ featureId, onChange }: {
  featureId: string | undefined;
  onChange: (id: string) => void;
}) {
  const allFeatures = useFeatures() ?? [];
  const [search, setSearch] = useState('');
  const [changing, setChanging] = useState(false);

  const current = allFeatures.find(f => f.id === featureId);
  const filtered = allFeatures.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    (f.tags ?? []).some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  if (current && !changing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: 'color-mix(in srgb, var(--accent) 10%, var(--bg-2))', borderRadius: 6, border: '1px solid color-mix(in srgb, var(--accent) 30%, var(--border))' }}>
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>
          ⚡ {current.name}
          {current.actionType && <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--accent)', fontWeight: 400 }}>({current.actionType.replace('_', ' ')})</span>}
          {current.cost && <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--text-2)' }}>{current.cost}</span>}
        </span>
        <button type="button" className="btn btn-ghost" style={{ fontSize: 11 }} onClick={() => setChanging(true)}>Change</button>
        <button type="button" style={{ color: 'var(--accent-2)', fontSize: 16, lineHeight: 1 }} onClick={() => onChange('')}>×</button>
      </div>
    );
  }

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
      <input
        value={search}
        autoFocus
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        placeholder="Search features by name or tag…"
        style={{ width: '100%', borderRadius: 0, margin: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}
      />
      <div style={{ maxHeight: 180, overflowY: 'auto' }}>
        {allFeatures.length === 0 ? (
          <p style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text-2)' }}>
            No features in database yet — create them in Game Database → Features ⚡
          </p>
        ) : filtered.length === 0 ? (
          <p style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text-2)' }}>No results for "{search}".</p>
        ) : filtered.map(f => (
          <button key={f.id} type="button"
            onClick={() => { onChange(f.id); setChanging(false); setSearch(''); }}
            style={{ width: '100%', textAlign: 'left', padding: '7px 12px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>
              {f.name}
              {f.actionType && <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--accent)' }}>{f.actionType.replace('_', ' ')}</span>}
              {f.cost && <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--text-2)' }}>{f.cost}</span>}
            </span>
            {f.description && (
              <span style={{ fontSize: 11, color: 'var(--text-2)' }}>
                {f.description.slice(0, 90)}{f.description.length > 90 ? '…' : ''}
              </span>
            )}
          </button>
        ))}
      </div>
      {(current || changing) && (
        <div style={{ padding: 6, borderTop: '1px solid var(--border)' }}>
          <button type="button" className="btn btn-ghost" style={{ fontSize: 11 }}
            onClick={() => { setChanging(false); setSearch(''); }}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
