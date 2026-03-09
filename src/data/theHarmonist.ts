/**
 * The Harmonist — subclass of the Elemental Shaper
 *
 * Features are exported individually for seeding to the Features DB table.
 * The subclass definition references them via featureRefs.
 *
 * Seed order: upsert all theHarmonistFeatures first, then the subclass.
 */

import type { Subclass, Feature } from '@/types/game';

// ── Level 3 ───────────────────────────────────────────────────

export const featureBalanceInAllThings: Feature = {
  id: 'harmonist-balance-in-all-things',
  name: 'Balance in All Things',
  actionType: 'passive',
  description:
    'When you choose this subclass at 3rd level, your elemental path progression is altered ' +
    'to prioritize versatility over specialization.\n\n' +
    '- You may only select Tier I from any element, **except** the first element you chose, ' +
    'which may reach Tier II.\n' +
    '- When you gain a new Elemental Tier (at levels 5, 10, and 15), you must first select ' +
    'from elemental paths you do not yet know. Once all four are known, you may begin ' +
    'upgrading your original path.\n' +
    '- You cannot gain Tier III access naturally through progression.\n\n' +
    'This progression ensures you always know all four elements, with only one reaching Tier II. ' +
    'With this restriction applied, you may select a second element now.',
  tags: ['subclass', 'elemental', 'passive'],
};

// ── Level 6 ───────────────────────────────────────────────────

export const featureResonantOverload: Feature = {
  id: 'harmonist-resonant-overload',
  name: 'Resonant Overload',
  actionType: 'passive',
  description:
    'You may use Elemental Augments from elements you know, even if you haven\'t unlocked ' +
    'the required tier, by spending additional Elemental Charges (EC).\n\n' +
    '- Augments may be used by paying **+2 EC per missing tier** (e.g., using a Tier III augment ' +
    'when you only know Tier I costs +4 EC).\n' +
    '- You must have learned the element\'s path to use its techniques.\n\n' +
    '**Upcasting Passive Augments:** You must have the full EC cost available (including the ' +
    'surcharge). Upon activating, your maximum and current EC are both reduced by the total cost. ' +
    'When the effect ends, your maximum and current EC increase by the same amount.',
  tags: ['subclass', 'elemental', 'passive'],
};

// ── Level 11 ──────────────────────────────────────────────────

export const featureElementalCascade: Feature = {
  id: 'harmonist-elemental-cascade',
  name: 'Elemental Cascade',
  actionType: 'passive',
  description:
    'Once per turn, when you activate an Augment from one elemental path, you may immediately ' +
    'activate a second Tier 1 Augment from a **different** elemental path you know, as part of ' +
    'the same action or bonus action.\n\n' +
    '- The second Augment must not be Passive.\n' +
    '- You must have the EC to pay both costs in full.\n' +
    '- The second Augment must not share the same elemental path as the first.\n' +
    '- This feature can only trigger once per turn.',
  tags: ['subclass', 'elemental', 'passive', 'combat'],
};

// ── Level 14 ──────────────────────────────────────────────────

export const featureCoreOfTheSpiral: Feature = {
  id: 'harmonist-core-of-the-spiral',
  name: 'Core of the Spiral',
  actionType: 'passive',
  description:
    'At the start of each of your turns, choose one element you know. Until the start of your ' +
    'next turn, you gain the corresponding Spiral Effect:\n\n' +
    '- **Water:** If you are below half your maximum HP at the start of your turn, regain 1 HP.\n' +
    '- **Earth:** Gain temporary HP equal to your Wisdom modifier.\n' +
    '- **Fire:** If you are below half your maximum EC pool, regain 1 EC.\n' +
    '- **Air:** Gain 10ft movement speed.\n\n' +
    'You may change the active element each round. These bonuses do not stack with themselves ' +
    'or the benefits of Elemental Resonance, but you may benefit from both in the same round. ' +
    'These benefits are only active while you are conscious.',
  tags: ['subclass', 'elemental', 'passive', 'combat'],
  isCard: true,
  cardTab: 'combat',
  cardSelectionLabel: 'Choose a Spiral element at the start of your turn.',
  cardOptionSource: { pathBased: true } as unknown as { choiceId: string },
};

// ── All features — seed this array to the Features DB table ───

export const theHarmonistFeatures: Feature[] = [
  featureBalanceInAllThings,
  featureResonantOverload,
  featureElementalCascade,
  featureCoreOfTheSpiral,
];

// ── Subclass definition ────────────────────────────────────────

export const theHarmonist: Subclass = {
  id: 'the-harmonist',
  parentClassId: 'elemental-shaper',
  name: 'The Harmonist',
  description:
    'A subclass of the Elemental Shaper that prioritizes versatility over specialization. ' +
    'The Harmonist learns all four elements, mastering breadth rather than depth.',
  chosenAtLevel: 3,
  levelEntries: [
    // ── Level 3 ─────────────────────────────────────────────
    {
      level: 3,
      features: [],
      featureRefs: [featureBalanceInAllThings.id],
      choices: [
        {
          id: 'elemental_path_harmonist_3',
          label: 'Elemental Path — Harmonist (3rd)',
          type: 'path_advance',
          count: 1,
          pathFeatureIds: ['path-water', 'path-earth', 'path-fire', 'path-air'],
          // Harmonist restriction: max tier 1 on all paths except first; max tier 2 overall
        },
      ],
    },
    // ── Level 6 ─────────────────────────────────────────────
    {
      level: 6,
      features: [],
      featureRefs: [featureResonantOverload.id],
    },
    // ── Level 11 ────────────────────────────────────────────
    {
      level: 11,
      features: [],
      featureRefs: [featureElementalCascade.id],
    },
    // ── Level 14 ────────────────────────────────────────────
    {
      level: 14,
      features: [],
      featureRefs: [featureCoreOfTheSpiral.id],
    },
  ],
};
