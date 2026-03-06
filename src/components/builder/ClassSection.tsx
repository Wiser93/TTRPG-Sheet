import { useState } from 'react';
import { useCharacterStore } from '@/store/characterStore';
import { useClasses } from '@/hooks/useGameDatabase';
import { ChoicePicker } from '@/components/sheet/ChoicePicker';
import type { Character, CharacterClassEntry } from '@/types/character';
import type { GameClass } from '@/types/game';

interface Props { character: Character; derivedMaxHP: number }

export function ClassSection({ character, derivedMaxHP }: Props) {
  const { addClassLevel } = useCharacterStore();
  const allClasses = useClasses() ?? [];
  const [addingClass, setAddingClass] = useState(false);

  const totalLevel = character.classes.reduce((sum: number, c) => sum + c.level, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Summary bar */}
      <div style={{
        display: 'flex', gap: 12, background: 'var(--bg-2)',
        border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: 'var(--text-2)' }}>Total Level</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{totalLevel}</div>
        </div>
        <div style={{ flex: 1, textAlign: 'right' }}>
          <div style={{ fontSize: 13, color: 'var(--text-2)' }}>Max HP</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent-4)' }}>{derivedMaxHP}</div>
        </div>
      </div>

      {character.classes.length === 0 && (
        <p style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-2)', fontSize: 13 }}>
          No classes yet - add one below.
        </p>
      )}

      {character.classes.map(entry => {
        const cls = allClasses.find(c => c.id === entry.classId);
        if (!cls) {
          return (
            <div key={entry.classId} className="card" style={{ color: 'var(--text-2)', fontSize: 13 }}>
              Class not found in database: {entry.classId}
            </div>
          );
        }
        return <ClassEntry key={entry.classId} entry={entry} cls={cls} character={character} />;
      })}

      {/* Add class button / picker */}
      {!addingClass ? (
        <button className="btn btn-ghost" style={{ alignSelf: 'flex-start' }} onClick={() => setAddingClass(true)}>
          + Add Class
        </button>
      ) : (
        <ClassPicker
          allClasses={allClasses}
          existingClassIds={character.classes.map(c => c.classId)}
          onPick={(cls) => { addClassLevel(cls.id, cls.hitDie); setAddingClass(false); }}
          onCancel={() => setAddingClass(false)}
        />
      )}
    </div>
  );
}

// ── Class accordion ───────────────────────────────────────────

function ClassEntry({ entry, cls, character }: {
  entry: CharacterClassEntry;
  cls: GameClass;
  character: Character;
}) {
  const { addClassLevel, removeClassLevel } = useCharacterStore();
  const [open, setOpen] = useState(true);

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>

      {/* Header row */}
      <div style={{ background: 'var(--bg-2)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => setOpen(!open)} style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{cls.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-2)' }}>
            d{cls.hitDie} - Level {entry.level}
          </div>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => removeClassLevel(entry.classId)}
            style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-3)', border: '1px solid var(--border)', fontSize: 16, lineHeight: 1 }}
          >-</button>
          <span style={{ fontWeight: 800, fontSize: 18, minWidth: 28, textAlign: 'center' }}>{entry.level}</span>
          <button
            onClick={() => addClassLevel(entry.classId, cls.hitDie)}
            disabled={entry.level >= 20}
            style={{
              width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)',
              border: 'none', color: '#fff', fontSize: 16, lineHeight: 1,
              opacity: entry.level >= 20 ? 0.4 : 1,
            }}
          >+</button>
        </div>
        <button onClick={() => setOpen(!open)} style={{ fontSize: 12, color: 'var(--text-2)', padding: '0 2px' }}>
          {open ? 'v' : '^'}
        </button>
      </div>

      {/* Level entries */}
      {open && (
        <div style={{ padding: '4px 0' }}>
          {(cls.creationChoices ?? []).length > 0 && (
            <LevelBlock
              label="Character Creation"
              levelNum={0}
              cls={cls}
              entry={entry}
              character={character}
              features={[]}
              choices={cls.creationChoices ?? []}
              showHpRoll={false}
            />
          )}
          {cls.levelEntries
            .filter(le => le.level <= entry.level)
            .map(le => (
              <LevelBlock
                key={le.level}
                label={`Level ${le.level}`}
                levelNum={le.level}
                cls={cls}
                entry={entry}
                character={character}
                features={le.features}
                choices={le.choices ?? []}
                showHpRoll={true}
              />
            ))
          }
        </div>
      )}
    </div>
  );
}

// ── Level block ───────────────────────────────────────────────

type LevelFeature = GameClass['levelEntries'][0]['features'][0];
type LevelChoice  = NonNullable<GameClass['levelEntries'][0]['choices']>[0];

