import { useCharacterStore } from '@/store/characterStore';
import type { Character, DerivedStats } from '@/types/character';

interface Props { character: Character; derived: DerivedStats; }

export function CombatTab({ character }: Props) {
  const { addDeathSave, resetDeathSaves, shortRest, longRest, addCondition, removeCondition } = useCharacterStore();

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Death saves */}
      {character.health.current === 0 && (
        <div className="card" style={{ borderColor: 'var(--accent-2)' }}>
          <p className="label" style={{ marginBottom: 8 }}>Death Saving Throws</p>
          <div style={{ display: 'flex', gap: 16 }}>
            <SaveRow
              label="Successes"
              count={character.health.deathSaves.successes}
              color="var(--accent-4)"
              onAdd={() => addDeathSave('success')}
            />
            <SaveRow
              label="Failures"
              count={character.health.deathSaves.failures}
              color="var(--accent-2)"
              onAdd={() => addDeathSave('failure')}
            />
          </div>
          <button className="btn btn-ghost" style={{ marginTop: 8, fontSize: 12 }} onClick={resetDeathSaves}>
            Reset
          </button>
        </div>
      )}

      {/* Conditions */}
      <div className="card">
        <p className="label" style={{ marginBottom: 8 }}>Conditions</p>
        {character.conditions.length === 0 ? (
          <p style={{ color: 'var(--text-2)', fontSize: 13 }}>No conditions active.</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {character.conditions.map(c => (
              <div key={c.id} style={{
                background: 'var(--bg-3)',
                border: '1px solid var(--accent-2)',
                borderRadius: 20,
                padding: '3px 10px',
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                {c.name}
                <button
                  onClick={() => removeCondition(c.id)}
                  style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1 }}
                >×</button>
              </div>
            ))}
          </div>
        )}
        <button
          className="btn btn-ghost"
          style={{ marginTop: 10, fontSize: 12 }}
          onClick={() => {
            const name = prompt('Condition name:');
            if (name) addCondition({ id: crypto.randomUUID(), name });
          }}
        >
          + Add Condition
        </button>
      </div>

      {/* Resources */}
      {character.resources.length > 0 && (
        <div className="card">
          <p className="label" style={{ marginBottom: 8 }}>Resources</p>
          {character.resources.map(r => (
            <ResourceRow key={r.id} resource={r} />
          ))}
        </div>
      )}

      {/* Rests */}
      <div className="card">
        <p className="label" style={{ marginBottom: 8 }}>Rests</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => shortRest(0)}>Short Rest</button>
          <button className="btn btn-ghost" onClick={longRest}>Long Rest</button>
        </div>
      </div>

    </div>
  );
}

function SaveRow({ label, count, color, onAdd }: { label: string; count: number; color: string; onAdd: () => void }) {
  return (
    <div>
      <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4 }}>{label}</p>
      <div style={{ display: 'flex', gap: 4 }}>
        {[0,1,2].map(i => (
          <button
            key={i}
            onClick={onAdd}
            style={{
              width: 24, height: 24, borderRadius: '50%',
              background: i < count ? color : 'var(--bg-2)',
              border: `2px solid ${color}`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ResourceRow({ resource }: { resource: import('@/types/character').ResourceState }) {
  const { expendResource, restoreResource } = useCharacterStore();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <span style={{ flex: 1, fontSize: 13 }}>{resource.name}</span>
      <button onClick={() => expendResource(resource.id)} className="btn btn-ghost" style={{ padding: '2px 8px' }}>−</button>
      <span style={{ minWidth: 40, textAlign: 'center', fontWeight: 700 }}>
        {resource.current}/{resource.max}
      </span>
      <button onClick={() => restoreResource(resource.id, 1)} className="btn btn-ghost" style={{ padding: '2px 8px' }}>+</button>
    </div>
  );
}
