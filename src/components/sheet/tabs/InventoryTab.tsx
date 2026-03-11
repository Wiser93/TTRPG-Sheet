import { useState } from 'react';
import { useCharacterStore } from '@/store/characterStore';
import { useItem, useItems, useItemProperties } from '@/hooks/useGameDatabase';
import type { Character, DerivedStats, InventoryEntry } from '@/types/character';
import type { DBItem } from '@/db/schema';
import type { EquipSlot, ItemCategory } from '@/types/game';

interface Props { character: Character; derived: DerivedStats }

const WEAPON_SLOTS: { slot: EquipSlot; label: string }[] = [
  { slot: 'mainHand', label: 'Main Hand' },
  { slot: 'offHand',  label: 'Off Hand'  },
  { slot: 'twoHand',  label: 'Two-Handed'},
];
const ARMOR_SLOTS: { slot: EquipSlot; label: string }[] = [
  { slot: 'head',  label: 'Head'  },
  { slot: 'chest', label: 'Body'  },
  { slot: 'hands', label: 'Hands' },
  { slot: 'feet',  label: 'Feet'  },
  { slot: 'neck',  label: 'Neck'  },
  { slot: 'ring1', label: 'Ring 1'},
  { slot: 'ring2', label: 'Ring 2'},
  { slot: 'cloak', label: 'Cloak' },
];

