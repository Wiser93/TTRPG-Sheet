import { useState } from 'react';
import { useCharacterStore } from '@/store/characterStore';
import { useFeatureCardOptions } from '@/hooks/useFeatureCardOptions';
import { useItems, useItemProperties } from '@/hooks/useGameDatabase';
import type { Character, DerivedStats, ResourceState } from '@/types/character';
import type { Feature, ActionType } from '@/types/game';

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

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
    addDeathSave, resetDeathSaves,
    addCondition, removeCondition,
    setFeatureCardState,
  } = useCharacterStore();
  // Persist feature expand state for the session
  const [expandedFeatures, setExpandedFeatures] = useState<Set<string>>(new Set());
  function toggleFeature(id: string) {
    setExpandedFeatures(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  // Resources split by combatResource flag
  const combatResources = derived.allResources.filter(r => {
    const feat = derived.allFeatures.find(f => (f.resourceId ?? slugify(f.name)) === r.id);
    return feat?.combatResource ?? r.id === 'elemental-charges';
  });
  const otherResources = derived.allResources.filter(r => !combatResources.some(cr => cr.id === r.id));

  // Card features for combat tab
  const combatCards = derived.allFeatures.filter(f => f.isCard && (f.cardTab ?? 'combat') === 'combat');

  // Features grouped by action type (exclude card features — they get their own panel)
  const featuresWithAction = derived.allFeatures.filter(f => f.actionType && !f.isCard);
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

      {/* ── Combat resources (prominent panels) ────────────── */}
      {combatResources.map(r => (
        <EcPanel key={r.id} resource={r} derivedMax={derived.resourceMaxes[r.id]} />
      ))}

      {/* ── Weapon Attacks ────────────────────────────────── */}
      <AttacksPanel character={character} derived={derived} />

      {/* ── Feature cards (isCard + combat tab) ─────────────── */}
      {combatCards.map(f => (
        <FeatureCardPanel
          key={f.id}
          feature={f}
          activeValue={(character.featureCardStates ?? {})[f.id] ?? null}
          onChange={val => setFeatureCardState(f.id, val)}
        />
      ))}

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
              {features.map(f => <ActionCard key={f.id} feature={f} accentColor={group.color} expanded={expandedFeatures.has(f.id)} onToggle={() => toggleFeature(f.id)} />)}
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
        <p className="label">⚡ {resource.name}</p>
        <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{resource.rechargeOn.replace(/_/g, ' ')}</span>
      </div>

      {/* Big numeric counter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 10 }}>
        <button onClick={() => expendResource(resource.id, 1, max)} className="btn btn-ghost"
          style={{ fontSize: 22, padding: '4px 14px', fontWeight: 700 }}>−</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, fontWeight: 900, lineHeight: 1, color: 'var(--accent)' }}>{current}</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)' }}>/ {max}</div>
        </div>
        <button onClick={() => restoreResource(resource.id, 1, max)} className="btn btn-ghost"
          style={{ fontSize: 22, padding: '4px 14px', fontWeight: 700 }}>+</button>
      </div>

      {/* Pip row */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
        {Array.from({ length: max }).map((_, i) => (
          <button key={i}
            onClick={() => i < current
              ? expendResource(resource.id, 1, max)
              : restoreResource(resource.id, 1, max)}
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

function ActionCard({ feature, accentColor, expanded, onToggle }: { feature: Feature; accentColor: string; expanded: boolean; onToggle: () => void }) {
  return (
    <div style={{
      border: `1px solid var(--border)`,
      borderLeft: `3px solid ${accentColor}`,
      borderRadius: 6, overflow: 'hidden',
      background: 'var(--bg-2)',
    }}>
      <button
        onClick={onToggle}
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
          <p style={{ fontSize: 11, color: 'var(--text-2)' }}>
            {resource.rechargeOn === 'long_rest' ? 'Resets on long rest'
              : resource.rechargeOn === 'short_rest' ? 'Resets on short rest'
              : resource.rechargeOn === 'dawn' ? 'Resets at dawn'
              : 'Does not reset'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={() => expendResource(resource.id, 1, max)} className="btn btn-ghost"
            style={{ fontSize: 20, padding: '2px 10px', fontWeight: 700 }}>−</button>
          <span style={{ minWidth: 64, textAlign: 'center', fontWeight: 800, fontSize: 26, fontVariantNumeric: 'tabular-nums' }}>
            {current}<span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-2)' }}>/{max}</span>
          </span>
          <button onClick={() => restoreResource(resource.id, 1, max)} className="btn btn-ghost"
            style={{ fontSize: 20, padding: '2px 10px', fontWeight: 700 }}>+</button>
        </div>
      </div>
      {usePips && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
          {Array.from({ length: max }).map((_, i) => (
            <button key={i}
              onClick={() => i < current
                ? expendResource(resource.id, 1, max)
                : restoreResource(resource.id, 1, max)}
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

// ── Feature card panel ──────────────────────────────────────────

function FeatureCardPanel({ feature, activeValue, onChange }: {
  feature: Feature;
  activeValue: string | null;
  onChange: (val: string | null) => void;
}) {
  const options = useFeatureCardOptions(feature);
  if (options.length === 0) return null;

  const activeOpt = options.find(o => o.id === activeValue);

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
        <p className="label">{feature.name}</p>
        {activeValue && (
          <button onClick={() => onChange(null)} style={{ fontSize: 11, color: 'var(--text-2)', padding: '2px 6px' }}>
            Clear
          </button>
        )}
      </div>
      {feature.cardSelectionLabel && (
        <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 10 }}>
          {feature.cardSelectionLabel}
        </p>
      )}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {options.map(opt => {
          const active = activeValue === opt.id;
          const color = opt.color ?? 'var(--accent)';
          return (
            <button key={opt.id}
              onClick={() => onChange(active ? null : opt.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                background: active ? color : 'var(--bg-2)',
                color: active ? '#fff' : 'var(--text-1)',
                border: `2px solid ${active ? color : 'var(--border)'}`,
                transition: 'all 150ms ease',
              }}
            >
              {opt.icon && <span>{opt.icon}</span>}
              {opt.label.split(' — ')[0]}
            </button>
          );
        })}
      </div>
      {activeOpt?.description && (
        <p style={{ fontSize: 12, marginTop: 10, color: activeOpt.color ?? 'var(--accent)' }}>
          {activeOpt.description}
        </p>
      )}
    </div>
  );
}

// ── Property tooltip ──────────────────────────────────────────

function PropertyBadge({ name, properties, isProficient }: {
  name: string;
  properties: import('@/types/game').ItemProperty[];
  isProficient: boolean;
}) {
  const [open, setOpen] = useState(false);
  const def = properties.find(p => p.name.toLowerCase() === name.toLowerCase());
  // Mastery properties only show when proficient
  if (def?.isMastery && !isProficient) return null;
  // (Category filtering happens before calling this — badge only renders for matching properties)
  const hasTip = !!def;
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => hasTip && setOpen(o => !o)}
        style={{
          fontSize: 11, padding: '1px 6px', borderRadius: 10,
          background: def?.isMastery
            ? 'color-mix(in srgb,var(--accent) 18%,var(--bg-3))'
            : 'var(--bg-3)',
          border: `1px solid ${def?.isMastery ? 'var(--accent)' : 'var(--border)'}`,
          color: def?.isMastery ? 'var(--accent)' : 'var(--text-2)',
          fontWeight: def?.isMastery ? 700 : 400,
          cursor: hasTip ? 'pointer' : 'default',
          textDecoration: hasTip ? 'underline dotted' : 'none',
        }}
      >
        {name}{def?.isMastery ? ' ★' : ''}
      </button>
      {open && hasTip && (
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
          <button onClick={() => setOpen(false)}
            style={{ position: 'absolute', top: 6, right: 8, fontSize: 14, color: 'var(--text-2)' }}>×</button>
        </div>
      )}
    </span>
  );
}

// ── Attacks panel ──────────────────────────────────────────────

function AttacksPanel({ character, derived }: { character: Character; derived: DerivedStats }) {
  const allItems = useItems() ?? [];
  const allProperties = useItemProperties() ?? [];

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
    .filter(Boolean) as { slot: string; entry: { id: string; customName?: string }; item: { id: string; name: string; category: import('@/types/game').ItemCategory; weaponStats: NonNullable<import('@/types/game').Item['weaponStats']> } }[];

  if (equippedWeapons.length === 0) return null;

  const strMod = derived.statMods.strength;
  const dexMod = derived.statMods.dexterity;
  const prof   = derived.proficiencyBonus;

  // Check weapon proficiency: derived.extraWeaponProfs contains proficiency strings
  function isWeaponProficient(_ws: NonNullable<import('@/types/game').Item['weaponStats']>, itemCategory: string): boolean {
    const profs = [
      ...character.proficiencies.weapons,
      ...derived.extraWeaponProfs,
    ].map(p => p.toLowerCase());
    const cat = itemCategory.toLowerCase();
    return profs.some(p => p === cat || p === 'all weapons' || p === 'simple weapons' || p === 'martial weapons');
  }

  return (
    <div className="card">
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
        <div style={{ width:10, height:10, borderRadius:'50%', background:'#e06c75', flexShrink:0 }} />
        <p className="label">Attacks</p>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {equippedWeapons.map(({ slot, entry, item }) => {
          const ws = item.weaponStats;
          const proficient = isWeaponProficient(ws, item.category);
          const isFinesse = ws.properties.includes('finesse');
          const atkMod = (isFinesse ? Math.max(strMod, dexMod) : strMod) + (proficient ? prof : 0) + (ws.attackBonus ?? 0);
          const dmgMod = isFinesse ? Math.max(strMod, dexMod) : strMod;
          const totalDmgMod = dmgMod + (ws.damage.modifier ?? 0);
          const displayName = (entry as { customName?: string }).customName ?? item.name;
          const slotLabel = slot === 'mainHand' ? 'Main' : slot === 'offHand' ? 'Off' : '2H';

          return (
            <div key={entry.id} style={{
              padding:'10px 12px',
              background:'var(--bg-2)', borderRadius:6, border:'1px solid var(--border)',
              borderLeft:`3px solid ${proficient ? '#e06c75' : 'var(--border)'}`,
              opacity: proficient ? 1 : 0.75,
            }}>
              {/* Top row: name + proficiency badge + slot */}
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                <div style={{ flex:1, fontWeight:600, fontSize:13 }}>{displayName}</div>
                {!proficient && (
                  <span style={{ fontSize:10, padding:'1px 6px', borderRadius:8,
                    background:'color-mix(in srgb,var(--accent-2) 15%,var(--bg-3))',
                    border:'1px solid var(--accent-2)', color:'var(--accent-2)', fontWeight:600 }}>
                    Not proficient
                  </span>
                )}
                <span style={{ fontSize:11, color:'var(--text-2)', flexShrink:0 }}>{slotLabel}</span>
              </div>

              {/* Stats row: To Hit | Damage dice+mod | Damage type */}
              <div style={{ display:'flex', gap:16, marginBottom: ws.properties.length > 0 ? 8 : 0 }}>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:10, color:'var(--text-2)', textTransform:'uppercase', letterSpacing:'0.05em' }}>To Hit</div>
                  <div style={{ fontWeight:800, fontSize:16, color: proficient ? 'var(--accent-4)' : 'var(--text-2)' }}>
                    {atkMod >= 0 ? '+' : ''}{atkMod}
                  </div>
                </div>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:10, color:'var(--text-2)', textTransform:'uppercase', letterSpacing:'0.05em' }}>Damage</div>
                  <div style={{ fontWeight:700, fontSize:14 }}>
                    {ws.damage.diceCount}d{ws.damage.dieSize}
                    {totalDmgMod !== 0 ? ` ${totalDmgMod > 0 ? '+' : ''}${totalDmgMod}` : ''}
                  </div>
                  <div style={{ fontSize:11, color:'var(--text-2)', marginTop:1 }}>{ws.damageType}</div>
                </div>
              </div>

              {/* Properties */}
              {ws.properties.length > 0 && (
                <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                  {ws.properties.map(p => (
                    <PropertyBadge key={p} name={p}
                      properties={allProperties.filter(ap => {
                        const cats = ap.applicableCategories;
                        return !cats || cats === 'all' || (Array.isArray(cats) && cats.includes(item.category));
                      })}
                      isProficient={proficient} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
