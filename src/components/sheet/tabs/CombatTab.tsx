import { useState } from 'react';
import { useCharacterStore } from '@/store/characterStore';
import { useItems } from '@/hooks/useGameDatabase';
import type { Character, DerivedStats, ResourceState } from '@/types/character';
import type { Feature, ActionType } from '@/types/game';

// ── Constants ─────────────────────────────────────────────────

const ELEMENT_ICONS: Record<string, string> = { water: '💧', earth: '🪨', fire: '🔥', air: '💨' };
const ELEMENT_COLORS: Record<string, string> = {
  water: '#61afef', earth: '#e5c07b', fire: '#e06c75', air: '#98c379',
};

const ACTION_GROUPS: { type: ActionType; label: string; color: string }[] = [
  { type: 'action',       label: 'Actions',       color: '#e06c75' },
  { type: 'bonus_action', label: 'Bonus Actions',  color: '#d19a66' },
  { type: 'reaction',     label: 'Reactions',      color: '#61afef' },
  { type: 'passive',      label: 'Passive',        color: '#98c379' },
];

// ── Main component ─────────────────────────────────────────────

interface Props { character: Character; derived: DerivedStats }

export function CombatTab({ character, derived }: Props) {
  const {
    addDeathSave, resetDeathSaves, shortRest, longRest,
    addCondition, removeCondition, setElementalEmbodiment,
  } = useCharacterStore();

  const knownElements = getKnownElements(character);
  const hasElementalEmbodiment = knownElements.length > 0;

  // EC resource — special treatment
  const ecResource = character.resources.find(r => r.id === 'elemental-charges');
  const otherResources = character.resources.filter(r => r.id !== 'elemental-charges');

  // Features grouped by action type
  const featuresWithAction = derived.allFeatures.filter(f => f.actionType);
  const hasActions = featuresWithAction.length > 0;

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── Death saves ────────────────────────────────────── */}
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

      {/* ── Elemental Charges (prominent) ──────────────────── */}
      {ecResource && (
        <EcPanel resource={ecResource} derivedMax={derived.resourceMaxes[ecResource.id]} />
      )}

      {/* ── Weapon Attacks ────────────────────────────────── */}
      <AttacksPanel character={character} derived={derived} />

      {/* ── Elemental Embodiment ───────────────────────────── */}
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
                <button key={element}
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

      {/* ── Actions / Bonus Actions / Reactions / Passive ──── */}
      {hasActions && ACTION_GROUPS.map(group => {
        const features = featuresWithAction.filter(f => f.actionType === group.type);
        if (features.length === 0) return null;
        return (
          <div key={group.type} className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: group.color, flexShrink: 0 }} />
              <p className="label">{group.label}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {features.map(f => <ActionCard key={f.id} feature={f} accentColor={group.color} />)}
            </div>
          </div>
        );
      })}

      {/* ── Other resources — full counter card per resource ─ */}
      {otherResources.map(r => (
        <ResourcePanel key={r.id} resource={r} derivedMax={derived.resourceMaxes[r.id]} />
      ))}

      {/* ── Conditions ─────────────────────────────────────── */}
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

      {/* ── Rests ──────────────────────────────────────────── */}
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

// ── Elemental Charges panel ────────────────────────────────────

