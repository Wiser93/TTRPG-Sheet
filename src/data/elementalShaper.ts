/**
 * Elemental Shaper — seed data
 *
 * Import this via the app's future "Import content pack" feature, or call
 * seedGameContent({ classes: [elementalShaperClass] }) from a dev console.
 *
 * The class ID is stable so you can reference it in maxFormula terms:
 *   { type: 'half_class_level', classId: 'elemental-shaper' }
 */

import type { GameClass } from '@/types/game';
import { theHarmonist } from './theHarmonist';

export const ELEMENTAL_SHAPER_ID = 'elemental-shaper';

export const elementalShaperClass: Omit<GameClass, 'id'> & { id: string } = {
  id: ELEMENTAL_SHAPER_ID,
  name: 'Elemental Shaper',
  description:
    'A martial combatant who channels elemental energy through their body. ' +
    'They accumulate Elemental Charges and spend them on Elemental Techniques, ' +
    'building toward a chosen combination of four Elemental Paths.',
  hitDie: 8,
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
      type: 'weapon_proficiency' as const,
      count: 1,
      unique: true,
      dbSource: {
        entity: 'items' as const,
        filterTag: 'martial',
        grantsType: 'weapon_proficiency' as const,
      },
    },
  ],

  spellcasting: {
    // Not a spellcaster but we use this to expose the save DC formula:
    // 8 + Prof + WIS mod — same as spell save DC
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
      features: [
        {
          id: 'ec-feature',
          name: 'Elemental Charges',
          description:
            'You have Elemental Charges (EC) equal to your WIS modifier + half your Shaper ' +
            'level (minimum 1). They recharge on a long rest.\n\n' +
            'Your Elemental Save DC = 8 + Proficiency Bonus + WIS modifier.',
          actionType: 'passive' as const,
          tags: ['resource', 'core'],
        },
      ],
      choices: [
        {
          id: 'elemental_path',
          label: 'Elemental Path (1st)',
          type: 'custom_feature',
          count: 1,
          options: [
            { id: 'water', label: 'Water — Stillness (Tier 1)', description: 'Riptide Step, Flowing Form. Recharge: reaction used when attacked.', color: '#61afef', icon: '💧' },
            { id: 'earth', label: 'Earth — Rooted (Tier 1)',   description: 'Earthen Grasp, Stone\'s Endurance. Recharge: no movement on turn.', color: '#e5c07b', icon: '🪨' },
            { id: 'fire',  label: 'Fire — The Flame Within (Tier 1)', description: 'Flame Lash, Kindled Motion. Recharge: reduce enemy to 0 HP with Fire.', color: '#e06c75', icon: '🔥' },
            { id: 'air',   label: 'Air — Whisper (Tier 1)',    description: 'Cyclone Palm, Whisperstep. Recharge: move 20ft unharmed.', color: '#98c379', icon: '💨' },
          ],
        },
      ],
    },
    // ── Level 2 ─────────────────────────────────────────────
    {
      level: 2,
      features: [
        {
          id: 'elemental-embodiment',
          name: 'Elemental Embodiment',
          actionType: 'passive' as const,
          description:
            'At the start of a long rest or short rest in which you roll hit dice, choose one ' +
            'known element to embody until your next rest.\n\n' +
            '**Water:** Roll max on 1 hit die, reroll 1s. Optionally sacrifice up to half the HP ' +
            'regained to heal resting allies by the same amount.\n\n' +
            '**Earth:** Gain (Prof)d4 temp HP at rest start. Subsequent rests carry over unspent ' +
            'temp HP; resets on long rest.\n\n' +
            '**Fire:** Add Proficiency to initiative. Add 1d6 to STR-based checks.\n\n' +
            '**Air:** Fall ≤60ft/round with lateral control (15ft per 10ft descended/ascended). ' +
            'Add 1d6 to DEX-based checks.',
          tags: ['rest', 'elemental'],
          isCard: true,
          cardTab: 'combat' as const,
          cardSelectionLabel: 'Choose an element to embody at the start of a rest.',
          cardOptionSource: { choiceId: 'elemental_path' },
        },
      ],
    },
    // ── Level 3 ─────────────────────────────────────────────
    { level: 3, features: [{ id: 'l3-subclass', name: 'Subclass Feature', description: 'You gain a feature from your chosen subclass.', tags: ['subclass'] }] },
    // ── Level 4 ─────────────────────────────────────────────
    { level: 4, features: [{ id: 'l4-asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two ability scores by 1 each. You may take a Feat instead.', tags: ['asi'] }] },
    // ── Level 5 ─────────────────────────────────────────────
    {
      level: 5,
      features: [
        { id: 'extra-attack', name: 'Extra Attack', description: 'You can attack twice, instead of once, whenever you take the Attack action on your turn.', tags: ['combat'] },
      ],
      choices: [
        {
          id: 'elemental_path',
          label: 'Elemental Path (2nd)',
          type: 'custom_feature',
          count: 1,
          options: [
            { id: 'water', label: 'Water — Current (Tier 2) or Stillness (Tier 1)', description: 'If already Water: Current tier 2 boost + 1 Water Augment. Otherwise: Stillness tier 1.' },
            { id: 'earth', label: 'Earth — Mantle (Tier 2) or Rooted (Tier 1)' },
            { id: 'fire',  label: 'Fire — Kindling (Tier 2) or The Flame Within (Tier 1)' },
            { id: 'air',   label: 'Air — Gale (Tier 2) or Whisper (Tier 1)' },
          ],
        },
      ],
    },
    // ── Level 6 ─────────────────────────────────────────────
    { level: 6, features: [{ id: 'l6-subclass', name: 'Subclass Feature', description: 'You gain a feature from your chosen subclass.', tags: ['subclass'] }] },
    // ── Level 7 ─────────────────────────────────────────────
    {
      level: 7,
      features: [
        {
          id: 'elemental-surge',
          name: 'Elemental Surge',
          description:
            'Once per long rest, shroud yourself in your known element(s). For 1 turn you become ' +
            'invulnerable and cannot take any action or movement. On the turn after, regain EC equal ' +
            'to twice your WIS modifier and all techniques cost 0 EC.',
          actionType: 'action' as const,
          cost: '1/long rest',
          uses: { max: { type: 'flat', value: 1 }, rechargeOn: 'long_rest' },
          tags: ['combat', 'resource'],
        },
        {
          id: 'elemental-combo',
          name: 'Elemental Combo',
          description:
            'When you take the Attack action, you may replace one of your weapon attacks with an ' +
            'Elemental Technique that costs 1 EC or less.',
          actionType: 'action' as const,
          tags: ['combat'],
        },
      ],
    },
    // ── Level 8 ─────────────────────────────────────────────
    { level: 8, features: [{ id: 'l8-asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two by 1. May take a Feat instead.', tags: ['asi'] }] },
    // ── Level 9 ─────────────────────────────────────────────
    {
      level: 9,
      features: [
        {
          id: 'imbued-strike',
          name: 'Imbued Strike',
          description:
            'Spend 1 EC as part of a weapon attack to imbue it with an element you know. ' +
            'That attack deals 1d8 extra damage of the element\'s type:\n' +
            '• Water → Cold\n• Earth → Magical Bludgeoning\n• Fire → Fire\n• Air → Thunder',
          actionType: 'action' as const,
          cost: '1 EC',
          tags: ['combat', 'damage'],
        },
      ],
    },
    // ── Level 10 ────────────────────────────────────────────
    {
      level: 10,
      features: [],
      choices: [
        {
          id: 'elemental_path',
          label: 'Elemental Path (3rd)',
          type: 'custom_feature',
          count: 1,
          options: [
            { id: 'water', label: 'Water — next tier' },
            { id: 'earth', label: 'Earth — next tier' },
            { id: 'fire',  label: 'Fire — next tier' },
            { id: 'air',   label: 'Air — next tier' },
          ],
        },
      ],
    },
    // ── Level 11 ────────────────────────────────────────────
    { level: 11, features: [{ id: 'l11-subclass', name: 'Subclass Feature', description: 'You gain a feature from your chosen subclass.', tags: ['subclass'] }] },
    // ── Level 12 ────────────────────────────────────────────
    { level: 12, features: [{ id: 'l12-asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two by 1. May take a Feat instead.', tags: ['asi'] }] },
    // ── Level 13 ────────────────────────────────────────────
    {
      level: 13,
      features: [
        {
          id: 'elemental-resonance',
          name: 'Elemental Resonance',
          actionType: 'passive' as const,
          description:
            'When you use the same element two rounds in a row, gain a cumulative benefit:\n' +
            '• Water: Reduce the cost of the first Augment used next turn by 1 EC.\n' +
            '• Earth: +1 AC until the start of your next turn.\n' +
            '• Fire: All attacks deal bonus Fire damage equal to your WIS modifier next turn.\n' +
            '• Air: +10ft movement speed this turn.',
          tags: ['combat', 'passive'],
          isCard: true,
          cardTab: 'combat' as const,
          cardSelectionLabel: 'Track which element you used last round.',
          cardOptionSource: { choiceId: 'elemental_path' },
        },
      ],
    },
    // ── Level 14 ────────────────────────────────────────────
    { level: 14, features: [{ id: 'l14-subclass', name: 'Subclass Feature', description: 'You gain a feature from your chosen subclass.', tags: ['subclass'] }] },
    // ── Level 15 ────────────────────────────────────────────
    {
      level: 15,
      features: [],
      choices: [
        {
          id: 'elemental_path',
          label: 'Elemental Path (Final)',
          type: 'custom_feature',
          count: 1,
          options: [
            { id: 'water', label: 'Water — final tier' },
            { id: 'earth', label: 'Earth — final tier' },
            { id: 'fire',  label: 'Fire — final tier' },
            { id: 'air',   label: 'Air — final tier' },
          ],
        },
      ],
    },
    // ── Level 16 ────────────────────────────────────────────
    { level: 16, features: [{ id: 'l16-asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two by 1. May take a Feat instead.', tags: ['asi'] }] },
    // ── Level 17 ────────────────────────────────────────────
    {
      level: 17,
      features: [
        {
          id: 'elemental-overflow',
          name: 'Elemental Overflow',
          actionType: 'passive' as const,
          description:
            'Once per turn, when you take the Attack action, one weapon attack is automatically ' +
            'enhanced by Imbued Strike for free (no EC cost). This free use cannot apply to attacks ' +
            'replaced by Elemental Techniques via Elemental Combo.',
          tags: ['combat', 'passive'],
        },
      ],
    },
    // ── Level 18 ────────────────────────────────────────────
    {
      level: 18,
      features: [
        {
          id: 'elemental-wellspring',
          name: 'Elemental Wellspring',
          actionType: 'passive' as const,
          description:
            'When you roll initiative with 0 EC remaining, regain half your EC pool (rounded down).\n\n' +
            'Once per long rest, you may ignore EC costs for a number of rounds equal to your WIS modifier.',
          uses: { max: { type: 'flat', value: 1 }, rechargeOn: 'long_rest' },
          tags: ['resource'],
        },
      ],
    },
    // ── Level 19 ────────────────────────────────────────────
    { level: 19, features: [{ id: 'l19-asi', name: 'Ability Score Improvement', description: 'Increase one ability score by 2, or two by 1. May take a Feat instead.', tags: ['asi'] }] },
    // ── Level 20 ────────────────────────────────────────────
    {
      level: 20,
      features: [
        {
          id: 'avatar-form',
          name: 'Avatar Form',
          actionType: 'bonus_action' as const,
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
        },
      ],
    },
  ],
};

/**
 * The Elemental Charges resource definition for a new Elemental Shaper character.
 * Add this to character.resources when creating the character.
 *
 * The maxFormula makes the sheet auto-calculate:
 *   max EC = WIS modifier + floor(Shaper level / 2), minimum 1
 */
export function makeElementalChargesResource() {
  return {
    id: 'elemental-charges',
    name: 'Elemental Charges',
    current: 1,
    max: 1,   // will be overwritten by formula on first render
    maxFormula: [
      { type: 'stat_mod' as const, stat: 'wisdom' as const },
      { type: 'half_class_level' as const, classId: ELEMENTAL_SHAPER_ID },
    ],
    minMax: 1,
    rechargeOn: 'long_rest' as const,
  };
}
