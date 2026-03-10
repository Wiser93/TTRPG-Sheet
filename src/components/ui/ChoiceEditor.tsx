/**
 * ChoiceEditor — type-driven
 *
 * Picking a choice type determines exactly what UI you see.
 * Auto types (subclass, ASI/feat) need zero configuration.
 * Everything else shows only the fields relevant to that type.
 */
import { useState } from 'react';
import type { Choice, ChoiceType, ChoiceDbSource, ChoiceOption } from '@/types/game';
import { LabeledInput, FormRow } from '@/components/ui/FormField';
import { useFeatures } from '@/hooks/useGameDatabase';

// ── Kind catalogue ───────────────────────────────────────────

interface ChoiceKind {
  /** Stable key — custom_feature exists twice so we need this separate */
  key: string;
  type: ChoiceType;
  dbSourceEntity?: ChoiceDbSource['entity'];
  label: string;
  icon: string;
  description: string;
  auto?: boolean;
  group: 'automatic' | 'proficiency' | 'content';
}

const CHOICE_KINDS: ChoiceKind[] = [
  { key: 'subclass',   type: 'subclass',   label: 'Subclass',       icon: '🎓', group: 'automatic',
    auto: true, description: 'Player picks a subclass. Options are drawn automatically from subclasses linked to this class.' },
  { key: 'feat',       type: 'feat',       label: 'ASI / Feat',     icon: '📈', group: 'automatic',
    auto: true, description: 'Player increases two ability scores by 1 (or one by 2), or chooses a feat. Fully automatic — no setup needed.' },
  { key: 'path_advance', type: 'path_advance', label: 'Tiered Feature', icon: '🌀', group: 'automatic',
    description: 'Player advances or unlocks an tiered feature. Select which paths are available.' },

  { key: 'skill_proficiency',  type: 'skill_proficiency',  label: 'Skill Proficiency',  icon: '🎯', group: 'proficiency',
    description: 'Player picks skills from a defined list.' },
  { key: 'weapon_proficiency', type: 'weapon_proficiency', label: 'Weapon Proficiency', icon: '⚔️', group: 'proficiency',
    dbSourceEntity: 'items', description: 'Player picks a weapon proficiency from the items database.' },
  { key: 'armor_proficiency',  type: 'armor_proficiency',  label: 'Armor Proficiency',  icon: '🛡️', group: 'proficiency',
    dbSourceEntity: 'items', description: 'Player picks an armor proficiency from the items database.' },
  { key: 'tool_proficiency',   type: 'tool_proficiency',   label: 'Tool Proficiency',   icon: '🔧', group: 'proficiency',
    dbSourceEntity: 'items', description: 'Player picks a tool proficiency from the items database.' },
  { key: 'language',           type: 'language',           label: 'Language',           icon: '💬', group: 'proficiency',
    dbSourceEntity: 'items', description: 'Player learns a language.' },

  { key: 'spell_known',     type: 'spell_known',     label: 'Spell',               icon: '✨', group: 'content',
    dbSourceEntity: 'spells', description: 'Player picks spells from the database, optionally filtered by tag.' },
  { key: 'feature_from_db', type: 'custom_feature',  label: 'Feature (from DB)',   icon: '⚡', group: 'content',
    dbSourceEntity: 'features', description: 'Player picks from DB features, optionally filtered by tag.' },
  { key: 'custom',          type: 'custom_feature',  label: 'Custom Options',      icon: '📋', group: 'content',
    description: 'You define the options manually. Each can grant DB features or unlock nested choices.' },
];

const DB_GRANTS: Partial<Record<ChoiceType, ChoiceDbSource['grantsType']>> = {
  weapon_proficiency: 'weapon_proficiency',
  armor_proficiency:  'armor_proficiency',
  tool_proficiency:   'tool_proficiency',
  language:           'language',
};

function blankFromKind(k: ChoiceKind): Choice {
  const c: Choice = { id: crypto.randomUUID(), label: '', type: k.type, count: 1, unique: true };
  if (k.dbSourceEntity) c.dbSource = { entity: k.dbSourceEntity, grantsType: DB_GRANTS[k.type] };
  return c;
}

function detectKind(choice: Choice): ChoiceKind {
  for (const k of CHOICE_KINDS) {
    if (k.type !== choice.type) continue;
    if (k.type === 'custom_feature') {
      if (k.dbSourceEntity && choice.dbSource) return k;
      if (!k.dbSourceEntity && !choice.dbSource) return k;
    } else {
      return k;
    }
  }
  return CHOICE_KINDS[CHOICE_KINDS.length - 1];
}

