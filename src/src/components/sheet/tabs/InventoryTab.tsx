import { useCharacterStore } from '@/store/characterStore';
import { useItem } from '@/hooks/useGameDatabase';
import type { Character, DerivedStats, InventoryEntry } from '@/types/character';

interface Props { character: Character; derived: DerivedStats; }

export function InventoryTab({ character }: Props) {
  const { removeInventoryEntry, updateInventoryEntry } = useCharacterStore();

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Currency */}
      <div className="card">
        <p className="label" style={{ marginBottom: 8 }}>Currency</p>
        <div style={{ display: 'flex', gap: 10 }}>
          {(['pp','gp','ep','sp','cp'] as const).map(coin => (
            <div key={coin} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-2)', textTransform: 'uppercase' }}>{coin}</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{character.currency[coin]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Item list */}
      <div className="card">
        <p className="label" style={{ marginBottom: 8 }}>
          Inventory ({character.inventory.length} items)
        </p>

        {character.inventory.length === 0 ? (
          <p style={{ color: 'var(--text-2)', fontSize: 13 }}>No items in inventory.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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

function InventoryRow({ entry, equipped, onRemove, onQtyChange }: {
  entry: InventoryEntry;
  equipped: boolean;
  onRemove: () => void;
  onQtyChange: (qty: number) => void;
}) {
  const item = useItem(entry.itemId);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
      {equipped && (
        <span title="Equipped" style={{ color: 'var(--accent-5)', fontSize: 12 }}>⚔️</span>
      )}
      {entry.attuned && (
        <span title="Attuned" style={{ color: 'var(--accent)', fontSize: 12 }}>✨</span>
      )}
      <span style={{ flex: 1, fontWeight: equipped ? 600 : 400 }}>
        {entry.customName ?? item?.name ?? `Item (${entry.itemId.slice(0,8)})`}
      </span>
      <input
        type="number"
        value={entry.quantity}
        min={0}
        onChange={e => onQtyChange(Number(e.target.value))}
        style={{ width: 50, textAlign: 'center' }}
      />
      <button
        onClick={onRemove}
        style={{ color: 'var(--accent-2)', fontSize: 16, lineHeight: 1, padding: '0 4px' }}
      >×</button>
    </div>
  );
}