function LevelBlock({ label, levelNum, cls, entry, character, features, choices, showHpRoll }: {
  label: string;
  levelNum: number;
  cls: GameClass;
  entry: CharacterClassEntry;
  character: Character;
  features: LevelFeature[];
  choices: LevelChoice[];
  showHpRoll: boolean;
}) {
  const { setHpRoll, resolveBuilderChoice } = useCharacterStore();
  const hpRoll = character.hpRolls?.find(r => r.classId === entry.classId && r.level === levelNum);
  const [collapsed, setCollapsed] = useState(levelNum > 1);

  const hasContent = features.length > 0 || choices.length > 0 || showHpRoll;
  if (!hasContent) return null;

  const isFirstClassFirstLevel = levelNum === 1 && character.classes[0]?.classId === entry.classId;

  return (
    <div style={{ borderTop: '1px solid var(--border)' }}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 14px', fontSize: 13, textAlign: 'left',
          background: !collapsed ? 'color-mix(in srgb, var(--accent) 6%, var(--bg-1))' : 'transparent',
        }}
      >
        <span style={{ fontWeight: 600 }}>{label}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-2)' }}>
          {showHpRoll && hpRoll && <span style={{ color: 'var(--accent-4)' }}>+{hpRoll.roll} HP</span>}
          {features.length > 0 && <span>{features.map(f => f.name).join(', ')}</span>}
          <span>{collapsed ? 'v' : '^'}</span>
        </span>
      </button>

      {!collapsed && (
        <div style={{ padding: '8px 14px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* HP roll editor */}
          {showHpRoll && (
            <HpRollEditor
              level={levelNum}
              hitDie={cls.hitDie}
              roll={hpRoll?.roll}
              isFirstLevel={isFirstClassFirstLevel}
              onSet={(roll) => setHpRoll(entry.classId, levelNum, roll)}
            />
          )}

          {/* Features */}
          {features.map(f => (
            <div key={f.id} style={{ background: 'var(--bg-2)', borderRadius: 6, padding: '8px 10px' }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{f.name}</div>
              {f.uses && (
                <div style={{ fontSize: 11, color: 'var(--accent)', marginTop: 2 }}>
                  {f.uses.max.type === 'flat' ? f.uses.max.value : '?'} uses per {f.uses.rechargeOn.replace('_', ' ')}
                </div>
              )}
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4, whiteSpace: 'pre-wrap' }}>
                {f.description}
              </div>
            </div>
          ))}

          {/* Choices */}
          {choices.map(choice => (
            <ChoicePicker
              key={choice.id}
              choice={choice}
              resolved={entry.choices.find(r => r.choiceId === choice.id && r.level === levelNum)}
              allResolved={entry.choices}
              context={{ sourceType: 'class', sourceId: cls.id, level: levelNum }}
              onChange={r => resolveBuilderChoice(r, 'class')}
              onNestedChange={r => resolveBuilderChoice(r, 'class')}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── HP roll editor ─────────────────────────────────────────────

function HpRollEditor({ level, hitDie, roll, isFirstLevel, onSet }: {
  level: number;
  hitDie: number;
  roll: number | undefined;
  isFirstLevel: boolean;
  onSet: (roll: number) => void;
}) {
  const avg = Math.ceil((hitDie + 1) / 2);
  const displayRoll = roll ?? (isFirstLevel ? hitDie : avg);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
      background: 'var(--bg-2)', borderRadius: 6, padding: '8px 10px',
    }}>
      <div style={{ flex: 1, minWidth: 100 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)', marginBottom: 2 }}>
          HP at Level {level} (d{hitDie})
        </div>
        {isFirstLevel && (
          <div style={{ fontSize: 11, color: 'var(--accent)' }}>First level always uses max die</div>
        )}
      </div>

      {isFirstLevel ? (
        <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent-4)' }}>
          {hitDie}
          <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-2)', marginLeft: 4 }}>(max)</span>
        </span>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="number"
            min={1}
            max={hitDie}
            value={displayRoll}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onSet(Math.max(1, Math.min(hitDie, Number(e.target.value))))}
            style={{ width: 52, textAlign: 'center', fontSize: 17, fontWeight: 700 }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <button className="btn btn-ghost" style={{ fontSize: 11, padding: '2px 6px' }}
              onClick={() => onSet(hitDie)}>Max</button>
            <button className="btn btn-ghost" style={{ fontSize: 11, padding: '2px 6px' }}
              onClick={() => onSet(avg)}>Avg</button>
            <button className="btn btn-ghost" style={{ fontSize: 11, padding: '2px 6px' }}
              onClick={() => onSet(Math.max(1, Math.floor(Math.random() * hitDie) + 1))}>Roll</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Class picker ──────────────────────────────────────────────

function ClassPicker({ allClasses, existingClassIds, onPick, onCancel }: {
  allClasses: GameClass[];
  existingClassIds: string[];
  onPick: (cls: GameClass) => void;
  onCancel: () => void;
}) {
  const [search, setSearch] = useState('');
  const filtered = allClasses.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ border: '1px solid var(--accent)', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: 10, background: 'var(--bg-2)', display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          placeholder="Search classes..."
          style={{ flex: 1, margin: 0 }}
          autoFocus
        />
        <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={onCancel}>Cancel</button>
      </div>
      {filtered.length === 0 ? (
        <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-2)', fontSize: 13 }}>
          {allClasses.length === 0 ? 'No classes in database yet.' : 'No results.'}
        </div>
      ) : (
        <div style={{ maxHeight: 240, overflowY: 'auto' }}>
          {filtered.map(cls => {
            const alreadyAdded = existingClassIds.includes(cls.id);
            return (
              <button
                key={cls.id}
                onClick={() => onPick(cls)}
                disabled={alreadyAdded}
                style={{
                  width: '100%', textAlign: 'left', padding: '9px 14px',
                  borderBottom: '1px solid var(--border)', background: 'transparent',
                  opacity: alreadyAdded ? 0.4 : 1,
                  cursor: alreadyAdded ? 'not-allowed' : 'pointer',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 13 }}>
                  {cls.name}
                  {alreadyAdded && (
                    <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-2)', marginLeft: 8 }}>
                      (already added - use + to level up)
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-2)' }}>
                  d{cls.hitDie} - Saves: {cls.savingThrowProficiencies.map(s => s.slice(0, 3).toUpperCase()).join(', ')}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
