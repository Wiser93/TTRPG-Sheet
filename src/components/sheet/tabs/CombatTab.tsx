import { useCharacterStore } from '@/store/characterStore';
import type { Character, DerivedStats, ResourceState } from '@/types/character';

const ELEMENT_ICONS: Record<string, string> = {
  water: '💧', earth: '🪨', fire: '🔥', air: '💨',
};

const ELEMENT_COLORS: Record<string, string> = {
  water: '#61afef',
  earth: '#e5c07b',
  fire: '#e06c75',
  air: '#98c379',
};

interface Props { character: Character; derived: DerivedStats; }

export function CombatTab({ character, derived }: Props) {
  const {
    addDeathSave, resetDeathSaves, shortRest, longRest,
    addCondition, removeCondition,
    setElementalEmbodiment,
  } = useCharacterStore();

  // Work out which elements this character has paths in from their class choices
  const knownElements = getKnownElements(character);
  const hasElementalEmbodiment = knownElements.length > 0;

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Death saves — only when at 0 HP */}
      {character.health.current === 0 && (
        <div className="card" style={{ borderColor: 'var(--accent-2)' }}>
          <p className="label" style={{ marginBottom: 8 }}>Death Saving Throws</p>
          <div style={{ display: 'flex', gap: 16 }}>
            <SaveRow label="Successes" count={character.health.deathSaves.successes}
              color="var(--accent-4)" onAdd={() => addDeathSave('success')} />
            <SaveRow label="Failures" count={character.health.deathSaves.failures}
              color="var(--accent-2)" onAdd={() => addDeathSave('failure')} />
          </div>
          <button className="btn btn-ghost" style={{ marginTop: 8, fontSize: 12 }} onClick={resetDeathSaves}>
            Reset
          </button>
        </div>
      )}

      {/* Elemental Embodiment — shown when character has Elemental Path choices */}
      {hasElementalEmbodiment && (
        <div className="card">
          <p className="label" style={{ marginBottom: 8 }}>Elemental Embodiment</p>
          <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 10 }}>
            Choose an element to embody at the start of a rest.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {knownElements.map(element => {
              const active = character.elementalEmbodiment === element;
              const color = ELEMENT_COLORS[element];
              return (
                <button
                  key={element}
                  onClick={() => setElementalEmbodiment(active ? null : element as Character['elementalEmbodiment'])}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                    background: active ? color : 'var(--bg-2)',
                    color: active ? '#fff' : 'var(--text-1)',
                    border: `2px solid ${active ? color : 'var(--border)'}`,
                    transition: 'all 150ms ease',
                  }}
                >
                  {ELEMENT_ICONS[element]} {element.charAt(0).toUpperCase() + element.slice(1)}
                </button>
              );
            })}
            {character.elementalEmbodiment && (
              <button onClick={() => setElementalEmbodiment(null)}
                style={{ fontSize: 12, color: 'var(--text-2)', padding: '6px 10px' }}>
                Clear
              </button>
            )}
          </div>
          {character.elementalEmbodiment && (
            <p style={{ fontSize: 12, marginTop: 10, color: ELEMENT_COLORS[character.elementalEmbodiment] }}>
              {getEmbodimentBonus(character.elementalEmbodiment)}
            </p>
          )}
        </div>
      )}

      {/* Resources */}
      {character.resources.length > 0 && (
        <div className="card">
          <p className="label" style={{ marginBottom: 8 }}>Resources</p>
          {character.resources.map(r => (
            <ResourceRow key={r.id} resource={r} derivedMax={derived.resourceMaxes[r.id]} />
          ))}
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
                background: 'var(--bg-3)', border: '1px solid var(--accent-2)',
                borderRadius: 20, padding: '3px 10px', fontSize: 12,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {c.name}
                <button onClick={() => removeCondition(c.id)}
                  style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1 }}>×</button>
              </div>
            ))}
          </div>
        )}
        <button className="btn btn-ghost" style={{ marginTop: 10, fontSize: 12 }}
          onClick={() => {
            const name = prompt('Condition name:');
            if (name) addCondition({ id: crypto.randomUUID(), name });
          }}>
          + Add Condition
        </button>
      </div>

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

// ── Helpers ───────────────────────────────────────────────────

function getKnownElements(character: Character): string[] {
  const elements = new Set<string>();
  for (const cls of character.classes) {
    for (const choice of cls.choices) {
      if (choice.choiceId === 'elemental_path') {
        choice.selectedValues.forEach(v => elements.add(v.toLowerCase()));
      }
    }
  }
  return Array.from(elements);
}

function getEmbodimentBonus(element: string): string {
  switch (element) {
    case 'water': return 'Roll max on 1 hit die + reroll 1s. Share healing with allies.';
    case 'earth': return 'Gain (Prof)d4 temp HP at the start of rest. Unspent temp HP carries over.';
    case 'fire':  return '+Prof to initiative. Add 1d6 to STR-based checks.';
    case 'air':   return 'Fall ≤60ft/round. Move 15ft laterally per 10ft of altitude change. Add 1d6 to DEX checks.';
    default:      return '';
  }
}

// ── Sub-components ─────────────────────────────────────────────

function SaveRow({ label, count, color, onAdd }: {
  label: string; count: number; color: string; onAdd: () => void;
}) {
  return (
    <div>
      <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4 }}>{label}</p>
      <div style={{ display: 'flex', gap: 4 }}>
        {[0,1,2].map(i => (
          <button key={i} onClick={onAdd} style={{
            width: 24, height: 24, borderRadius: '50%',
            background: i < count ? color : 'var(--bg-2)',
            border: `2px solid ${color}`,
          }} />
        ))}
      </div>
    </div>
  );
}

function ResourceRow({ resource, derivedMax }: { resource: ResourceState; derivedMax?: number }) {
  const { expendResource, restoreResource } = useCharacterStore();
  const displayMax = derivedMax ?? resource.max;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{resource.name}</div>
        <div style={{ fontSize: 11, color: 'var(--text-2)' }}>
          {resource.rechargeOn.replace('_', ' ')}
          {resource.maxFormula ? ' · auto-calculated' : ''}
        </div>
      </div>
      {/* Pip display for small pools (≤10), numeric for larger */}
      {displayMax <= 10 ? (
        <div style={{ display: 'flex', gap: 3 }}>
          {Array.from({ length: displayMax }).map((_, i) => (
            <button key={i}
              onClick={() => i < resource.current
                ? expendResource(resource.id)
                : restoreResource(resource.id, 1)}
              style={{
                width: 20, height: 20, borderRadius: '50%',
                background: i < resource.current ? 'var(--accent)' : 'var(--bg-2)',
                border: '2px solid var(--accent)',
                flexShrink: 0,
              }}
            />
          ))}
        </div>
      ) : (
        <>
          <button onClick={() => expendResource(resource.id)} className="btn btn-ghost"
            style={{ padding: '2px 8px' }}>−</button>
          <span style={{ minWidth: 48, textAlign: 'center', fontWeight: 700, fontSize: 15 }}>
            {resource.current}/{displayMax}
          </span>
          <button onClick={() => restoreResource(resource.id, 1)} className="btn btn-ghost"
            style={{ padding: '2px 8px' }}>+</button>
        </>
      )}
    </div>
  );
}
