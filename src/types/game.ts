// ============================================================
// PRIMITIVES
// ============================================================

export type StatKey =
  | 'strength' | 'dexterity' | 'constitution'
  | 'intelligence' | 'wisdom' | 'charisma';

export type DamageType =
  | 'slashing' | 'piercing' | 'bludgeoning'
  | 'fire' | 'cold' | 'lightning' | 'thunder'
  | 'acid' | 'poison' | 'necrotic' | 'radiant'
  | 'psychic' | 'force' | 'magical' | 'custom';

export type SkillKey =
  | 'acrobatics' | 'animalHandling' | 'arcana' | 'athletics'
  | 'deception' | 'history' | 'insight' | 'intimidation'
  | 'investigation' | 'medicine' | 'nature' | 'perception'
  | 'performance' | 'persuasion' | 'religion' | 'sleightOfHand'
  | 'stealth' | 'survival';

export type AbilityKey = StatKey | SkillKey | 'initiative' | 'spellAttack' | 'savingThrow';

// A generic "roll" definition, e.g. "2d6+3"
export interface RollExpression {
  diceCount: number;
  dieSize: number;       // 4, 6, 8, 10, 12, 20, 100
  modifier: number;
  statBonus?: StatKey;   // adds the stat modifier on top
}

// A value that can be flat or scaled by level/proficiency
export type ScaledValue =
  | { type: 'flat'; value: number }
  | { type: 'proficiencyMultiple'; multiple: number }  // 1 = prof, 2 = expertise
  | { type: 'statMod'; stat: StatKey }
  | { type: 'expression'; expr: string };              // e.g. "floor(level/2)"

// ============================================================
// CHOICE TREES — used by classes, backgrounds, feats, species
// ============================================================

export type ChoiceType =
  | 'stat_increase'
  | 'skill_proficiency'
  | 'skill_expertise'
  | 'language'
  | 'tool_proficiency'
  | 'weapon_proficiency'
  | 'armor_proficiency'
  | 'feat'
  | 'subclass'
  | 'spell_known'
  | 'custom_feature'
  | 'path_advance';

export interface ChoiceOption {
  id: string;
  label: string;
  description?: string;
  /** Accent color for this option (e.g. '#61afef') — used by card panels */
  color?: string;
  /** Emoji or short icon string for this option — used by card panels */
  icon?: string;
  /**
   * IDs of standalone DB Features to grant when this option is selected.
   * deriveStats will pull them into allFeatures automatically.
   */
  featureIds?: string[];
  /** Nested choices unlocked by selecting this option */
  grants?: Choice[];
}

/**
 * When set on a Choice, options are populated live from the game database
 * rather than being listed statically in `options[]`.
 *
 * Examples:
 *   { entity: 'items', filterTag: 'martial' }      → all items tagged 'martial'
 *   { entity: 'items', filterCategory: 'weapon' }  → all weapon-category items
 *   { entity: 'feats' }                             → all feats
 *
 * The resolved option id is the DB record's id, and label is its name.
 * The selected ids are stored in ResolvedChoice.selectedValues as usual.
 */
export interface ChoiceDbSource {
  entity: 'items' | 'spells' | 'feats' | 'features' | 'subclasses';
  /** Only include records whose tags array contains this value */
  filterTag?: string;
  /** Only include items whose category matches (items only) */
  filterCategory?: string;
  /** How the selected value should be interpreted for character proficiencies */
  grantsType?: 'weapon_proficiency' | 'armor_proficiency' | 'tool_proficiency' | 'language';
  /**
   * For entity: 'subclasses' — only show subclasses linked to this class ID.
   * Populated automatically at runtime from context.sourceId; set to a fixed
   * value if you want to hard-wire a specific parent class.
   */
  parentClassId?: string;
}

export interface Choice {
  id: string;
  label: string;
  type: ChoiceType;
  /** How many options the player picks */
  count: number;
  /** If defined, player must pick from this list; otherwise open-ended */
  options?: ChoiceOption[];
  /** If true, the same option cannot be picked twice */
  unique?: boolean;
  /**
   * When set, options are sourced live from the game database.
   * Overrides static `options` if both are present.
   */
  dbSource?: ChoiceDbSource;
  /** For type='path_advance': IDs of path Features the player may advance */
  pathFeatureIds?: string[];
  /**
   * For type='path_advance': optional cap on how high any single path can be advanced.
   * e.g. maxTier=1 means each path can only ever reach Tier 1 from this choice.
   * Enforced globally — all path_advance choices for the class share the same pathProgress.
   */
  maxTier?: number;
}

// ============================================================
// FEATURE
// ============================================================

