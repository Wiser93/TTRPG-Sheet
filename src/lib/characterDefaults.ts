import type { Character, StatBlock, SkillBlock } from '@/types/character';

const defaultStats: StatBlock = {
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
};

const defaultSkills: SkillBlock = Object.fromEntries(
  [
    'acrobatics', 'animalHandling', 'arcana', 'athletics',
    'deception', 'history', 'insight', 'intimidation',
    'investigation', 'medicine', 'nature', 'perception',
    'performance', 'persuasion', 'religion', 'sleightOfHand',
    'stealth', 'survival',
  ].map(k => [k, { proficient: false, expertise: false, extraBonus: 0 }])
) as SkillBlock;

export function buildDefaultCharacter(name: string): Character {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  return {
    meta: {
      id,
      name,
      createdAt: now,
      updatedAt: now,
    },

    speciesChoices: [],
    backgroundChoices: [],
    classes: [],
    hpRolls: [],

    stats: {
      base: { ...defaultStats },
      overrides: {},
    },
    skills: { ...defaultSkills },

    health: {
      current: 0,
      max: 0,
      temp: 0,
      deathSaves: { successes: 0, failures: 0 },
      stable: false,
    },

    combat: {
      speed: 30,
      inspiration: false,
    },

    activeFeatureIds: [],

    spellSlots: [],
    knownSpells: [],
    resources: [],
    conditions: [],

    inventory: [],
    equipped: {},
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },

    appearance: {},
    biography: {},
    languages: [],
    featureCardStates: {},
    proficiencies: {
      armor: [],
      weapons: [],
      tools: [],
    },
  };
}
