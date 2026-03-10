import React, { useState } from 'react';
import { useCharacterStore } from '@/store/characterStore';
import { computePathProgress } from '@/lib/pathUtils';
import { useClasses, useSubclasses, useFeatures } from '@/hooks/useGameDatabase';
import { ChoicePicker } from '@/components/sheet/ChoicePicker';
import type { Character, CharacterClassEntry } from '@/types/character';
import type { GameClass, Subclass, Feature } from '@/types/game';

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

// ── Helpers ────────────────────────────────────────────────────

/** Returns the level numbers where this class expects a subclass choice */
function getSubclassLevels(cls: GameClass): number[] {
  const levels: number[] = [];
  for (const le of cls.levelEntries) {
    const hasSubclassChoice =
      (le.choices ?? []).some(ch => ch.type === 'subclass' || ch.dbSource?.entity === 'subclasses') ||
      le.features.some(f => f.tags?.includes('subclass')) ||
      (le.featureRefs ?? []).some(id => id.match(/^l\d+-?subclass$/));
    if (hasSubclassChoice) levels.push(le.level);
  }
  return levels;
}

/** First subclass level = the one where the character chooses */
function getSubclassChoiceLevel(cls: GameClass): number {
  return getSubclassLevels(cls)[0] ?? 3;
}

// ── Class accordion ────────────────────────────────────────────

