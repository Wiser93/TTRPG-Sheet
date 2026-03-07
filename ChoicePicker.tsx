import { useCharacterStore } from '@/store/characterStore';
import { useBackgrounds, useClasses, useAllSpecies } from '@/hooks/useGameDatabase';
import { DbSourcedChoicePicker } from '@/components/sheet/DbSourcedChoicePicker';
import type { Character, ResolvedChoice } from '@/types/character';
import type { SkillKey, Choice } from '@/types/game';
import type { DBClass } from '@/db/schema';

const ALL_SKILLS: { key: SkillKey; label: string }[] = [
  { key: 'acrobatics',    label: 'Acrobatics'    },
  { key: 'animalHandling',label: 'Animal Handling'},
  { key: 'arcana',        label: 'Arcana'        },
  { key: 'athletics',     label: 'Athletics'     },
  { key: 'deception',     label: 'Deception'     },
  { key: 'history',       label: 'History'       },
  { key: 'insight',       label: 'Insight'       },
  { key: 'intimidation',  label: 'Intimidation'  },
  { key: 'investigation', label: 'Investigation' },
  { key: 'medicine',      label: 'Medicine'      },
  { key: 'nature',        label: 'Nature'        },
  { key: 'perception',    label: 'Perception'    },
  { key: 'performance',   label: 'Performance'   },
  { key: 'persuasion',    label: 'Persuasion'    },
  { key: 'religion',      label: 'Religion'      },
  { key: 'sleightOfHand', label: 'Sleight of Hand'},
  { key: 'stealth',       label: 'Stealth'       },
  { key: 'survival',      label: 'Survival'      },
];

interface Props { character: Character }

