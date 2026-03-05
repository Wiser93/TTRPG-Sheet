import { useState } from 'react';
import type { GameClass, Subclass, StatKey, SkillKey, ClassLevelEntry, Feature } from '@/types/game';
import { LabeledInput, LabeledSelect, LabeledTextarea, FormRow, FormSection } from '@/components/ui/FormField';
import { CheckboxGroup, TagInput } from '@/components/ui/TagInput';
import { FeatureEditor } from '@/components/ui/FeatureEditor';

const STATS: StatKey[] = ['strength','dexterity','constitution','intelligence','wisdom','charisma'];
const STAT_LABELS: Record<StatKey, string> = { strength:'STR', dexterity:'DEX', constitution:'CON', intelligence:'INT', wisdom:'WIS', charisma:'CHA' };
const ALL_SKILLS: SkillKey[] = ['acrobatics','animalHandling','arcana','athletics','deception','history','insight','intimidation','investigation','medicine','nature','perception','performance','persuasion','religion','sleightOfHand','stealth','survival'];
const SKILL_LABELS: Record<SkillKey, string> = { acrobatics:'Acrobatics', animalHandling:'Animal Handling', arcana:'Arcana', athletics:'Athletics', deception:'Deception', history:'History', insight:'Insight', intimidation:'Intimidation', investigation:'Investigation', medicine:'Medicine', nature:'Nature', perception:'Perception', performance:'Performance', persuasion:'Persuasion', religion:'Religion', sleightOfHand:'Sleight of Hand', stealth:'Stealth', survival:'Survival' };
const ARMOR_OPTIONS = ['Light armor','Medium armor','Heavy armor','Shields'];
const WEAPON_OPTIONS = ['Simple weapons','Martial weapons','Unarmed strikes'];