function ClassEntry({ entry, cls, character }: {
  entry: CharacterClassEntry;
  cls: GameClass;
  character: Character;
}) {
  const { addClassLevel, removeClassLevel, setSubclass } = useCharacterStore();
  const allSubclasses = useSubclasses(cls.id) ?? [];
  const allDbFeatures = useFeatures() ?? [];
  const [open, setOpen] = useState(true);

  const subclassChoiceLevel = getSubclassChoiceLevel(cls);
  const subclassFeatureLevels = getSubclassLevels(cls);
  const selectedSubclass = entry.subclassId
    ? allSubclasses.find(s => s.id === entry.subclassId) ?? null
    : null;

  // Build the merged level list: class levels up to current, with subclass rows injected
  const classLevels = cls.levelEntries.filter(le => le.level <= entry.level);

  // Gather subclass level entries that should be displayed (only at subclass feature levels)
  const subclassLevelMap = new Map<number, typeof cls.levelEntries[0]>();
  if (selectedSubclass) {
    for (const sle of selectedSubclass.levelEntries) {
      if (sle.level <= entry.level) {
        subclassLevelMap.set(sle.level, sle);
      }
    }
  }

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>

      {/* Header row */}
      <div style={{ background: 'var(--bg-2)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => setOpen(!open)} style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>
            {cls.name}
            {selectedSubclass && (
              <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--accent)', marginLeft: 8 }}>
                · {selectedSubclass.name}
              </span>
            )}
          </div>
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
          {/* Creation choices */}
          {(cls.creationChoices ?? []).length > 0 && (
            <LevelBlock
              label="Character Creation"
              levelNum={0}
              cls={cls}
              entry={entry}
              character={character}
              features={[]}
              featureRefs={[]}
              choices={cls.creationChoices ?? []}
              showHpRoll={false}
              isSubclassLevel={false}
              allSubclasses={[]}
              allDbFeatures={allDbFeatures}
              selectedSubclass={null}
              onSelectSubclass={() => {}}
              subclassChoiceLevel={subclassChoiceLevel}
            />
          )}

          {classLevels.map(le => {
            const isSubclassChoiceLevel = le.level === subclassChoiceLevel;
            const isSubclassFeatureLevel = subclassFeatureLevels.includes(le.level);
            const subclassLe = subclassLevelMap.get(le.level);

            // Features to show: class features (excluding the placeholder) + subclass features
            const classFeatures = le.features.filter(f => !f.tags?.includes('subclass'));
            const classFeatureRefs = (le.featureRefs ?? []).filter(id => !id.match(/^l\d+-?subclass$/));
            const subFeatures = subclassLe?.features ?? [];
            const subFeatureRefs = subclassLe?.featureRefs ?? [];

            return (
              <LevelBlock
                key={le.level}
                label={`Level ${le.level}`}
                levelNum={le.level}
                cls={cls}
                entry={entry}
                character={character}
                features={[...classFeatures, ...subFeatures]}
                featureRefs={[...classFeatureRefs, ...subFeatureRefs]}
                choices={[...(le.choices ?? []), ...(subclassLe?.choices ?? [])]}
                showHpRoll={true}
                isSubclassLevel={isSubclassChoiceLevel}
                isSubclassFeatureLevel={isSubclassFeatureLevel}
                allSubclasses={allSubclasses}
                allDbFeatures={allDbFeatures}
                selectedSubclass={selectedSubclass}
                onSelectSubclass={(id) => setSubclass(entry.classId, id || undefined)}
                subclassChoiceLevel={subclassChoiceLevel}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Level block ────────────────────────────────────────────────

type LevelFeature = GameClass['levelEntries'][0]['features'][0];
type LevelChoice  = NonNullable<GameClass['levelEntries'][0]['choices']>[0];

function LevelBlock({
  label, levelNum, cls, entry, character, features, featureRefs, choices,
  showHpRoll, isSubclassLevel, isSubclassFeatureLevel,
  allSubclasses, allDbFeatures, selectedSubclass, onSelectSubclass,
}: {
  label: string;
  levelNum: number;
  cls: GameClass;
  entry: CharacterClassEntry;
  character: Character;
  features: LevelFeature[];
  featureRefs: string[];
  choices: LevelChoice[];
  showHpRoll: boolean;
  isSubclassLevel: boolean;
  isSubclassFeatureLevel?: boolean;
  allSubclasses: Subclass[];
  allDbFeatures: Feature[];
  selectedSubclass: Subclass | null;
  onSelectSubclass: (id: string | null) => void;
  subclassChoiceLevel?: number;
}) {
  const { setHpRoll, resolveBuilderChoice } = useCharacterStore();
  const hpRoll = character.hpRolls?.find(r => r.classId === entry.classId && r.level === levelNum);
  const [collapsed, setCollapsed] = useState(levelNum > 1);

  // Resolve featureRefs to Feature objects for display
  const resolvedRefFeatures = featureRefs
    .map(id => allDbFeatures.find(f => f.id === id))
    .filter((f): f is Feature => !!f);

  const allDisplayFeatures = [...features, ...resolvedRefFeatures];

  const hasContent =
    allDisplayFeatures.length > 0 ||
    choices.length > 0 ||
    showHpRoll ||
    isSubclassLevel;

  if (!hasContent) return null;

  const isFirstClassFirstLevel = levelNum === 1 && character.classes[0]?.classId === entry.classId;

  const subclassIsChosen = !!selectedSubclass;
  const showSubclassPicker = isSubclassLevel && levelNum <= entry.level;
  const showSubclassFeatureBadge = isSubclassFeatureLevel && !isSubclassLevel && selectedSubclass;

  return (
    <div style={{
      borderTop: '1px solid var(--border)',
      borderLeft: isSubclassFeatureLevel ? '3px solid var(--accent)' : undefined,
    }}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 14px', fontSize: 13, textAlign: 'left',
          background: !collapsed ? 'color-mix(in srgb, var(--accent) 6%, var(--bg-1))' : 'transparent',
        }}
      >
        <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          {label}
          {isSubclassLevel && (
            <span style={{
              fontSize: 10, padding: '1px 6px', borderRadius: 4,
              background: subclassIsChosen ? 'var(--accent)' : 'var(--bg-3)',
              color: subclassIsChosen ? '#fff' : 'var(--text-2)',
              fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              {subclassIsChosen ? selectedSubclass!.name : 'Choose Subclass'}
            </span>
          )}
          {showSubclassFeatureBadge && (
            <span style={{
              fontSize: 10, padding: '1px 6px', borderRadius: 4,
              background: 'color-mix(in srgb, var(--accent) 20%, var(--bg-2))',
              color: 'var(--accent)', fontWeight: 600,
            }}>
              {selectedSubclass!.name}
            </span>
          )}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-2)' }}>
          {showHpRoll && hpRoll && <span style={{ color: 'var(--accent-4)' }}>+{hpRoll.roll} HP</span>}
          {allDisplayFeatures.length > 0 && (
            <span style={{
              background: 'var(--bg-3)', borderRadius: 4, padding: '1px 6px', fontSize: 11,
            }}>
              {allDisplayFeatures.length} feature{allDisplayFeatures.length !== 1 ? 's' : ''}
            </span>
          )}
          {choices.length > 0 && (
            <span style={{
              background: 'color-mix(in srgb, var(--accent) 15%, var(--bg-3))',
              color: 'var(--accent)', borderRadius: 4, padding: '1px 6px', fontSize: 11,
            }}>
              {choices.length} choice{choices.length !== 1 ? 's' : ''}
            </span>
          )}
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

          {/* Subclass picker — only at the choice level */}
          {showSubclassPicker && (
            <SubclassPicker
              subclasses={allSubclasses}
              selected={selectedSubclass}
              onSelect={onSelectSubclass}
            />
          )}

          {/* Features */}
          {allDisplayFeatures.map(f => (
            <FeatureBlock key={f.id} feature={f} />
          ))}

          {/* Choices — subclass handled by SubclassPicker; tiered feature choices by TieredFeaturePicker */}
          {choices.map(choice => {
            if (choice.type === 'path_advance') {
              return (
                <TieredFeaturePicker
                  key={choice.id}
                  choice={choice}
                  classId={cls.id}
                  entry={entry}
                  allDbFeatures={allDbFeatures}
                  cls={cls}
                />
              );
            }
            // Subclass choices are handled by SubclassPicker rendered above
            if (choice.type === 'subclass' || choice.dbSource?.entity === 'subclasses') {
              return null;
            }
            return (
              <ChoicePicker
                key={choice.id}
                choice={choice}
                resolved={entry.choices.find(r => r.choiceId === choice.id && r.level === levelNum)}
                allResolved={entry.choices}
                context={{ sourceType: 'class', sourceId: cls.id, level: levelNum }}
                onChange={r => resolveBuilderChoice(r, 'class')}
                onNestedChange={r => resolveBuilderChoice(r, 'class')}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Feature display block ──────────────────────────────────────

function FeatureBlock({ feature }: { feature: Feature }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ background: 'var(--bg-2)', borderRadius: 6, padding: '8px 10px' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}
      >
        <span style={{ fontWeight: 600, fontSize: 13, flex: 1 }}>{feature.name}</span>
        {feature.uses && (
          <span style={{ fontSize: 11, color: 'var(--accent)' }}>
            {feature.uses.max.type === 'flat' ? feature.uses.max.value : '?'}/{feature.uses.rechargeOn.replace('_', ' ')}
          </span>
        )}
        {feature.cost && (
          <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{feature.cost}</span>
        )}
        {feature.description && (
          <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{expanded ? '▲' : '▼'}</span>
        )}
      </button>
      {expanded && feature.description && (
        <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 6, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
          {feature.description}
        </div>
      )}
    </div>
  );
}

// ── Subclass picker ────────────────────────────────────────────

function SubclassPicker({ subclasses, selected, onSelect }: {
  subclasses: Subclass[];
  selected: Subclass | null;
  onSelect: (id: string | null) => void;
}) {
  const [expanded, setExpanded] = useState(!selected);

  if (subclasses.length === 0) {
    return (
      <div style={{
        background: 'color-mix(in srgb, var(--accent) 8%, var(--bg-2))',
        border: '1px dashed var(--accent)', borderRadius: 8, padding: '12px 14px',
      }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', marginBottom: 4 }}>
          Choose Subclass
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-2)' }}>
          No subclasses found for this class. Add one in the Database → Subclasses tab.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'color-mix(in srgb, var(--accent) 8%, var(--bg-2))',
      border: `1px solid ${selected ? 'var(--accent)' : 'color-mix(in srgb, var(--accent) 40%, var(--border))'}`,
      borderRadius: 8, overflow: 'hidden',
    }}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%', padding: '10px 14px', textAlign: 'left',
          display: 'flex', alignItems: 'center', gap: 10,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
            Subclass
          </div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>
            {selected ? selected.name : <span style={{ color: 'var(--text-2)', fontStyle: 'italic' }}>Not yet chosen</span>}
          </div>
          {selected && (
            <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>{selected.description}</div>
          )}
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{expanded ? '▲' : '▼'}</span>
      </button>

      {/* Options */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)' }}>
          {subclasses.map(sc => {
            const isSelected = selected?.id === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => { onSelect(isSelected ? null : sc.id); setExpanded(false); }}
                style={{
                  width: '100%', textAlign: 'left', padding: '10px 14px',
                  borderBottom: '1px solid var(--border)',
                  background: isSelected ? 'color-mix(in srgb, var(--accent) 15%, var(--bg-1))' : 'var(--bg-1)',
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                  border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                  background: isSelected ? 'var(--accent)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isSelected && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{sc.name}</div>
                  {sc.description && (
                    <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{sc.description}</div>
                  )}
                  <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 4 }}>
                    Features at levels: {sc.levelEntries.map(le => le.level).join(', ')}
                  </div>
                </div>
              </button>
            );
          })}
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

// ── Class picker ───────────────────────────────────────────────

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

// ── Tiered Feature Picker ─────────────────────────────────────

function TieredFeaturePicker({ choice, classId, entry, allDbFeatures, cls }: {
  choice: import('@/types/game').Choice;
  classId: string;
  entry: CharacterClassEntry;
  allDbFeatures: Feature[];
  cls: GameClass;
}) {
  const { resolveBuilderChoice } = useCharacterStore();
  const allSubclasses = useSubclasses(cls.id) ?? [];
  const [expandedPath, setExpandedPath] = useState<string | null>(null);

  const pathIds = choice.pathFeatureIds ?? [];
  const pathFeatures = pathIds
    .map(id => allDbFeatures.find(f => f.id === id && f.isPath))
    .filter((f): f is Feature => !!f);

  // Derive current tiers from ALL resolved path_advance choices (globally)
  const pathProgress = computePathProgress(cls, entry);

  // Budget for THIS specific choice
  const resolvedHere = entry.choices.find(r => r.choiceId === choice.id);
  const advancementsHere = resolvedHere?.selectedValues ?? [];
  const used = advancementsHere.length;
  const remaining = choice.count - used;

  // Compute effective maxTier: min of the choice's own cap and any active subclass override
  const subclass = entry.subclassId ? allSubclasses.find(s => s.id === entry.subclassId) : undefined;
  const subclassMaxTier: number = (() => {
    if (!subclass?.classOverrides?.length) return Infinity;
    let cap = Infinity;
    for (const ov of subclass.classOverrides) {
      if (ov.type !== 'path_max_tier') continue;
      if (ov.choiceIds && !ov.choiceIds.includes(choice.id)) continue;
      cap = Math.min(cap, ov.value);
    }
    return cap;
  })();
  const hardMaxTier = Math.min(choice.maxTier ?? Infinity, subclassMaxTier);

  function handleAdvance(pathId: string) {
    if (remaining <= 0) return;
    const currentTier = pathProgress[pathId] ?? 0;
    const pathFeat = pathFeatures.find(f => f.id === pathId);
    const pathMax = pathFeat?.pathTiers?.length ?? 4;
    if (currentTier >= hardMaxTier) return;
    if (currentTier >= pathMax) return;
    resolveBuilderChoice({
      id: resolvedHere?.id ?? crypto.randomUUID(),
      sourceType: 'class', sourceId: classId, level: 0,
      choiceId: choice.id,
      selectedValues: [...advancementsHere, pathId],
    }, 'class');
  }

  function handleRevert(pathId: string) {
    const arr = [...advancementsHere];
    const idx = arr.lastIndexOf(pathId);
    if (idx === -1) return;
    arr.splice(idx, 1);
    resolveBuilderChoice({
      id: resolvedHere?.id ?? crypto.randomUUID(),
      sourceType: 'class', sourceId: classId, level: 0,
      choiceId: choice.id,
      selectedValues: arr,
    }, 'class');
  }

  const budgetColor = remaining === 0 ? 'var(--accent-2)' : remaining <= 1 ? 'var(--accent)' : 'var(--text-1)';

  return (
    <div style={{
      background: 'var(--bg-2)', border: '1px solid var(--border)',
      borderRadius: 8, overflow: 'hidden',
    }}>
      {/* Header with budget */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
            {choice.label}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
            Select a tiered feature to advance. Known paths show their current tier; new ones start at Tier 1.
            {hardMaxTier < Infinity && (
              <span style={{ marginLeft: 6, color: 'var(--text-2)' }}>Max tier: {hardMaxTier}.</span>
            )}
          </div>
        </div>
        {/* Advancement budget */}
        <div style={{
          textAlign: 'center', flexShrink: 0, marginLeft: 12,
          background: remaining === 0 ? 'color-mix(in srgb,var(--accent-2) 12%,var(--bg-3))' : 'color-mix(in srgb,var(--accent) 12%,var(--bg-3))',
          border: `1px solid ${remaining === 0 ? 'color-mix(in srgb,var(--accent-2) 30%,var(--border))' : 'color-mix(in srgb,var(--accent) 30%,var(--border))'}`,
          borderRadius: 8, padding: '6px 12px', minWidth: 64,
        }}>
          <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1, color: budgetColor }}>{remaining}</div>
          <div style={{ fontSize: 10, color: 'var(--text-2)', marginTop: 2 }}>
            {remaining === 1 ? 'advancement' : 'advancements'}<br/>remaining
          </div>
        </div>
      </div>

      {pathFeatures.map(pathFeat => {
        const currentTier = pathProgress[pathFeat.id] ?? 0;
        const pathMax = pathFeat.pathTiers?.length ?? 4;
        const isKnown = currentTier > 0;
        const atHardCap = currentTier >= hardMaxTier;
        const atPathMax = currentTier >= pathMax;
        const canAdvance = remaining > 0 && !atHardCap && !atPathMax;
        const canRevert = advancementsHere.includes(pathFeat.id);
        const tierDef = pathFeat.pathTiers?.find(t => t.tier === currentTier);
        const nextTierDef = pathFeat.pathTiers?.find(t => t.tier === currentTier + 1);
        const isExpanded = expandedPath === pathFeat.id;
        const pathColor = (pathFeat as Feature & { color?: string }).color;
        const pathIcon = (pathFeat as Feature & { icon?: string }).icon;

        return (
          <div key={pathFeat.id} style={{
            borderBottom: '1px solid var(--border)',
            borderLeft: isKnown ? `3px solid ${pathColor ?? 'var(--accent)'}` : undefined,
            opacity: (!isKnown && !canAdvance) ? 0.45 : 1,
          }}>
            <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Name + tier badge */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  {pathIcon && <span style={{ fontSize: 18 }}>{pathIcon}</span>}
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{pathFeat.name.replace(' Path', '')}</span>
                  {isKnown && (
                    <span style={{
                      fontSize: 11, padding: '1px 7px', borderRadius: 10, fontWeight: 600,
                      background: pathColor ?? 'var(--accent)', color: '#fff',
                    }}>
                      Tier {currentTier} — {tierDef?.name ?? ''}
                    </span>
                  )}
                  {atHardCap && isKnown && (
                    <span style={{ fontSize: 10, color: 'var(--text-2)', fontStyle: 'italic' }}>cap reached</span>
                  )}
                </div>
              </div>

              {/* Tier pips */}
              {isKnown && (
                <div style={{ display: 'flex', gap: 4 }}>
                  {(pathFeat.pathTiers ?? []).map(t => (
                    <div key={t.tier} style={{
                      width: 12, height: 12, borderRadius: '50%',
                      background: t.tier <= currentTier ? (pathColor ?? 'var(--accent)') : 'var(--bg-3)',
                      border: `1px solid ${t.tier <= (hardMaxTier) ? (pathColor ?? 'var(--border)') : 'var(--border)'}`,
                      opacity: t.tier > hardMaxTier ? 0.3 : 1,
                    }} />
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexShrink: 0 }}>
                {canAdvance && nextTierDef && (
                  <button className="btn btn-primary" style={{ fontSize: 12, padding: '4px 10px' }}
                    onClick={() => handleAdvance(pathFeat.id)}>
                    {isKnown ? `→ ${nextTierDef.name}` : `+ ${nextTierDef.name}`}
                  </button>
                )}
                {canRevert && (
                  <button className="btn btn-ghost" style={{ fontSize: 11, padding: '3px 8px', color: 'var(--accent-2)' }}
                    title="Undo last advancement of this path"
                    onClick={() => handleRevert(pathFeat.id)}>
                    ↩
                  </button>
                )}
                {isKnown && (atHardCap || atPathMax) && !canRevert && (
                  <span style={{ fontSize: 11, color: 'var(--text-2)', fontStyle: 'italic' }}>Maxed</span>
                )}
                <button className="btn btn-ghost" style={{ fontSize: 11, padding: '3px 8px' }}
                  onClick={() => setExpandedPath(isExpanded ? null : pathFeat.id)}>
                  {isExpanded ? '▲' : isKnown ? '▼' : '▼ Preview'}
                </button>
              </div>
            </div>

            {/* Expanded tier tree */}
            {isExpanded && (
              <div style={{ padding: '0 14px 12px', borderTop: '1px solid var(--border)' }}>
                {(pathFeat.pathTiers ?? []).map(tier => {
                  const isUnlocked = tier.tier <= currentTier;
                  const isNext = tier.tier === currentTier + 1;
                  const isBeyondCap = tier.tier > hardMaxTier;
                  return (
                    <div key={tier.tier} style={{
                      margin: '10px 0',
                      opacity: isUnlocked ? 1 : isBeyondCap ? 0.2 : isNext ? 0.65 : 0.3,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                          background: isUnlocked ? (pathColor ?? 'var(--accent)') : 'var(--bg-3)',
                          border: `2px solid ${pathColor ?? 'var(--border)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700, color: isUnlocked ? '#fff' : 'var(--text-2)',
                        }}>
                          {tier.tier}
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 13 }}>
                          Tier {tier.tier} — {tier.name}
                          {isUnlocked && <span style={{ fontSize: 11, color: 'var(--accent)', marginLeft: 6 }}>✓ Unlocked</span>}
                          {isNext && !isUnlocked && !isBeyondCap && <span style={{ fontSize: 11, color: 'var(--text-2)', marginLeft: 6 }}>Next</span>}
                          {isBeyondCap && <span style={{ fontSize: 11, color: 'var(--accent-2)', marginLeft: 6 }}>Beyond cap</span>}
                        </span>
                      </div>

                      {tier.boostDescription && (
                        <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4, paddingLeft: 30 }}>
                          ⬆ <strong>Boost:</strong> {tier.boostDescription}
                        </div>
                      )}

                      {(tier.features ?? []).map(f => (
                        <div key={f.id} style={{
                          marginLeft: 30, marginBottom: 4,
                          background: 'var(--bg-1)', borderRadius: 5, padding: '5px 8px',
                        }}>
                          <span style={{ fontWeight: 600, fontSize: 12 }}>{f.name}</span>
                          {f.cost && <span style={{ fontSize: 11, color: 'var(--accent)', marginLeft: 6 }}>{f.cost}</span>}
                          {f.description && (
                            <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>{f.description}</div>
                          )}
                        </div>
                      ))}

                      {(tier.choices ?? []).map(ch => (
                        <div key={ch.id} style={{ marginLeft: 0, marginTop: 8 }}>
                          {isUnlocked ? (
                            <ChoicePicker
                              choice={ch}
                              resolved={entry.choices.find(r => r.choiceId === ch.id)}
                              allResolved={entry.choices}
                              context={{ sourceType: 'class', sourceId: cls.id, level: tier.tier }}
                              onChange={r => resolveBuilderChoice(r, 'class')}
                              onNestedChange={r => resolveBuilderChoice(r, 'class')}
                            />
                          ) : (
                            <div style={{ fontSize: 12, color: 'var(--text-2)', fontStyle: 'italic', paddingLeft: 30 }}>
                              🎲 {ch.label}: {(ch.options ?? []).map(o => o.label).join(' / ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
