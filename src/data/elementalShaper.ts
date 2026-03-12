/**
 * Elemental Shaper — seed data
 *
 * Features are exported individually so they can be seeded to the Features
 * database table. The class definition references them via featureRefs.
 *
 * Seed order: upsert all elementalShaperFeatures first, then elementalShaperClass.
 */

import type { GameClass, Feature } from '@/types/game';
import { elementalPathFeatures, ELEMENTAL_PATH_IDS } from './elementalPaths';
import { theHarmonist } from './theHarmonist';

export const ELEMENTAL_SHAPER_ID = 'elemental-shaper';

// ── Level 1 ───────────────────────────────────────────────────

export const featureElementalCharges: Feature = {
  id: 'ec-feature',
  sourceId: ELEMENTAL_SHAPER_ID,
  sourceType: 'class' as const,
  name: 'Elemental Charges',
  actionType: 'passive',
  description:
    'You have Elemental Charges (EC) equal to your WIS modifier + half your Shaper ' +
    'level (minimum 1). They recharge on a long rest.\n\n' +
    'Your Elemental Save DC = 8 + Proficiency Bonus + WIS modifier.',
  tags: ['resource', 'core'],
  isResource: true,
  resourceId: 'elemental-charges',
  resourceName: 'Elemental Charges',
  resourceFormula: [
    { type: 'stat_mod', stat: 'wisdom' },
    { type: 'half_class_level', classId: ELEMENTAL_SHAPER_ID },
  ],
  resourceRecharge: 'long_rest',
  resourceMin: 1,
  combatResource: true,
};

// ── Level 2 ───────────────────────────────────────────────────

export const featureElementalEmbodiment: Feature = {
  id: 'elemental-embodiment',
  sourceId: ELEMENTAL_SHAPER_ID,
  sourceType: 'class' as const,
  name: 'Elemental Embodiment',
  actionType: 'passive',
  description:
    'At the start of a long rest or short rest in which you roll hit dice, choose one ' +
    'known element to embody until your next rest.\n\n' +
    '**Water:** Roll max on 1 hit die, reroll 1s. Optionally sacrifice up to half the HP ' +
    'regained to heal resting allies by the same amount.\n\n' +
    '**Earth:** Gain (Prof)d4 temp HP at rest start. Subsequent rests carry over unspent ' +
    "temp HP; resets on long rest.\n\n" +
    '**Fire:** Add Proficiency to initiative. Add 1d6 to STR-based checks.\n\n' +
    '**Air:** Fall ≤60ft/round with lateral control (15ft per 10ft descended/ascended). ' +
    'Add 1d6 to DEX-based checks.',
  tags: ['rest', 'elemental'],
  isCard: true,
  cardTab: 'combat',
  cardSelectionLabel: 'Choose an element to embody at the start of a rest.',
  cardOptionSource: { pathBased: true } as unknown as { choiceId: string },
};

// ── Level 3 ───────────────────────────────────────────────────

// ── Level 4 ───────────────────────────────────────────────────

// ── Level 5 ───────────────────────────────────────────────────

export const featureExtraAttack: Feature = {
  id: 'extra-attack',
  sourceId: ELEMENTAL_SHAPER_ID,
  sourceType: 'class' as const,
  name: 'Extra Attack',
  actionType: 'passive',
  description:
    'You can attack twice, instead of once, whenever you take the Attack action on your turn.',
  tags: ['combat'],
};

// ── Level 6 ───────────────────────────────────────────────────

// ── Level 7 ───────────────────────────────────────────────────

export const featureElementalSurge: Feature = {
  id: 'elemental-surge',
  sourceId: ELEMENTAL_SHAPER_ID,
  sourceType: 'class' as const,
  name: 'Elemental Surge',
  actionType: 'action',
  cost: '1/long rest',
  description:
    'Once per long rest, shroud yourself in your known element(s). For 1 turn you become ' +
    'invulnerable and cannot take any action or movement. On the turn after, regain EC equal ' +
    'to twice your WIS modifier and all techniques cost 0 EC.',
  uses: { max: { type: 'flat', value: 1 }, rechargeOn: 'long_rest' },
  tags: ['combat', 'resource'],
};

