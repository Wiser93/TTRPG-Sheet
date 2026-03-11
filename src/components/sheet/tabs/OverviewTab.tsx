import { useState } from 'react';
import { useCharacterStore } from '@/store/characterStore';
import { useBackgrounds, useAllSpecies } from '@/hooks/useGameDatabase';
import { useFeatureCardOptions } from '@/hooks/useFeatureCardOptions';
import type { Character, DerivedStats } from '@/types/character';
import type { StatKey, SkillKey, Feature } from '@/types/game';

const STAT_LABELS: Record<StatKey, string> = {
  strength:     'STR',
  dexterity:    'DEX',
  constitution: 'CON',
  intelligence: 'INT',
  wisdom:       'WIS',
  charisma:     'CHA',
};

const SKILL_LABELS: Record<SkillKey, string> = {
  acrobatics:    'Acrobatics (DEX)',
  animalHandling:'Animal Handling (WIS)',
  arcana:        'Arcana (INT)',
  athletics:     'Athletics (STR)',
  deception:     'Deception (CHA)',
  history:       'History (INT)',
  insight:       'Insight (WIS)',
  intimidation:  'Intimidation (CHA)',
  investigation: 'Investigation (INT)',
  medicine:      'Medicine (WIS)',
  nature:        'Nature (INT)',
  perception:    'Perception (WIS)',
  performance:   'Performance (CHA)',
  persuasion:    'Persuasion (CHA)',
  religion:      'Religion (INT)',
  sleightOfHand: 'Sleight of Hand (DEX)',
  stealth:       'Stealth (DEX)',
  survival:      'Survival (WIS)',
};

function sign(n: number) { return n >= 0 ? `+${n}` : `${n}`; }

interface Props { character: Character; derived: DerivedStats; }

