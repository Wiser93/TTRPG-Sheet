/**
 * SRD Species — seed data (5e SRD / Basic Rules)
 *
 * Covers the nine species from the 5e SRD: Dwarf, Elf, Halfling,
 * Human, Dragonborn, Gnome, Half-Elf, Half-Orc, and Tiefling.
 *
 * Species features are stored as inline Feature objects so they display
 * correctly on the character sheet without requiring separate DB entries.
 * Ability score bonuses are described in the feature text since the Species
 * type does not carry a structured abilityBonuses field.
 *
 * Usage:
 *   import { seedSrdSpecies } from '@/data/srdSpecies';
 *   await seedSrdSpecies();
 */

import type { Species } from '@/types/game';
import { upsertSpecies } from '@/db/gameDatabase';

// ─────────────────────────────────────────────────────────────
// DWARF
// ─────────────────────────────────────────────────────────────

export const speciesDwarf: Species = {
  id: 'srd-species-dwarf',
  name: 'Dwarf',
  description:
    'Bold and hardy, dwarves are known as skilled warriors, miners, and workers of ' +
    'stone and metal. They live beneath mountains or in the fortified strongholds they ' +
    'carve out of solid rock.',
  size: 'medium',
  speed: 25,
  darkvision: 60,
  weaponProficiencies: ['battleaxe', 'handaxe', 'light hammer', 'warhammer'],
  languages: ['Common', 'Dwarvish'],
  features: [
    {
      id: 'srd-dwarf-ability-bonuses',
      name: 'Ability Score Increase',
      description: 'Your Constitution score increases by 2.',
      tags: ['passive', 'species'],
    },
    {
      id: 'srd-dwarf-dwarven-resilience',
      name: 'Dwarven Resilience',
      description:
        'You have advantage on saving throws against poison, and you have resistance ' +
        'against poison damage.',
      tags: ['passive', 'resistance'],
    },
    {
      id: 'srd-dwarf-dwarven-combat-training',
      name: 'Dwarven Combat Training',
      description:
        'You have proficiency with the battleaxe, handaxe, light hammer, and warhammer.',
      tags: ['passive', 'proficiency'],
    },
    {
      id: 'srd-dwarf-tool-proficiency',
      name: 'Tool Proficiency',
      description:
        "You gain proficiency with the artisan's tools of your choice: smith's tools, " +
        "brewer's supplies, or mason's tools.",
      tags: ['passive', 'proficiency'],
    },
    {
      id: 'srd-dwarf-stonecunning',
      name: 'Stonecunning',
      description:
        'Whenever you make an Intelligence (History) check related to the origin of ' +
        'stonework, you are considered proficient in the History skill and add double ' +
        'your proficiency bonus to the check.',
      tags: ['passive', 'skill'],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// ELF
// ─────────────────────────────────────────────────────────────

export const speciesElf: Species = {
  id: 'srd-species-elf',
  name: 'Elf',
  description:
    'Elves are a magical people of otherworldly grace, living in the world but not entirely ' +
    'part of it. They live in places of ethereal beauty, in the midst of ancient forests or ' +
    'in silvery spires glittering with faerie light.',
  size: 'medium',
  speed: 30,
  darkvision: 60,
  skillProficiencies: ['perception'],
  languages: ['Common', 'Elvish'],
  features: [
    {
      id: 'srd-elf-ability-bonuses',
      name: 'Ability Score Increase',
      description: 'Your Dexterity score increases by 2.',
      tags: ['passive', 'species'],
    },
    {
      id: 'srd-elf-keen-senses',
      name: 'Keen Senses',
      description: 'You have proficiency in the Perception skill.',
      tags: ['passive', 'proficiency'],
    },
    {
      id: 'srd-elf-fey-ancestry',
      name: 'Fey Ancestry',
      description:
        'You have advantage on saving throws against being charmed, and magic ' +
        "can't put you to sleep.",
      tags: ['passive'],
    },
    {
      id: 'srd-elf-trance',
      name: 'Trance',
      description:
        "Elves don't need to sleep. Instead, they meditate deeply for 4 hours a day. " +
        'A long rest for an elf is only 4 hours. After resting this way, you gain the ' +
        'same benefit a human does from 8 hours of sleep.',
      tags: ['passive'],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// HALFLING
// ─────────────────────────────────────────────────────────────

export const speciesHalfling: Species = {
  id: 'srd-species-halfling',
  name: 'Halfling',
  description:
    "The comforts of home are the goals of most halflings' lives: a place to settle in peace " +
    'and quiet, far from marauding monsters and clashing armies. They are remarkably resilient ' +
    'and resourceful.',
  size: 'small',
  speed: 25,
  languages: ['Common', 'Halfling'],
  features: [
    {
      id: 'srd-halfling-ability-bonuses',
      name: 'Ability Score Increase',
      description: 'Your Dexterity score increases by 2.',
      tags: ['passive', 'species'],
    },
    {
      id: 'srd-halfling-lucky',
      name: 'Lucky',
      description:
        'When you roll a 1 on the d20 for an attack roll, ability check, or saving throw, ' +
        'you can reroll the die and must use the new roll.',
      tags: ['passive'],
    },
    {
      id: 'srd-halfling-brave',
      name: 'Brave',
      description:
        'You have advantage on saving throws against being frightened.',
      tags: ['passive'],
    },
    {
      id: 'srd-halfling-nimble',
      name: 'Halfling Nimbleness',
      description:
        'You can move through the space of any creature that is of a size larger than yours.',
      tags: ['passive', 'movement'],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// HUMAN
// ─────────────────────────────────────────────────────────────

export const speciesHuman: Species = {
  id: 'srd-species-human',
  name: 'Human',
  description:
    'Humans are the most adaptable and ambitious people among the common races. ' +
    'Whatever drives them, humans are the innovators, the achievers, and the pioneers of the worlds.',
  size: 'medium',
  speed: 30,
  languages: 2,   // Common + one of their choice
  features: [
    {
      id: 'srd-human-ability-bonuses',
      name: 'Ability Score Increase',
      description: 'All six of your ability scores each increase by 1.',
      tags: ['passive', 'species'],
    },
    {
      id: 'srd-human-extra-language',
      name: 'Extra Language',
      description:
        'You can speak, read, and write one additional language of your choice.',
      tags: ['passive', 'language'],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// DRAGONBORN
// ─────────────────────────────────────────────────────────────

export const speciesDragonborn: Species = {
  id: 'srd-species-dragonborn',
  name: 'Dragonborn',
  description:
    'Born of dragons, as their name proclaims, the dragonborn walk proudly through a world ' +
    'that greets them with fearful incomprehension. Shaped by draconic gods or the dragons ' +
    'themselves, dragonborn originally hatched from dragon eggs.',
  size: 'medium',
  speed: 30,
  languages: ['Common', 'Draconic'],
  features: [
    {
      id: 'srd-dragonborn-ability-bonuses',
      name: 'Ability Score Increase',
      description: 'Your Strength score increases by 2 and your Charisma score increases by 1.',
      tags: ['passive', 'species'],
    },
    {
      id: 'srd-dragonborn-draconic-ancestry',
      name: 'Draconic Ancestry',
      description:
        'You have draconic ancestry of a particular dragon type, determining your breath ' +
        'weapon damage type and resistance. Common types: Black (acid), Blue (lightning), ' +
        'Brass (fire), Bronze (lightning), Copper (acid), Gold (fire), Green (poison), ' +
        'Red (fire), Silver (cold), White (cold).',
      tags: ['passive', 'species'],
    },
    {
      id: 'srd-dragonborn-breath-weapon',
      name: 'Breath Weapon',
      description:
        'You can use your action to exhale destructive energy in an area determined by your ' +
        'draconic ancestry (15-ft cone or 5×30-ft line). Each creature in the area makes a ' +
        'DEX or CON saving throw (DC = 8 + CON mod + proficiency bonus). On a failed save a ' +
        'creature takes 2d6 damage (3d6 at level 6, 4d6 at level 11, 5d6 at level 16), or ' +
        'half damage on a success. Usable once per short or long rest.',
      actionType: 'action',
      tags: ['species', 'breath'],
    },
    {
      id: 'srd-dragonborn-damage-resistance',
      name: 'Damage Resistance',
      description:
        'You have resistance to the damage type associated with your draconic ancestry.',
      tags: ['passive', 'resistance'],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// GNOME
// ─────────────────────────────────────────────────────────────

export const speciesGnome: Species = {
  id: 'srd-species-gnome',
  name: 'Gnome',
  description:
    "A gnome's energy and enthusiasm for living shines through every inch of his or her tiny " +
    'body. Gnomes average slightly over 3 feet tall and weigh 40 to 45 pounds.',
  size: 'small',
  speed: 25,
  darkvision: 60,
  languages: ['Common', 'Gnomish'],
  features: [
    {
      id: 'srd-gnome-ability-bonuses',
      name: 'Ability Score Increase',
      description: 'Your Intelligence score increases by 2.',
      tags: ['passive', 'species'],
    },
    {
      id: 'srd-gnome-gnome-cunning',
      name: 'Gnome Cunning',
      description:
        'You have advantage on all Intelligence, Wisdom, and Charisma saving throws against magic.',
      tags: ['passive'],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// HALF-ELF
// ─────────────────────────────────────────────────────────────

export const speciesHalfElf: Species = {
  id: 'srd-species-half-elf',
  name: 'Half-Elf',
  description:
    'Walking in two worlds but truly belonging to neither, half-elves combine what some say are ' +
    "the best qualities of their elf and human parents: human curiosity, invention, and ambition " +
    "tempered by the refined senses, love of nature, and artistic tastes of the elves.",
  size: 'medium',
  speed: 30,
  darkvision: 60,
  languages: 3,   // Common, Elvish, + one of their choice
  features: [
    {
      id: 'srd-half-elf-ability-bonuses',
      name: 'Ability Score Increase',
      description:
        'Your Charisma score increases by 2, and two other ability scores of your choice each increase by 1.',
      tags: ['passive', 'species'],
    },
    {
      id: 'srd-half-elf-fey-ancestry',
      name: 'Fey Ancestry',
      description:
        'You have advantage on saving throws against being charmed, and magic ' +
        "can't put you to sleep.",
      tags: ['passive'],
    },
    {
      id: 'srd-half-elf-skill-versatility',
      name: 'Skill Versatility',
      description: 'You gain proficiency in two skills of your choice.',
      tags: ['passive', 'proficiency', 'skill'],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// HALF-ORC
// ─────────────────────────────────────────────────────────────

export const speciesHalfOrc: Species = {
  id: 'srd-species-half-orc',
  name: 'Half-Orc',
  description:
    'Whether united under the leadership of a mighty warlock or having fought to the ' +
    'edges of the known world, half-orcs and orcs have always been drawn to war.',
  size: 'medium',
  speed: 30,
  darkvision: 60,
  skillProficiencies: ['intimidation'],
  languages: ['Common', 'Orc'],
  features: [
    {
      id: 'srd-half-orc-ability-bonuses',
      name: 'Ability Score Increase',
      description: 'Your Strength score increases by 2 and your Constitution score increases by 1.',
      tags: ['passive', 'species'],
    },
    {
      id: 'srd-half-orc-menacing',
      name: 'Menacing',
      description: 'You gain proficiency in the Intimidation skill.',
      tags: ['passive', 'proficiency'],
    },
    {
      id: 'srd-half-orc-relentless-endurance',
      name: 'Relentless Endurance',
      description:
        'When you are reduced to 0 hit points but not killed outright, you can drop to 1 ' +
        "hit point instead. You can't use this feature again until you finish a long rest.",
      tags: ['passive', 'survival'],
    },
    {
      id: 'srd-half-orc-savage-attacks',
      name: 'Savage Attacks',
      description:
        'When you score a critical hit with a melee weapon attack, you can roll one of the ' +
        "weapon's damage dice one additional time and add it to the extra damage of the critical hit.",
      tags: ['passive', 'combat'],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// TIEFLING
// ─────────────────────────────────────────────────────────────

export const speciesTiefling: Species = {
  id: 'srd-species-tiefling',
  name: 'Tiefling',
  description:
    "To be greeted with stares and whispers, to suffer violence and insult on the street, to see " +
    "mistrust and fear in every eye: this is the lot of the tiefling. Their infernal heritage " +
    'marks them indelibly.',
  size: 'medium',
  speed: 30,
  darkvision: 60,
  languages: ['Common', 'Infernal'],
  features: [
    {
      id: 'srd-tiefling-ability-bonuses',
      name: 'Ability Score Increase',
      description: 'Your Intelligence score increases by 1 and your Charisma score increases by 2.',
      tags: ['passive', 'species'],
    },
    {
      id: 'srd-tiefling-hellish-resistance',
      name: 'Hellish Resistance',
      description: 'You have resistance to fire damage.',
      tags: ['passive', 'resistance'],
    },
    {
      id: 'srd-tiefling-infernal-legacy',
      name: 'Infernal Legacy',
      description:
        'You know the Thaumaturgy cantrip. Once you reach 3rd level, you can cast the ' +
        'Hellish Rebuke spell as a 2nd-level spell; you must finish a long rest to cast it ' +
        'again. Once you reach 5th level, you can also cast the Darkness spell; you must ' +
        'finish a long rest to cast it again. Charisma is your spellcasting ability for ' +
        'these spells.',
      tags: ['passive', 'spellcasting'],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// COLLECTION
// ─────────────────────────────────────────────────────────────

export const SRD_SPECIES: Species[] = [
  speciesDwarf,
  speciesElf,
  speciesHalfling,
  speciesHuman,
  speciesDragonborn,
  speciesGnome,
  speciesHalfElf,
  speciesHalfOrc,
  speciesTiefling,
];

// ─────────────────────────────────────────────────────────────
// SEED FUNCTION
// ─────────────────────────────────────────────────────────────

/**
 * Upserts all SRD species into the database.
 * Safe to run multiple times — existing records are updated, not duplicated.
 */
export async function seedSrdSpecies(): Promise<void> {
  for (const species of SRD_SPECIES) {
    await upsertSpecies(species);
  }
}