export const featureElementalCombo: Feature = {
  id: 'elemental-combo',
  sourceId: ELEMENTAL_SHAPER_ID,
  sourceType: 'class' as const,
  name: 'Elemental Combo',
  actionType: 'action',
  description:
    'When you take the Attack action, you may replace one of your weapon attacks with an ' +
    'Elemental Technique that costs 1 EC or less.',
  tags: ['combat'],
};

// ── Level 8 ───────────────────────────────────────────────────

// ── Level 9 ───────────────────────────────────────────────────

export const featureImbuedStrike: Feature = {
  id: 'imbued-strike',
  sourceId: ELEMENTAL_SHAPER_ID,
  sourceType: 'class' as const,
  name: 'Imbued Strike',
  actionType: 'action',
  cost: '1 EC',
  description:
    "Spend 1 EC as part of a weapon attack to imbue it with an element you know. " +
    "That attack deals 1d8 extra damage of the element's type:\n" +
    '• Water → Cold\n• Earth → Magical Bludgeoning\n• Fire → Fire\n• Air → Thunder',
  tags: ['combat', 'damage'],
};

// ── Level 11 ──────────────────────────────────────────────────

// ── Level 12 ──────────────────────────────────────────────────

// ── Level 13 ──────────────────────────────────────────────────

export const featureElementalResonance: Feature = {
  id: 'elemental-resonance',
  sourceId: ELEMENTAL_SHAPER_ID,
  sourceType: 'class' as const,
  name: 'Elemental Resonance',
  actionType: 'passive',
  description:
    'When you use the same element two rounds in a row, gain a cumulative benefit:\n' +
    '• Water: Reduce the cost of the first Augment used next turn by 1 EC.\n' +
    '• Earth: +1 AC until the start of your next turn.\n' +
    '• Fire: All attacks deal bonus Fire damage equal to your WIS modifier next turn.\n' +
    '• Air: +10ft movement speed this turn.',
  tags: ['combat', 'passive'],
  isCard: true,
  cardTab: 'combat',
  cardSelectionLabel: 'Track which element you used last round.',
  cardOptionSource: { pathBased: true } as unknown as { choiceId: string },
};

// ── Level 14 ──────────────────────────────────────────────────

// ── Level 16 ──────────────────────────────────────────────────

// ── Level 17 ──────────────────────────────────────────────────

export const featureElementalOverflow: Feature = {
  id: 'elemental-overflow',
  sourceId: ELEMENTAL_SHAPER_ID,
  sourceType: 'class' as const,
  name: 'Elemental Overflow',
  actionType: 'passive',
  description:
    'Once per turn, when you take the Attack action, one weapon attack is automatically ' +
    'enhanced by Imbued Strike for free (no EC cost). This free use cannot apply to attacks ' +
    'replaced by Elemental Techniques via Elemental Combo.',
  tags: ['combat', 'passive'],
};

// ── Level 18 ──────────────────────────────────────────────────

export const featureElementalWellspring: Feature = {
  id: 'elemental-wellspring',
  sourceId: ELEMENTAL_SHAPER_ID,
  sourceType: 'class' as const,
  name: 'Elemental Wellspring',
  actionType: 'passive',
  description:
    'When you roll initiative with 0 EC remaining, regain half your EC pool (rounded down).\n\n' +
    'Once per long rest, you may ignore EC costs for a number of rounds equal to your WIS modifier.',
  uses: { max: { type: 'flat', value: 1 }, rechargeOn: 'long_rest' },
  tags: ['resource'],
};

// ── Level 19 ──────────────────────────────────────────────────

// ── Level 20 ──────────────────────────────────────────────────

