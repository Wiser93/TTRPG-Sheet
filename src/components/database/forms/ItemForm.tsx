import { useState } from 'react';
import type { Item, ItemCategory, Rarity, DamageType, WeaponStats, ShieldStats, ItemProperty } from '@/types/game';
import { LabeledInput, LabeledSelect, LabeledTextarea, FormRow, FormSection } from '@/components/ui/FormField';
import { TagInput } from '@/components/ui/TagInput';
import { FeatureEditor } from '@/components/ui/FeatureEditor';
import { useItemProperties } from '@/hooks/useGameDatabase';

const CATEGORIES: ItemCategory[] = ['weapon','armor','shield','ammunition','potion','scroll','wand','ring','wondrous','tool','gear','trade_goods','currency','custom'];
const RARITIES: Rarity[] = ['common','uncommon','rare','very_rare','legendary','artifact','unique'];
const DAMAGE_TYPES: DamageType[] = ['slashing','piercing','bludgeoning','fire','cold','lightning','thunder','acid','poison','necrotic','radiant','psychic','force','magical','custom'];
const DIE_SIZES = [4,6,8,10,12,20,100];

function defaultWeapon(existing?: Item['weaponStats']): WeaponStats {
  return {
    damage: existing?.damage ?? { diceCount: 1, dieSize: 6, modifier: 0 },
    damageType: existing?.damageType ?? 'slashing',
    properties: existing?.properties ?? [],
    attackBonus: existing?.attackBonus ?? 0,
    secondaryDamage: existing?.secondaryDamage,
  };
}
function defaultShield(existing?: Item['shieldStats']): ShieldStats {
  return { acBonus: existing?.acBonus ?? 2, properties: existing?.properties ?? [] };
}

function blankItem(): Partial<Item> {
  return {
    name: '', category: 'gear', description: '',
    weight: 0, cost: { amount: 0, currency: 'gp' },
    rarity: 'common', requiresAttunement: false,
    stackable: false, tags: [], features: [],
  };
}

interface ItemFormProps {
  initial?: Partial<Item>;
  onSave: (item: Omit<Item, 'id'>) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

// ── DB-filtered property chips ────────────────────────────────
function PropertyChips({
  category, selected, onChange, allDbProps,
}: {
  category: ItemCategory;
  selected: string[];
  onChange: (props: string[]) => void;
  allDbProps: ItemProperty[];
}) {
  const [custom, setCustom] = useState('');

  const relevant = allDbProps.filter(p => {
    if (!p.applicableCategories || p.applicableCategories === 'all') return true;
    return (p.applicableCategories as ItemCategory[]).includes(category);
  });

  function toggle(name: string) {
    onChange(selected.includes(name) ? selected.filter(s => s !== name) : [...selected, name]);
  }
  function addCustom() {
    const val = custom.trim();
    if (!val || selected.includes(val)) return;
    onChange([...selected, val]);
    setCustom('');
  }

  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-2)', marginBottom: 8 }}>
        Properties
      </p>
      {relevant.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {relevant.map(p => {
            const on = selected.includes(p.name);
            return (
              <label key={p.id} title={p.description} style={{
                display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
                padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: on ? 700 : 400,
                background: on ? 'var(--accent)' : 'var(--bg-3)',
                color: on ? '#fff' : 'var(--text-1)',
                border: `1px solid ${on ? 'var(--accent)' : 'var(--border)'}`,
                transition: 'all 120ms',
              }}>
                <input type="checkbox" checked={on} onChange={() => toggle(p.name)} style={{ display: 'none' }} />
                {p.name}{p.isMastery ? ' ★' : ''}
              </label>
            );
          })}
        </div>
      )}
      {/* Custom (no DB entry) properties still attached */}
      {selected.filter(s => !relevant.some(p => p.name === s)).map(s => (
        <span key={s} style={{
          display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 6, marginBottom: 6,
          padding: '3px 10px', borderRadius: 12, fontSize: 12,
          background: 'var(--bg-3)', border: '1px solid var(--border)',
        }}>
          {s}
          <button type="button" onClick={() => onChange(selected.filter(x => x !== s))}
            style={{ fontSize: 13, lineHeight: 1, color: 'var(--text-2)' }}>×</button>
        </span>
      ))}
      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
        <input value={custom} onChange={e => setCustom(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }}
          placeholder="Add custom property…" style={{ flex: 1, fontSize: 12 }} />
        <button type="button" className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 10px' }} onClick={addCustom}>Add</button>
      </div>
      {relevant.length === 0 && (
        <p style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 4, fontStyle: 'italic' }}>
          No property definitions for this category yet — add them in Database → Properties.
        </p>
      )}
    </div>
  );
}