function choiceSummary(choice: Choice): string {
  const k = detectKind(choice);
  const c = choice.count > 1 ? ` · choose ${choice.count}` : '';
  if (k.auto) return k.label;
  if (choice.type === 'path_advance') {
    const n = choice.pathFeatureIds?.length ?? 0;
    return `${n} path${n !== 1 ? 's' : ''}`;
  }
  if (choice.dbSource?.filterTag) return `[${choice.dbSource.filterTag}]${c}`;
  if ((choice.options?.length ?? 0) > 0) return `${choice.options!.length} options${c}`;
  if (choice.count > 1) return `choose ${choice.count}`;
  return k.label;
}

// ── Public component ─────────────────────────────────────────

interface ChoiceEditorProps {
  choices: Choice[];
  onChange: (choices: Choice[]) => void;
  depth?: number;
}

const GROUP_LABELS = { automatic: 'Automatic', proficiency: 'Proficiency', content: 'Content' };

export function ChoiceEditor({ choices, onChange, depth = 0 }: ChoiceEditorProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);

  function add(kind: ChoiceKind) {
    const c = blankFromKind(kind);
    onChange([...choices, c]);
    setExpandedId(c.id);
    setPicking(false);
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
      {choices.length === 0 && !picking && (
        <p style={{ fontSize: 12, color: 'var(--text-2)', fontStyle: 'italic' }}>No choices defined.</p>
      )}

      {choices.map(choice => {
        const isOpen = expandedId === choice.id;
        const kind = detectKind(choice);
        return (
          <div key={choice.id} style={{ border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: 'var(--bg-2)' }}>
              <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>{kind.icon}</span>
              <button type="button" onClick={() => setExpandedId(isOpen ? null : choice.id)}
                style={{ flex: 1, textAlign: 'left', fontSize: 13 }}>
                <span style={{ fontWeight: 600 }}>{choice.label || kind.label}</span>
                <span style={{ fontSize: 11, color: 'var(--text-2)', marginLeft: 8 }}>{choiceSummary(choice)}</span>
                {kind.auto && (
                  <span style={{ marginLeft: 8, fontSize: 10, padding: '1px 5px', borderRadius: 3,
                    background: 'color-mix(in srgb,var(--accent) 15%,transparent)', color: 'var(--accent)', fontWeight: 700 }}>
                    AUTO
                  </span>
                )}
              </button>
              <button type="button" onClick={() => remove(choice.id)}
                style={{ fontSize: 16, color: 'var(--accent-2)', lineHeight: 1, padding: '0 2px', flexShrink: 0 }}>×</button>
            </div>

            {/* Editor */}
            {isOpen && (
              <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <KindEditor choice={choice} kind={kind} onChange={p => update(choice.id, p)} depth={depth} />
              </div>
            )}
          </div>
        );
      })}

      {/* Type picker */}
      {picking ? (
        <div style={{ border: '1px solid var(--accent)', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ background: 'var(--bg-2)', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-2)' }}>
              What kind of choice?
            </span>
            <button type="button" className="btn btn-ghost" style={{ fontSize: 11 }} onClick={() => setPicking(false)}>Cancel</button>
          </div>
          {(['automatic', 'proficiency', 'content'] as const).map(g => {
            const ks = CHOICE_KINDS.filter(k => k.group === g);
            return (
              <div key={g} style={{ borderTop: '1px solid var(--border)' }}>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                  color: 'var(--text-2)', padding: '6px 12px 2px' }}>{GROUP_LABELS[g]}</p>
                {ks.map(k => (
                  <button key={k.key} type="button" onClick={() => add(k)}
                    style={{ width: '100%', textAlign: 'left', padding: '8px 12px',
                      borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: 10 }}
                    onMouseOver={e => (e.currentTarget.style.background = 'var(--bg-2)')}
                    onMouseOut={e => (e.currentTarget.style.background = '')}>
                    <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>{k.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>
                        {k.label}
                        {k.auto && <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--accent)', fontWeight: 700 }}>AUTO</span>}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>{k.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        <button type="button" onClick={() => setPicking(true)} className="btn btn-ghost"
          style={{ alignSelf: 'flex-start', fontSize: 12 }}>
          + Add Choice
        </button>
      )}
    </div>
  );
}

// ── Per-kind editor ──────────────────────────────────────────

function KindEditor({ choice, kind, onChange, depth }: {
  choice: Choice; kind: ChoiceKind;
  onChange: (p: Partial<Choice>) => void; depth: number;
}) {
  if (kind.auto) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <InfoBanner icon={kind.icon} text={kind.description} />
        <LabeledInput label="Label override (optional)" value={choice.label}
          placeholder={kind.label}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ label: e.target.value })} />
      </div>
    );
  }
  if (choice.type === 'path_advance') return <PathAdvanceEditor choice={choice} onChange={onChange} />;
  if (choice.type === 'skill_proficiency') return <SkillProfEditor choice={choice} onChange={onChange} />;
  if (['weapon_proficiency','armor_proficiency','tool_proficiency','language'].includes(choice.type)) {
    return <DbProfEditor choice={choice} onChange={onChange} />;
  }
  if (choice.type === 'spell_known' || (choice.type === 'custom_feature' && choice.dbSource)) {
    return <DbContentEditor choice={choice} onChange={onChange} />;
  }
  return <CustomEditor choice={choice} onChange={onChange} depth={depth} />;
}

// ── Helpers ──────────────────────────────────────────────────

function InfoBanner({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start',
      background: 'color-mix(in srgb,var(--accent) 8%,var(--bg-2))',
      border: '1px solid color-mix(in srgb,var(--accent) 25%,var(--border))',
      borderRadius: 6, padding: '8px 12px', fontSize: 12, color: 'var(--text-1)' }}>
      <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>{icon}</span>
      <span>{text}</span>
    </div>
  );
}