export function ProficiencySection({ character }: Props) {
  const { patchCharacter, resolveBuilderChoice } = useCharacterStore();
  const allClasses     = useClasses()      ?? [];
  const allBackgrounds = useBackgrounds()  ?? [];
  const allSpecies     = useAllSpecies()   ?? [];

  // Gather what each source grants
  const classes = character.classes
    .map(ce => allClasses.find(c => c.id === ce.classId))
    .filter((c): c is DBClass => c != null);
  const bg       = allBackgrounds.find(b => b.id === character.backgroundId);

  // Currently set proficiencies on the character
  const skillProfs  = new Set(
    Object.entries(character.skills)
      .filter(([, s]) => s.proficient)
      .map(([k]) => k as SkillKey)
  );
  const armorProfs  = new Set(character.proficiencies.armor);
  const weaponProfs = new Set(character.proficiencies.weapons);
  const toolProfs   = new Set(character.proficiencies.tools);

  function toggleSkill(key: SkillKey) {
    const updated = { ...character.skills };
    updated[key] = { ...updated[key], proficient: !updated[key].proficient };
    patchCharacter({ skills: updated });
  }

  function toggleArmor(name: string) {
    const arr = armorProfs.has(name)
      ? character.proficiencies.armor.filter(a => a !== name)
      : [...character.proficiencies.armor, name];
    patchCharacter({ proficiencies: { ...character.proficiencies, armor: arr } });
  }

  function toggleWeapon(name: string) {
    const arr = weaponProfs.has(name)
      ? character.proficiencies.weapons.filter(w => w !== name)
      : [...character.proficiencies.weapons, name];
    patchCharacter({ proficiencies: { ...character.proficiencies, weapons: arr } });
  }

  function toggleTool(name: string) {
    const arr = toolProfs.has(name)
      ? character.proficiencies.tools.filter(t => t !== name)
      : [...character.proficiencies.tools, name];
    patchCharacter({ proficiencies: { ...character.proficiencies, tools: arr } });
  }

  const species = allSpecies.find(s => s.id === character.speciesId);

  // ── Skill pools ─────────────────────────────────────────────

  // Fixed skills from background
  const bgSkills   = new Set<SkillKey>(bg?.skillProficiencies ?? []);
  // Chooseable skills from classes
  const classSkillPools: { choose: number; from: SkillKey[] }[] = classes.map((cls: DBClass) => cls.skillProficiencies);
  // How many class-granted skills are currently chosen
  const classChosenCount = Array.from(skillProfs).filter(k => !bgSkills.has(k)).length;
  const maxClassSkills   = classSkillPools.reduce((s, p) => s + p.choose, 0);
  // ── Fixed prof lists from class ──────────────────────────────
  const fixedArmor   = dedupe(classes.flatMap((c: DBClass) => c.armorProficiencies));
  const fixedWeapons = dedupe(classes.flatMap((c: DBClass) => c.weaponProficiencies));
  const fixedTools   = dedupe(classes.flatMap((c: DBClass) => c.toolProficiencies));
  const bgTools      = bg?.toolProficiencies ?? [];

  // ── Class language choices ───────────────────────────────────
  // Collect all `language` type choices from class creation choices + per-level
  // entries for which the character has reached that level
  const classLanguageChoices: {
    choice: import('@/types/game').Choice;
    resolved: import('@/types/character').ResolvedChoice[];
    sourceName: string;
    sourceId: string;
  }[] = [];
  for (const cls of classes) {
    const charClass = character.classes.find(cc => cc.classId === cls.id);
    if (!charClass) continue;
    const reached = charClass.level;
    // Creation choices
    for (const ch of cls.creationChoices ?? []) {
      if (ch.type === 'language') {
        classLanguageChoices.push({ choice: ch, resolved: charClass.choices, sourceName: cls.name, sourceId: cls.id });
      }
    }
    // Per-level choices up to current level
    for (const lvl of cls.levelEntries ?? []) {
      if (lvl.level > reached) continue;
      for (const ch of lvl.choices ?? []) {
        if (ch.type === 'language') {
          classLanguageChoices.push({ choice: ch, resolved: charClass.choices, sourceName: `${cls.name} (lvl ${lvl.level})`, sourceId: cls.id });
        }
      }
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Skill Proficiencies ──────────────────────────── */}
      <div>
        <SectionHeading label="Skill Proficiencies" />

        {!bg && !classes.length && (
          <p style={{ fontSize: 13, color: 'var(--text-2)' }}>Set a class and background first to see available skill options.</p>
        )}

        {/* Background fixed skills */}
        {bgSkills.size > 0 && (
          <FixedProfRow label={`${bg!.name} (fixed)`} items={Array.from(bgSkills).map(k => (ALL_SKILLS.find(s => s.key === k)?.label ?? k) as string)} />
        )}

        {/* Class choose-N skills */}
        {classSkillPools.map((pool, i) => {
          if (pool.from.length === 0) return null;
          const cls = classes[i]!;
          const chosenFromPool = pool.from.filter(k => skillProfs.has(k) && !bgSkills.has(k));
          return (
            <div key={cls.id} style={{ marginTop: 10 }}>
              <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6 }}>
                <strong>{cls.name}</strong> — choose {pool.choose}
                <span style={{ marginLeft: 6, color: chosenFromPool.length === pool.choose ? 'var(--accent-4)' : 'var(--accent)' }}>
                  ({chosenFromPool.length}/{pool.choose})
                </span>
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {pool.from.map(key => {
                  const isFixed = bgSkills.has(key);
                  const chosen  = skillProfs.has(key);
                  const atMax   = !chosen && classChosenCount >= maxClassSkills + bgSkills.size;
                  return (
                    <ProfChip
                      key={key}
                      label={(ALL_SKILLS.find(s => s.key === key)?.label ?? key) as string}
                      active={chosen}
                      locked={isFixed}
                      disabled={atMax && !chosen}
                      onClick={() => { if (!isFixed) toggleSkill(key); }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* All skills — show full list to manually toggle anything not covered */}
        <details style={{ marginTop: 12 }}>
          <summary style={{ fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}>
            All skills (manually override)
          </summary>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {ALL_SKILLS.map(({ key, label }) => (
              <ProfChip
                key={key}
                label={label}
                active={skillProfs.has(key)}
                locked={bgSkills.has(key)}
                onClick={() => { if (!bgSkills.has(key)) toggleSkill(key); }}
              />
            ))}
          </div>
        </details>
      </div>

      {/* ── Armor Proficiencies ──────────────────────────── */}
      <ProfListSection
        label="Armor Proficiencies"
        fixedItems={fixedArmor}
        activeItems={armorProfs}
        onToggle={toggleArmor}
        addPlaceholder="e.g. shields"
        onAdd={(name) => toggleArmor(name)}
      />

      {/* ── Weapon Proficiencies ─────────────────────────── */}
      <ProfListSection
        label="Weapon Proficiencies"
        fixedItems={fixedWeapons}
        activeItems={weaponProfs}
        onToggle={toggleWeapon}
        addPlaceholder="e.g. net, hand crossbow"
        onAdd={(name) => toggleWeapon(name)}
      />

      {/* ── Tool Proficiencies ───────────────────────────── */}
      <ProfListSection
        label="Tool Proficiencies"
        fixedItems={dedupe([...fixedTools, ...bgTools])}
        activeItems={toolProfs}
        onToggle={toggleTool}
        addPlaceholder="e.g. thieves' tools"
        onAdd={(name) => toggleTool(name)}
      />

      {/* ── Species skill choices (e.g. "Skillful — choose 1 skill") ── */}
      {[
        ...(species?.creationChoices ?? []).filter(c => c.type === 'skill_proficiency').map(c => ({
          choice: c, resolved: character.speciesChoices, source: 'species' as const, sourceId: species!.id, sourceName: species!.name,
        })),
        ...(bg?.creationChoices ?? []).filter(c => c.type === 'skill_proficiency').map(c => ({
          choice: c, resolved: character.backgroundChoices, source: 'background' as const, sourceId: bg!.id, sourceName: bg!.name,
        })),
      ].map(({ choice, resolved, source, sourceId, sourceName }) => (
        <SkillChoicePicker
          key={choice.id}
          choice={choice}
          allResolved={resolved}
          sourceName={sourceName}
          bgSkills={bgSkills}
          onResolve={r => resolveBuilderChoice(r, source)}
          context={{ sourceType: source, sourceId, level: 0 }}
        />
      ))}

      {/* ── Languages ───────────────────────────────────── */}
      <LanguagesSection
        character={character}
        species={species}
        bg={bg}
        classLanguageChoices={classLanguageChoices}
        patchCharacter={patchCharacter}
        resolveBuilderChoice={resolveBuilderChoice}
      />

      {/* ── Feat choices (e.g. "Versatile — choose an origin feat") ── */}
      {[
        ...(species?.creationChoices ?? []).filter(c => c.type === 'feat').map(c => ({
          choice: c, resolved: character.speciesChoices, source: 'species' as const, sourceId: species!.id, sourceName: species!.name,
        })),
        ...(bg?.creationChoices ?? []).filter(c => c.type === 'feat').map(c => ({
          choice: c, resolved: character.backgroundChoices, source: 'background' as const, sourceId: bg!.id, sourceName: bg!.name,
        })),
      ].map(({ choice, resolved, source, sourceId, sourceName }) => (
        <div key={choice.id}>
          <SectionHeading label={`${sourceName}: ${choice.label}`} />
          <DbSourcedChoicePicker
            choice={choice}
            resolved={resolved.find(r => r.choiceId === choice.id)}
            onChange={r => resolveBuilderChoice(r, source)}
            context={{ sourceType: source, sourceId }}
          />
        </div>
      ))}

    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────

function SectionHeading({ label }: { label: string }) {
  return (
    <p style={{
      fontSize: 13, fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.07em', color: 'var(--text-2)', marginBottom: 8,
    }}>{label}</p>
  );
}

function FixedProfRow({ label, items }: { label: string; items: string[] }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4 }}>{label}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {items.map(item => <ProfChip key={item} label={item} active locked />)}
      </div>
    </div>
  );
}

function ProfChip({ label, active, locked, disabled, onClick }: {
  label: string;
  active?: boolean;
  locked?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || locked}
      style={{
        padding: '4px 10px', borderRadius: 16, fontSize: 12, fontWeight: active ? 700 : 400,
        background: active
          ? locked ? 'var(--accent-4)' : 'var(--accent)'
          : 'var(--bg-2)',
        color: active ? '#fff' : disabled ? 'var(--text-2)' : 'var(--text-1)',
        border: `1px solid ${active ? 'transparent' : 'var(--border)'}`,
        cursor: locked ? 'default' : disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'all 120ms ease',
      }}
    >
      {locked ? '🔒 ' : ''}{label}
    </button>
  );
}

function ProfListSection({ label, fixedItems, activeItems, onToggle, addPlaceholder, onAdd }: {
  label: string;
  fixedItems: string[];
  activeItems: Set<string>;
  onToggle: (name: string) => void;
  addPlaceholder: string;
  onAdd: (name: string) => void;
}) {
  const extraItems = Array.from(activeItems).filter(a => !fixedItems.includes(a));

  return (
    <div>
      <SectionHeading label={label} />
      {fixedItems.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4 }}>From class/background (fixed)</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {fixedItems.map(item => <ProfChip key={item} label={item} active locked />)}
          </div>
        </div>
      )}
      {extraItems.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4 }}>Additional</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {extraItems.map(item => (
              <ProfChip key={item} label={item} active onClick={() => onToggle(item)} />
            ))}
          </div>
        </div>
      )}
      <AddProfInput placeholder={addPlaceholder} onAdd={name => {
        if (!activeItems.has(name)) onAdd(name);
      }} />
    </div>
  );
}