// ── Main form ─────────────────────────────────────────────────
export function ItemForm({ initial, onSave, onCancel, isSaving }: ItemFormProps) {
  const [item, setItem] = useState<Partial<Item>>(() => ({ ...blankItem(), ...initial }));
  const allDbProps = (useItemProperties() ?? []) as ItemProperty[];
  const patch = (changes: Partial<Item>) => setItem(prev => ({ ...prev, ...changes }));

  // Category-driven section visibility (purely for showing the right form panels)
  const cat = item.category ?? 'gear';
  const isWeapon = cat === 'weapon';
  const isArmor  = cat === 'armor';
  const isShield = cat === 'shield';
  const hasMechStats = isWeapon || isArmor || isShield;

  // ── Property helpers ────────────────────────────────────────
  function getProps(): string[] {
    if (isWeapon) return item.weaponStats?.properties ?? [];
    if (isArmor)  return item.armorStats?.properties ?? [];
    if (isShield) return item.shieldStats?.properties ?? [];
    return item.properties ?? [];
  }
  function setProperties(props: string[]) {
    if (isWeapon) patch({ weaponStats: { ...defaultWeapon(item.weaponStats), properties: props } });
    else if (isArmor)  patch({ armorStats: { baseAC: item.armorStats?.baseAC ?? 10, ...item.armorStats, properties: props } });
    else if (isShield) patch({ shieldStats: { ...defaultShield(item.shieldStats), properties: props } });
    else patch({ properties: props });
  }

  // ── Save — clear stats that don't match the saved category ──
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!item.name?.trim()) return;
    onSave({
      name: item.name!.trim(),
      category: cat,
      description: item.description ?? '',
      weight: item.weight ?? 0,
      cost: item.cost ?? { amount: 0, currency: 'gp' },
      rarity: item.rarity ?? 'common',
      requiresAttunement: item.requiresAttunement ?? false,
      stackable: item.stackable,
      tags: item.tags,
      features: item.features ?? [],
      // Stats: only persist what matches the current category; everything else is explicitly cleared
      weaponStats:  isWeapon ? defaultWeapon(item.weaponStats) : undefined,
      armorStats:   isArmor  ? item.armorStats                 : undefined,
      shieldStats:  isShield ? defaultShield(item.shieldStats) : undefined,
      properties:   (!hasMechStats && item.properties?.length) ? item.properties : undefined,
    });
  }

  const weapon = defaultWeapon(item.weaponStats);
  const shield = defaultShield(item.shieldStats);

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Identity ────────────────────────────────────────── */}
      <FormSection title="Identity">
        <LabeledInput label="Name" value={item.name ?? ''} required placeholder="e.g. Longsword +1"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ name: e.target.value })} />
        <FormRow>
          <LabeledSelect label="Category" value={cat}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => patch({ category: e.target.value as ItemCategory })}
            options={CATEGORIES.map(c => ({ value: c, label: c.replace(/_/g, ' ') }))} />
          <LabeledSelect label="Rarity" value={item.rarity ?? 'common'}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => patch({ rarity: e.target.value as Rarity })}
            options={RARITIES.map(r => ({ value: r, label: r.replace(/_/g, ' ') }))} />
        </FormRow>
        <LabeledTextarea label="Description" value={item.description ?? ''} rows={3} placeholder="What does this item do?"
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => patch({ description: e.target.value })} />
      </FormSection>

      {/* ── Details ─────────────────────────────────────────── */}
      <FormSection title="Details">
        <FormRow cols={3}>
          <LabeledInput label="Weight (lbs)" type="number" min={0} step={0.1} value={item.weight ?? 0}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ weight: Number(e.target.value) })} />
          <LabeledInput label="Cost" type="number" min={0} value={item.cost?.amount ?? 0}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ cost: { ...item.cost!, amount: Number(e.target.value) } })} />
          <LabeledSelect label="Currency" value={item.cost?.currency ?? 'gp'}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => patch({ cost: { ...item.cost!, currency: e.target.value as Item['cost']['currency'] } })}
            options={[{value:'cp',label:'cp'},{value:'sp',label:'sp'},{value:'ep',label:'ep'},{value:'gp',label:'gp'},{value:'pp',label:'pp'}]} />
        </FormRow>
        <FormRow>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" checked={item.requiresAttunement ?? false}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ requiresAttunement: e.target.checked })}
              style={{ accentColor: 'var(--accent)', width: 15, height: 15 }} /> Requires Attunement
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" checked={item.stackable ?? false}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ stackable: e.target.checked })}
              style={{ accentColor: 'var(--accent)', width: 15, height: 15 }} /> Stackable
          </label>
        </FormRow>
        <TagInput label="Tags" values={item.tags ?? []} placeholder="e.g. martial, magic, consumable"
          onChange={(tags: string[]) => patch({ tags })} />
      </FormSection>

      {/* ── Weapon Stats ────────────────────────────────────── */}
      {isWeapon && (
        <FormSection title="Weapon Stats">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 8, borderLeft: '2px solid var(--border)' }}>
            <FormRow cols={3}>
              <LabeledInput label="Damage Dice" type="number" min={1} value={weapon.damage.diceCount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ weaponStats: { ...weapon, damage: { ...weapon.damage, diceCount: Number(e.target.value) } } })} />
              <LabeledSelect label="Die Size" value={String(weapon.damage.dieSize)}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => patch({ weaponStats: { ...weapon, damage: { ...weapon.damage, dieSize: Number(e.target.value) as 4|6|8|10|12|20|100 } } })}
                options={DIE_SIZES.map(d => ({ value: String(d), label: `d${d}` }))} />
              <LabeledInput label="Damage Modifier" type="number" value={weapon.damage.modifier ?? 0}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ weaponStats: { ...weapon, damage: { ...weapon.damage, modifier: Number(e.target.value) } } })} />
            </FormRow>
            <LabeledSelect label="Damage Type" value={weapon.damageType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => patch({ weaponStats: { ...weapon, damageType: e.target.value as DamageType } })}
              options={DAMAGE_TYPES.map(d => ({ value: d, label: d }))} />
            <LabeledInput label="Attack Bonus (additional)" type="number" value={weapon.attackBonus ?? 0}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ weaponStats: { ...weapon, attackBonus: Number(e.target.value) } })} />

            {/* Secondary damage (versatile / alternate form) */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-2)' }}>
                  Secondary Damage
                  <span style={{ fontWeight: 400, textTransform: 'none', marginLeft: 6 }}>— optional, shown in the 5th column (e.g. versatile two-hand)</span>
                </p>
                {weapon.secondaryDamage ? (
                  <button type="button" className="btn btn-ghost" style={{ fontSize: 11, color: 'var(--accent-2)' }}
                    onClick={() => patch({ weaponStats: { ...weapon, secondaryDamage: undefined } })}>
                    Remove
                  </button>
                ) : (
                  <button type="button" className="btn btn-ghost" style={{ fontSize: 11 }}
                    onClick={() => patch({ weaponStats: { ...weapon, secondaryDamage: { roll: { diceCount: 1, dieSize: 8, modifier: 0 }, type: weapon.damageType } } })}>
                    + Add secondary damage
                  </button>
                )}
              </div>
              {weapon.secondaryDamage && (
                <FormRow cols={4}>
                  <LabeledInput label="Dice Count" type="number" min={1}
                    value={weapon.secondaryDamage.roll.diceCount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ weaponStats: { ...weapon, secondaryDamage: { ...weapon.secondaryDamage!, roll: { ...weapon.secondaryDamage!.roll, diceCount: Number(e.target.value) } } } })} />
                  <LabeledSelect label="Die Size" value={String(weapon.secondaryDamage.roll.dieSize)}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => patch({ weaponStats: { ...weapon, secondaryDamage: { ...weapon.secondaryDamage!, roll: { ...weapon.secondaryDamage!.roll, dieSize: Number(e.target.value) as 4|6|8|10|12|20|100 } } } })}
                    options={DIE_SIZES.map(d => ({ value: String(d), label: `d${d}` }))} />
                  <LabeledInput label="Modifier" type="number"
                    value={weapon.secondaryDamage.roll.modifier ?? 0}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ weaponStats: { ...weapon, secondaryDamage: { ...weapon.secondaryDamage!, roll: { ...weapon.secondaryDamage!.roll, modifier: Number(e.target.value) } } } })} />
                  <LabeledSelect label="Damage Type" value={weapon.secondaryDamage.type}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => patch({ weaponStats: { ...weapon, secondaryDamage: { ...weapon.secondaryDamage!, type: e.target.value as DamageType } } })}
                    options={DAMAGE_TYPES.map(d => ({ value: d, label: d }))} />
                </FormRow>
              )}
            </div>

            <PropertyChips category={cat} selected={getProps()} onChange={setProperties} allDbProps={allDbProps} />
          </div>
        </FormSection>
      )}

      {/* ── Armor Stats ─────────────────────────────────────── */}
      {isArmor && (
        <FormSection title="Armor Stats">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 8, borderLeft: '2px solid var(--border)' }}>
            <FormRow cols={2}>
              <LabeledInput label="Base AC" type="number" min={0} value={item.armorStats?.baseAC ?? 10}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ armorStats: { ...item.armorStats, baseAC: Number(e.target.value) } })} />
              <LabeledInput label="Max DEX Bonus (−1 = unlimited)" type="number" min={-1}
                value={item.armorStats?.maxDexBonus !== undefined ? item.armorStats.maxDexBonus : -1}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const v = Number(e.target.value);
                  patch({ armorStats: { ...item.armorStats, baseAC: item.armorStats?.baseAC ?? 10, maxDexBonus: v < 0 ? undefined : v } });
                }} />
            </FormRow>
            <FormRow>
              <LabeledInput label="STR Requirement" type="number" min={0}
                value={item.armorStats?.strengthRequired ?? 0}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ armorStats: { ...item.armorStats, baseAC: item.armorStats?.baseAC ?? 10, strengthRequired: Number(e.target.value) || undefined } })} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', paddingTop: 20 }}>
                <input type="checkbox" checked={item.armorStats?.stealthDisadvantage ?? false}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ armorStats: { ...item.armorStats, baseAC: item.armorStats?.baseAC ?? 10, stealthDisadvantage: e.target.checked } })}
                  style={{ accentColor: 'var(--accent)' }} /> Stealth Disadvantage
              </label>
            </FormRow>
            <PropertyChips category={cat} selected={getProps()} onChange={setProperties} allDbProps={allDbProps} />
          </div>
        </FormSection>
      )}

      {/* ── Shield Stats ─────────────────────────────────────── */}
      {isShield && (
        <FormSection title="Shield Stats">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 8, borderLeft: '2px solid var(--border)' }}>
            <p style={{ fontSize: 12, color: 'var(--text-2)' }}>
              Shields grant a flat bonus to AC regardless of DEX or other attributes.
            </p>
            <FormRow cols={2}>
              <LabeledInput label="AC Bonus" type="number" min={0} value={shield.acBonus}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ shieldStats: { ...shield, acBonus: Number(e.target.value) } })} />
              <LabeledInput label="STR Requirement" type="number" min={0}
                value={shield.strengthRequired ?? 0}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ shieldStats: { ...shield, strengthRequired: Number(e.target.value) || undefined } })} />
            </FormRow>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={shield.stealthDisadvantage ?? false}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ shieldStats: { ...shield, stealthDisadvantage: e.target.checked } })}
                style={{ accentColor: 'var(--accent)' }} /> Stealth Disadvantage
            </label>
            <PropertyChips category={cat} selected={getProps()} onChange={setProperties} allDbProps={allDbProps} />
          </div>
        </FormSection>
      )}

      {/* ── Generic properties (tool, gear, etc.) ──────────── */}
      {!hasMechStats && (
        <FormSection title="Properties">
          <PropertyChips category={cat} selected={getProps()} onChange={setProperties} allDbProps={allDbProps} />
        </FormSection>
      )}

      {/* ── Features & Abilities ─────────────────────────────── */}
      <FormSection title="Features & Abilities">
        <FeatureEditor features={item.features ?? []} onChange={(features) => patch({ features })} />
      </FormSection>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8 }}>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={isSaving || !item.name?.trim()}>
          {isSaving ? 'Saving…' : 'Save Item'}
        </button>
      </div>
    </form>
  );
}
