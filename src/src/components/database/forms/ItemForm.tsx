import { useState } from 'react';
import type { Item, ItemCategory, Rarity } from '@/types/game';
import { LabeledInput, LabeledSelect, LabeledTextarea, FormRow, FormSection } from '@/components/ui/FormField';
import { TagInput } from '@/components/ui/TagInput';
import { FeatureEditor } from '@/components/ui/FeatureEditor';

const CATEGORIES: ItemCategory[] = ['weapon','armor','shield','ammunition','potion','scroll','wand','ring','wondrous','tool','gear','trade_goods','currency','custom'];
const RARITIES: Rarity[] = ['common','uncommon','rare','very_rare','legendary','artifact','unique'];
const DAMAGE_TYPES = ['slashing','piercing','bludgeoning','fire','cold','lightning','thunder','acid','poison','necrotic','radiant','psychic','force','magical','custom'];
const DIE_SIZES = [4,6,8,10,12,20,100];
const WEAPON_PROPERTIES = ['finesse','thrown','reach','versatile','two-handed','light','heavy','loading','range','ammunition','special','silvered','adamantine'];

function blankItem(): Partial<Item> {
  return {
    name: '',
    category: 'gear',
    description: '',
    weight: 0,
    cost: { amount: 0, currency: 'gp' },
    rarity: 'common',
    requiresAttunement: false,
    stackable: false,
    tags: [],
    features: [],
  };
}

