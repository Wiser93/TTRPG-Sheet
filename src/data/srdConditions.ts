/**
 * SRD Standard Conditions — seed data (5e 2024 SRD)
 *
 * Includes all 15 standard conditions plus Exhaustion as a 10-level
 * (well, 6-level for standard 5e) levelled condition.
 *
 * Usage:
 *   import { seedSrdConditions } from '@/data/srdConditions';
 *   await seedSrdConditions();
 */

import type { Condition } from '@/types/game';
import { upsertCondition } from '@/db/gameDatabase';

// ─────────────────────────────────────────────────────────────
// FLAT CONDITIONS
// ─────────────────────────────────────────────────────────────

export const condBlinded: Condition = {
  id: 'srd-cond-blinded',
  name: 'Blinded',
  icon: '👁️',
  color: '#abb2bf',
  description: 'A blinded creature cannot see.',
  effects: [
    'Automatically fails any ability check requiring sight.',
    'Attack rolls against it have Advantage.',
    'Its attack rolls have Disadvantage.',
  ],
};

export const condCharmed: Condition = {
  id: 'srd-cond-charmed',
  name: 'Charmed',
  icon: '💕',
  color: '#c678dd',
  description: 'A charmed creature regards its charmer as a trusted friend.',
  effects: [
    'Cannot attack the charmer or target them with harmful abilities or spells.',
    'The charmer has Advantage on ability checks to interact socially with it.',
  ],
};

export const condDeafened: Condition = {
  id: 'srd-cond-deafened',
  name: 'Deafened',
  icon: '🔇',
  color: '#abb2bf',
  description: 'A deafened creature cannot hear.',
  effects: [
    'Automatically fails any ability check requiring hearing.',
  ],
};

export const condFrightened: Condition = {
  id: 'srd-cond-frightened',
  name: 'Frightened',
  icon: '😨',
  color: '#d19a66',
  description: 'A frightened creature is overcome with fear of a source.',
  effects: [
    'Disadvantage on ability checks and attack rolls while the source of fear is within line of sight.',
    'Cannot willingly move closer to the source of fear.',
  ],
};

export const condGrappled: Condition = {
  id: 'srd-cond-grappled',
  name: 'Grappled',
  icon: '🤼',
  color: '#e5c07b',
  description: 'A grappled creature is being held by another.',
  effects: [
    'Speed becomes 0 and cannot benefit from bonuses to speed.',
    'The condition ends if the grappler is incapacitated.',
    'The condition ends if an effect removes the grappled creature from the reach of the grappler.',
  ],
};

export const condIncapacitated: Condition = {
  id: 'srd-cond-incapacitated',
  name: 'Incapacitated',
  icon: '😵',
  color: '#e06c75',
  description: 'An incapacitated creature cannot take actions or reactions.',
  effects: [
    'Cannot take Actions or Reactions.',
  ],
};

export const condInvisible: Condition = {
  id: 'srd-cond-invisible',
  name: 'Invisible',
  icon: '👻',
  color: '#56b6c2',
  description: 'An invisible creature cannot be seen without the aid of magic or a special sense.',
  effects: [
    'Impossible to see without special senses. Counts as heavily obscured for hiding.',
    'Attack rolls against it have Disadvantage.',
    'Its own attack rolls have Advantage.',
  ],
};

export const condParalyzed: Condition = {
  id: 'srd-cond-paralyzed',
  name: 'Paralyzed',
  icon: '⚡',
  color: '#e06c75',
  description: 'A paralyzed creature cannot move or act.',
  effects: [
    'Is incapacitated and cannot move or speak.',
    'Automatically fails STR and DEX saving throws.',
    'Attack rolls against it have Advantage.',
    'Any attack that hits it is a critical hit if the attacker is within 5 feet.',
  ],
};

export const condPetrified: Condition = {
  id: 'srd-cond-petrified',
  name: 'Petrified',
  icon: '🪨',
  color: '#98c379',
  description: 'A petrified creature is transformed into a solid inanimate substance.',
  effects: [
    'Transformed along with all nonmagical items worn or carried into a solid substance.',
    'Weight increases by a factor of ten; ceases aging.',
    'Is incapacitated, cannot move, and cannot speak.',
    'Unaware of its surroundings.',
    'Attack rolls against it have Advantage.',
    'Automatically fails STR and DEX saving throws.',
    'Resistance to all damage.',
    'Immune to poison and disease, though existing poison or disease is suspended.',
  ],
};

