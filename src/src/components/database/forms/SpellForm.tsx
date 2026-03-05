import { useState } from 'react';
import type { Spell, SpellSchool, StatKey } from '@/types/game';
import { LabeledInput, LabeledSelect, LabeledTextarea, FormRow, FormSection } from '@/components/ui/FormField';
import { TagInput } from '@/components/ui/TagInput';

const SCHOOLS: SpellSchool[] = ['abjuration','conjuration','divination','enchantment','evocation','illusion','necromancy','transmutation','custom'];
const DAMAGE_TYPES = ['slashing','piercing','bludgeoning','fire','cold','lightning','thunder','acid','poison','necrotic','radiant','psychic','force','magical','custom'];
const STATS: StatKey[] = ['strength','dexterity','constitution','intelligence','wisdom','charisma'];
const DIE_SIZES = [4,6,8,10,12,20];

function blankSpell(): Partial<Spell> {
  return {
    name: '',
    level: 1,
    school: 'evocation',
    castingTime: '1 action',
    range: '30 feet',
    duration: 'Instantaneous',
    concentration: false,
    ritual: false,
    components: { verbal: true, somatic: true },
    description: '',
    tags: [],
  };
}

interface SpellFormProps {
  initial?: Partial<Spell>;
  onSave: (spell: Omit<Spell, 'id'>) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function SpellForm({ initial, onSave, onCancel, isSaving }: SpellFormProps) {
  const [spell, setSpell] = useState<Partial<Spell>>(() => ({ ...blankSpell(), ...initial }));
  const [hasDamage, setHasDamage] = useState(!!initial?.damage);
  const [hasSave, setHasSave] = useState(!!initial?.savingThrow);

  const patch = (changes: Partial<Spell>) => setSpell(prev => ({ ...prev, ...changes }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!spell.name?.trim()) return;
    onSave({
      name: spell.name!.trim(),
      level: spell.level ?? 1,
      school: spell.school ?? 'evocation',
      castingTime: spell.castingTime ?? '1 action',
      range: spell.range ?? 'Self',
      duration: spell.duration ?? 'Instantaneous',
      concentration: spell.concentration ?? false,
      ritual: spell.ritual ?? false,
      components: spell.components ?? { verbal: true, somatic: true },
      description: spell.description ?? '',
      higherLevels: spell.higherLevels || undefined,
      damage: hasDamage ? spell.damage : undefined,
      savingThrow: hasSave ? spell.savingThrow : undefined,
      tags: spell.tags,
      sourceBook: spell.sourceBook || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      <FormSection title="Identity">
        <LabeledInput label="Name" value={spell.name ?? ''} onChange={e => patch({ name: e.target.value })} required placeholder="e.g. Fireball" />
        <FormRow>
          <LabeledSelect label="Level" value={String(spell.level ?? 1)}
            onChange={e => patch({ level: Number(e.target.value) })}
            options={[{value:'0',label:'Cantrip'},...Array.from({length:9},(_,i)=>({value:String(i+1),label:`Level ${i+1}`}))]} />
          <LabeledSelect label="School" value={spell.school ?? 'evocation'}
            onChange={e => patch({ school: e.target.value as SpellSchool })}
            options={SCHOOLS.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))} />
        </FormRow>
        <LabeledInput label="Source Book" value={spell.sourceBook ?? ''} onChange={e => patch({ sourceBook: e.target.value })} placeholder="e.g. Player's Handbook" />
      </FormSection>

      <FormSection title="Casting">
        <FormRow>
          <LabeledInput label="Casting Time" value={spell.castingTime ?? ''} onChange={e => patch({ castingTime: e.target.value })} placeholder="e.g. 1 action" />
          <LabeledInput label="Range" value={spell.range ?? ''} onChange={e => patch({ range: e.target.value })} placeholder="e.g. 60 feet" />
        </FormRow>
        <LabeledInput label="Duration" value={spell.duration ?? ''} onChange={e => patch({ duration: e.target.value })} placeholder="e.g. Instantaneous" />

        {/* Flags */}
        <FormRow>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" checked={spell.concentration ?? false} onChange={e => patch({ concentration: e.target.checked })} style={{ accentColor: 'var(--accent)' }} />
            Concentration
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" checked={spell.ritual ?? false} onChange={e => patch({ ritual: e.target.checked })} style={{ accentColor: 'var(--accent)' }} />
            Ritual
          </label>
        </FormRow>

        {/* Components */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-2)', marginBottom: 6 }}>Components</p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={spell.components?.verbal ?? false}
                onChange={e => patch({ components: { ...spell.components!, verbal: e.target.checked } })}
                style={{ accentColor: 'var(--accent)' }} /> V (Verbal)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={spell.components?.somatic ?? false}
                onChange={e => patch({ components: { ...spell.components!, somatic: e.target.checked } })}
                style={{ accentColor: 'var(--accent)' }} /> S (Somatic)
            </label>
          </div>
          <input
            value={spell.components?.material ?? ''}
            onChange={e => patch({ components: { ...spell.components!, material: e.target.value || undefined } })}
            placeholder="M (Material) — leave blank if none"
            style={{ marginTop: 8 }}
          />
        </div>
      </FormSection>

      <FormSection title="Description">
        <LabeledTextarea label="Description" value={spell.description ?? ''} rows={5}
          onChange={e => patch({ description: e.target.value })} required placeholder="Full spell description…" />
        <LabeledTextarea label="At Higher Levels" value={spell.higherLevels ?? ''} rows={2}
          onChange={e => patch({ higherLevels: e.target.value || undefined })}
          placeholder="When cast using a spell slot of X or higher… (optional)" />
      </FormSection>

      <FormSection title="Damage">
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
          <input type="checkbox" checked={hasDamage} onChange={e => setHasDamage(e.target.checked)} style={{ accentColor: 'var(--accent)' }} />
          This spell deals damage
        </label>
        {hasDamage && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 8, borderLeft: '2px solid var(--border)' }}>
            <FormRow cols={3}>
              <LabeledInput label="Dice Count" type="number" min={1}
                value={spell.damage?.roll?.diceCount ?? 1}
                onChange={e => patch({ damage: { ...blankDamage(spell), roll: { ...spell.damage?.roll!, diceCount: Number(e.target.value), dieSize: spell.damage?.roll?.dieSize ?? 6, modifier: spell.damage?.roll?.modifier ?? 0 } } })} />
              <LabeledSelect label="Die Size"
                value={String(spell.damage?.roll?.dieSize ?? 6)}
                onChange={e => patch({ damage: { ...blankDamage(spell), roll: { ...spell.damage?.roll!, dieSize: Number(e.target.value) as 4|6|8|10|12|20|100 } } })}
                options={DIE_SIZES.map(d => ({ value: String(d), label: `d${d}` }))} />
              <LabeledInput label="Modifier" type="number"
                value={spell.damage?.roll?.modifier ?? 0}
                onChange={e => patch({ damage: { ...blankDamage(spell), roll: { ...spell.damage?.roll!, modifier: Number(e.target.value) } } })} />
            </FormRow>
            <LabeledSelect label="Damage Type"
              value={spell.damage?.type ?? 'fire'}
              onChange={e => patch({ damage: { ...blankDamage(spell), type: e.target.value as Spell['damage']['type'] } })}
              options={DAMAGE_TYPES.map(d => ({ value: d, label: d }))} />
          </div>
        )}
      </FormSection>

      <FormSection title="Saving Throw">
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
          <input type="checkbox" checked={hasSave} onChange={e => setHasSave(e.target.checked)} style={{ accentColor: 'var(--accent)' }} />
          This spell requires a saving throw
        </label>
        {hasSave && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 8, borderLeft: '2px solid var(--border)' }}>
            <LabeledSelect label="Saving Throw" value={spell.savingThrow?.stat ?? 'dexterity'}
              onChange={e => patch({ savingThrow: { ...spell.savingThrow, stat: e.target.value as StatKey, onSuccess: spell.savingThrow?.onSuccess ?? '' } })}
              options={STATS.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))} />
            <LabeledInput label="On Successful Save" value={spell.savingThrow?.onSuccess ?? ''}
              onChange={e => patch({ savingThrow: { ...spell.savingThrow!, onSuccess: e.target.value } })}
              placeholder="e.g. Half damage" />
          </div>
        )}
      </FormSection>

      <FormSection title="Tags">
        <TagInput label="Tags" values={spell.tags ?? []} onChange={tags => patch({ tags })}
          placeholder="e.g. damage, aoe, fire, control" />
      </FormSection>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8 }}>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={isSaving || !spell.name?.trim()}>
          {isSaving ? 'Saving…' : 'Save Spell'}
        </button>
      </div>
    </form>
  );
}

function blankDamage(spell: Partial<Spell>): Spell['damage'] {
  return spell.damage ?? { roll: { diceCount: 1, dieSize: 6, modifier: 0 }, type: 'fire' };
}