function blankLevelEntry(level: number): ClassLevelEntry {
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
    levelEntries: Array.from({ length: 20 }, (_, i) => blankLevelEntry(i + 1)),
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
    // Ensure all 20 levels exist
    const existingLevels = initial.levelEntries ?? [];
    const levelEntries = Array.from({ length: 20 }, (_, i) =>
      existingLevels.find(e => e.level === i + 1) ?? blankLevelEntry(i + 1)
    );
    return { ...base, ...initial, levelEntries };
  });

  const [expandedLevel, setExpandedLevel] = useState<number | null>(null);
  const [hasSpellcasting, setHasSpellcasting] = useState(!!initial?.spellcasting);

  const patch = (changes: Partial<GameClass>) => setCls(prev => ({ ...prev, ...changes }));

  function updateLevel(level: number, features: Feature[]) {
    const updated = (cls.levelEntries ?? []).map(e =>
      e.level === level ? { ...e, features } : e
    );
    patch({ levelEntries: updated });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cls.name?.trim()) return;
    // Strip empty level entries to keep data lean
    const levelEntries = (cls.levelEntries ?? []).map(e => ({
      ...e,
      features: e.features ?? [],
      resources: e.resources ?? {},
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
      levelEntries,
      subclasses: cls.subclasses ?? [],
    });
  }

  const levelEntries = cls.levelEntries ?? Array.from({ length: 20 }, (_, i) => blankLevelEntry(i + 1));

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      <FormSection title="Identity">
        <LabeledInput label="Name" value={cls.name ?? ''} onChange={e => patch({ name: e.target.value })} required placeholder="e.g. Ranger" />
        <LabeledTextarea label="Description" value={cls.description ?? ''} rows={3}
          onChange={e => patch({ description: e.target.value })} placeholder="Brief class description…" />
        <FormRow cols={2}>
          <LabeledSelect label="Hit Die"
            value={String(cls.hitDie ?? 8)}
            onChange={e => patch({ hitDie: Number(e.target.value) })}
            options={[6,8,10,12].map(d => ({ value: String(d), label: `d${d}` }))} />
        </FormRow>
      </FormSection>

      <FormSection title="Proficiencies">
        <CheckboxGroup
          label="Saving Throw Proficiencies"
          values={(cls.savingThrowProficiencies ?? []).map(s => STAT_LABELS[s])}
          onChange={vals => patch({ savingThrowProficiencies: STATS.filter(s => vals.includes(STAT_LABELS[s])) })}
          options={STATS.map(s => STAT_LABELS[s])}
          columns={3}
        />
        <CheckboxGroup
          label="Armor Proficiencies"
          values={cls.armorProficiencies ?? []}
          onChange={vals => patch({ armorProficiencies: vals })}
          options={ARMOR_OPTIONS}
          columns={2}
        />
        <CheckboxGroup
          label="Weapon Proficiencies"
          values={cls.weaponProficiencies ?? []}
          onChange={vals => patch({ weaponProficiencies: vals })}
          options={WEAPON_OPTIONS}
          columns={2}
        />
        <TagInput
          label="Tool Proficiencies"
          values={cls.toolProficiencies ?? []}
          onChange={tools => patch({ toolProficiencies: tools })}
          placeholder="e.g. Thieves' tools"
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-2)' }}>Skill Proficiencies</p>
          <FormRow>
            <LabeledInput label="Choose (count)" type="number" min={0} max={18}
              value={cls.skillProficiencies?.choose ?? 2}
              onChange={e => patch({ skillProficiencies: { ...cls.skillProficiencies!, choose: Number(e.target.value) } })} />
          </FormRow>
          <CheckboxGroup
            label="Available Skills"
            values={(cls.skillProficiencies?.from ?? []).map(s => SKILL_LABELS[s])}
            onChange={vals => patch({ skillProficiencies: { choose: cls.skillProficiencies?.choose ?? 2, from: ALL_SKILLS.filter(s => vals.includes(SKILL_LABELS[s])) } })}
            options={ALL_SKILLS.map(s => SKILL_LABELS[s])}
            columns={2}
          />
        </div>
      </FormSection>

      {/* Spellcasting */}
      <FormSection title="Spellcasting">
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
          <input type="checkbox" checked={hasSpellcasting} onChange={e => {
            setHasSpellcasting(e.target.checked);
            if (e.target.checked && !cls.spellcasting) {
              patch({ spellcasting: { ability: 'intelligence', type: 'full', prepareFromList: false, ritualCasting: false } });
            }
          }} style={{ accentColor: 'var(--accent)' }} />
          This class has spellcasting
        </label>
        {hasSpellcasting && cls.spellcasting && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 8, borderLeft: '2px solid var(--border)' }}>
            <FormRow>
              <LabeledSelect label="Spellcasting Ability"
                value={cls.spellcasting.ability}
                onChange={e => patch({ spellcasting: { ...cls.spellcasting!, ability: e.target.value as StatKey } })}
                options={STATS.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))} />
              <LabeledSelect label="Caster Type"
                value={cls.spellcasting.type}
                onChange={e => patch({ spellcasting: { ...cls.spellcasting!, type: e.target.value as GameClass['spellcasting']['type'] } })}
                options={[
                  { value: 'full', label: 'Full caster (Wizard, Cleric)' },
                  { value: 'half', label: 'Half caster (Paladin, Ranger)' },
                  { value: 'third', label: 'Third caster (Eldritch Knight)' },
                  { value: 'pact', label: 'Pact magic (Warlock)' },
                  { value: 'custom', label: 'Custom' },
                ]} />
            </FormRow>
            <FormRow>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                <input type="checkbox" checked={cls.spellcasting.prepareFromList ?? false}
                  onChange={e => patch({ spellcasting: { ...cls.spellcasting!, prepareFromList: e.target.checked } })}
                  style={{ accentColor: 'var(--accent)' }} />
                Prepares spells from list
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                <input type="checkbox" checked={cls.spellcasting.ritualCasting ?? false}
                  onChange={e => patch({ spellcasting: { ...cls.spellcasting!, ritualCasting: e.target.checked } })}
                  style={{ accentColor: 'var(--accent)' }} />
                Ritual casting
              </label>
            </FormRow>
          </div>
        )}
      </FormSection>

      {/* Level entries */}
      <FormSection title="Level Features">
        <p style={{ fontSize: 12, color: 'var(--text-2)' }}>
          Click a level to add features granted at that level. Levels with features are highlighted.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {levelEntries.map(entry => {
            const hasFeatures = entry.features.length > 0;
            const isOpen = expandedLevel === entry.level;
            return (
              <div key={entry.level} style={{ border: `1px solid ${hasFeatures ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 6, overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => setExpandedLevel(isOpen ? null : entry.level)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: isOpen ? 'var(--bg-2)' : hasFeatures ? 'color-mix(in srgb, var(--accent) 10%, var(--bg-1))' : 'var(--bg-1)',
                    fontSize: 13,
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontWeight: hasFeatures ? 600 : 400 }}>
                    Level {entry.level}
                  </span>
                  <span style={{ fontSize: 12, color: hasFeatures ? 'var(--accent)' : 'var(--text-2)' }}>
                    {hasFeatures ? `${entry.features.length} feature${entry.features.length !== 1 ? 's' : ''}` : 'No features'} {isOpen ? '▲' : '▼'}
                  </span>
                </button>
                {isOpen && (
                  <div style={{ padding: 12 }}>
                    <FeatureEditor
                      features={entry.features}
                      onChange={features => updateLevel(entry.level, features)}
                    />
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