function AddProfInput({ placeholder, onAdd }: { placeholder: string; onAdd: (name: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
      <input
        placeholder={placeholder}
        style={{ flex: 1 }}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter') {
            const val = (e.target as HTMLInputElement).value.trim();
            if (val) { onAdd(val); (e.target as HTMLInputElement).value = ''; }
          }
        }}
      />
      <button className="btn btn-ghost" style={{ fontSize: 12 }}
        onClick={(e) => {
          const input = (e.currentTarget.previousSibling as HTMLInputElement);
          const val = input.value.trim();
          if (val) { onAdd(val); input.value = ''; }
        }}>
        + Add
      </button>
    </div>
  );
}

function dedupe(arr: string[]): string[] {
  return Array.from(new Set(arr));
}

// ── SkillChoicePicker ─────────────────────────────────────────
// Renders a skill_proficiency choice as a grid of skill chips,
// styled consistently with the class skill pools above.

function SkillChoicePicker({ choice, allResolved, sourceName, bgSkills, onResolve, context }: {
  choice: Choice;
  allResolved: ResolvedChoice[];
  sourceName: string;
  bgSkills: Set<SkillKey>;
  onResolve: (r: ResolvedChoice) => void;
  context: { sourceType: 'class' | 'species' | 'background' | 'feat'; sourceId: string; level: number };
}) {
  const resolved = allResolved.find(r => r.choiceId === choice.id);
  const selected = new Set<SkillKey>((resolved?.selectedValues ?? []) as SkillKey[]);

  function toggle(key: SkillKey) {
    let next: SkillKey[];
    if (selected.has(key)) {
      next = Array.from(selected).filter(k => k !== key);
    } else if (selected.size < choice.count) {
      next = [...Array.from(selected), key];
    } else if (choice.count === 1) {
      next = [key];
    } else {
      return;
    }
    onResolve({
      id: resolved?.id ?? crypto.randomUUID(),
      sourceType: context.sourceType,
      sourceId: context.sourceId,
      level: context.level,
      choiceId: choice.id,
      selectedValues: next,
    });
  }

  return (
    <div>
      <SectionHeading label={`${sourceName}: ${choice.label}`} />
      <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 8 }}>
        Choose {choice.count} &middot; {selected.size}/{choice.count} selected
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {ALL_SKILLS.map(({ key, label }) => {
          const isFixed   = bgSkills.has(key);
          const isChosen  = selected.has(key);
          const atMax     = !isChosen && selected.size >= choice.count;
          return (
            <ProfChip
              key={key}
              label={label}
              active={isChosen || isFixed}
              locked={isFixed}
              disabled={atMax}
              onClick={() => { if (!isFixed) toggle(key); }}
            />
          );
        })}
      </div>
    </div>
  );
}

