import type { StatKey, SkillKey, EquipSlot, Feature, Modifier, ResourceFormulaTerm } from './game';

// ============================================================
// STATS & SKILLS
// ============================================================

export type StatBlock = Record<StatKey, number>;

export interface SkillState {
  proficient: boolean;
  expertise: boolean;
  /** Any extra flat bonus beyond prof/stat */
  extraBonus: number;
}

export type SkillBlock = Record<SkillKey, SkillState>;

// ============================================================
// LEVEL & CLASS CHOICES
// ============================================================

/**
 * A single resolved choice made at character creation or level-up.
 * e.g. { classId: 'wizard', level: 3, choiceId: 'subclass', selectedValues: ['evocation'] }
 */
export interface ResolvedChoice {
  id: string;
  /** The entity this choice belongs to */
  sourceType: 'class' | 'subclass' | 'background' | 'feat' | 'species' | 'item';
  sourceId: string;
  /** Level at which this choice was made (0 for creation) */
  level: number;
  choiceId: string;
  selectedValues: string[];
}

/** One class the character has levels in */
export interface CharacterClassEntry {
  classId: string;
  level: number;
  subclassId?: string;
  /** All choices made for this class (level features, subclass, etc.) */
  choices: ResolvedChoice[];
}

// ============================================================
// CONDITIONS
// ============================================================

export type StandardCondition =
  | 'blinded' | 'charmed' | 'deafened' | 'exhaustion'
  | 'frightened' | 'grappled' | 'incapacitated' | 'invisible'
  | 'paralyzed' | 'petrified' | 'poisoned' | 'prone'
  | 'restrained' | 'stunned' | 'unconscious';

export interface ActiveCondition {
  id: string;
  name: StandardCondition | string;   // supports custom conditions
  description?: string;
  /** Turn/round it expires, or undefined if indefinite */
  expiresAt?: { round?: number; note?: string };
  /** Exhaustion has levels 1–6 */
  level?: number;
  /** Modifiers this condition applies */
  modifiers?: Modifier[];
}

// ============================================================
// RESOURCES (spell slots, ki, rage, etc.)
// ============================================================

// ResourceFormulaTerm lives in game.ts to avoid circular imports.
// Re-exported here for backwards-compat with existing imports from character.ts.
export type { ResourceFormulaTerm } from './game';

export interface ResourceState {
  id: string;
  name: string;
  current: number;
  /** Stored flat max — used when maxFormula is absent */
  max: number;
  /**
   * If set, the true max is computed from these terms each render.
   * The live value lives in DerivedStats.resourceMaxes[id].
   */
  maxFormula?: ResourceFormulaTerm[];
  /** Min value the computed max is clamped to (default 1) */
  minMax?: number;
  rechargeOn: 'short_rest' | 'long_rest' | 'dawn' | 'never';
}

export interface SpellSlotState {
  level: number;   // 1–9
  current: number;
  max: number;
}

// ============================================================
// INVENTORY
// ============================================================

export interface InventoryEntry {
  id: string;
  itemId: string;          // references Item in game DB
  quantity: number;
  charges?: number;        // current charges if item has them
  attuned: boolean;
  notes?: string;
  /** Custom name override (e.g. "Grandpa's Shortsword") */
  customName?: string;
}

export type EquippedSlots = Partial<Record<EquipSlot, string>>;  // slot -> inventoryEntry.id

// ============================================================
// CURRENCY
// ============================================================

export interface Currency {
  cp: number;
  sp: number;
  ep: number;
  gp: number;
  pp: number;
}

// ============================================================
// DEATH SAVES
// ============================================================

export interface DeathSaves {
  successes: number;  // 0-3
  failures: number;   // 0-3
}

// ============================================================
// KNOWN / PREPARED SPELLS
// ============================================================

export interface KnownSpell {
  spellId: string;
  /** Which class list this is prepared under */
  classId: string;
  prepared: boolean;       // false = known but not currently prepared
  alwaysPrepared?: boolean;
}

// ============================================================
// CHARACTER
// ============================================================

export interface HpRollEntry {
  /** Which class this roll belongs to */
  classId: string;
  /** 1-indexed level within that class */
  level: number;
  /** The raw die result (before CON modifier) */
  roll: number;
}

export interface CharacterMeta {
  id: string;
  name: string;
  player?: string;
  campaign?: string;
  /** URL or base64 */
  portrait?: string;
  /** ISO 8601 */
  createdAt: string;
  updatedAt: string;
  /** If synced, the remote record ID */
  remoteId?: string;
  /** Dirty flag: local changes not yet synced */
  isDirty?: boolean;
}

