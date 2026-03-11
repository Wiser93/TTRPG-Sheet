import { useState } from 'react';
import type { ItemProperty, ItemCategory } from '@/types/game';
import { LabeledInput, LabeledTextarea } from '@/components/ui/FormField';

const ALL_CATEGORIES: ItemCategory[] = [
  'weapon', 'armor', 'shield', 'ammunition',
  'potion', 'scroll', 'wand', 'ring', 'wondrous',
  'tool', 'gear', 'trade_goods', 'currency', 'custom',
];

const CATEGORY_LABELS: Record<ItemCategory, string> = {
  weapon: 'Weapon', armor: 'Armor', shield: 'Shield', ammunition: 'Ammunition',
  potion: 'Potion', scroll: 'Scroll', wand: 'Wand', ring: 'Ring',
  wondrous: 'Wondrous', tool: 'Tool', gear: 'Gear',
  trade_goods: 'Trade Goods', currency: 'Currency', custom: 'Custom',
};

interface Props {
  initial?: Partial<ItemProperty>;
  onSave: (prop: Omit<ItemProperty, 'id'>) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function PropertyForm({ initial, onSave, onCancel, isSaving }: Props) {
  const initCats = initial?.applicableCategories;
  const [allCategories, setAllCategories] = useState<boolean>(!initCats || initCats === 'all');
  const [selectedCats, setSelectedCats] = useState<ItemCategory[]>(
    Array.isArray(initCats) ? initCats : []
  );
  const [prop, setProp] = useState<Partial<ItemProperty>>({
    name: '', description: '', isMastery: false, ...initial,
  });

  const patch = (changes: Partial<ItemProperty>) => setProp(prev => ({ ...prev, ...changes }));

  function toggleCat(cat: ItemCategory) {
    setSelectedCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prop.name?.trim()) return;
    const applicableCategories: ItemProperty['applicableCategories'] =
      allCategories ? 'all' : selectedCats.length > 0 ? selectedCats : 'all';
    onSave({
      name: prop.name.trim(),
      description: prop.description?.trim() ?? '',
      applicableCategories,
      isMastery: prop.isMastery || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <LabeledInput label="Property Name"
        value={prop.name ?? ''}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ name: e.target.value })}
        placeholder="e.g. finesse, light, stealth disadvantage, mastery"
        required />

      <LabeledTextarea label="Description"
        value={prop.description ?? ''}
        rows={4}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => patch({ description: e.target.value })}
        placeholder="What this property does — shown as a tooltip when clicked." />

      {/* Applicable Categories */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-2)' }}>
          Applicable To
        </p>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
          <input type="checkbox" checked={allCategories}
            onChange={e => { setAllCategories(e.target.checked); if (e.target.checked) setSelectedCats([]); }}
            style={{ accentColor: 'var(--accent)' }} />
          <span style={{ fontWeight: 600 }}>All categories (universal property)</span>
        </label>
        {!allCategories && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '10px 12px',
            background: 'var(--bg-2)', borderRadius: 8, border: '1px solid var(--border)' }}>
            {ALL_CATEGORIES.map(cat => {
              const checked = selectedCats.includes(cat);
              return (
                <label key={cat} style={{
                  display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, cursor: 'pointer',
                  padding: '3px 8px', borderRadius: 12,
                  background: checked ? 'var(--accent)' : 'var(--bg-3)',
                  color: checked ? '#fff' : 'var(--text-1)',
                  border: `1px solid ${checked ? 'var(--accent)' : 'var(--border)'}`,
                  fontWeight: checked ? 600 : 400, transition: 'all 120ms',
                }}>
                  <input type="checkbox" checked={checked} onChange={() => toggleCat(cat)} style={{ display: 'none' }} />
                  {CATEGORY_LABELS[cat]}
                </label>
              );
            })}
            {selectedCats.length === 0 && (
              <p style={{ fontSize: 12, color: 'var(--accent-2)', fontStyle: 'italic' }}>
                Select at least one category, or enable "All categories" above.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Mastery */}
      <label style={{
        display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
        padding: '10px 12px', background: 'var(--bg-2)', borderRadius: 8,
        border: `1px solid ${prop.isMastery ? 'color-mix(in srgb,var(--accent) 40%,var(--border))' : 'var(--border)'}`,
      }}>
        <input type="checkbox" checked={!!prop.isMastery}
          onChange={e => patch({ isMastery: e.target.checked || undefined })}
          style={{ accentColor: 'var(--accent)', width: 16, height: 16 }} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Mastery Property</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
            Only shown on the item card when the character is proficient with that item.
          </div>
        </div>
      </label>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={isSaving || !prop.name?.trim()}>
          {isSaving ? 'Saving…' : 'Save Property'}
        </button>
      </div>
    </form>
  );
}