// ── Languages section ─────────────────────────────────────────

const COMMON_LANGUAGES = [
  'Common', 'Dwarvish', 'Elvish', 'Giant', 'Gnomish', 'Goblin',
  'Halfling', 'Orcish', 'Abyssal', 'Celestial', 'Draconic',
  'Deep Speech', 'Infernal', 'Primordial', 'Sylvan', 'Undercommon',
];

function LanguagesSection({ character, species, bg, classLanguageChoices, patchCharacter, resolveBuilderChoice }: {
  character: import('@/types/character').Character;
  species: import('@/types/game').Species | undefined;
  bg: import('@/types/game').Background | undefined;
  classLanguageChoices: {
    choice: import('@/types/game').Choice;
    resolved: import('@/types/character').ResolvedChoice[];
    sourceName: string;
    sourceId: string;
  }[];
  patchCharacter: (changes: Partial<import('@/types/character').Character>) => void;
  resolveBuilderChoice: (r: import('@/types/character').ResolvedChoice, source: 'class' | 'species' | 'background') => void;
}) {
  // Fixed langs from species (array form) and background
  const fixedSpeciesLangs: string[] = Array.isArray(species?.languages)
    ? species.languages as string[]
    : [];
  // Number of free picks granted by species/background
  const speciesFreeCount = typeof species?.languages === 'number' ? species.languages : 0;
  const bgFreeCount = typeof bg?.languages === 'number' ? bg.languages : 0;
  const totalFree = speciesFreeCount + bgFreeCount;

  const fixedLangs = new Set(['Common', ...fixedSpeciesLangs]);
  const chosen = character.languages;
  const chosenSet = new Set(chosen);

  // How many free picks still available
  const freeUsed = chosen.filter(l => !fixedLangs.has(l)).length;
  const freeLeft = Math.max(0, totalFree - freeUsed);

  function toggle(lang: string) {
    if (fixedLangs.has(lang)) return;
    if (chosenSet.has(lang)) {
      patchCharacter({ languages: chosen.filter(l => l !== lang) });
    } else if (freeLeft > 0) {
      patchCharacter({ languages: [...chosen, lang] });
    }
  }

  function addCustom(lang: string) {
    if (!chosenSet.has(lang) && freeLeft > 0) {
      patchCharacter({ languages: [...chosen, lang] });
    }
  }

  function remove(lang: string) {
    if (!fixedLangs.has(lang)) {
      patchCharacter({ languages: chosen.filter(l => l !== lang) });
    }
  }

  return (
    <div>
      <SectionHeading label="Languages" />

      {/* Fixed grants */}
      {fixedLangs.size > 0 && (
        <div style={{ marginBottom: 8 }}>
          <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4 }}>Fixed (species / all characters)</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {Array.from(fixedLangs).map(l => (
              <ProfChip key={l} label={l} active locked />
            ))}
          </div>
        </div>
      )}

      {/* Free picks */}
      {totalFree > 0 && (
        <div style={{ marginBottom: 8 }}>
          <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6 }}>
            Additional languages — choose {totalFree}
            <span style={{ marginLeft: 6, color: freeLeft === 0 ? 'var(--accent-4)' : 'var(--accent)' }}>
              ({freeUsed}/{totalFree})
            </span>
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {COMMON_LANGUAGES.filter(l => !fixedLangs.has(l)).map(l => {
              const isChosen = chosenSet.has(l);
              const disabled = !isChosen && freeLeft === 0;
              return (
                <ProfChip
                  key={l}
                  label={l}
                  active={isChosen}
                  disabled={disabled}
                  onClick={() => toggle(l)}
                />
              );
            })}
          </div>
          <AddProfInput placeholder="Custom language…" onAdd={addCustom} />
        </div>
      )}

      {/* Manual — if no free picks granted, still allow adding */}
      {totalFree === 0 && (
        <div>
          <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6 }}>
            Manually add languages known
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
            {chosen.filter(l => !fixedLangs.has(l)).map(l => (
              <ProfChip key={l} label={l} active onClick={() => remove(l)} />
            ))}
          </div>
          <AddProfInput placeholder="Add language…" onAdd={l => {
            if (!chosenSet.has(l)) patchCharacter({ languages: [...chosen, l] });
          }} />
        </div>
      )}

      {/* Always show chosen custom languages even in free-pick mode */}
      {totalFree > 0 && chosen.filter(l => !fixedLangs.has(l) && !COMMON_LANGUAGES.includes(l)).length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
          {chosen.filter(l => !fixedLangs.has(l) && !COMMON_LANGUAGES.includes(l)).map(l => (
            <ProfChip key={l} label={l} active onClick={() => remove(l)} />
          ))}
        </div>
      )}

      {/* ── Class-granted language choices ─────────────── */}
      {classLanguageChoices.map(({ choice, resolved, sourceName, sourceId }) => (
        <LanguageChoicePicker
          key={choice.id}
          choice={choice}
          allResolved={resolved}
          sourceName={sourceName}
          sourceId={sourceId}
          fixedLangs={fixedLangs}
          onResolve={r => resolveBuilderChoice(r, 'class')}
        />
      ))}
    </div>
  );
}