// ── Skill proficiency ─────────────────────────────────────────

const ALL_SKILLS = [
  'Acrobatics','Animal Handling','Arcana','Athletics','Deception','History',
  'Insight','Intimidation','Investigation','Medicine','Nature','Perception',
  'Performance','Persuasion','Religion','Sleight of Hand','Stealth','Survival',
];

function SkillProfEditor({ choice, onChange }: { choice: Choice; onChange: (p: Partial<Choice>) => void }) {
  const selected = (choice.options ?? []).map(o => o.label);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <LabeledInput label="Label (optional)" value={choice.label} placeholder="Skill Proficiency"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ label: e.target.value })} />
      <FormRow>
        <LabeledInput label="Choose (count)" type="number" min={1} value={choice.count}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ count: Number(e.target.value) })} />
      </FormRow>
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-2)', marginBottom: 6 }}>
          Available skills
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 12px' }}>
          {ALL_SKILLS.map(s => (
            <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
              <input type="checkbox" checked={selected.includes(s)}
                onChange={e => {
                  const next = e.target.checked ? [...selected, s] : selected.filter(x => x !== s);
                  onChange({ options: next.map(n => ({ id: n.toLowerCase().replace(/ /g, '_'), label: n })) });
                }}
                style={{ accentColor: 'var(--accent)' }} />
              {s}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── DB-sourced proficiency ────────────────────────────────────

function DbProfEditor({ choice, onChange }: { choice: Choice; onChange: (p: Partial<Choice>) => void }) {
  const ds = choice.dbSource ?? { entity: 'items' as const, grantsType: DB_GRANTS[choice.type] };
  const kindLabel = CHOICE_KINDS.find(k => k.type === choice.type)?.label ?? '';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <LabeledInput label="Label (optional)" value={choice.label} placeholder={kindLabel}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ label: e.target.value })} />
      <FormRow>
        <LabeledInput label="Choose (count)" type="number" min={1} value={choice.count}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ count: Number(e.target.value) })} />
      </FormRow>
      <LabeledInput label="Filter by tag (optional)" value={ds.filterTag ?? ''}
        placeholder="e.g. martial, simple"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange({ dbSource: { ...ds, filterTag: e.target.value || undefined } })} />
    </div>
  );
}

// ── DB-sourced content (features / spells) ───────────────────

function DbContentEditor({ choice, onChange }: { choice: Choice; onChange: (p: Partial<Choice>) => void }) {
  const ds = choice.dbSource ?? { entity: (choice.type === 'spell_known' ? 'spells' : 'features') as ChoiceDbSource['entity'] };
  const isSpell = choice.type === 'spell_known';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <LabeledInput label="Label" value={choice.label}
        placeholder={isSpell ? 'Choose a spell' : 'Choose a feature'}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ label: e.target.value })} />
      <FormRow>
        <LabeledInput label="Choose (count)" type="number" min={1} value={choice.count}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ count: Number(e.target.value) })} />
      </FormRow>
      <LabeledInput label="Filter by tag (optional)" value={ds.filterTag ?? ''}
        placeholder={isSpell ? 'e.g. evocation, cantrip' : 'e.g. technique, water, combat'}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange({ dbSource: { ...ds, filterTag: e.target.value || undefined } })} />
      {!isSpell && (
        <LabeledInput label="Filter by category (optional)" value={ds.filterCategory ?? ''}
          placeholder="e.g. technique"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange({ dbSource: { ...ds, filterCategory: e.target.value || undefined } })} />
      )}
    </div>
  );
}