function EcPanel({ resource, derivedMax }: { resource: ResourceState; derivedMax?: number }) {
  const { expendResource, restoreResource } = useCharacterStore();
  const max = derivedMax ?? resource.max;
  const current = resource.current;

  return (
    <div className="card" style={{ border: '2px solid var(--accent)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <p className="label">⚡ Elemental Charges</p>
        <span style={{ fontSize: 12, color: 'var(--text-2)' }}>long rest · auto-calculated</span>
      </div>

      {/* Big numeric counter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 10 }}>
        <button onClick={() => expendResource(resource.id)} className="btn btn-ghost"
          style={{ fontSize: 22, padding: '4px 14px', fontWeight: 700 }}>−</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, fontWeight: 900, lineHeight: 1, color: 'var(--accent)' }}>{current}</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)' }}>/ {max}</div>
        </div>
        <button onClick={() => restoreResource(resource.id, 1)} className="btn btn-ghost"
          style={{ fontSize: 22, padding: '4px 14px', fontWeight: 700 }}>+</button>
      </div>

      {/* Pip row */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
        {Array.from({ length: max }).map((_, i) => (
          <button key={i}
            onClick={() => i < current ? expendResource(resource.id) : restoreResource(resource.id, 1)}
            style={{
              width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
              background: i < current ? 'var(--accent)' : 'var(--bg-2)',
              border: '2px solid var(--accent)',
              transition: 'background 100ms',
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Action card ────────────────────────────────────────────────

function ActionCard({ feature, accentColor }: { feature: Feature; accentColor: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{
      border: `1px solid var(--border)`,
      borderLeft: `3px solid ${accentColor}`,
      borderRadius: 6, overflow: 'hidden',
      background: 'var(--bg-2)',
    }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          gap: 8, padding: '8px 10px', textAlign: 'left',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontWeight: 600, fontSize: 13 }}>{feature.name}</span>
          {feature.cost && (
            <span style={{
              marginLeft: 8, fontSize: 11, fontWeight: 700,
              color: accentColor, background: `color-mix(in srgb, ${accentColor} 15%, var(--bg-1))`,
              border: `1px solid color-mix(in srgb, ${accentColor} 35%, transparent)`,
              borderRadius: 3, padding: '1px 5px',
            }}>
              {feature.cost}
            </span>
          )}
          {feature.uses && !expanded && (
            <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--text-2)' }}>
              ({feature.uses.max.type === 'flat' ? feature.uses.max.value : '?'} uses)
            </span>
          )}
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-2)', flexShrink: 0 }}>{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <div style={{ padding: '0 10px 10px', borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: 12, color: 'var(--text-1)', marginTop: 8, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
            {feature.description}
          </p>
          {feature.uses && (
            <p style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 6 }}>
              Uses: {feature.uses.max.type === 'flat' ? feature.uses.max.value : '?'} per {feature.uses.rechargeOn.replace('_', ' ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Resource panel (full card, like EcPanel) ──────────────────

function ResourcePanel({ resource, derivedMax }: { resource: ResourceState; derivedMax?: number }) {
  const { expendResource, restoreResource } = useCharacterStore();
  const max = derivedMax ?? resource.max;
  const current = resource.current;
  const usePips = max <= 12;

  return (
    <div className="card" style={{ border: '1px solid var(--accent-4)', borderRadius: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: 15 }}>{resource.name}</p>
          <p style={{ fontSize: 11, color: 'var(--text-2)' }}>{resource.rechargeOn.replace(/_/g, ' ')}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={() => expendResource(resource.id)} className="btn btn-ghost"
            style={{ fontSize: 20, padding: '2px 10px', fontWeight: 700 }}>−</button>
          <span style={{ minWidth: 64, textAlign: 'center', fontWeight: 800, fontSize: 26, fontVariantNumeric: 'tabular-nums' }}>
            {current}<span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-2)' }}>/{max}</span>
          </span>
          <button onClick={() => restoreResource(resource.id, 1)} className="btn btn-ghost"
            style={{ fontSize: 20, padding: '2px 10px', fontWeight: 700 }}>+</button>
        </div>
      </div>
      {usePips && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
          {Array.from({ length: max }).map((_, i) => (
            <button key={i}
              onClick={() => i < current ? expendResource(resource.id) : restoreResource(resource.id, 1)}
              style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                background: i < current ? 'var(--accent-4)' : 'var(--bg-2)',
                border: '2px solid var(--accent-4)', transition: 'background 120ms',
              }} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Save row ───────────────────────────────────────────────────

function SaveRow({ label, count, color, onAdd }: {
  label: string; count: number; color: string; onAdd: () => void;
}) {
  return (
    <div>
      <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4 }}>{label}</p>
      <div style={{ display: 'flex', gap: 4 }}>
        {[0, 1, 2].map(i => (
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

// ── Helpers ────────────────────────────────────────────────────

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
    case 'earth': return 'Gain (Prof)d4 temp HP at rest start. Unspent temp HP carries over.';
    case 'fire':  return '+Prof to initiative. Add 1d6 to STR-based checks.';
    case 'air':   return 'Fall ≤60ft/round. 15ft lateral movement per 10ft altitude change. Add 1d6 to DEX checks.';
    default:      return '';
  }
}

// ── Attacks panel ──────────────────────────────────────────────

function AttacksPanel({ character, derived }: { character: Character; derived: DerivedStats }) {
  const allItems = useItems() ?? [];

  // Find all equipped weapons
  const equippedWeapons = (Object.entries(character.equipped) as [string, string][])
    .filter(([slot]) => ['mainHand','offHand','twoHand'].includes(slot))
    .map(([slot, entryId]) => {
      const entry = character.inventory.find(i => i.id === entryId);
      if (!entry) return null;
      const item = allItems.find(i => i.id === entry.itemId);
      if (!item?.weaponStats) return null;
      return { slot, entry, item };
    })
    .filter(Boolean) as { slot: string; entry: { id: string; customName?: string }; item: { id: string; name: string; weaponStats: NonNullable<import('@/types/game').Item['weaponStats']> } }[];

  if (equippedWeapons.length === 0) return null;

  const strMod = derived.statMods.strength;
  const dexMod = derived.statMods.dexterity;
  const prof   = derived.proficiencyBonus;

  return (
    <div className="card">
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
        <div style={{ width:10, height:10, borderRadius:'50%', background:'#e06c75', flexShrink:0 }} />
        <p className="label">Attacks</p>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {equippedWeapons.map(({ slot, entry, item }) => {
          const ws = item.weaponStats;
          const isFinesse = ws.properties.includes('finesse');
          const atkMod = (isFinesse ? Math.max(strMod, dexMod) : strMod) + prof + (ws.attackBonus ?? 0);
          const dmgMod = isFinesse ? Math.max(strMod, dexMod) : strMod;
          const totalDmgMod = dmgMod + (ws.damage.modifier ?? 0);
          const displayName = (entry as { customName?: string }).customName ?? item.name;
          const slotLabel = slot === 'mainHand' ? 'Main' : slot === 'offHand' ? 'Off' : '2H';

          return (
            <div key={entry.id} style={{
              display:'flex', alignItems:'center', gap:10, padding:'8px 10px',
              background:'var(--bg-2)', borderRadius:6, border:'1px solid var(--border)',
              borderLeft:'3px solid #e06c75',
            }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:600, fontSize:13 }}>{displayName}</div>
                <div style={{ fontSize:11, color:'var(--text-2)', marginTop:1 }}>
                  {ws.properties.length > 0 && ws.properties.join(', ')}
                </div>
              </div>
              <div style={{ textAlign:'center', minWidth:50 }}>
                <div style={{ fontSize:11, color:'var(--text-2)' }}>To Hit</div>
                <div style={{ fontWeight:800, fontSize:15, color:'var(--accent-4)' }}>
                  {atkMod >= 0 ? '+' : ''}{atkMod}
                </div>
              </div>
              <div style={{ textAlign:'center', minWidth:70 }}>
                <div style={{ fontSize:11, color:'var(--text-2)' }}>Damage</div>
                <div style={{ fontWeight:700, fontSize:13 }}>
                  {ws.damage.diceCount}d{ws.damage.dieSize}
                  {totalDmgMod !== 0 ? ` ${totalDmgMod > 0 ? '+' : ''}${totalDmgMod}` : ''}
                  <span style={{ fontSize:11, color:'var(--text-2)', marginLeft:3 }}>{ws.damageType}</span>
                </div>
              </div>
              <div style={{ fontSize:11, color:'var(--text-2)', minWidth:28, textAlign:'right' }}>{slotLabel}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