// ============================================================
// ELEMENTAL PATH TIERS
// ============================================================

export interface PathTier {
  tier: number;
  /** Display name for this tier, e.g. "Stillness", "Current", "Tide", "Ocean" */
  name: string;
  /** Description of what this tier unlocks */
  description?: string;
  /** Text describing the Boost granted at this tier */
  boostDescription?: string;
  /** Inline features granted at this tier */
  features?: Feature[];
  /** IDs of standalone DB features linked at this tier */
  featureRefs?: string[];
  /** Choices presented when reaching this tier (e.g. pick an Augment) */
  choices?: Choice[];
}

/** How the feature is used in combat — drives the Combat tab grouping */
export type ActionType = 'action' | 'bonus_action' | 'reaction' | 'passive';

export interface Feature {
  id: string;
  name: string;
  description: string;
  /**
   * How this ability is used. Features with an actionType appear in the
   * Combat tab grouped by action economy. Omit for informational features
   * that don't need to appear there.
   */
  actionType?: ActionType;
  /** Free-text cost shown in Combat tab (e.g. "1 EC", "1 use", "free") */
  cost?: string;
  /** What triggers this feature (e.g. "Long Rest", "When hit", "Reaction") */
  trigger?: string;
  /** What the feature does in plain language (e.g. "Gain Heroic Inspiration") */
  effect?: string;
  /**
   * If true, this feature automatically grants Heroic Inspiration when its
   * trigger fires. Currently supports trigger='long_rest'.
   */
  grantHeroicInspiration?: 'long_rest' | 'short_rest';
  /** Choices the player must make when gaining this feature */
  choices?: Choice[];
  /** E.g. uses per short/long rest */
  uses?: {
    max: ScaledValue;
    rechargeOn: 'short_rest' | 'long_rest' | 'dawn' | 'never';
  };
  /** Passive modifiers this feature grants */
  modifiers?: Modifier[];
  /** Tags for filtering/display */
  tags?: string[];
  sourceId?: string;
  sourceType?: 'class' | 'subclass' | 'background' | 'feat' | 'species';

  // ── Resource grant ─────────────────────────────────────────
  /**
   * If true, this feature creates a tracked resource (like Elemental Charges).
   * The resource is automatically added to character.resources when derived.
   */
  isResource?: boolean;
  /**
   * Stable ID for the resource created by this feature.
   * Used as character.resources[].id and for cross-feature prerequisites.
   * If omitted, falls back to slugify(name).
   * e.g. "elemental-charges"
   */
  resourceId?: string;
  /** Override display name for the resource (defaults to feature name) */
  resourceName?: string;
  /**
   * Formula for computing max. Each term is summed.
   * e.g. [{ type: 'stat_mod', stat: 'wisdom' }, { type: 'half_class_level', classId: 'elemental-shaper' }]
   */
  resourceFormula?: ResourceFormulaTerm[];
  /** When the resource recharges */
  resourceRecharge?: 'short_rest' | 'long_rest' | 'dawn' | 'never';
  /** Minimum value for the computed max (default 1) */
  resourceMin?: number;
  /**
   * If true, the resource counter appears prominently in the Combat tab.
   * If false/absent, it still appears in the Resources section of Combat.
   */
  combatResource?: boolean;
  /**
   * IDs of resources (resourceId values) this feature requires to use.
   * Used for display/filtering — e.g. a technique that costs Elemental Charges.
   */
  requiresResourceIds?: string[];

  // ── Feature card ───────────────────────────────────────────
  /**
   * If true, this feature renders as an interactive card on the character sheet.
   * Card features appear ABOVE action groups on the relevant tab.
   */
  isCard?: boolean;
  /** Which sheet tab the card appears on. Defaults to 'combat'. */
  cardTab?: 'combat' | 'overview';
  /**
   * Text shown above the option buttons on the card.
   * e.g. "Choose an element to embody at the start of a rest."
   */
  cardSelectionLabel?: string;
  /**
   * Dynamically populate card options from the values the player has selected
   * in any choice with this ID. The option display is taken from the choice's
   * option definitions (label, description, color, icon).
   * e.g. { choiceId: 'elemental_path' } → shows whichever elements have been chosen.
   */
  cardOptionSource?: { choiceId: string };
  /**
   * Static card options (used when options don't come from a choice).
   * Each option has an id, label, optional description, color, icon.
   */
  cardOptions?: Array<{
    id: string;
    label: string;
    description?: string;
    color?: string;
    icon?: string;
  }>;

  // ── Display ─────────────────────────────────────────────────
  /** Accent color for display (hex string, e.g. '#61afef') */
  color?: string;
  /** Emoji or short icon string for display */
  icon?: string;

