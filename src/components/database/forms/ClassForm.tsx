import { useState, useEffect } from 'react';
import { useFeatures } from '@/hooks/useGameDatabase';
import type { GameClass, StatKey, SkillKey, ClassLevelEntry, Feature, SpellcastingConfig, Choice } from '@/types/game';
import { LabeledInput, LabeledSelect, LabeledTextarea, FormRow, FormSection } from '@/components/ui/FormField';
import { CheckboxGroup, TagInput } from '@/components/ui/TagInput';
import { FeatureEditor } from '@/components/ui/FeatureEditor';
import { ChoiceEditor } from '@/components/ui/ChoiceEditor';

const STATS: StatKey[] = ['strength','dexterity','constitution','intelligence','wisdom','charisma'];
const STAT_LABELS: Record<StatKey, string> = { strength:'STR', dexterity:'DEX', constitution:'CON', intelligence:'INT', wisdom:'WIS', charisma:'CHA' };
const ALL_SKILLS: SkillKey[] = ['acrobatics','animalHandling','arcana','athletics','deception','history','insight','intimidation','investigation','medicine','nature','perception','performance','persuasion','religion','sleightOfHand','stealth','survival'];
const SKILL_LABELS: Record<SkillKey, string> = { acrobatics:'Acrobatics', animalHandling:'Animal Handling', arcana:'Arcana', athletics:'Athletics', deception:'Deception', history:'History', insight:'Insight', intimidation:'Intimidation', investigation:'Investigation', medicine:'Medicine', nature:'Nature', perception:'Perception', performance:'Performance', persuasion:'Persuasion', religion:'Religion', sleightOfHand:'Sleight of Hand', stealth:'Stealth', survival:'Survival' };
const ARMOR_OPTIONS = ['Light armor','Medium armor','Heavy armor','Shields'];
const WEAPON_OPTIONS = ['Simple weapons','Martial weapons','Unarmed strikes'];

function blankLevel(level: number): ClassLevelEntry {
  return { level, features: [], resources: {} };
}

function blankClass(): Partial<GameClass> {
  return {
    name: '',
    description: '',
    hitDie: 8,
    primaryAbility: [],
    savingThrowProficiencies: [],
    skillProficiencies: { choose: 2, from: [] },
    armorProficiencies: [],
    weaponProficiencies: [],
    toolProficiencies: [],
    levelEntries: Array.from({ length: 20 }, (_, i) => blankLevel(i + 1)),
    subclasses: [],
  };
}

interface ClassFormProps {
  initial?: Partial<GameClass>;
  onSave: (cls: Omit<GameClass, 'id'>) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function ClassForm({ initial, onSave, onCancel, isSaving }: ClassFormProps) {
  const [cls, setCls] = useState<Partial<GameClass>>(() => {
    const base = blankClass();
    if (!initial) return base;
    const existing = initial.levelEntries ?? [];
    const levelEntries = Array.from({ length: 20 }, (_, i) =>
      existing.find(e => e.level === i + 1) ?? blankLevel(i + 1)
    );
    return { ...base, ...initial, levelEntries };
  });

  const [expandedLevel, setExpandedLevel] = useState<number | null>(null);
  const [hasSpellcasting, setHasSpellcasting] = useState(!!initial?.spellcasting);

  // Re-sync if initial changes (e.g. DB record arrives after mount)
  useEffect(() => {
    if (!initial) return;
    const existing = initial.levelEntries ?? [];
    const levelEntries = Array.from({ length: 20 }, (_, i) =>
      existing.find(e => e.level === i + 1) ?? blankLevel(i + 1)
    );
    setCls({ ...blankClass(), ...initial, levelEntries });
    setHasSpellcasting(!!initial.spellcasting);
  }, [initial?.id]);

  const patch = (changes: Partial<GameClass>) => setCls(prev => ({ ...prev, ...changes }));
  const sc = cls.spellcasting;

  function updateLevel(level: number, features: Feature[]) {
    const updated = (cls.levelEntries ?? []).map(e => e.level === level ? { ...e, features } : e);
    patch({ levelEntries: updated });
  }

  function updateLevelFeatureRefs(level: number, refs: string[]) {
    const updated = (cls.levelEntries ?? []).map(e =>
      e.level === level ? { ...e, featureRefs: refs } : e
    );
    patch({ levelEntries: updated });
  }

  function updateLevelChoices(level: number, choices: Choice[]) {
    const updated = (cls.levelEntries ?? []).map(e => e.level === level ? { ...e, choices } : e);
    patch({ levelEntries: updated });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cls.name?.trim()) return;
    const levelEntries = (cls.levelEntries ?? []).map(e => ({
      ...e, features: e.features ?? [], resources: e.resources ?? {},
    }));
    onSave({
      name: cls.name!.trim(),
      description: cls.description ?? '',
      hitDie: cls.hitDie ?? 8,
      primaryAbility: cls.primaryAbility ?? [],
      savingThrowProficiencies: cls.savingThrowProficiencies ?? [],
      skillProficiencies: cls.skillProficiencies ?? { choose: 2, from: [] },
      armorProficiencies: cls.armorProficiencies ?? [],
      weaponProficiencies: cls.weaponProficiencies ?? [],
      toolProficiencies: cls.toolProficiencies ?? [],
      spellcasting: hasSpellcasting ? cls.spellcasting : undefined,
      creationChoices: cls.creationChoices ?? [],
      levelEntries,
      subclasses: cls.subclasses ?? [],
    });
  }

