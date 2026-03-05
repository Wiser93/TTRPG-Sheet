import type { Character, DerivedStats, StatBlock } from '@/types/character';
import type { StatKey, SkillKey, Modifier, Feature, GameClass, Subclass, Species, Background, Feat } from '@/types/game';

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
    }

    if (classEntry.subclassId) {
      const subclass = gameData.subclasses.find(s => s.id === classEntry.subclassId);
      if (subclass) {
        for (const levelEntry of subclass.levelEntries) {
          if (levelEntry.level > classEntry.level) break;
          allFeatures.push(...levelEntry.features);
          levelEntry.features.forEach(f => allModifiers.push(...(f.modifiers ?? [])));
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
  // Merge any weapon/armor/tool proficiencies granted by resolved choices
  // (including DB-sourced picks like "1 martial weapon of your choice")
  const extraWeaponProfs: string[] = [];
  const extraArmorProfs: string[] = [];
  const extraToolProfs: string[] = [];

  function resolveChoiceProfs(choices: import('@/types/game').Choice[], resolved: import('@/types/character').ResolvedChoice[]) {
    for (const choice of choices) {
      if (!choice.dbSource?.grantsType) continue;
      const match = resolved.find(r => r.choiceId === choice.id);
      if (!match || match.selectedValues.length === 0) continue;
      // For DB-sourced choices, selectedValues are item IDs — we store the name
      // via the item lookup below. For now, store ids and let the sheet resolve labels.
      const { grantsType } = choice.dbSource;
      for (const val of match.selectedValues) {
        if (grantsType === 'weapon_proficiency') extraWeaponProfs.push(val);
        else if (grantsType === 'armor_proficiency') extraArmorProfs.push(val);
        else if (grantsType === 'tool_proficiency') extraToolProfs.push(val);
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

  let ac = character.combat.baseAC ?? (10 + statMods.dexterity);
  for (const mod of allModifiers) {
    if (mod.target.kind !== 'ac') continue;
    ac += resolveScaledValue(mod.value, { totalLevel, profBonus, stats: finalStats });
  }

  // ── Skills ───────────────────────────────────────────────
  const skills = Object.fromEntries(
    (Object.keys(SKILL_STAT) as SkillKey[]).map(skill => {
      const state = character.skills[skill];
      const base = statMods[SKILL_STAT[skill]];
      const profMult = state.expertise ? 2 : state.proficient ? 1 : 0;
      const bonus = base + profMult * profBonus + state.extraBonus;
      return [skill, { bonus, proficient: state.proficient, expert: state.expertise }];
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
    for (const classEntry of character.classes) {
      const cls = gameData.classes.find(c => c.id === classEntry.classId);
      if (!cls) continue;
      // First level: max die + CON mod; subsequent: average + CON mod
      const conMod = statMods.constitution;
      const avg = Math.ceil((cls.hitDie + 1) / 2);
      maxHP += (cls.hitDie + conMod) + (classEntry.level - 1) * (avg + conMod);
    }
  }

  // ── Formula-based resource maxes ────────────────────────
  const classLevels = Object.fromEntries(
    character.classes.map(c => [c.classId, c.level])
  );
  const resourceMaxes = deriveResourceMaxes(character.resources, {
    statMods, profBonus, totalLevel, classLevels,
  });

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
    resourceMaxes,
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