  // ── Elemental Path ──────────────────────────────────────────
  /** If true, this feature is an Elemental Path with tiered progression */
  isPath?: boolean;
  /**
   * Tier definitions for elemental path features.
   * Each tier (1–4) has its own name, boost, features, and augment choices.
   */
  pathTiers?: PathTier[];
}

// ============================================================
// RESOURCE FORMULA
// ============================================================

/**
 * A formula term for computing a resource's max from derived stats.
 * All terms in the array are summed. E.g. Elemental Charges:
 *   [{ type: 'stat_mod', stat: 'wisdom' }, { type: 'half_class_level', classId: 'elemental-shaper' }]
 */
export type ResourceFormulaTerm =
  | { type: 'flat'; value: number }
  | { type: 'stat_mod'; stat: StatKey }
  | { type: 'proficiency_bonus' }
  | { type: 'half_class_level'; classId: string }
  | { type: 'class_level'; classId: string }
  | { type: 'total_level' };

// ============================================================
// MODIFIERS
// ============================================================

export type ModifierTarget =
  | { kind: 'stat'; stat: StatKey }
  | { kind: 'skill'; skill: SkillKey }
  | { kind: 'ac' }
  | { kind: 'initiative' }
  | { kind: 'speed'; speedType?: string }
  | { kind: 'hp_max' }
  | { kind: 'saving_throw'; stat: StatKey }
  | { kind: 'damage'; damageType?: DamageType }
  | { kind: 'attack_roll' }
  | { kind: 'custom'; key: string };

export interface Modifier {
  id: string;
  target: ModifierTarget;
  value: ScaledValue;
  /** Advantage/disadvantage instead of flat bonus */
  advantage?: 'advantage' | 'disadvantage';
  /** If set, only applies when condition is met */
  condition?: string;
}

// ============================================================
// SPECIES
// ============================================================

export interface Species {
  id: string;
  name: string;
  description: string;
  size: 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'gargantuan';
  speed: number;
  /** Additional speed types e.g. fly, swim, climb */
  extraSpeeds?: { type: string; value: number }[];
  darkvision?: number;           // range in feet, 0 = none
  features: Feature[];
  /** Fixed skill proficiencies granted by this species */
  skillProficiencies?: SkillKey[];
  /** Fixed armor proficiencies (e.g. "light armor") */
  armorProficiencies?: string[];
  /** Fixed weapon proficiencies (e.g. "longsword") */
  weaponProficiencies?: string[];
  /** Fixed tool proficiencies */
  toolProficiencies?: string[];
  /** Languages granted (number of free picks, or list of fixed) */
  languages?: number | string[];
  /** DB Feat IDs granted automatically */
  featIds?: string[];
  /** DB Spell IDs granted as innate spells */
  innateSpellIds?: string[];
  /** Choices made at character creation for this species */
  /** DB Feature IDs automatically granted by this species (not a choice) */
  featureRefs?: string[];
  creationChoices?: Choice[];
  customFields?: Record<string, unknown>;
}

// ============================================================
// BACKGROUND
// ============================================================

export interface Background {
  id: string;
  name: string;
  description: string;
  skillProficiencies: SkillKey[];
  toolProficiencies?: string[];
  languages?: number;            // number of extra languages
  startingEquipmentIds?: string[];
  features: Feature[];
  creationChoices?: Choice[];
  customFields?: Record<string, unknown>;
}

// ============================================================
// CLASS & SUBCLASS
// ============================================================

export interface ClassLevelEntry {
  level: number;
  features: Feature[];
  /** IDs of standalone DB features linked to this level */
  featureRefs?: string[];
  /** Slots, ki points, rages, etc. — fully custom */
  resources?: Record<string, number>;
  /** Choices presented at this level */
  choices?: Choice[];
}

export interface SpellcastingConfig {
  ability: StatKey;
  type: 'full' | 'half' | 'third' | 'pact' | 'custom';
  /** Override slot table — key is level, value is array of slots per spell level */
  slotTableOverride?: Record<number, number[]>;
  /** For "spells known" casters */
  spellsKnownPerLevel?: Record<number, number>;
  /** For "prepare from list" casters */
  prepareFromList?: boolean;
  ritualCasting?: boolean;
}

/**
 * A targeted override that a subclass applies to its parent class's mechanics.
 * Applied before choices are resolved, so they cap/modify class-level choices.
 */
export interface ClassOverride {
  /** Which class mechanic is being modified */
  type: 'path_max_tier';
  /** The new value (e.g. max tier number) */
  value: number;
  /**
   * If set, only apply to choices with one of these IDs.
   * If omitted, applies to all choices of the relevant type in the class.
   */
  choiceIds?: string[];
}

