import { useCharacterStore } from '@/store/characterStore';
import { useSpell } from '@/hooks/useGameDatabase';
import type { Character, DerivedStats, KnownSpell } from '@/types/character';

interface Props { character: Character; derived: DerivedStats; }

export function SpellsTab({ character, derived }: Props) {
  const { expendSlot, restoreSlot, toggleSpellPrepared } = useCharacterStore();

  const slotLevels = character.spellSlots.filter(s => s.max > 0);

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Spell attack / save DC */}
      {Object.keys(derived.spellAttackBonus).length > 0 && (
        <div style={{ display: 'flex', gap: 8 }}>
          {Object.entries(derived.spellAttackBonus).map(([classId, bonus]) => (
            <div key={classId} className="card" style={{ flex: 1, textAlign: 'center' }}>
              <div className="label">Spell Attack</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>+{bonus}</div>
            </div>
          ))}
          {Object.entries(derived.spellSaveDC).map(([classId, dc]) => (
            <div key={classId} className="card" style={{ flex: 1, textAlign: 'center' }}>
              <div className="label">Save DC</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{dc}</div>
            </div>
          ))}
        </div>
      )}

      {/* Spell slots */}
      {slotLevels.length > 0 && (
        <div className="card">
          <p className="label" style={{ marginBottom: 10 }}>Spell Slots</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {slotLevels.map(slot => (
              <div key={slot.level} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 60, fontSize: 12, color: 'var(--text-2)' }}>
                  Level {slot.level}
                </span>
                <div style={{ display: 'flex', gap: 4, flex: 1 }}>
                  {Array.from({ length: slot.max }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => i < slot.current ? expendSlot(slot.level) : restoreSlot(slot.level)}
                      style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: i < slot.current ? 'var(--accent)' : 'var(--bg-2)',
                        border: '2px solid var(--accent)',
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-2)', minWidth: 32, textAlign: 'right' }}>
                  {slot.current}/{slot.max}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Known spells by level — grouped rendering handled below */}

      {/* Cantrips */}
      <SpellList
        title="Cantrips"
        spells={character.knownSpells}
        onTogglePrepare={toggleSpellPrepared}
      />

      {character.knownSpells.length === 0 && (
        <p style={{ color: 'var(--text-2)', fontSize: 13 }}>
          No spells added yet. Add spells from the Game Database.
        </p>
      )}
    </div>
  );
}

function SpellList({ title, spells, onTogglePrepare }: {
  title: string;
  spells: KnownSpell[];
  onTogglePrepare: (spellId: string, classId: string) => void;
}) {
  if (spells.length === 0) return null;
  return (
    <div className="card">
      <p className="label" style={{ marginBottom: 8 }}>{title}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {spells.map(s => (
          <SpellRow key={`${s.spellId}-${s.classId}`} knownSpell={s} onToggle={onTogglePrepare} />
        ))}
      </div>
    </div>
  );
}

function SpellRow({ knownSpell, onToggle }: {
  knownSpell: KnownSpell;
  onToggle: (spellId: string, classId: string) => void;
}) {
  const spell = useSpell(knownSpell.spellId);
  if (!spell) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
      <button
        onClick={() => onToggle(knownSpell.spellId, knownSpell.classId)}
        style={{
          width: 16, height: 16, borderRadius: 3,
          background: knownSpell.prepared ? 'var(--accent)' : 'var(--bg-2)',
          border: '1px solid var(--border)',
          flexShrink: 0,
        }}
      />
      <span style={{ flex: 1 }}>{spell.name}</span>
      <span style={{ color: 'var(--text-2)', fontSize: 11 }}>
        {spell.level === 0 ? 'Cantrip' : `Lv${spell.level}`}
      </span>
    </div>
  );
}