export const condPoisoned: Condition = {
  id: 'srd-cond-poisoned',
  name: 'Poisoned',
  icon: '🤢',
  color: '#98c379',
  description: 'A poisoned creature is wracked with illness or toxin.',
  effects: [
    'Disadvantage on attack rolls and ability checks.',
  ],
};

export const condProne: Condition = {
  id: 'srd-cond-prone',
  name: 'Prone',
  icon: '⬇️',
  color: '#e5c07b',
  description: 'A prone creature is lying on the ground.',
  effects: [
    'Only movement option is to crawl (costs 1 extra foot per foot), unless it stands up.',
    'Disadvantage on attack rolls.',
    'Attack rolls against it have Advantage if the attacker is within 5 ft; otherwise Disadvantage.',
  ],
};

export const condRestrained: Condition = {
  id: 'srd-cond-restrained',
  name: 'Restrained',
  icon: '⛓️',
  color: '#d19a66',
  description: 'A restrained creature is held in place by bonds or magic.',
  effects: [
    'Speed becomes 0 and cannot benefit from bonuses to speed.',
    'Disadvantage on attack rolls.',
    'Attack rolls against it have Advantage.',
    'Disadvantage on DEX saving throws.',
  ],
};

export const condStunned: Condition = {
  id: 'srd-cond-stunned',
  name: 'Stunned',
  icon: '💫',
  color: '#e06c75',
  description: 'A stunned creature is dazed and overwhelmed.',
  effects: [
    'Is incapacitated and can only speak falteringly.',
    'Automatically fails STR and DEX saving throws.',
    'Attack rolls against it have Advantage.',
  ],
};

export const condUnconscious: Condition = {
  id: 'srd-cond-unconscious',
  name: 'Unconscious',
  icon: '💤',
  color: '#61afef',
  description: 'An unconscious creature is unaware of its surroundings.',
  effects: [
    'Is incapacitated, cannot move or speak, and is unaware of its surroundings.',
    'Drops whatever it is holding; falls prone.',
    'Automatically fails STR and DEX saving throws.',
    'Attack rolls against it have Advantage.',
    'Any attack that hits it is a critical hit if the attacker is within 5 feet.',
  ],
};

// ─────────────────────────────────────────────────────────────
// LEVELLED CONDITION — EXHAUSTION (2024 Rules)
// ─────────────────────────────────────────────────────────────

export const condExhaustion: Condition = {
  id: 'srd-cond-exhaustion',
  name: 'Exhaustion',
  icon: '😓',
  color: '#56b6c2',
  description:
    'Exhaustion is measured in six levels. Each long rest removes one level of exhaustion. ' +
    'Effects are cumulative — a creature with level 3 exhaustion suffers the effects of levels 1, 2, and 3.',
  // Shared effect shown at all levels
  effects: [
    'A long rest removes one level of Exhaustion.',
  ],
  maxLevel: 6,
  levels: [
    {
      level: 1,
      label: 'Exhausted',
      cumulative: true,
      effects: [
        'Disadvantage on ability checks.',
      ],
    },
    {
      level: 2,
      label: 'Haggard',
      cumulative: true,
      effects: [
        'Speed halved.',
      ],
    },
    {
      level: 3,
      label: 'Spent',
      cumulative: true,
      effects: [
        'Disadvantage on attack rolls and saving throws.',
      ],
    },
    {
      level: 4,
      label: 'Near Collapse',
      cumulative: true,
      effects: [
        'Maximum hit points halved.',
      ],
    },
    {
      level: 5,
      label: 'Near Death',
      cumulative: true,
      effects: [
        'Speed reduced to 0.',
      ],
    },
    {
      level: 6,
      label: 'Dead',
      cumulative: true,
      effects: [
        'Death.',
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// ALL CONDITIONS
// ─────────────────────────────────────────────────────────────

export const allSrdConditions: Condition[] = [
  condBlinded,
  condCharmed,
  condDeafened,
  condExhaustion,
  condFrightened,
  condGrappled,
  condIncapacitated,
  condInvisible,
  condParalyzed,
  condPetrified,
  condPoisoned,
  condProne,
  condRestrained,
  condStunned,
  condUnconscious,
];

export async function seedSrdConditions(): Promise<void> {
  for (const cond of allSrdConditions) {
    await upsertCondition(cond);
  }
}
