import type { Character, DerivedStats, StatBlock } from '@/types/character';
import type { StatKey, SkillKey, Modifier, Feature, GameClass, Subclass, Species, Background, Feat } from '@/types/game';
import { computePathProgress } from '@/lib/pathUtils';

// ============================================================
// SKILL → STAT MAPPING
// ============================================================

const SKILL_STAT: Record<SkillKey, StatKey> = {
  acrobatics:    'dexterity',
  animalHandling:'wisdom',
  arcana:        'intelligence',
  athletics:     'strength',
  deception:     'charisma',
  history:       'intelligence',
  insight:       'wisdom',
  intimidation:  'charisma',
  investigation: 'intelligence',
  medicine:      'wisdom',
  nature:        'intelligence',
  perception:    'wisdom',
  performance:   'charisma',
  persuasion:    'charisma',
  religion:      'intelligence',
  sleightOfHand: 'dexterity',
  stealth:       'dexterity',
  survival:      'wisdom',
};

// ============================================================
// HELPERS
// ============================================================

export function statMod(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function proficiencyBonus(totalLevel: number): number {
  return Math.ceil(totalLevel / 4) + 1;
}

// ============================================================
// MAIN CALCULATOR
// ============================================================

interface GameData {
  classes: GameClass[];
  subclasses: Subclass[];
  species: Species[];
  backgrounds: Background[];
  feats: Feat[];
  features?: Feature[];   // standalone DB features, resolved by featureRefs
}

export function deriveStats(character: Character, gameData: GameData): DerivedStats {
  // ── Total level ──────────────────────────────────────────
  const totalLevel = character.classes.reduce((sum, c) => sum + c.level, 0);
  const profBonus = character.proficiencyBonusOverride ?? proficiencyBonus(Math.max(1, totalLevel));

  // ── Collect all features & modifiers ────────────────────
  const allFeatures: Feature[] = [];
  const allModifiers: Modifier[] = [];

  // From species
  if (character.speciesId) {
    const species = gameData.species.find(s => s.id === character.speciesId);
    if (species) {
      allFeatures.push(...species.features);
      species.features.forEach(f => allModifiers.push(...(f.modifiers ?? [])));
    }
  }

  // From background
  if (character.backgroundId) {
    const bg = gameData.backgrounds.find(b => b.id === character.backgroundId);
    if (bg) {
      allFeatures.push(...bg.features);
      bg.features.forEach(f => allModifiers.push(...(f.modifiers ?? [])));
    }
  }

  // From classes
  for (const classEntry of character.classes) {
    const cls = gameData.classes.find(c => c.id === classEntry.classId);
    if (!cls) continue;

    for (const levelEntry of cls.levelEntries) {
      if (levelEntry.level > classEntry.level) break;
      allFeatures.push(...levelEntry.features);
      levelEntry.features.forEach(f => allModifiers.push(...(f.modifiers ?? [])));
      // Also resolve DB feature refs
      for (const ref of (levelEntry.featureRefs ?? [])) {
        const dbFeat = gameData.features?.find(f => f.id === ref);
        if (dbFeat) {
          allFeatures.push(dbFeat);
          allModifiers.push(...(dbFeat.modifiers ?? []));
        }
      }
    }

    // Path features — load features from each unlocked tier
    // Progress is derived from resolved path_advance choices, not stored separately
    const pathProgress = computePathProgress(cls, classEntry);
    for (const [pathId, tier] of Object.entries(pathProgress)) {
        const pathFeat = gameData.features?.find(f => f.id === pathId && f.isPath);
        if (!pathFeat?.pathTiers) continue;
        // Add the path feature itself once
        if (!allFeatures.some(f => f.id === pathFeat.id)) {
          allFeatures.push(pathFeat);
        }
        // Add all features from tiers 1..current
        for (const pt of pathFeat.pathTiers) {
          if (pt.tier > tier) break;
          // Inline features on the tier
          for (const f of pt.features ?? []) {
            if (!allFeatures.some(x => x.id === f.id)) allFeatures.push(f);
            allModifiers.push(...(f.modifiers ?? []));
          }
          // DB feature refs on the tier (base features, recharge triggers)
          for (const ref of pt.featureRefs ?? []) {
            const dbFeat = gameData.features?.find(f => f.id === ref);
            if (dbFeat && !allFeatures.some(f => f.id === dbFeat.id)) {
              allFeatures.push(dbFeat);
              allModifiers.push(...(dbFeat.modifiers ?? []));
            }
          }
          // Tier choices — resolve featureIds from selected options (augments)
          for (const choice of pt.choices ?? []) {
            const resolved = classEntry.choices.find(r => r.choiceId === choice.id);
            if (!resolved) continue;
            for (const selectedId of resolved.selectedValues) {
              const opt = choice.options?.find(o => o.id === selectedId);
              for (const fid of (opt?.featureIds ?? [])) {
                const dbFeat = gameData.features?.find(f => f.id === fid);
                if (dbFeat && !allFeatures.some(f => f.id === dbFeat.id)) {
                  allFeatures.push(dbFeat);
                  allModifiers.push(...(dbFeat.modifiers ?? []));
                }
              }
            }
          }
        }
    }

    if (classEntry.subclassId) {
      const subclass = gameData.subclasses.find(s => s.id === classEntry.subclassId);
      if (subclass) {
        for (const levelEntry of subclass.levelEntries) {
          if (levelEntry.level > classEntry.level) break;
          allFeatures.push(...levelEntry.features);
          levelEntry.features.forEach(f => allModifiers.push(...(f.modifiers ?? [])));
          // Resolve featureRefs for subclass levels (same as class levels)
          for (const ref of (levelEntry.featureRefs ?? [])) {
            const dbFeat = gameData.features?.find(f => f.id === ref);
            if (dbFeat && !allFeatures.some(f => f.id === dbFeat.id)) {
              allFeatures.push(dbFeat);
              allModifiers.push(...(dbFeat.modifiers ?? []));
            }
          }
        }
      }
    }
  }

  // ── Calculate final stats ────────────────────────────────
  const baseStats = { ...character.stats.base, ...character.stats.overrides };
  const finalStats = { ...baseStats } as StatBlock;

  // Apply stat modifiers
  for (const mod of allModifiers) {
    if (mod.target.kind !== 'stat') continue;
    const val = resolveScaledValue(mod.value, { totalLevel, profBonus, stats: finalStats });
    finalStats[mod.target.stat] = (finalStats[mod.target.stat] ?? 0) + val;
  }

  const statMods = Object.fromEntries(
    (Object.keys(finalStats) as StatKey[]).map(k => [k, statMod(finalStats[k])])
  ) as Record<StatKey, number>;

  // ── AC ───────────────────────────────────────────────────
  // Base: 10 + DEX unless armor equipped (simplified — UI layer handles equipped armor)
  // ── DB-sourced choice proficiencies ─────────────────────
  // ── Resolve features granted by choice selections ────────
  // Walk every resolved choice and check its selected option(s) for featureId links.
  // Also handles DB-sourced 'features' entity choices.
  function resolveGrantedFeatures(
    choices: import('@/types/game').Choice[],
    resolved: import('@/types/character').ResolvedChoice[]
  ) {
    for (const choice of choices) {
      const match = resolved.find(r => r.choiceId === choice.id);
      if (!match || match.selectedValues.length === 0) continue;

      for (const selectedId of match.selectedValues) {
        // Static options with featureIds (one option can grant multiple features)
        const opt = (choice.options ?? []).find(o => o.id === selectedId);
        for (const fid of (opt?.featureIds ?? [])) {
          const dbFeat = gameData.features?.find(f => f.id === fid);
          if (dbFeat && !allFeatures.some(f => f.id === dbFeat.id)) {
            allFeatures.push(dbFeat);
            allModifiers.push(...(dbFeat.modifiers ?? []));
          }
        }

        // DB-sourced 'features' entity — selectedId IS the feature id
        if (choice.dbSource?.entity === 'features') {
          const dbFeat = gameData.features?.find(f => f.id === selectedId);
          if (dbFeat && !allFeatures.some(f => f.id === dbFeat.id)) {
            allFeatures.push(dbFeat);
            allModifiers.push(...(dbFeat.modifiers ?? []));
          }
        }

        // Recurse into nested grants
        if (opt?.grants?.length) {
          resolveGrantedFeatures(opt.grants, resolved);
        }
      }
    }
  }

  // Run for every class (creation choices + per-level choices)
  for (const charClass of character.classes) {
    const cls = gameData.classes.find(c => c.id === charClass.classId);
    if (!cls) continue;
    resolveGrantedFeatures(cls.creationChoices ?? [], charClass.choices);
    for (const levelEntry of cls.levelEntries) {
      if (levelEntry.level > charClass.level) break;
      resolveGrantedFeatures(levelEntry.choices ?? [], charClass.choices);
    }
    if (charClass.subclassId) {
      const sub = gameData.subclasses.find(s => s.id === charClass.subclassId);
      if (sub) {
        for (const levelEntry of sub.levelEntries) {
          if (levelEntry.level > charClass.level) break;
          resolveGrantedFeatures(levelEntry.choices ?? [], charClass.choices);
          resolveChoiceProfs(levelEntry.choices ?? [], charClass.choices);
        }
      }
    }
  }
  // Also species and background choices
  resolveGrantedFeatures(
    gameData.species.find(s => s.id === character.speciesId)?.creationChoices ?? [],
    character.speciesChoices
  );
  resolveGrantedFeatures(
    gameData.backgrounds.find(b => b.id === character.backgroundId)?.creationChoices ?? [],
    character.backgroundChoices
  );

  // ── Resolve feats chosen via DB-sourced feat choices ─────
  // When a choice has entity:'feats', selectedValues are feat IDs.
  // Load the feat's features into allFeatures.
  function resolveGrantedFeats(
    choices: import('@/types/game').Choice[],
    resolved: import('@/types/character').ResolvedChoice[]
  ) {
    for (const choice of choices) {
      if (choice.dbSource?.entity !== 'feats') continue;
      const match = resolved.find(r => r.choiceId === choice.id);
      if (!match || match.selectedValues.length === 0) continue;
      for (const featId of match.selectedValues) {
        const feat = gameData.feats.find(f => f.id === featId);
        if (!feat) continue;
        for (const f of (feat.features ?? [])) {
          if (!allFeatures.some(x => x.id === f.id)) {
            allFeatures.push(f);
            allModifiers.push(...(f.modifiers ?? []));
          }
        }
      }
    }
  }

  for (const charClass of character.classes) {
    const cls = gameData.classes.find(c => c.id === charClass.classId);
    if (!cls) continue;
    resolveGrantedFeats(cls.creationChoices ?? [], charClass.choices);
    for (const le of cls.levelEntries) {
      if (le.level > charClass.level) break;
      resolveGrantedFeats(le.choices ?? [], charClass.choices);
    }
  }
  resolveGrantedFeats(
    gameData.species.find(s => s.id === character.speciesId)?.creationChoices ?? [],
    character.speciesChoices
  );
  resolveGrantedFeats(
    gameData.backgrounds.find(b => b.id === character.backgroundId)?.creationChoices ?? [],
    character.backgroundChoices
  );

  // ── Merge any weapon/armor/tool proficiencies granted by resolved choices
  // (including DB-sourced picks like "1 martial weapon of your choice")
  const extraWeaponProfs: string[] = [];
  const extraArmorProfs: string[] = [];
  const extraToolProfs: string[] = [];
  const extraLanguages: string[] = [];

  const extraSkillProfs: SkillKey[] = [];

  function resolveChoiceProfs(choices: import('@/types/game').Choice[], resolved: import('@/types/character').ResolvedChoice[]) {
    for (const choice of choices) {
      const match = resolved.find(r => r.choiceId === choice.id);
      if (!match || match.selectedValues.length === 0) continue;

      // skill_proficiency type — selectedValues are SkillKey strings
      if (choice.type === 'skill_proficiency') {
        for (const val of match.selectedValues) {
          extraSkillProfs.push(val as SkillKey);
        }
      }

      // language type — selectedValues are language name strings
      if (choice.type === 'language') {
        for (const val of match.selectedValues) {
          if (!extraLanguages.includes(val)) extraLanguages.push(val);
        }
      }

      // DB-sourced proficiency grants
      if (choice.dbSource?.grantsType) {
        const { grantsType } = choice.dbSource;
        for (const val of match.selectedValues) {
          if (grantsType === 'weapon_proficiency') extraWeaponProfs.push(val);
          else if (grantsType === 'armor_proficiency') extraArmorProfs.push(val);
          else if (grantsType === 'tool_proficiency') extraToolProfs.push(val);
        }
      }

      // Recurse into nested grants from static options
      for (const selectedId of match.selectedValues) {
        const opt = (choice.options ?? []).find(o => o.id === selectedId);
        if (opt?.grants?.length) {
          resolveChoiceProfs(opt.grants, resolved);
        }
      }
    }
  }

  // Scan class creation choices and per-level choices
  for (const charClass of character.classes) {
    const cls = gameData.classes.find(c => c.id === charClass.classId);
    if (!cls) continue;
    resolveChoiceProfs(cls.creationChoices ?? [], charClass.choices);
    for (const levelEntry of cls.levelEntries) {
      if (levelEntry.level > charClass.level) break;
      resolveChoiceProfs(levelEntry.choices ?? [], charClass.choices);
    }
  }
  // Scan species and background choices
  const speciesCreationChoices = gameData.species.find(s => s.id === character.speciesId)?.creationChoices ?? [];
  resolveChoiceProfs(speciesCreationChoices, character.speciesChoices);
  const bgCreationChoices = gameData.backgrounds.find(b => b.id === character.backgroundId)?.creationChoices ?? [];
  resolveChoiceProfs(bgCreationChoices, character.backgroundChoices);

  // Apply species fixed proficiencies
  if (character.speciesId) {
    const sp = gameData.species.find(s => s.id === character.speciesId);
    if (sp) {
      extraArmorProfs.push(...(sp.armorProficiencies ?? []));
      extraWeaponProfs.push(...(sp.weaponProficiencies ?? []));
      extraToolProfs.push(...(sp.toolProficiencies ?? []));
    }
  }

  let ac = character.combat.baseAC ?? (10 + statMods.dexterity);
  for (const mod of allModifiers) {
    if (mod.target.kind !== 'ac') continue;
    ac += resolveScaledValue(mod.value, { totalLevel, profBonus, stats: finalStats });
  }

  // ── Skills ───────────────────────────────────────────────
  // Collect fixed skill proficiencies from background and species
  const bgSkillProfs = new Set<SkillKey>(
    gameData.backgrounds.find(b => b.id === character.backgroundId)?.skillProficiencies ?? []
  );
  const speciesSkillProfs = new Set<SkillKey>(
    gameData.species.find(s => s.id === character.speciesId)?.skillProficiencies ?? []
  );

  const skills = Object.fromEntries(
    (Object.keys(SKILL_STAT) as SkillKey[]).map(skill => {
      const state = character.skills[skill];
      const base = statMods[SKILL_STAT[skill]];
      // Proficient if stored on character OR granted by background/species
      const isProficient = state.proficient || bgSkillProfs.has(skill) || speciesSkillProfs.has(skill) || extraSkillProfs.includes(skill);
      const profMult = state.expertise ? 2 : isProficient ? 1 : 0;
      const bonus = base + profMult * profBonus + state.extraBonus;
      return [skill, { bonus, proficient: isProficient, expert: state.expertise }];
    })
  ) as Record<SkillKey, { bonus: number; proficient: boolean; expert: boolean }>;

  // ── Saving throws ────────────────────────────────────────
  const proficientSaves = new Set<StatKey>(
    character.classes.flatMap(c => {
      const cls = gameData.classes.find(g => g.id === c.classId);
      return cls?.savingThrowProficiencies ?? [];
    })
  );

  const savingThrows = Object.fromEntries(
    (Object.keys(finalStats) as StatKey[]).map(stat => {
      const isProficient = proficientSaves.has(stat);
      const override = character.savingThrowOverrides?.[stat];
      const bonus = override !== undefined
        ? override
        : statMods[stat] + (isProficient ? profBonus : 0);
      return [stat, { bonus, proficient: isProficient }];
    })
  ) as Record<StatKey, { bonus: number; proficient: boolean }>;

  // ── Spell attack / save DC ───────────────────────────────
  const spellAttackBonus: Record<string, number> = {};
  const spellSaveDC: Record<string, number> = {};

  for (const classEntry of character.classes) {
    const cls = gameData.classes.find(c => c.id === classEntry.classId);
    if (!cls?.spellcasting) continue;
    const mod = statMods[cls.spellcasting.ability];
    spellAttackBonus[classEntry.classId] = profBonus + mod;
    spellSaveDC[classEntry.classId] = 8 + profBonus + mod;
  }

  // ── Speed ────────────────────────────────────────────────
  let speed = character.combat.speed;
  for (const mod of allModifiers) {
    if (mod.target.kind !== 'speed') continue;
    speed += resolveScaledValue(mod.value, { totalLevel, profBonus, stats: finalStats });
  }

  // ── Max HP ───────────────────────────────────────────────
  let maxHP = character.health.maxOverride ?? 0;
  if (!character.health.maxOverride) {
    const conMod = statMods.constitution;
    for (const classEntry of character.classes) {
      const cls = gameData.classes.find(c => c.id === classEntry.classId);
      if (!cls) continue;
      for (let lvl = 1; lvl <= classEntry.level; lvl++) {
        const stored = character.hpRolls?.find(
          r => r.classId === classEntry.classId && r.level === lvl
        );
        if (stored) {
          // Use the player's actual roll (or recorded max) + CON mod
          maxHP += stored.roll + conMod;
        } else {
          // Fallback: level 1 = max die, subsequent = average
          const avg = Math.ceil((cls.hitDie + 1) / 2);
          maxHP += (lvl === 1 ? cls.hitDie : avg) + conMod;
        }
      }
    }
  }

  // ── Formula-based resource maxes ────────────────────────
  const classLevels = Object.fromEntries(
    character.classes.map(c => [c.classId, c.level])
  );

  // ── Synthesize ResourceState entries from isResource features ──
  // Each feature with isResource:true produces a ResourceState that is
  // merged with any existing character.resources entry (preserving .current).
  function slugify(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  const syntheticResources: import('@/types/character').ResourceState[] = allFeatures
    .filter(f => f.isResource)
    .map(f => {
      const id = f.resourceId ?? slugify(f.name);
      const existing = character.resources.find(r => r.id === id);
      return {
        id,
        name:        f.resourceName ?? f.name,
        current:     existing?.current ?? 0,
        max:         existing?.max ?? 1,
        maxFormula:  f.resourceFormula?.length ? f.resourceFormula : existing?.maxFormula,
        minMax:      f.resourceMin ?? existing?.minMax ?? 1,
        rechargeOn:  f.resourceRecharge ?? existing?.rechargeOn ?? 'long_rest',
      };
    });

  // Merge: synthetic takes precedence for definition, manual resources are kept
  const syntheticIds = new Set(syntheticResources.map(r => r.id));
  const manualResources = character.resources.filter(r => !syntheticIds.has(r.id));
  const allResources = [...syntheticResources, ...manualResources];

  const resourceMaxCtx = { statMods, profBonus, totalLevel, classLevels };
  const resourceMaxes = deriveResourceMaxes(allResources, resourceMaxCtx);

  return {
    stats: finalStats,
    statMods,
    proficiencyBonus: profBonus,
    totalLevel,
    ac,
    initiative: character.combat.initiative ?? statMods.dexterity,
    speed,
    maxHP,
    skills,
    savingThrows,
    passivePerception: 10 + skills.perception.bonus,
    allFeatures,
    allModifiers,
    spellAttackBonus,
    spellSaveDC,
    allResources,
    resourceMaxes,
    extraLanguages,
    extraWeaponProfs,
    extraArmorProfs,
    extraToolProfs,
  };
}

// ============================================================
// SCALED VALUE RESOLVER
// ============================================================

interface ResolveCtx {
  totalLevel: number;
  profBonus: number;
  stats: StatBlock;
}

function resolveScaledValue(
  value: import('@/types/game').ScaledValue,
  ctx: ResolveCtx
): number {
  switch (value.type) {
    case 'flat':
      return value.value;
    case 'proficiencyMultiple':
      return Math.floor(ctx.profBonus * value.multiple);
    case 'statMod':
      return statMod(ctx.stats[value.stat]);
    case 'expression':
      // Simple eval-free expression: supports "floor(level/N)" and "ceil(level/N)"
      try {
        const expr = value.expr
          .replace(/level/g, String(ctx.totalLevel))
          .replace(/proficiency/g, String(ctx.profBonus));
        // Only allow safe math operations
        if (/[^0-9+\-*/()., flooraceilm]/.test(expr)) return 0;
        return Function(`"use strict"; return (${expr})`)() as number;
      } catch {
        return 0;
      }
  }
}

// ============================================================
// RESOURCE FORMULA RESOLVER
// ============================================================

import type { ResourceFormulaTerm, ResourceState } from '@/types/character';

/**
 * Resolve a ResourceFormulaTerm[] into a concrete max value.
 * Called inside deriveStats and exported for use in the store.
 */
export function resolveResourceMax(
  formula: ResourceFormulaTerm[],
  ctx: {
    statMods: Record<import('@/types/game').StatKey, number>;
    profBonus: number;
    totalLevel: number;
    classLevels: Record<string, number>;
  },
  minMax = 1
): number {
  const sum = formula.reduce((acc, term) => {
    switch (term.type) {
      case 'flat':           return acc + term.value;
      case 'stat_mod':       return acc + (ctx.statMods[term.stat] ?? 0);
      case 'proficiency_bonus': return acc + ctx.profBonus;
      case 'half_class_level':  return acc + Math.floor((ctx.classLevels[term.classId] ?? 0) / 2);
      case 'class_level':       return acc + (ctx.classLevels[term.classId] ?? 0);
      case 'total_level':       return acc + ctx.totalLevel;
      default:               return acc;
    }
  }, 0);
  return Math.max(minMax, sum);
}

/**
 * Compute resolved maxes for all resources that have a maxFormula.
 * Returns a Record<resourceId, resolvedMax>.
 */
export function deriveResourceMaxes(
  resources: ResourceState[],
  ctx: Parameters<typeof resolveResourceMax>[1]
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const r of resources) {
    if (r.maxFormula?.length) {
      result[r.id] = resolveResourceMax(r.maxFormula, ctx, r.minMax ?? 1);
    }
  }
  return result;
}

