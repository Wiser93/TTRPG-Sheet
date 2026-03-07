import { useCharacterStore } from '@/store/characterStore';
import { useBackgrounds, useAllSpecies } from '@/hooks/useGameDatabase';
import type { Character, DerivedStats } from '@/types/character';
import type { StatKey, SkillKey } from '@/types/game';

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
  const { setCurrentHP, shortRest, longRest } = useCharacterStore();
  const allSpecies    = useAllSpecies()   ?? [];
  const allBackgrounds = useBackgrounds() ?? [];
  const species    = allSpecies.find(s => s.id === character.speciesId);
  const background = allBackgrounds.find(b => b.id === character.backgroundId);

  // Collect all languages
  const fixedLangs = new Set<string>(['Common', ...((Array.isArray(species?.languages) ? species.languages : []) as string[])]);
  const allLangs = Array.from(new Set([...Array.from(fixedLangs), ...character.languages]));

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
              onClick={() => shortRest(0)}
            >
              Short Rest
            </button>
            <button
              className="btn btn-ghost"
              style={{ fontSize: 11, padding: '3px 10px' }}
              onClick={longRest}
            >
              Long Rest
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <input
            type="number"
            value={character.health.current}
            onChange={e => setCurrentHP(Number(e.target.value))}
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
      <div className="card">
        <p className="label" style={{ marginBottom: 10 }}>Ability Scores</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {(Object.keys(STAT_LABELS) as StatKey[]).map(stat => (
            <div key={stat} style={{
              background: 'var(--bg-2)',
              borderRadius: 6,
              padding: '8px 4px',
              textAlign: 'center',
            }}>
              <div className="label">{STAT_LABELS[stat]}</div>
              <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.1 }}>
                {derived.stats[stat]}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
                {sign(derived.statMods[stat])}
              </div>
            </div>
          ))}
        </div>
      </div>

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

function QuickStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '10px 8px' }}>
      <div className="label">{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