export function InventoryTab({ character }: Props) {
  const { removeInventoryEntry, updateInventoryEntry, addInventoryEntry } = useCharacterStore();
  const [addingItem, setAddingItem] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState(false);

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── Currency ────────────────────────────────────── */}
      <div className="card">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
          <p className="label">Currency</p>
          <button className="btn btn-ghost" style={{ fontSize:12 }}
            onClick={() => setEditingCurrency(!editingCurrency)}>
            {editingCurrency ? 'Done' : 'Edit'}
          </button>
        </div>
        <CurrencyRow editing={editingCurrency} currency={character.currency} />
      </div>

      {/* ── Inventory ───────────────────────────────────── */}
      <div className="card">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
          <p className="label">Inventory ({character.inventory.length})</p>
          <button className="btn btn-primary" style={{ fontSize:12 }}
            onClick={() => setAddingItem(!addingItem)}>
            {addingItem ? 'Cancel' : '+ Add Item'}
          </button>
        </div>

        {addingItem && (
          <ItemPicker
            onAdd={(item, qty) => {
              addInventoryEntry({ id: crypto.randomUUID(), itemId: item.id, quantity: qty, attuned: false });
              setAddingItem(false);
            }}
            onAddCustom={(name) => {
              addInventoryEntry({ id: crypto.randomUUID(), itemId: `custom-${crypto.randomUUID()}`, quantity: 1, attuned: false, customName: name });
              setAddingItem(false);
            }}
          />
        )}

        {character.inventory.length === 0 && !addingItem ? (
          <p style={{ color:'var(--text-2)', fontSize:13 }}>No items yet.</p>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:4, marginTop: addingItem ? 12 : 0 }}>
            {character.inventory.map(entry => (
              <InventoryRow
                key={entry.id}
                entry={entry}
                equipped={character.equipped}
                onRemove={() => removeInventoryEntry(entry.id)}
                onQtyChange={qty => updateInventoryEntry(entry.id, { quantity: qty })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Item picker ────────────────────────────────────────────────

function ItemPicker({ onAdd, onAddCustom }: {
  onAdd: (item: DBItem, qty: number) => void;
  onAddCustom: (name: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [qty, setQty] = useState(1);
  const allItems = useItems() ?? [];
  const filtered = allItems.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    (i.category ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ border:'1px solid var(--accent)', borderRadius:8, overflow:'hidden', marginBottom:4 }}>
      <div style={{ padding:10, background:'var(--bg-2)', display:'flex', gap:8, alignItems:'center' }}>
        <input value={search} autoFocus
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          placeholder="Search items..." style={{ flex:1, margin:0 }} />
        <span style={{ fontSize:12, color:'var(--text-2)', flexShrink:0 }}>Qty</span>
        <input type="number" min={1} value={qty} style={{ width:48, margin:0 }}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQty(Math.max(1, Number(e.target.value)))} />
      </div>
      <div style={{ maxHeight:220, overflowY:'auto' }}>
        {allItems.length === 0 ? (
          <p style={{ padding:'12px 14px', color:'var(--text-2)', fontSize:13 }}>
            No items in database. Add some in Game Database, or type a name to add a custom item.
          </p>
        ) : filtered.length === 0 && search ? null : (
          filtered.map(item => (
            <button key={item.id} onClick={() => onAdd(item, qty)}
              style={{ width:'100%', textAlign:'left', padding:'8px 14px', borderBottom:'1px solid var(--border)', background:'transparent', display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:600, fontSize:13 }}>{item.name}</div>
                <div style={{ fontSize:11, color:'var(--text-2)' }}>
                  {[item.category, item.rarity].filter(Boolean).join(' · ')}
                </div>
              </div>
              <span style={{ fontSize:11, fontWeight:700, color:'var(--accent)', background:'color-mix(in srgb, var(--accent) 12%, var(--bg-1))', borderRadius:4, padding:'2px 7px', flexShrink:0 }}>+</span>
            </button>
          ))
        )}
        {search.trim() && (
          <button onClick={() => onAddCustom(search.trim())}
            style={{ width:'100%', textAlign:'left', padding:'8px 14px', background:'color-mix(in srgb, var(--accent) 6%, var(--bg-1))', borderTop:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600, fontSize:13 }}>Add "{search.trim()}" as custom item</div>
              <div style={{ fontSize:11, color:'var(--text-2)' }}>Not linked to database</div>
            </div>
            <span style={{ fontSize:11, fontWeight:700, color:'var(--accent-4)', background:'color-mix(in srgb, var(--accent-4) 12%, var(--bg-1))', borderRadius:4, padding:'2px 7px', flexShrink:0 }}>Custom</span>
          </button>
        )}
      </div>
    </div>
  );
}

// ── Currency ───────────────────────────────────────────────────

function CurrencyRow({ editing, currency }: { editing: boolean; currency: Character['currency'] }) {
  const { patchCharacter } = useCharacterStore();
  const coins = ['pp','gp','ep','sp','cp'] as const;
  return (
    <div style={{ display:'flex', gap:10, justifyContent:'space-between' }}>
      {coins.map(coin => (
        <div key={coin} style={{ textAlign:'center', flex:1 }}>
          <div style={{ fontSize:11, color:'var(--text-2)', textTransform:'uppercase', marginBottom:3 }}>{coin}</div>
          {editing ? (
            <input type="number" min={0} value={currency[coin]}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => patchCharacter({ currency: { ...currency, [coin]: Math.max(0, Number(e.target.value)) } })}
              style={{ width:'100%', textAlign:'center', padding:'4px 2px', fontSize:15, fontWeight:700 }} />
          ) : (
            <div style={{ fontSize:16, fontWeight:700 }}>{currency[coin]}</div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Inventory row ──────────────────────────────────────────────

function InventoryRow({ entry, equipped, onRemove, onQtyChange }: {
  entry: InventoryEntry;
  equipped: Character['equipped'];
  onRemove: () => void;
  onQtyChange: (qty: number) => void;
}) {
  const { equipItem, unequipItem } = useCharacterStore();
  const item = useItem(entry.itemId);
  const allProperties = useItemProperties() ?? [];
  const [expanded, setExpanded] = useState(false);
  const [showEquipMenu, setShowEquipMenu] = useState(false);
  const [qtyStr, setQtyStr] = useState<string | null>(null);

  const equippedSlot = (Object.entries(equipped) as [EquipSlot, string][])
    .find(([, id]) => id === entry.id)?.[0];
  const isEquipped = !!equippedSlot;

  const displayName = entry.customName ?? item?.name ?? `Item (${entry.itemId.slice(0,8)})`;
  const isWeapon = !!item?.weaponStats;
  const isArmor  = !!item?.armorStats;
  const availableSlots = isWeapon ? WEAPON_SLOTS : isArmor ? ARMOR_SLOTS :
    [{ slot: 'custom' as EquipSlot, label: 'Equip' }];

  return (
    <div style={{ border:'1px solid var(--border)', borderRadius:6, overflow:'visible',
      background: isEquipped ? 'color-mix(in srgb, var(--accent) 8%, var(--bg-2))' : 'var(--bg-2)',
      borderColor: isEquipped ? 'var(--accent)' : 'var(--border)',
      position: 'relative',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 10px' }}>
        {/* Equip toggle */}
        {(item?.weaponStats || item?.armorStats || item?.equipSlots) ? (
          <div style={{ position:'relative' }}>
            <button
              onClick={() => isEquipped ? unequipItem(entry.id) : setShowEquipMenu(!showEquipMenu)}
              title={isEquipped ? `Equipped: ${equippedSlot}` : 'Equip'}
              style={{
                width:22, height:22, borderRadius:4, fontSize:13, lineHeight:1,
                background: isEquipped ? 'var(--accent)' : 'var(--bg-3)',
                border: `1px solid ${isEquipped ? 'var(--accent)' : 'var(--border)'}`,
                color: isEquipped ? '#fff' : 'var(--text-2)',
              }}>
              {isEquipped ? '✓' : '○'}
            </button>
            {showEquipMenu && !isEquipped && (
              <div style={{
                position:'absolute', top:'100%', left:0, zIndex:50,
                background:'var(--bg-1)', border:'1px solid var(--border)',
                borderRadius:6, padding:4, minWidth:110, boxShadow:'0 4px 12px rgba(0,0,0,0.3)',
              }}>
                {availableSlots.map(({ slot, label }) => (
                  <button key={slot} onClick={() => { equipItem(entry.id, slot); setShowEquipMenu(false); }}
                    style={{ display:'block', width:'100%', textAlign:'left', padding:'5px 10px', fontSize:12, borderRadius:4 }}>
                    {label}
                  </button>
                ))}
                <button onClick={() => setShowEquipMenu(false)}
                  style={{ display:'block', width:'100%', textAlign:'left', padding:'5px 10px', fontSize:11, color:'var(--text-2)', borderRadius:4 }}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ width:22 }} />
        )}

        {/* Name */}
        <button onClick={() => item?.description && setExpanded(!expanded)}
          style={{ flex:1, textAlign:'left', fontSize:13, fontWeight: isEquipped ? 700 : 400 }}>
          {isEquipped && <span style={{ color:'var(--accent)', marginRight:4 }}>⚔</span>}
          {entry.attuned && <span style={{ marginRight:4 }}>✨</span>}
          {displayName}
          {item?.category && <span style={{ fontSize:11, color:'var(--text-2)', fontWeight:400, marginLeft:6 }}>{item.category}</span>}
        </button>

        {/* Qty */}
        <input type="number" value={qtyStr ?? entry.quantity} min={0}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQtyStr(e.target.value)}
          onBlur={() => {
            const parsed = parseInt(qtyStr ?? '', 10);
            onQtyChange(isNaN(parsed) ? entry.quantity : Math.max(0, parsed));
            setQtyStr(null);
          }}
          style={{ width:44, textAlign:'center', margin:0, fontSize:13 }} />

        <button onClick={onRemove} style={{ color:'var(--accent-2)', fontSize:18, lineHeight:1, padding:'0 2px' }}>×</button>
      </div>

      {expanded && item && (
        <div style={{ padding:'4px 10px 10px', borderTop:'1px solid var(--border)', borderRadius:'0 0 6px 6px', overflow:'hidden' }}>
          {item.description && <p style={{ fontSize:12, color:'var(--text-2)', marginBottom:6, lineHeight:1.5 }}>{item.description}</p>}
          {item.weaponStats && (
            <div style={{ marginBottom: 6 }}>
              <p style={{ fontSize:12, color:'var(--text-1)', marginBottom: item.weaponStats.properties.length > 0 ? 4 : 0 }}>
                {item.weaponStats.damage.diceCount}d{item.weaponStats.damage.dieSize}
                {item.weaponStats.damage.modifier ? ` ${item.weaponStats.damage.modifier > 0 ? '+' : ''}${item.weaponStats.damage.modifier}` : ''}
                {' · '}{item.weaponStats.damageType}
              </p>
              {item.weaponStats.properties.length > 0 && (
                <InlinePropertyBadges
                  properties={item.weaponStats.properties}
                  allProperties={allProperties}
                  itemCategory={item.category as ItemCategory} />
              )}
            </div>
          )}
          {item.armorStats && (
            <div style={{ marginBottom: 6 }}>
              <p style={{ fontSize:12, color:'var(--text-1)', marginBottom: 4 }}>
                AC {item.armorStats.baseAC}
                {item.armorStats.maxDexBonus !== undefined ? ` (max +${item.armorStats.maxDexBonus} DEX)` : ' + DEX'}
              </p>
              {(item.armorStats.properties?.length ?? 0) > 0 && (
                <InlinePropertyBadges
                  properties={item.armorStats.properties ?? []}
                  allProperties={allProperties}
                  itemCategory={item.category as ItemCategory} />
              )}
            </div>
          )}
          {item.shieldStats && (
            <div style={{ marginBottom: 6 }}>
              <p style={{ fontSize:12, color:'var(--text-1)', marginBottom: 4 }}>
                +{item.shieldStats.acBonus} AC (shield)
                {item.shieldStats.strengthRequired ? ` · STR ${item.shieldStats.strengthRequired}+` : ''}
                {item.shieldStats.stealthDisadvantage ? ' · stealth disadv.' : ''}
              </p>
              {(item.shieldStats.properties?.length ?? 0) > 0 && (
                <InlinePropertyBadges
                  properties={item.shieldStats.properties ?? []}
                  allProperties={allProperties}
                  itemCategory={item.category as ItemCategory} />
              )}
            </div>
          )}
          {(item.properties?.length ?? 0) > 0 && !item.weaponStats && !item.armorStats && !item.shieldStats && (
            <InlinePropertyBadges
              properties={item.properties ?? []}
              allProperties={allProperties}
              itemCategory={item.category as ItemCategory} />
          )}
          {item.rarity && item.rarity !== 'common' && (
            <p style={{ fontSize:11, color:'var(--accent)', marginTop:4, fontStyle:'italic' }}>{item.rarity}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Inline property badges for inventory expanded view ────────

function InlinePropertyBadges({
  properties, allProperties, itemCategory, showAll = false,
}: {
  properties: string[];
  allProperties: import('@/types/game').ItemProperty[];
  itemCategory: ItemCategory;
  showAll?: boolean;
}) {
  const [open, setOpen] = useState<string | null>(null);

  // Filter property definitions to those applicable to this category
  const applicable = allProperties.filter(ap => {
    const cats = ap.applicableCategories;
    return !cats || cats === 'all' || (Array.isArray(cats) && cats.includes(itemCategory));
  });

  // When showAll=true (armor/tool with no stored property strings), show all applicable defs
  const toShow = showAll
    ? applicable
    : applicable.filter(ap => properties.some(p => p.toLowerCase() === ap.name.toLowerCase()));

  // Also show any property strings that have no matching definition
  const unmatched = properties.filter(p => !applicable.some(ap => ap.name.toLowerCase() === p.toLowerCase()));

  if (toShow.length === 0 && unmatched.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {toShow.map(def => (
        <span key={def.id} style={{ position: 'relative', display: 'inline-block' }}>
          <button
            onClick={() => setOpen(open === def.id ? null : def.id)}
            style={{
              fontSize: 11, padding: '1px 7px', borderRadius: 10,
              background: def.isMastery ? 'color-mix(in srgb,var(--accent) 18%,var(--bg-3))' : 'var(--bg-3)',
              border: `1px solid ${def.isMastery ? 'var(--accent)' : 'var(--border)'}`,
              color: def.isMastery ? 'var(--accent)' : 'var(--text-2)',
              fontWeight: def.isMastery ? 700 : 400,
              cursor: 'pointer', textDecoration: 'underline dotted',
            }}>
            {def.name}{def.isMastery ? ' ★' : ''}
          </button>
          {open === def.id && (
            <div style={{
              position: 'absolute', bottom: '110%', left: 0,
              background: 'var(--bg-0)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '10px 12px', width: 220,
              zIndex: 200, boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
              fontSize: 12, lineHeight: 1.5,
            }}>
              <div style={{ fontWeight: 700, marginBottom: 4, color: def.isMastery ? 'var(--accent)' : 'var(--text-1)' }}>
                {def.name}{def.isMastery ? ' (Mastery)' : ''}
              </div>
              <div style={{ color: 'var(--text-2)' }}>{def.description}</div>
              <button onClick={() => setOpen(null)}
                style={{ position: 'absolute', top: 6, right: 8, fontSize: 14, color: 'var(--text-2)' }}>×</button>
            </div>
          )}
        </span>
      ))}
      {unmatched.map(p => (
        <span key={p} style={{
          fontSize: 11, padding: '1px 7px', borderRadius: 10,
          background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--text-2)',
        }}>{p}</span>
      ))}
    </div>
  );
}