export const featureAvatarForm: Feature = {
  id: 'avatar-form',
  sourceId: ELEMENTAL_SHAPER_ID,
  sourceType: 'class' as const,
  name: 'Avatar Form',
  actionType: 'bonus_action',
  cost: '1/long rest',
  description:
    'Once per long rest, as a bonus action, become a living conduit of the elements for 1 minute:\n' +
    '• Immediately regain all spent EC.\n' +
    '• Gain resistance to all elemental damage types.\n' +
    '• Once per turn, use one Elemental Technique without spending EC.\n' +
    '• All Imbued Strike and Technique damage is maximized.\n' +
    '• Elemental Combo lets you replace any number of weapon attacks (instead of one) with ' +
    'techniques costing 1 EC or less.\n\n' +
    'When the form ends, choose one known element. Creatures of your choice within 30ft make ' +
    'a DEX save (DC 14 + WIS mod) or take 4d10 elemental damage, half on success.',
  uses: { max: { type: 'flat', value: 1 }, rechargeOn: 'long_rest' },
  tags: ['combat', 'ultimate'],
};

// ── All features — seed this array to the Features DB table ───

export const elementalShaperFeatures: Feature[] = [
  ...elementalPathFeatures,
  featureElementalCharges,
  featureElementalEmbodiment,
  featureExtraAttack,
  featureElementalSurge,
  featureElementalCombo,
  featureImbuedStrike,
  featureElementalResonance,
  featureElementalOverflow,
  featureElementalWellspring,
  featureAvatarForm,
];

// ── Class definition ───────────────────────────────────────────