// ── Language choice picker (for class-granted picks) ──────────

function LanguageChoicePicker({ choice, allResolved, sourceName, sourceId, fixedLangs, onResolve }: {
  choice: import('@/types/game').Choice;
  allResolved: import('@/types/character').ResolvedChoice[];
  sourceName: string;
  sourceId: string;
  fixedLangs: Set<string>;
  onResolve: (r: import('@/types/character').ResolvedChoice) => void;
}) {
  const resolved = allResolved.find(r => r.choiceId === choice.id);
  const selected = new Set<string>(resolved?.selectedValues ?? []);
  const count = choice.count ?? 1;

  function toggle(lang: string) {
    if (fixedLangs.has(lang)) return;
    let next: string[];
    if (selected.has(lang)) {
      next = Array.from(selected).filter(l => l !== lang);
    } else if (selected.size < count) {
      next = [...Array.from(selected), lang];
    } else if (count === 1) {
      next = [lang];
    } else return;
    onResolve({
      id: resolved?.id ?? crypto.randomUUID(),
      sourceType: 'class',
      sourceId,
      level: 0,
      choiceId: choice.id,
      selectedValues: next,
    });
  }

  function addCustom(lang: string) {
    if (!selected.has(lang) && selected.size < count) {
      const next = [...Array.from(selected), lang];
      onResolve({
        id: resolved?.id ?? crypto.randomUUID(),
        sourceType: 'class',
        sourceId,
        level: 0,
        choiceId: choice.id,
        selectedValues: next,
      });
    }
  }

  return (
    <div style={{ marginTop: 12 }}>
      <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6 }}>
        <strong>{sourceName}:</strong> {choice.label} — choose {count}
        <span style={{ marginLeft: 6, color: selected.size === count ? 'var(--accent-4)' : 'var(--accent)' }}>
          ({selected.size}/{count})
        </span>
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
        {COMMON_LANGUAGES.filter(l => !fixedLangs.has(l)).map(l => {
          const isChosen = selected.has(l);
          const disabled = !isChosen && selected.size >= count;
          return (
            <ProfChip
              key={l}
              label={l}
              active={isChosen}
              disabled={disabled}
              onClick={() => toggle(l)}
            />
          );
        })}
      </div>
      <AddProfInput placeholder="Custom language…" onAdd={addCustom} />
    </div>
  );
}