// ── Path advance ─────────────────────────────────────────────

function PathAdvanceEditor({ choice, onChange }: { choice: Choice; onChange: (p: Partial<Choice>) => void }) {
  const allFeatures = useFeatures() ?? [];
  const pathFeatures = allFeatures.filter(f => f.isPath);
  const selected = choice.pathFeatureIds ?? [];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <LabeledInput label="Label (optional)" value={choice.label} placeholder="Choose a Tiered Feature"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ label: e.target.value })} />
      <FormRow>
        <LabeledInput label="Advancements granted" type="number" min={1} value={choice.count}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ count: Number(e.target.value) })} />
        <LabeledInput label="Max tier cap (optional)" type="number" min={1} max={10}
          value={choice.maxTier ?? ''}
          placeholder="No limit"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange({ maxTier: e.target.value ? Number(e.target.value) : undefined })} />
      </FormRow>
      {(choice.maxTier ?? 0) > 0 && (
        <div style={{
          fontSize: 12, color: 'var(--text-1)',
          background: 'color-mix(in srgb,var(--accent) 8%,var(--bg-2))',
          border: '1px solid color-mix(in srgb,var(--accent) 25%,var(--border))',
          borderRadius: 6, padding: '7px 10px',
        }}>
          ⚠ Max tier {choice.maxTier} — paths in this class can never exceed this tier globally.
        </div>
      )}
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-2)', marginBottom: 6 }}>
          Available tiered features
        </p>
        {pathFeatures.length === 0 ? (
          <p style={{ fontSize: 12, color: 'var(--text-2)', fontStyle: 'italic' }}>
            No tiered features in DB yet — create features with "Is Tiered Path" enabled.
          </p>
        ) : pathFeatures.map(f => (
          <label key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', padding: '4px 0' }}>
            <input type="checkbox" checked={selected.includes(f.id)}
              onChange={e => {
                const next = e.target.checked ? [...selected, f.id] : selected.filter(id => id !== f.id);
                onChange({ pathFeatureIds: next });
              }}
              style={{ accentColor: 'var(--accent)' }} />
            <span style={{ fontSize: 16 }}>{f.icon ?? '🌀'}</span>
            <span style={{ fontWeight: 600 }}>{f.name}</span>
            {f.description && <span style={{ fontSize: 11, color: 'var(--text-2)' }}>— {f.description.slice(0, 60)}{f.description.length > 60 ? '…' : ''}</span>}
          </label>
        ))}
      </div>
    </div>
  );
}

// ── Custom static options ────────────────────────────────────

function CustomEditor({ choice, onChange, depth }: {
  choice: Choice; onChange: (p: Partial<Choice>) => void; depth: number;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <FormRow>
        <LabeledInput label="Label" value={choice.label} placeholder="e.g. Elemental Technique"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ label: e.target.value })} />
        <LabeledInput label="Choose (count)" type="number" min={1} value={choice.count}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ count: Number(e.target.value) })} />
      </FormRow>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer' }}>
        <input type="checkbox" checked={choice.unique ?? true}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ unique: e.target.checked })}
          style={{ accentColor: 'var(--accent)' }} />
        No duplicates
      </label>
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-2)', marginBottom: 8 }}>
          Options
        </p>
        <StaticOptionsEditor options={choice.options ?? []} onChange={o => onChange({ options: o })} depth={depth} />
      </div>
    </div>
  );
}

// ── Static option rows ───────────────────────────────────────