export interface CharacterStats {
  base: StatBlock;
  /** Bonuses from items/effects not tied to a specific feature */
  overrides: Partial<StatBlock>;
}

export interface CharacterHealth {
  current: number;
  max: number;
  /** Temp HP (doesn't stack, take the highest) */
  temp: number;
  /** Manually set max HP override (e.g. from effect) */
  maxOverride?: number;
  deathSaves: DeathSaves;
  stable: boolean;
}

export interface CharacterCombat {
  /** Base AC before equipment */
  baseAC?: number;
  speed: number;
  initiative?: number;     // override; normally calculated
  inspiration: boolean;
}

export interface CharacterAppearance {
  age?: string;
  height?: string;
  weight?: string;
  eyes?: string;
  skin?: string;
  hair?: string;
  appearance?: string;
}

export interface CharacterBiography {
  alignment?: string;
  backstory?: string;
  personality?: string;
  ideals?: string;
  bonds?: string;
  flaws?: string;
  notes?: string;
}

export interface Character {
  meta: CharacterMeta;

  // Origins
  speciesId?: string;
  speciesChoices: ResolvedChoice[];
  backgroundId?: string;
  backgroundChoices: ResolvedChoice[];

  // Class(es)
  classes: CharacterClassEntry[];

  /**
   * Per-level HP rolls, stored so the builder can reference and edit them.
   * When present for a given level, deriveStats sums these instead of using
   * the class average. CON modifier is added per level at derivation time.
   * Level 1 of the first class always uses max die value (stored as the die max).
   */
  hpRolls: HpRollEntry[];

  // Core stats
  stats: CharacterStats;
  skills: SkillBlock;
  proficiencyBonusOverride?: number;

  // Derived overrides (usually auto-calculated)
  savingThrowOverrides?: Partial<Record<StatKey, number>>;

  // Health & combat
  health: CharacterHealth;
  combat: CharacterCombat;

  // Features granted (flattened from all sources for quick lookup)
  // Populated automatically, not edited directly
  activeFeatureIds: string[];

  // Spellcasting
  spellSlots: SpellSlotState[];
  pactSlots?: { current: number; max: number; level: number };
  knownSpells: KnownSpell[];
  concentratingOnSpellId?: string;

  // Resources (ki, rage, bardic inspiration, etc.)
  resources: ResourceState[];

  // Conditions
  conditions: ActiveCondition[];

  // Inventory
  inventory: InventoryEntry[];
  equipped: EquippedSlots;
  currency: Currency;

  // Roleplay
  appearance: CharacterAppearance;
  biography: CharacterBiography;
  languages: string[];
  proficiencies: {
    armor: string[];
    weapons: string[];
    tools: string[];
  };

  /** Any extra custom fields for house rules */
  customFields?: Record<string, unknown>;

  /**
   * Persisted selection state for isCard features, keyed by feature id.
   * e.g. { 'elemental-embodiment': 'water', 'elemental-resonance': null }
   */
  featureCardStates: Record<string, string | null>;
}

// ============================================================
// DERIVED / COMPUTED (never stored, always calculated)
// ============================================================

export interface DerivedStats {
  /** Final stat scores after all bonuses */
  stats: StatBlock;
  statMods: Record<StatKey, number>;
  proficiencyBonus: number;
  totalLevel: number;
  ac: number;
  initiative: number;
  speed: number;
  maxHP: number;
  /** Final skill bonuses */
  skills: Record<SkillKey, { bonus: number; proficient: boolean; expert: boolean }>;
  savingThrows: Record<StatKey, { bonus: number; proficient: boolean }>;
  passivePerception: number;
  allFeatures: Feature[];
  allModifiers: Modifier[];
  spellAttackBonus: Record<string, number>;   // keyed by classId
  spellSaveDC: Record<string, number>;        // keyed by classId
  /** Merged resource list (synthetic from features + manual), used for Combat tab */
  allResources: ResourceState[];
  /** Resolved max for each resource with a maxFormula, keyed by resource id */
  resourceMaxes: Record<string, number>;
  /** Language names collected from all sources (class/species/bg choices) */
  extraLanguages: string[];
  /** Weapon proficiency ids/names granted by DB-sourced choice picks */
  extraWeaponProfs: string[];
  extraArmorProfs: string[];
  extraToolProfs: string[];
}