export const elementalShaperClass: Omit<GameClass, 'id'> & { id: string } = {
  id: ELEMENTAL_SHAPER_ID,
  name: 'Elemental Shaper',
  description:
    'A martial combatant who channels elemental energy through their body. ' +
    'They accumulate Elemental Charges and spend them on Elemental Techniques, ' +
    'building toward a chosen combination of four Elemental Paths.',
  hitDie: 10,
  primaryAbility: ['wisdom'],
  savingThrowProficiencies: ['dexterity', 'wisdom'],
  skillProficiencies: {
    choose: 2,
    from: ['acrobatics', 'arcana', 'insight', 'nature', 'perception', 'survival'],
  },
  armorProficiencies: ['Light armor'],
  weaponProficiencies: ['Simple weapons'],
  toolProficiencies: ['Calligraphy tools'],
  creationChoices: [
    {
      id: 'martial-weapon-choice',
      label: 'Martial Weapon Proficiency',
      type: 'weapon_proficiency',
      count: 1,
      unique: true,
      dbSource: {
        entity: 'items',
        filterTag: 'martial',
        grantsType: 'weapon_proficiency',
      },
    },
  ],
  spellcasting: {
    ability: 'wisdom',
    type: 'custom',
    prepareFromList: false,
    ritualCasting: false,
  },
  subclasses: [theHarmonist],

  levelEntries: [
    // ── Level 1 ─────────────────────────────────────────────
    {
      level: 1,
      features: [],
      featureRefs: [featureElementalCharges.id],
      choices: [
        {
          id: 'elemental_path_1',
          label: 'Elemental Path (1st)',
          type: 'path_advance',
          count: 1,
          pathFeatureIds: Object.values(ELEMENTAL_PATH_IDS),
        },
      ],
    },
    // ── Level 2 ─────────────────────────────────────────────
    {
      level: 2,
      features: [],
      featureRefs: [featureElementalEmbodiment.id],
    },
    // ── Level 3 ─────────────────────────────────────────────
    {
      level: 3,
      features: [],
      choices: [{
          id: 'subclass',
          label: 'Choose Subclass',
          type: 'subclass' as const,
          count: 1,
        }],
    },
    // ── Level 4 ─────────────────────────────────────────────
    {
      level: 4,
      features: [],
      choices: [{
          id: 'asi-or-feat',
          label: 'Ability Score Improvement or Feat',
          type: 'feat' as const,
          count: 1,
        }],
    },
    // ── Level 5 ─────────────────────────────────────────────
    {
      level: 5,
      features: [],
      featureRefs: [featureExtraAttack.id],
      choices: [
        {
          id: 'elemental_path_2',
          label: 'Elemental Path (2nd)',
          type: 'path_advance',
          count: 1,
          pathFeatureIds: Object.values(ELEMENTAL_PATH_IDS),
        },
      ],
    },
    // ── Level 6 ─────────────────────────────────────────────
    {
      level: 6,
      features: [],
    },
    // ── Level 7 ─────────────────────────────────────────────
    {
      level: 7,
      features: [],
      featureRefs: [featureElementalSurge.id, featureElementalCombo.id],
    },
    // ── Level 8 ─────────────────────────────────────────────
    {
      level: 8,
      features: [],
      choices: [{
          id: 'asi-or-feat',
          label: 'Ability Score Improvement or Feat',
          type: 'feat' as const,
          count: 1,
        }],
    },
    // ── Level 9 ─────────────────────────────────────────────
    {
      level: 9,
      features: [],
      featureRefs: [featureImbuedStrike.id],
    },
    // ── Level 10 ────────────────────────────────────────────
    {
      level: 10,
      features: [],
      choices: [
        {
          id: 'elemental_path_3',
          label: 'Elemental Path (3rd)',
          type: 'path_advance',
          count: 1,
          pathFeatureIds: Object.values(ELEMENTAL_PATH_IDS),
        },
      ],
    },
    // ── Level 11 ────────────────────────────────────────────
    {
      level: 11,
      features: [],
    },
    // ── Level 12 ────────────────────────────────────────────
    {
      level: 12,
      features: [],
      choices: [{
          id: 'asi-or-feat',
          label: 'Ability Score Improvement or Feat',
          type: 'feat' as const,
          count: 1,
        }],
    },
    // ── Level 13 ────────────────────────────────────────────
    {
      level: 13,
      features: [],
      featureRefs: [featureElementalResonance.id],
    },
    // ── Level 14 ────────────────────────────────────────────
    {
      level: 14,
      features: [],
    },
    // ── Level 15 ────────────────────────────────────────────
    {
      level: 15,
      features: [],
      choices: [
        {
          id: 'elemental_path_4',
          label: 'Elemental Path (Final)',
          type: 'path_advance',
          count: 1,
          pathFeatureIds: Object.values(ELEMENTAL_PATH_IDS),
        },
      ],
    },
    // ── Level 16 ────────────────────────────────────────────
    {
      level: 16,
      features: [],
      choices: [{
          id: 'asi-or-feat',
          label: 'Ability Score Improvement or Feat',
          type: 'feat' as const,
          count: 1,
        }],
    },
    // ── Level 17 ────────────────────────────────────────────
    {
      level: 17,
      features: [],
      featureRefs: [featureElementalOverflow.id],
    },
    // ── Level 18 ────────────────────────────────────────────
    {
      level: 18,
      features: [],
      featureRefs: [featureElementalWellspring.id],
    },
    // ── Level 19 ────────────────────────────────────────────
    {
      level: 19,
      features: [],
      choices: [{
          id: 'asi-or-feat',
          label: 'Ability Score Improvement or Feat',
          type: 'feat' as const,
          count: 1,
        }],
    },
    // ── Level 20 ────────────────────────────────────────────
    {
      level: 20,
      features: [],
      featureRefs: [featureAvatarForm.id],
    },
  ],
};

/**
 * The Elemental Charges resource definition for a new Elemental Shaper character.
 * Add this to character.resources when creating the character.
 */
export function makeElementalChargesResource() {
  return {
    id: 'elemental-charges',
    name: 'Elemental Charges',
    current: 1,
    max: 1,
    maxFormula: [
      { type: 'stat_mod' as const, stat: 'wisdom' as const },
      { type: 'half_class_level' as const, classId: ELEMENTAL_SHAPER_ID },
    ],
    minMax: 1,
    rechargeOn: 'long_rest' as const,
  };
}