interface ItemFormProps {
  initial?: Partial<Item>;
  onSave: (item: Omit<Item, 'id'>) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function ItemForm({ initial, onSave, onCancel, isSaving }: ItemFormProps) {
  const [item, setItem] = useState<Partial<Item>>(() => ({ ...blankItem(), ...initial }));
  const [showWeapon, setShowWeapon] = useState(!!initial?.weaponStats);
  const [showArmor, setShowArmor] = useState(!!initial?.armorStats);

  const patch = (changes: Partial<Item>) => setItem(prev => ({ ...prev, ...changes }));
  const isWeapon = item.category === 'weapon' || showWeapon;
  const isArmor = item.category === 'armor' || item.category === 'shield' || showArmor;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!item.name?.trim()) return;
    onSave({
      name: item.name!.trim(),
      category: item.category ?? 'gear',
      description: item.description ?? '',
      weight: item.weight ?? 0,
      cost: item.cost ?? { amount: 0, currency: 'gp' },
      rarity: item.rarity ?? 'common',
      requiresAttunement: item.requiresAttunement ?? false,
      stackable: item.stackable,
      tags: item.tags,
      features: item.features ?? [],
      weaponStats: showWeapon ? item.weaponStats : undefined,
      armorStats: showArmor ? item.armorStats : undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      <FormSection title="Identity">
        <LabeledInput label="Name" value={item.name ?? ''} onChange={e => patch({ name: e.target.value })} required placeholder="e.g. Longsword +1" />
        <FormRow>
          <LabeledSelect label="Category" value={item.category ?? 'gear'}
            onChange={e => patch({ category: e.target.value as ItemCategory })}
            options={CATEGORIES.map(c => ({ value: c, label: c.replace('_', ' ') }))} />
          <LabeledSelect label="Rarity" value={item.rarity ?? 'common'}
            onChange={e => patch({ rarity: e.target.value as Rarity })}
            options={RARITIES.map(r => ({ value: r, label: r.replace('_', ' ') }))} />
        </FormRow>
        <LabeledTextarea label="Description" value={item.description ?? ''} rows={3}
          onChange={e => patch({ description: e.target.value })} placeholder="What does this item do?" />
      </FormSection>

      <FormSection title="Properties">
        <FormRow cols={3}>
          <LabeledInput label="Weight (lbs)" type="number" min={0} step={0.1}
            value={item.weight ?? 0} onChange={e => patch({ weight: Number(e.target.value) })} />
          <LabeledInput label="Cost" type="number" min={0}
            value={item.cost?.amount ?? 0} onChange={e => patch({ cost: { ...item.cost!, amount: Number(e.target.value) } })} />
          <LabeledSelect label="Currency" value={item.cost?.currency ?? 'gp'}
            onChange={e => patch({ cost: { ...item.cost!, currency: e.target.value as Item['cost']['currency'] } })}
            options={[{value:'cp',label:'cp'},{value:'sp',label:'sp'},{value:'ep',label:'ep'},{value:'gp',label:'gp'},{value:'pp',label:'pp'}]} />
        </FormRow>
        <FormRow>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" checked={item.requiresAttunement ?? false}
              onChange={e => patch({ requiresAttunement: e.target.checked })}
              style={{ accentColor: 'var(--accent)', width: 15, height: 15 }} />
            Requires Attunement
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" checked={item.stackable ?? false}
              onChange={e => patch({ stackable: e.target.checked })}
              style={{ accentColor: 'var(--accent)', width: 15, height: 15 }} />
            Stackable
          </label>
        </FormRow>
        <TagInput label="Tags" values={item.tags ?? []} onChange={tags => patch({ tags })}
          placeholder="e.g. martial, magic, consumable" />
      </FormSection>

      {/* Weapon stats */}
      <FormSection title="Weapon Stats">
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
          <input type="checkbox" checked={showWeapon} onChange={e => setShowWeapon(e.target.checked)}
            style={{ accentColor: 'var(--accent)', width: 15, height: 15 }} />
          This item is a weapon
        </label>
        {showWeapon && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 8, borderLeft: '2px solid var(--border)' }}>
            <FormRow cols={3}>
              <LabeledInput label="Damage Dice" type="number" min={1}
                value={item.weaponStats?.damage?.diceCount ?? 1}
                onChange={e => patch({ weaponStats: { ...blankWeapon(item), damage: { ...item.weaponStats?.damage, diceCount: Number(e.target.value), dieSize: item.weaponStats?.damage?.dieSize ?? 6, modifier: item.weaponStats?.damage?.modifier ?? 0 } } })} />
              <LabeledSelect label="Die Size"
                value={String(item.weaponStats?.damage?.dieSize ?? 6)}
                onChange={e => patch({ weaponStats: { ...blankWeapon(item), damage: { ...item.weaponStats?.damage!, dieSize: Number(e.target.value) as 4|6|8|10|12|20|100 } } })}
                options={DIE_SIZES.map(d => ({ value: String(d), label: `d${d}` }))} />
              <LabeledInput label="Bonus" type="number"
                value={item.weaponStats?.damage?.modifier ?? 0}
                onChange={e => patch({ weaponStats: { ...blankWeapon(item), damage: { ...item.weaponStats?.damage!, modifier: Number(e.target.value) } } })} />
            </FormRow>
            <LabeledSelect label="Damage Type"
              value={item.weaponStats?.damageType ?? 'slashing'}
              onChange={e => patch({ weaponStats: { ...blankWeapon(item), damageType: e.target.value as Item['weaponStats']['damageType'] } })}
              options={DAMAGE_TYPES.map(d => ({ value: d, label: d }))} />
            <TagInput label="Weapon Properties" values={item.weaponStats?.properties ?? []}
              onChange={props => patch({ weaponStats: { ...blankWeapon(item), properties: props } })}
              suggestions={WEAPON_PROPERTIES} />
            <LabeledInput label="Attack Bonus (additional)"  type="number"
              value={item.weaponStats?.attackBonus ?? 0}
              onChange={e => patch({ weaponStats: { ...blankWeapon(item), attackBonus: Number(e.target.value) } })} />
          </div>
        )}
      </FormSection>

      {/* Armor stats */}
      <FormSection title="Armor Stats">
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
          <input type="checkbox" checked={showArmor} onChange={e => setShowArmor(e.target.checked)}
            style={{ accentColor: 'var(--accent)', width: 15, height: 15 }} />
          This item provides armor
        </label>
        {showArmor && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 8, borderLeft: '2px solid var(--border)' }}>
            <FormRow cols={2}>
              <LabeledInput label="Base AC" type="number" min={0}
                value={item.armorStats?.baseAC ?? 10}
                onChange={e => patch({ armorStats: { ...item.armorStats, baseAC: Number(e.target.value) } })} />
              <LabeledInput label="Max DEX Bonus" type="number" min={-1} placeholder="-1 = unlimited"
                value={item.armorStats?.maxDexBonus ?? -1}
                onChange={e => patch({ armorStats: { ...item.armorStats, baseAC: item.armorStats?.baseAC ?? 10, maxDexBonus: Number(e.target.value) < 0 ? undefined : Number(e.target.value) } })} />
            </FormRow>
            <FormRow>
              <LabeledInput label="STR Requirement" type="number" min={0}
                value={item.armorStats?.strengthRequired ?? 0}
                onChange={e => patch({ armorStats: { ...item.armorStats, baseAC: item.armorStats?.baseAC ?? 10, strengthRequired: Number(e.target.value) || undefined } })} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', paddingTop: 20 }}>
                <input type="checkbox" checked={item.armorStats?.stealthDisadvantage ?? false}
                  onChange={e => patch({ armorStats: { ...item.armorStats, baseAC: item.armorStats?.baseAC ?? 10, stealthDisadvantage: e.target.checked } })}
                  style={{ accentColor: 'var(--accent)' }} />
                Stealth Disadvantage
              </label>
            </FormRow>
          </div>
        )}
      </FormSection>

      {/* Features */}
      <FormSection title="Features & Abilities">
        <FeatureEditor features={item.features ?? []} onChange={features => patch({ features })} />
      </FormSection>

      {/* Footer buttons */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8 }}>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={isSaving || !item.name?.trim()}>
          {isSaving ? 'Saving…' : 'Save Item'}
        </button>
      </div>
    </form>
  );
}

function blankWeapon(item: Partial<Item>): Item['weaponStats'] {
  return item.weaponStats ?? { damage: { diceCount: 1, dieSize: 6, modifier: 0 }, damageType: 'slashing', properties: [] };
}
