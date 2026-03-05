import { useState } from 'react';
import { useCharacterStore } from '@/store/characterStore';
import { useItem, useItems } from '@/hooks/useGameDatabase';
import type { Character, DerivedStats, InventoryEntry } from '@/types/character';
import type { DBItem } from '@/db/schema';

interface Props { character: Character; derived: DerivedStats }

export function InventoryTab({ character }: Props) {
  const { removeInventoryEntry, updateInventoryEntry, addInventoryEntry } = useCharacterStore();
  const [addingItem, setAddingItem] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState(false);

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── Currency ───────────────────────────────────────── */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <p className="label">Currency</p>
          <button className="btn btn-ghost" style={{ fontSize: 12 }}
            onClick={() => setEditingCurrency(!editingCurrency)}>
            {editingCurrency ? 'Done' : 'Edit'}
          </button>
        </div>
        <CurrencyRow editing={editingCurrency} currency={character.currency} />
      </div>

      {/* ── Inventory ──────────────────────────────────────── */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <p className="label">Inventory ({character.inventory.length})</p>
          <button className="btn btn-primary" style={{ fontSize: 12 }}
            onClick={() => setAddingItem(!addingItem)}>
            {addingItem ? 'Cancel' : '+ Add Item'}
          </button>
        </div>

        {/* Item picker */}
        {addingItem && (
          <ItemPicker
            onAdd={(item, qty) => {
              addInventoryEntry({
                id: crypto.randomUUID(),
                itemId: item.id,
                quantity: qty,
                attuned: false,
              });
              setAddingItem(false);
            }}
            onAddCustom={(name) => {
              addInventoryEntry({
                id: crypto.randomUUID(),
                itemId: `custom-${crypto.randomUUID()}`,
                quantity: 1,
                attuned: false,
                customName: name,
              });
              setAddingItem(false);
            }}
          />
        )}

        {/* Item list */}
        {character.inventory.length === 0 && !addingItem ? (
          <p style={{ color: 'var(--text-2)', fontSize: 13 }}>No items yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: addingItem ? 12 : 0 }}>
            {character.inventory.map(entry => (
              <InventoryRow
                key={entry.id}
                entry={entry}
                equipped={Object.values(character.equipped).includes(entry.id)}
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
    <div style={{
      border: '1px solid var(--accent)', borderRadius: 8, overflow: 'hidden', marginBottom: 4,
    }}>
      {/* Search row */}
      <div style={{ padding: 10, background: 'var(--bg-2)', display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          placeholder="Search items..."
          style={{ flex: 1, margin: 0 }}
          autoFocus
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <span style={{ fontSize: 12, color: 'var(--text-2)' }}>Qty</span>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQty(Math.max(1, Number(e.target.value)))}
            style={{ width: 50, margin: 0 }}
          />
        </div>
      </div>

      {/* Results */}
      <div style={{ maxHeight: 220, overflowY: 'auto' }}>
        {allItems.length === 0 ? (
          <div style={{ padding: '12px 14px', color: 'var(--text-2)', fontSize: 13 }}>
            No items in the database. Add some in Game Database, or add a custom item below.
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '12px 14px', color: 'var(--text-2)', fontSize: 13 }}>
            No items match "{search}".
          </div>
        ) : (
          filtered.map(item => (
            <button
              key={item.id}
              onClick={() => onAdd(item, qty)}
              style={{
                width: '100%', textAlign: 'left', padding: '8px 14px',
                borderBottom: '1px solid var(--border)', background: 'transparent',
                display: 'flex', alignItems: 'center', gap: 10,
                cursor: 'pointer',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{item.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-2)' }}>
                  {[item.category, item.rarity].filter(Boolean).join(' · ')}
                  {item.description && ` · ${item.description.slice(0, 60)}${item.description.length > 60 ? '…' : ''}`}
                </div>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, color: 'var(--accent)',
                background: 'color-mix(in srgb, var(--accent) 12%, var(--bg-1))',
                border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
                borderRadius: 4, padding: '2px 7px', flexShrink: 0,
              }}>
                + Add
              </span>
            </button>
          ))
        )}

        {/* Custom item option — always shown when there's a search term */}
        {search.trim().length > 0 && (
          <button
            onClick={() => onAddCustom(search.trim())}
            style={{
              width: '100%', textAlign: 'left', padding: '8px 14px',
              background: 'color-mix(in srgb, var(--accent) 6%, var(--bg-1))',
              borderTop: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 10,
              cursor: 'pointer',
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>Add "{search.trim()}" as custom item</div>
              <div style={{ fontSize: 11, color: 'var(--text-2)' }}>Not linked to the database</div>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700, color: 'var(--accent-4)',
              background: 'color-mix(in srgb, var(--accent-4) 12%, var(--bg-1))',
              border: '1px solid color-mix(in srgb, var(--accent-4) 30%, transparent)',
              borderRadius: 4, padding: '2px 7px', flexShrink: 0,
            }}>
              Custom
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

// ── Currency row ───────────────────────────────────────────────

function CurrencyRow({ editing, currency }: {
  editing: boolean;
  currency: Character['currency'];
}) {
  const { patchCharacter } = useCharacterStore();
  const coins = ['pp', 'gp', 'ep', 'sp', 'cp'] as const;
  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
      {coins.map(coin => (
        <div key={coin} style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: 11, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 3 }}>{coin}</div>
          {editing ? (
            <input
              type="number"
              min={0}
              value={currency[coin]}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                patchCharacter({ currency: { ...currency, [coin]: Math.max(0, Number(e.target.value)) } })}
              style={{ width: '100%', textAlign: 'center', padding: '4px 2px', fontSize: 15, fontWeight: 700 }}
            />
          ) : (
            <div style={{ fontSize: 16, fontWeight: 700 }}>{currency[coin]}</div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Inventory row ──────────────────────────────────────────────

function InventoryRow({ entry, equipped, onRemove, onQtyChange }: {
  entry: InventoryEntry;
  equipped: boolean;
  onRemove: () => void;
  onQtyChange: (qty: number) => void;
}) {
  const item = useItem(entry.itemId);
  const [expanded, setExpanded] = useState(false);
  const displayName = entry.customName ?? item?.name ?? `Unknown (${entry.itemId.slice(0, 8)})`;

  return (
    <div style={{
      border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden',
      background: equipped ? 'color-mix(in srgb, var(--accent-5) 8%, var(--bg-2))' : 'var(--bg-2)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px' }}>
        {/* Expand if item has a description */}
        {(item?.description || item?.weaponStats || item?.armorStats) ? (
          <button onClick={() => setExpanded(!expanded)}
            style={{ fontWeight: equipped ? 700 : 500, fontSize: 13, textAlign: 'left', flex: 1 }}>
            {equipped && <span style={{ marginRight: 5 }}>⚔️</span>}
            {entry.attuned && <span style={{ marginRight: 5 }}>✨</span>}
            {displayName}
            {item?.category && (
              <span style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 400, marginLeft: 6 }}>{item.category}</span>
            )}
          </button>
        ) : (
          <span style={{ fontWeight: equipped ? 700 : 400, fontSize: 13, flex: 1 }}>
            {equipped && <span style={{ marginRight: 5 }}>⚔️</span>}
            {entry.attuned && <span style={{ marginRight: 5 }}>✨</span>}
            {displayName}
          </span>
        )}
        <input
          type="number"
          value={entry.quantity}
          min={0}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onQtyChange(Number(e.target.value))}
          style={{ width: 48, textAlign: 'center', margin: 0, fontSize: 13 }}
        />
        <button onClick={onRemove}
          style={{ color: 'var(--accent-2)', fontSize: 18, lineHeight: 1, padding: '0 4px' }}>×</button>
      </div>
      {expanded && item && (
        <div style={{ padding: '4px 10px 10px', borderTop: '1px solid var(--border)' }}>
          {item.description && (
            <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6, lineHeight: 1.4 }}>{item.description}</p>
          )}
          {item.weaponStats && (
            <p style={{ fontSize: 11, color: 'var(--text-2)' }}>
              Damage: {item.weaponStats.damage.diceCount}d{item.weaponStats.damage.dieSize}
              {item.weaponStats.damage.modifier !== 0 ? ` ${item.weaponStats.damage.modifier > 0 ? '+' : ''}${item.weaponStats.damage.modifier}` : ''}
              {' '}{item.weaponStats.damageType}
            </p>
          )}
          {item.armorStats && (
            <p style={{ fontSize: 11, color: 'var(--text-2)' }}>
              AC: {item.armorStats.baseAC}
              {item.armorStats.maxDexBonus !== undefined && item.armorStats.maxDexBonus >= 0 ? ` (max +${item.armorStats.maxDexBonus} DEX)` : ''}
            </p>
          )}
          {item.rarity && item.rarity !== 'common' && (
            <p style={{ fontSize: 11, color: 'var(--accent)', marginTop: 4, fontStyle: 'italic' }}>{item.rarity}</p>
          )}
        </div>
      )}
    </div>
  );
}
