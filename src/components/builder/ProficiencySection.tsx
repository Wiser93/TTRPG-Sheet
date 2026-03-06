import { useCharacterStore } from '@/store/characterStore';
import { useAllSpecies, useBackgrounds, useClasses } from '@/hooks/useGameDatabase';
import type { Character } from '@/types/character';
import type { SkillKey } from '@/types/game';

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
  const { patchCharacter } = useCharacterStore();
  const allClasses     = useClasses()      ?? [];
  const allSpecies     = useAllSpecies()   ?? [];
  const allBackgrounds = useBackgrounds()  ?? [];

  // Gather what each source grants
  const classes = character.classes.map(ce => allClasses.find(c => c.id === ce.classId)).filter(Boolean);
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

  // ── Skill pools ─────────────────────────────────────────────

  // Fixed skills from background
  const bgSkills   = new Set(bg?.skillProficiencies ?? []);
  // Chooseable skills from classes
  const classSkillPools = classes.map(cls => cls!.skillProficiencies);
  // How many class-granted skills are currently chosen
  const classChosenCount = Array.from(skillProfs).filter(k => !bgSkills.has(k)).length;
  const maxClassSkills   = classSkillPools.reduce((s, p) => s + p.choose, 0);
  // ── Fixed prof lists from class ──────────────────────────────
  const fixedArmor   = dedupe(classes.flatMap(c => c!.armorProficiencies));
  const fixedWeapons = dedupe(classes.flatMap(c => c!.weaponProficiencies));
  const fixedTools   = dedupe(classes.flatMap(c => c!.toolProficiencies));
  const bgTools      = bg?.toolProficiencies ?? [];

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
          <FixedProfRow label={`${bg!.name} (fixed)`} items={Array.from(bgSkills).map(k => ALL_SKILLS.find(s => s.key === k)?.label ?? k)} />
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
                      label={ALL_SKILLS.find(s => s.key === key)?.label ?? key}
                      active={chosen}
                      locked={isFixed}
                      disabled={atMax && !chosen}
                      onClick={() => !isFixed && toggleSkill(key)}
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
                onClick={() => !bgSkills.has(key) && toggleSkill(key)}
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