function StaticOptionsEditor({ options, onChange, depth }: {
  options: ChoiceOption[]; onChange: (o: ChoiceOption[]) => void; depth: number;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function add() {
    const o: ChoiceOption = { id: crypto.randomUUID(), label: '' };
    onChange([...options, o]);
  }
  function update(id: string, patch: Partial<ChoiceOption>) {
    onChange(options.map(o => o.id === id ? { ...o, ...patch } : o));
  }
  function remove(id: string) {
    onChange(options.filter(o => o.id !== id));
    if (expandedId === id) setExpandedId(null);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {options.map(opt => {
        const isX = expandedId === opt.id;
        const hasF = (opt.featureIds?.length ?? 0) > 0;
        const hasG = (opt.grants?.length ?? 0) > 0;
        const badge = hasF && hasG ? '⚡+nested' : hasF ? '⚡ feature' : hasG ? '⊕ nested' : null;
        return (
          <div key={opt.id} style={{ border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden', background: 'var(--bg-1)' }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '6px 8px' }}>
              <input value={opt.label} placeholder="Option label"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => update(opt.id, { label: e.target.value })}
                style={{ flex: 2, margin: 0 }} />
              <input value={opt.description ?? ''} placeholder="Short description"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => update(opt.id, { description: e.target.value || undefined })}
                style={{ flex: 2, margin: 0 }} />
              <button type="button" onClick={() => setExpandedId(isX ? null : opt.id)}
                style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, flexShrink: 0,
                  background: badge ? 'var(--accent)' : 'var(--bg-2)',
                  color: badge ? '#fff' : 'var(--text-2)',
                  border: `1px solid ${badge ? 'var(--accent)' : 'var(--border)'}` }}>
                {badge ?? '+ more'}
              </button>
              <button type="button" onClick={() => remove(opt.id)}
                style={{ fontSize: 18, color: 'var(--accent-2)', lineHeight: 1, flexShrink: 0 }}>×</button>
            </div>
            {isX && (
              <div style={{ padding: '10px 10px 12px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-2)', marginBottom: 6 }}>
                    Linked Features — granted automatically when this option is picked
                  </p>
                  <FeatureIdListPicker
                    featureIds={opt.featureIds ?? []}
                    onChange={ids => update(opt.id, { featureIds: ids.length ? ids : undefined })} />
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-2)', marginBottom: 6 }}>
                    Nested Choices — revealed when this option is selected
                  </p>
                  <ChoiceEditor choices={opt.grants ?? []}
                    onChange={g => update(opt.id, { grants: g.length ? g : undefined })}
                    depth={depth + 1} />
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

// ── Feature ID list picker ────────────────────────────────────

function FeatureIdListPicker({ featureIds, onChange }: {
  featureIds: string[]; onChange: (ids: string[]) => void;
}) {
  const allFeatures = useFeatures() ?? [];
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);
  const linked = allFeatures.filter(f => featureIds.includes(f.id));
  const filtered = allFeatures.filter(f =>
    !featureIds.includes(f.id) &&
    (f.name.toLowerCase().includes(search.toLowerCase()) ||
     (f.tags ?? []).some(t => t.toLowerCase().includes(search.toLowerCase())))
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {linked.map(f => (
        <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px',
          background: 'color-mix(in srgb,var(--accent) 10%,var(--bg-2))', borderRadius: 6,
          border: '1px solid color-mix(in srgb,var(--accent) 30%,var(--border))' }}>
          <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>
            ⚡ {f.name}
            {f.actionType && <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--accent)', fontWeight: 400 }}>({f.actionType.replace('_',' ')})</span>}
          </span>
          <button type="button" style={{ color: 'var(--accent-2)', fontSize: 16, lineHeight: 1 }}
            onClick={() => onChange(featureIds.filter(id => id !== f.id))}>×</button>
        </div>
      ))}
      {adding ? (
        <div style={{ border: '1px solid var(--accent)', borderRadius: 6, overflow: 'hidden' }}>
          <input value={search} autoFocus placeholder="Search features by name or tag…"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            style={{ width: '100%', borderRadius: 0, margin: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }} />
          <div style={{ maxHeight: 180, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <p style={{ padding: '8px 10px', fontSize: 12, color: 'var(--text-2)' }}>
                {search ? `No results for "${search}".` : allFeatures.length === 0 ? 'No features yet.' : 'All features already linked.'}
              </p>
            ) : filtered.map(f => (
              <button key={f.id} type="button"
                onClick={() => { onChange([...featureIds, f.id]); setSearch(''); setAdding(false); }}
                style={{ width: '100%', textAlign: 'left', padding: '7px 10px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{f.name}
                  {f.actionType && <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--accent)' }}>{f.actionType.replace('_',' ')}</span>}
                </span>
                {f.description && <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{f.description.slice(0,90)}{f.description.length>90?'…':''}</span>}
              </button>
            ))}
          </div>
          <div style={{ padding: 6, borderTop: '1px solid var(--border)' }}>
            <button type="button" className="btn btn-ghost" style={{ fontSize: 11 }}
              onClick={() => { setAdding(false); setSearch(''); }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button type="button" className="btn btn-ghost" style={{ fontSize: 12, alignSelf: 'flex-start' }}
          onClick={() => setAdding(true)}>+ Link feature</button>
      )}
    </div>
  );
}