export interface Subclass {
  id: string;
  parentClassId: string;
  name: string;
  description: string;
  /** Which class level the subclass is chosen at */
  chosenAtLevel: number;
  levelEntries: ClassLevelEntry[];
  /**
   * Overrides that this subclass applies to the parent class's mechanics.
   * e.g. capping tiered feature advancement at Tier 1 until a higher-level
   * subclass feature removes or raises the cap.
   */
  classOverrides?: ClassOverride[];
  customFields?: Record<string, unknown>;
}

export interface GameClass {
  id: string;
  name: string;
  description: string;
  hitDie: number;              // e.g. 10 for d10
  primaryAbility: StatKey[];
  savingThrowProficiencies: StatKey[];
  skillProficiencies: { choose: number; from: SkillKey[] };
  armorProficiencies: string[];
  weaponProficiencies: string[];
  toolProficiencies: string[];
  spellcasting?: SpellcastingConfig;
  /**
   * Choices made at character creation, before level 1.
   * Supports DB-sourced choices (e.g. pick 1 martial weapon from Items tagged 'martial').
   */
  creationChoices?: Choice[];
  levelEntries: ClassLevelEntry[];   // 1–20
  subclasses: Subclass[];
  customFields?: Record<string, unknown>;
}

// ============================================================
// FEAT
// ============================================================

export interface Feat {
  id: string;
  name: string;
  description: string;
  prerequisites?: string;      // free-text for now
  repeatable?: boolean;
  features: Feature[];
  choices?: Choice[];
  customFields?: Record<string, unknown>;
}

// ============================================================
// SPELLS
// ============================================================

export type SpellSchool =
  | 'abjuration' | 'conjuration' | 'divination' | 'enchantment'
  | 'evocation' | 'illusion' | 'necromancy' | 'transmutation' | 'custom';

export interface SpellComponent {
  verbal: boolean;
  somatic: boolean;
  material?: string;           // description of material, undefined = not required
}

export interface Spell {
  id: string;
  name: string;
  level: number;               // 0 = cantrip
  school: SpellSchool;
  castingTime: string;
  range: string;
  duration: string;
  concentration: boolean;
  ritual: boolean;
  components: SpellComponent;
  description: string;
  higherLevels?: string;
  damage?: {
    roll: RollExpression;
    type: DamageType;
    /** If cantrip, how it scales with character level */
    cantripScaling?: Record<number, RollExpression>;
  };
  savingThrow?: { stat: StatKey; onSuccess: string };
  tags?: string[];
  sourceBook?: string;
  customFields?: Record<string, unknown>;
}

// ============================================================
// ITEMS
// ============================================================

export type ItemCategory =
  | 'weapon' | 'armor' | 'shield' | 'ammunition'
  | 'potion' | 'scroll' | 'wand' | 'ring' | 'wondrous'
  | 'tool' | 'gear' | 'trade_goods' | 'currency' | 'custom';

export type Rarity =
  | 'common' | 'uncommon' | 'rare' | 'very_rare' | 'legendary' | 'artifact' | 'unique';

export type EquipSlot =
  | 'mainHand' | 'offHand' | 'twoHand'
  | 'head' | 'chest' | 'hands' | 'feet' | 'neck' | 'ring1' | 'ring2'
  | 'belt' | 'cloak' | 'eyes' | 'body' | 'custom';

export interface WeaponStats {
  damage: RollExpression;
  damageType: DamageType;
  secondaryDamage?: { roll: RollExpression; type: DamageType };
  range?: { normal: number; long: number };
  properties: string[];        // e.g. "finesse", "thrown", "versatile 1d10"
  attackBonus?: number;
}

export interface ArmorStats {
  baseAC: number;
  maxDexBonus?: number;        // undefined = unlimited
  strengthRequired?: number;
  stealthDisadvantage?: boolean;
}

export interface Item {
  id: string;
  name: string;
  category: ItemCategory;
  description: string;
  weight: number;              // lbs
  cost: { amount: number; currency: 'cp' | 'sp' | 'ep' | 'gp' | 'pp' };
  rarity: Rarity;
  requiresAttunement: boolean;
  equipSlots?: EquipSlot[];
  weaponStats?: WeaponStats;
  armorStats?: ArmorStats;
  modifiers?: Modifier[];      // passive bonuses while equipped/attuned
  features?: Feature[];        // active abilities
  charges?: {
    max: number;
    rechargeOn: 'dawn' | 'dusk' | 'short_rest' | 'long_rest' | 'never';
    rechargeRoll?: RollExpression;
  };
  stackable?: boolean;
  tags?: string[];
  customFields?: Record<string, unknown>;
}