  const levelEntries = cls.levelEntries ?? Array.from({ length: 20 }, (_, i) => blankLevel(i + 1));

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <FormSection title="Identity">
        <LabeledInput label="Name" value={cls.name ?? ''} required placeholder="e.g. Ranger"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ name: e.target.value })} />
        <LabeledTextarea label="Description" value={cls.description ?? ''} rows={3} placeholder="Brief class description…"
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => patch({ description: e.target.value })} />
        <FormRow cols={2}>
          <LabeledSelect label="Hit Die" value={String(cls.hitDie ?? 8)}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => patch({ hitDie: Number(e.target.value) })}
            options={[6,8,10,12].map(d => ({ value: String(d), label: `d${d}` }))} />
        </FormRow>
      </FormSection>

      <FormSection title="Proficiencies">
        <CheckboxGroup
          label="Saving Throw Proficiencies"
          values={(cls.savingThrowProficiencies ?? []).map(s => STAT_LABELS[s])}
          onChange={(vals: string[]) => patch({ savingThrowProficiencies: STATS.filter(s => vals.includes(STAT_LABELS[s])) })}
          options={STATS.map(s => STAT_LABELS[s])} columns={3} />
        <CheckboxGroup
          label="Armor Proficiencies"
          values={cls.armorProficiencies ?? []}
          onChange={(vals: string[]) => patch({ armorProficiencies: vals })}
          options={ARMOR_OPTIONS} columns={2} />
        <CheckboxGroup
          label="Weapon Proficiencies"
          values={cls.weaponProficiencies ?? []}
          onChange={(vals: string[]) => patch({ weaponProficiencies: vals })}
          options={WEAPON_OPTIONS} columns={2} />
        <TagInput label="Tool Proficiencies" values={cls.toolProficiencies ?? []} placeholder="e.g. Thieves' tools"
          onChange={(tools: string[]) => patch({ toolProficiencies: tools })} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-2)' }}>Skill Proficiencies</p>
          <FormRow>
            <LabeledInput label="Choose (count)" type="number" min={0} max={18}
              value={cls.skillProficiencies?.choose ?? 2}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ skillProficiencies: { ...cls.skillProficiencies!, choose: Number(e.target.value) } })} />
          </FormRow>
          <CheckboxGroup
            label="Available Skills"
            values={(cls.skillProficiencies?.from ?? []).map(s => SKILL_LABELS[s])}
            onChange={(vals: string[]) => patch({ skillProficiencies: { choose: cls.skillProficiencies?.choose ?? 2, from: ALL_SKILLS.filter(s => vals.includes(SKILL_LABELS[s])) } })}
            options={ALL_SKILLS.map(s => SKILL_LABELS[s])} columns={2} />
        </div>
      </FormSection>

      <FormSection title="Spellcasting">
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
          <input type="checkbox" checked={hasSpellcasting}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setHasSpellcasting(e.target.checked);
              if (e.target.checked && !cls.spellcasting) {
                patch({ spellcasting: { ability: 'intelligence', type: 'full', prepareFromList: false, ritualCasting: false } });
              }
            }} style={{ accentColor: 'var(--accent)' }} />
          This class has spellcasting
        </label>
        {hasSpellcasting && sc && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 8, borderLeft: '2px solid var(--border)' }}>
            <FormRow>
              <LabeledSelect label="Spellcasting Ability" value={sc.ability}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => patch({ spellcasting: { ...sc, ability: e.target.value as StatKey } })}
                options={STATS.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))} />
              <LabeledSelect label="Caster Type" value={sc.type}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => patch({ spellcasting: { ...sc, type: e.target.value as SpellcastingConfig['type'] } })}
                options={[
                  { value: 'full',   label: 'Full caster (Wizard, Cleric)' },
                  { value: 'half',   label: 'Half caster (Paladin, Ranger)' },
                  { value: 'third',  label: 'Third caster (Eldritch Knight)' },
                  { value: 'pact',   label: 'Pact magic (Warlock)' },
                  { value: 'custom', label: 'Custom' },
                ]} />
            </FormRow>
            <FormRow>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                <input type="checkbox" checked={sc.prepareFromList ?? false}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ spellcasting: { ...sc, prepareFromList: e.target.checked } })}
                  style={{ accentColor: 'var(--accent)' }} />
                Prepares spells from list
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                <input type="checkbox" checked={sc.ritualCasting ?? false}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ spellcasting: { ...sc, ritualCasting: e.target.checked } })}
                  style={{ accentColor: 'var(--accent)' }} />
                Ritual casting
              </label>
            </FormRow>
          </div>
        )}
      </FormSection>

      <FormSection title="Creation Choices">
        <p style={{ fontSize: 12, color: 'var(--text-2)' }}>
          Choices the player makes at character creation (before level 1). Use DB-sourced choices
          to let the player pick from the live database — e.g. a single martial weapon proficiency.
        </p>
        <ChoiceEditor
          choices={cls.creationChoices ?? []}
          onChange={(creationChoices) => patch({ creationChoices })}
        />
      </FormSection>

      <FormSection title="Level Features">
        <p style={{ fontSize: 12, color: 'var(--text-2)' }}>Click a level to add features and choices granted at that level.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {levelEntries.map(entry => {
            const hasFeatures = entry.features.length > 0 || (entry.featureRefs?.length ?? 0) > 0 || (entry.choices?.length ?? 0) > 0;
            const isOpen = expandedLevel === entry.level;
            return (
              <div key={entry.level} style={{ border: `1px solid ${hasFeatures ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 6, overflow: 'hidden' }}>
                <button type="button"
                  onClick={() => setExpandedLevel(isOpen ? null : entry.level)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 12px', fontSize: 13, textAlign: 'left',
                    background: isOpen ? 'var(--bg-2)' : hasFeatures ? 'color-mix(in srgb, var(--accent) 10%, var(--bg-1))' : 'var(--bg-1)',
                  }}
                >
                  <span style={{ fontWeight: hasFeatures ? 600 : 400 }}>Level {entry.level}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                    {(() => {
                      const featCount = (entry.features?.length ?? 0) + (entry.featureRefs?.length ?? 0);
                      const choiceCount = entry.choices?.length ?? 0;
                      return (<>
                        {featCount > 0 && (
                          <span style={{ background: 'var(--bg-3)', borderRadius: 4, padding: '1px 6px', color: 'var(--text-1)' }}>
                            {featCount} feature{featCount !== 1 ? 's' : ''}
                          </span>
                        )}
                        {choiceCount > 0 && (
                          <span style={{ background: 'color-mix(in srgb, var(--accent) 15%, var(--bg-3))', borderRadius: 4, padding: '1px 6px', color: 'var(--accent)' }}>
                            {choiceCount} choice{choiceCount !== 1 ? 's' : ''}
                          </span>
                        )}
                        {featCount === 0 && choiceCount === 0 && (
                          <span style={{ color: 'var(--text-2)' }}>Empty</span>
                        )}
                        <span style={{ color: 'var(--text-2)' }}>{isOpen ? '▲' : '▼'}</span>
                      </>);
                    })()}
                  </span>
                </button>
                {isOpen && (
                  <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <FeatureRefPicker
                      refs={entry.featureRefs ?? []}
                      onChange={(refs) => updateLevelFeatureRefs(entry.level, refs)}
                    />
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-2)', marginBottom: 8 }}>
                        Choices at this level
                      </p>
                      <ChoiceEditor
                        choices={entry.choices ?? []}
                        onChange={(choices: Choice[]) => updateLevelChoices(entry.level, choices)}
                      />
                    </div>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-2)', marginBottom: 8 }}>
                        Inline Features
                        <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-2)', textTransform: 'none', marginLeft: 6 }}>
                          — define custom features directly on this level (use Linked DB Features above for existing ones)
                        </span>
                      </p>
                      <FeatureEditor features={entry.features}
                        onChange={(features: Feature[]) => updateLevel(entry.level, features)} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </FormSection>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8 }}>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={isSaving || !cls.name?.trim()}>
          {isSaving ? 'Saving…' : 'Save Class'}
        </button>
      </div>
    </form>
  );
}

// ── Feature ref picker — links standalone DB features to a level ──

function FeatureRefPicker({ refs, onChange }: { refs: string[]; onChange: (refs: string[]) => void }) {
  const allFeatures = useFeatures() ?? [];
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');

  const linked = allFeatures.filter(f => refs.includes(f.id));
  const filtered = allFeatures.filter(f =>
    !refs.includes(f.id) &&
    (f.name.toLowerCase().includes(search.toLowerCase()) ||
     (f.tags ?? []).some(t => t.toLowerCase().includes(search.toLowerCase())))
  );

  if (!adding && linked.length === 0) {
    return (
      <button type="button" className="btn btn-ghost"
        style={{ fontSize: 11, alignSelf: 'flex-start', marginTop: 2 }}
        onClick={() => setAdding(true)}>
        + Link DB feature
      </button>
    );
  }

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
      <div style={{ background: 'var(--bg-2)', padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Linked DB Features
        </span>
        {!adding && (
          <button type="button" className="btn btn-ghost" style={{ fontSize: 11 }} onClick={() => setAdding(true)}>
            + Link
          </button>
        )}
      </div>

      {linked.map(f => (
        <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderTop: '1px solid var(--border)' }}>
          <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>
            {f.name}
            {f.actionType && (
              <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--accent)', fontWeight: 700 }}>
                {f.actionType.replace('_', ' ')}
              </span>
            )}
          </div>
          <button type="button" style={{ color: 'var(--accent-2)', fontSize: 14, lineHeight: 1 }}
            onClick={() => onChange(refs.filter(id => id !== f.id))}>
            ×
          </button>
        </div>
      ))}

      {adding && (
        <div style={{ borderTop: '1px solid var(--border)' }}>
          <input value={search} autoFocus placeholder="Search features…"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            style={{ width: '100%', borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none', margin: 0 }} />
          <div style={{ maxHeight: 160, overflowY: 'auto' }}>
            {allFeatures.length === 0 ? (
              <p style={{ padding: '8px 10px', fontSize: 12, color: 'var(--text-2)' }}>
                No features in database yet — create some in the Features tab.
              </p>
            ) : filtered.length === 0 ? (
              <p style={{ padding: '8px 10px', fontSize: 12, color: 'var(--text-2)' }}>No results.</p>
            ) : filtered.map(f => (
              <button key={f.id} type="button"
                onClick={() => { onChange([...refs, f.id]); setSearch(''); setAdding(false); }}
                style={{ width: '100%', textAlign: 'left', padding: '6px 10px', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <span style={{ fontWeight: 600 }}>{f.name}</span>
                {f.actionType && (
                  <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--accent)' }}>
                    {f.actionType.replace('_', ' ')}
                  </span>
                )}
                {f.description && (
                  <span style={{ fontSize: 11, color: 'var(--text-2)', marginLeft: 8 }}>
                    {f.description.slice(0, 60)}{f.description.length > 60 ? '…' : ''}
                  </span>
                )}
              </button>
            ))}
          </div>
          <button type="button" className="btn btn-ghost"
            style={{ fontSize: 11, margin: 6 }} onClick={() => { setAdding(false); setSearch(''); }}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