export function OverviewTab({ character, derived }: Props) {
  const { setCurrentHP, shortRest, longRest, setFeatureCardState, setInspiration } = useCharacterStore();
  // Local HP string — allows empty while editing, validated on blur
  const [hpStr, setHpStr] = useState<string | null>(null);
  const [restReminder, setRestReminder] = useState<{ type: 'short' | 'long'; features: Feature[] } | null>(null);
  const [shortRestOpen, setShortRestOpen] = useState(false);
  // diceRolls: per-class entries { classId, value } so we can undo per class
  const [diceRolls, setDiceRolls] = useState<{ classId: string; value: number }[]>([]);
  // manualInput: per-class string for typing a manual roll value
  const [manualInput, setManualInput] = useState<Record<string, string>>({});

  // Derived: spending = dice spent this rest session per class
  const diceToSpend = diceRolls.reduce<Record<string, number>>((acc, r) => {
    acc[r.classId] = (acc[r.classId] ?? 0) + 1;
    return acc;
  }, {});

  function handleShortRest() {
    setDiceRolls([]);
    setManualInput({});
    setShortRestOpen(true);
  }

  function rollDie(sides: number, classId: string, hd: { available: number }) {
    const spending = diceToSpend[classId] ?? 0;
    if (spending >= hd.available) return;
    const roll = Math.floor(Math.random() * sides) + 1;
    const conMod = derived.statMods.constitution;
    const total = Math.max(1, roll + conMod);
    setDiceRolls(prev => [...prev, { classId, value: total }]);
  }

  function spendDieManual(classId: string, hd: { die: number; available: number }) {
    const spending = diceToSpend[classId] ?? 0;
    if (spending >= hd.available) return;
    const raw = parseInt(manualInput[classId] ?? '', 10);
    if (isNaN(raw)) return;
    const conMod = derived.statMods.constitution;
    const clamped = Math.max(1, Math.min(hd.die, raw));
    const total = Math.max(1, clamped + conMod);
    setDiceRolls(prev => [...prev, { classId, value: total }]);
    setManualInput(prev => ({ ...prev, [classId]: '' }));
  }

  function undoLastDie(classId: string) {
    // Remove the most recent roll for this classId
    const idx = [...diceRolls].map((r, i) => ({ r, i })).reverse().find(x => x.r.classId === classId)?.i;
    if (idx === undefined) return;
    setDiceRolls(prev => prev.filter((_, i) => i !== idx));
  }

  function confirmShortRest() {
    const totalHeal = diceRolls.reduce((s, r) => s + r.value, 0);
    shortRest(totalHeal, diceToSpend);
    setShortRestOpen(false);
    const triggered = derived.allFeatures.filter(f => {
      const t = (f.trigger ?? '').toLowerCase();
      return t.includes('short rest') || t === 'short_rest';
    });
    if (triggered.length > 0) setRestReminder({ type: 'short', features: triggered });
  }

  function handleLongRest() {
    const triggered = derived.allFeatures.filter(f => {
      const t = (f.trigger ?? '').toLowerCase();
      return t.includes('long rest') || t === 'long_rest' || t.includes('rest');
    });
    const grantsInspiration = derived.allFeatures.some(f => f.grantHeroicInspiration === 'long_rest');
    longRest(grantsInspiration, derived.maxHP);
    if (triggered.length > 0) setRestReminder({ type: 'long', features: triggered });
  }

  const allSpecies    = useAllSpecies()   ?? [];
  const allBackgrounds = useBackgrounds() ?? [];
  const species    = allSpecies.find(s => s.id === character.speciesId);
  const background = allBackgrounds.find(b => b.id === character.backgroundId);

  // Collect all languages — fixed from species, chosen manually, and from class/bg choices
  const fixedLangs = new Set<string>(['Common', ...((Array.isArray(species?.languages) ? species.languages : []) as string[])]);
  const allLangs = Array.from(new Set([...Array.from(fixedLangs), ...character.languages, ...derived.extraLanguages]));

  // Card features for the overview tab
  const overviewCards = derived.allFeatures.filter(f => f.isCard && f.cardTab === 'overview');

  // Collect all tool proficiencies
  const allTools = Array.from(new Set([
    ...(background?.toolProficiencies ?? []),
    ...character.proficiencies.tools,
    ...derived.extraToolProfs,
  ]));

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* HP & quick stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <QuickStat label="AC" value={derived.ac} />
        <QuickStat label="Initiative" value={sign(derived.initiative)} />
        <QuickStat label="Speed" value={`${derived.speed}ft`} />
      </div>

      {/* HP bar + rest buttons */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <p className="label">Hit Points</p>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              className="btn btn-ghost"
              style={{ fontSize: 11, padding: '3px 10px' }}
              onClick={handleShortRest}
            >
              Short Rest
            </button>
            <button
              className="btn btn-ghost"
              style={{ fontSize: 11, padding: '3px 10px' }}
              onClick={handleLongRest}
            >
              Long Rest
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <input
            type="number"
            value={hpStr ?? character.health.current}
            onChange={e => setHpStr(e.target.value)}
            onBlur={() => {
              const parsed = parseInt(hpStr ?? '', 10);
              setCurrentHP(isNaN(parsed) ? character.health.current : Math.max(0, parsed));
              setHpStr(null);
            }}
            style={{ width: 70, textAlign: 'center', fontSize: 22, fontWeight: 700 }}
          />
          <span style={{ color: 'var(--text-2)', fontSize: 18 }}>/</span>
          <span style={{ fontSize: 22, fontWeight: 700 }}>{derived.maxHP}</span>
          {character.health.temp > 0 && (
            <span style={{ fontSize: 13, color: 'var(--accent-3)', marginLeft: 8 }}>
              +{character.health.temp} temp
            </span>
          )}
        </div>
        <div style={{ background: 'var(--bg-2)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
          <div style={{
            background: character.health.current > derived.maxHP * 0.5
              ? 'var(--accent-4)'
              : character.health.current > derived.maxHP * 0.25
                ? 'var(--accent-5)'
                : 'var(--accent-2)',
            height: '100%',
            width: `${Math.max(0, Math.min(100, (character.health.current / derived.maxHP) * 100))}%`,
            transition: 'width 0.3s ease, background 0.3s ease',
          }} />
        </div>
      </div>

      {/* Stat block */}
      {(() => {
        const showMod = character.sheetConfig?.showModsAsPrimary ?? false;
        return (
          <div className="card">
            <p className="label" style={{ marginBottom: 10 }}>Ability Scores</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {(Object.keys(STAT_LABELS) as StatKey[]).map(stat => (
                <div key={stat} style={{ background: 'var(--bg-2)', borderRadius: 6, padding: '8px 4px', textAlign: 'center' }}>
                  <div className="label">{STAT_LABELS[stat]}</div>
                  <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.1 }}>
                    {showMod ? sign(derived.statMods[stat]) : derived.stats[stat]}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
                    {showMod ? derived.stats[stat] : sign(derived.statMods[stat])}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Saving throws */}
      <div className="card">
        <p className="label" style={{ marginBottom: 8 }}>Saving Throws</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {(Object.keys(STAT_LABELS) as StatKey[]).map(stat => {
            const save = derived.savingThrows[stat];
            return (
              <div key={stat} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                <span style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: save.proficient ? 'var(--accent-4)' : 'var(--bg-3)',
                  border: '1px solid var(--border)',
                  flexShrink: 0,
                }} />
                <span style={{ color: 'var(--text-1)' }}>{STAT_LABELS[stat]}</span>
                <span style={{ marginLeft: 'auto', fontWeight: 600 }}>{sign(save.bonus)}</span>
              </div>
            );
          })}
        </div>
      </div>


      {/* Heroic Inspiration */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px',
        background: character.combat.inspiration
          ? 'color-mix(in srgb, var(--accent) 12%, var(--bg-1))'
          : 'var(--bg-1)',
        border: `1px solid ${character.combat.inspiration ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 8,
        transition: 'all 200ms ease',
        cursor: 'pointer',
      }}
        onClick={() => setInspiration(!character.combat.inspiration)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>{character.combat.inspiration ? '✨' : '💫'}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: character.combat.inspiration ? 'var(--accent)' : 'var(--text-1)' }}>
              Heroic Inspiration
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-2)' }}>
              {character.combat.inspiration ? 'Active — reroll one d20 test' : 'Tap to mark as active'}
            </div>
          </div>
        </div>
        <div style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          background: character.combat.inspiration ? 'var(--accent)' : 'var(--bg-3)',
          border: `2px solid ${character.combat.inspiration ? 'var(--accent)' : 'var(--border)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14,
        }}>
          {character.combat.inspiration ? '✓' : ''}
        </div>
      </div>


      {/* Skills */}
      <div className="card">
        <p className="label" style={{ marginBottom: 8 }}>
          Skills · Passive Perception {derived.passivePerception}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {(Object.keys(SKILL_LABELS) as SkillKey[]).map(skill => {
            const s = derived.skills[skill];
            return (
              <div key={skill} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                <span style={{
                  width: 10, height: 10, borderRadius: s.expert ? 2 : '50%',
                  background: s.proficient ? 'var(--accent-4)' : 'var(--bg-3)',
                  border: '1px solid var(--border)',
                  flexShrink: 0,
                }} />
                <span style={{ color: s.proficient ? 'var(--text-0)' : 'var(--text-2)' }}>
                  {SKILL_LABELS[skill]}
                </span>
                <span style={{ marginLeft: 'auto', fontWeight: 600 }}>{sign(s.bonus)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Short rest modal */}
      {shortRestOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000, padding: 16 }}
          onClick={() => setShortRestOpen(false)}>
          <div style={{ background: 'var(--bg-1)', borderRadius: 16, padding: 20, width: '100%', maxWidth: 480, maxHeight: '80dvh', overflowY: 'auto', boxShadow: '0 -4px 40px rgba(0,0,0,0.4)' }}
            onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <p style={{ fontSize: 15, fontWeight: 700 }}>☕ Short Rest</p>
              <button onClick={() => setShortRestOpen(false)} style={{ fontSize: 22, color: 'var(--text-2)', lineHeight: 1, padding: '0 4px' }}>×</button>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 16 }}>
              Spend hit dice to recover HP. Roll randomly or enter your own result.
            </p>

            {/* Per-class hit dice */}
            {Object.entries(derived.hitDice).map(([classId, hd]) => {
              const spending = diceToSpend[classId] ?? 0;
              const conMod = derived.statMods.constitution;
              const conStr = conMod >= 0 ? `+${conMod}` : `${conMod}`;
              const exhausted = spending >= hd.available;
              return (
                <div key={classId} style={{ background: 'var(--bg-2)', borderRadius: 8, padding: '12px 14px', marginBottom: 10 }}>
                  {/* Die header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>d{hd.die}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-2)', marginLeft: 8 }}>
                        {hd.available} of {hd.total} remaining
                        {hd.used > 0 && <span style={{ color: 'var(--accent-2)' }}> ({hd.used} spent since last long rest)</span>}
                      </span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-2)' }}>CON {conStr}</span>
                  </div>

                  {/* Pip track */}
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
                    {Array.from({ length: hd.total }).map((_, i) => {
                      const isUsedBefore = i < hd.used;
                      const isSpentThisRest = i >= hd.used && i < hd.used + spending;
                      return (
                        <div key={i} style={{
                          width: 18, height: 18, borderRadius: 4,
                          background: isUsedBefore ? 'var(--bg-3)' : isSpentThisRest ? 'var(--accent)' : 'color-mix(in srgb,var(--accent) 30%,var(--bg-2))',
                          border: `1px solid ${isUsedBefore ? 'var(--border)' : 'var(--accent)'}`,
                          opacity: isUsedBefore ? 0.35 : 1,
                          fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: isSpentThisRest ? '#fff' : 'var(--accent)', fontWeight: 700,
                        }}>
                          {isSpentThisRest ? '✓' : isUsedBefore ? '×' : ''}
                        </div>
                      );
                    })}
                  </div>

                  {/* Action row */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    {/* Random roll */}
                    <button
                      className="btn btn-primary"
                      style={{ flex: 2, fontSize: 13, padding: '9px 12px' }}
                      disabled={exhausted}
                      onClick={() => rollDie(hd.die, classId, hd)}
                    >
                      {exhausted ? 'No dice left' : `Roll d${hd.die} (${conStr} CON)`}
                    </button>

                    {/* Manual entry */}
                    {!exhausted && (
                      <div style={{ flex: 1, display: 'flex', gap: 4 }}>
                        <input
                          type="number"
                          min={1}
                          max={hd.die}
                          placeholder={`1–${hd.die}`}
                          value={manualInput[classId] ?? ''}
                          onChange={e => setManualInput(prev => ({ ...prev, [classId]: e.target.value }))}
                          onKeyDown={e => { if (e.key === 'Enter') spendDieManual(classId, hd); }}
                          style={{ width: 54, textAlign: 'center', fontSize: 14, padding: '0 4px' }}
                        />
                        <button
                          className="btn btn-ghost"
                          style={{ fontSize: 13, padding: '9px 10px', whiteSpace: 'nowrap' }}
                          disabled={!manualInput[classId]}
                          onClick={() => spendDieManual(classId, hd)}
                        >
                          Add
                        </button>
                      </div>
                    )}

                    {/* Undo last die for this class */}
                    {spending > 0 && (
                      <button
                        className="btn btn-ghost"
                        style={{ fontSize: 13, padding: '9px 10px' }}
                        title="Undo last die spent this rest"
                        onClick={() => undoLastDie(classId)}
                      >
                        ↩
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {Object.keys(derived.hitDice).length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--text-2)', textAlign: 'center', padding: '16px 0' }}>
                No hit dice available (add a class in the builder).
              </p>
            )}

            {/* Roll log */}
            {diceRolls.length > 0 && (() => {
              const totalHeal = diceRolls.reduce((s, r) => s + r.value, 0);
              return (
                <div style={{ background: 'color-mix(in srgb,var(--accent) 8%,var(--bg-2))', borderRadius: 8, padding: '10px 14px', marginBottom: 10 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Healing this rest</p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                    {diceRolls.map((r, i) => (
                      <span key={i} style={{
                        fontSize: 13, fontWeight: 700, padding: '3px 9px', borderRadius: 6,
                        background: 'var(--accent)', color: '#fff',
                      }}>{r.value >= 0 ? '+' : ''}{r.value}</span>
                    ))}
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>
                    Total: +{totalHeal} HP
                    <span style={{ fontWeight: 400, color: 'var(--text-2)', marginLeft: 8 }}>
                      ({character.health.current} → {Math.min(derived.maxHP, character.health.current + totalHeal)})
                    </span>
                  </p>
                </div>
              );
            })()}

            {/* Confirm */}
            <div style={{ padding: '10px 0 0', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1, padding: '10px 0' }} onClick={() => setShortRestOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" style={{ flex: 2, fontSize: 14, padding: '10px 16px' }} onClick={confirmShortRest}>
                {diceRolls.length > 0
                  ? `Finish Rest (+${diceRolls.reduce((s, r) => s + r.value, 0)} HP)`
                  : 'Rest without spending dice'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rest reminder modal */}
      {restReminder && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          zIndex: 1000, padding: 16,
        }}
          onClick={() => setRestReminder(null)}
        >
          <div style={{
            background: 'var(--bg-1)', borderRadius: 16, padding: 20,
            width: '100%', maxWidth: 480, maxHeight: '60dvh', overflowY: 'auto',
            boxShadow: '0 -4px 40px rgba(0,0,0,0.4)',
          }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700 }}>
                  {restReminder.type === 'long' ? '🌙 Long Rest' : '☕ Short Rest'} — Reminders
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>
                  The following features trigger on this rest.
                </p>
              </div>
              <button onClick={() => setRestReminder(null)}
                style={{ fontSize: 22, color: 'var(--text-2)', lineHeight: 1, padding: '0 4px' }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {restReminder.features.map(f => (
                <div key={f.id} style={{
                  background: 'var(--bg-2)', borderRadius: 8, padding: '10px 14px',
                  borderLeft: '3px solid var(--accent)',
                }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{f.name}</div>
                  {f.effect && (
                    <div style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, marginBottom: 4 }}>
                      ⚡ {f.effect}
                    </div>
                  )}
                  {f.grantHeroicInspiration && (
                    <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, marginBottom: 4 }}>
                      ✨ Heroic Inspiration granted
                    </div>
                  )}
                  {f.description && (
                    <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>{f.description}</div>
                  )}
                </div>
              ))}
            </div>

            <button className="btn btn-primary" style={{ width: '100%', marginTop: 16 }}
              onClick={() => setRestReminder(null)}>
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Overview feature cards */}
      {overviewCards.map(f => (
        <OverviewFeatureCard
          key={f.id}
          feature={f}
          activeValue={(character.featureCardStates ?? {})[f.id] ?? null}
          onChange={val => setFeatureCardState(f.id, val)}
        />
      ))}

      {/* Languages & Tool Proficiencies */}
      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: allTools.length ? '1fr 1fr' : '1fr', gap: 16 }}>

          {/* Languages */}
          <div>
            <p className="label" style={{ marginBottom: 8 }}>Languages</p>
            {allLangs.length === 0 ? (
              <p style={{ fontSize: 12, color: 'var(--text-2)', fontStyle: 'italic' }}>None set</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {allLangs.map(lang => (
                  <div key={lang} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                      background: fixedLangs.has(lang) ? 'var(--accent-4)' : 'var(--accent)',
                    }} />
                    <span>{lang}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tool Proficiencies */}
          {allTools.length > 0 && (
            <div>
              <p className="label" style={{ marginBottom: 8 }}>Tool Proficiencies</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {allTools.map(tool => (
                  <div key={tool} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: 2, flexShrink: 0,
                      background: 'var(--accent)',
                    }} />
                    <span>{tool}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}

function OverviewFeatureCard({ feature, activeValue, onChange }: {
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
          <button onClick={() => onChange(null)} style={{ fontSize: 11, color: 'var(--text-2)', padding: '2px 6px' }}>Clear</button>
        )}
      </div>
      {feature.cardSelectionLabel && (
        <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 10 }}>{feature.cardSelectionLabel}</p>
      )}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {options.map(opt => {
          const active = activeValue === opt.id;
          const color = opt.color ?? 'var(--accent)';
          return (
            <button key={opt.id} onClick={() => onChange(active ? null : opt.id)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
              background: active ? color : 'var(--bg-2)',
              color: active ? '#fff' : 'var(--text-1)',
              border: `2px solid ${active ? color : 'var(--border)'}`,
              transition: 'all 150ms ease',
            }}>
              {opt.icon && <span>{opt.icon}</span>}
              {opt.label}
            </button>
          );
        })}
      </div>
      {activeOpt?.description && (
        <p style={{ fontSize: 12, marginTop: 10, color: activeOpt.color ?? 'var(--accent)' }}>{activeOpt.description}</p>
      )}
    </div>
  );
}

function QuickStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '10px 8px' }}>
      <div className="label">{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
