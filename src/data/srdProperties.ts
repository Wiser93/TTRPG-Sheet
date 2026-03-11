/**
 * SRD Item Properties — seed data
 *
 * Covers all standard weapon properties, armour properties, and the eight
 * weapon mastery properties introduced in the 2024 Player's Handbook.
 *
 * Seed this table before seeding srdItems so that tooltips resolve correctly.
 *
 * Usage:
 *   import { seedSrdProperties } from '@/data/srdProperties';
 *   await seedSrdProperties();
 */

import type { ItemProperty } from '@/types/game';
import { upsertItemProperty } from '@/db/gameDatabase';

// ─────────────────────────────────────────────────────────────
// STANDARD WEAPON PROPERTIES
// ─────────────────────────────────────────────────────────────

export const propAmmunition: ItemProperty = {
  id: 'srd-prop-ammunition',
  name: 'ammunition',
  description:
    'You can use a weapon that has the ammunition property to make a ranged attack only if you have ' +
    'ammunition to fire from the weapon. Each time you attack with the weapon, you expend one piece ' +
    'of ammunition. Drawing the ammunition from a quiver, case, or other container is part of the ' +
    'attack (you need a free hand to load a one-handed weapon). At the end of the battle, you can ' +
    'recover half your expended ammunition by taking a minute to search the battlefield.',
  applicableCategories: ['weapon', 'ammunition'],
};

export const propFinesse: ItemProperty = {
  id: 'srd-prop-finesse',
  name: 'finesse',
  description:
    'When making an attack with a finesse weapon, you use your choice of your Strength or Dexterity ' +
    'modifier for the attack and damage rolls. You must use the same modifier for both rolls.',
  applicableCategories: ['weapon'],
};

export const propHeavy: ItemProperty = {
  id: 'srd-prop-heavy',
  name: 'heavy',
  description:
    'Small creatures have disadvantage on attack rolls with heavy weapons. A heavy weapon\'s size ' +
    'and bulk make it too large for a Small creature to use effectively.',
  applicableCategories: ['weapon'],
};

export const propLight: ItemProperty = {
  id: 'srd-prop-light',
  name: 'light',
  description:
    'A light weapon is small and easy to handle, making it ideal for use when fighting with two ' +
    'weapons. When you take the Attack action and attack with a light melee weapon that you\'re ' +
    'holding in one hand, you can use a bonus action to attack with a different light melee weapon ' +
    'that you\'re holding in the other hand. You don\'t add your ability modifier to the damage of ' +
    'the bonus attack, unless that modifier is negative.',
  applicableCategories: ['weapon'],
};

export const propLoading: ItemProperty = {
  id: 'srd-prop-loading',
  name: 'loading',
  description:
    'Because of the time required to load this weapon, you can fire only one piece of ammunition ' +
    'from it when you use an action, bonus action, or reaction to fire it, regardless of the number ' +
    'of attacks you can normally make.',
  applicableCategories: ['weapon'],
};

export const propReach: ItemProperty = {
  id: 'srd-prop-reach',
  name: 'reach',
  description:
    'This weapon adds 5 feet to your reach when you attack with it, as well as when determining ' +
    'your reach for opportunity attacks with it.',
  applicableCategories: ['weapon'],
};

export const propSpecial: ItemProperty = {
  id: 'srd-prop-special',
  name: 'special',
  description:
    'A weapon with the special property has unusual rules governing its use, explained in the ' +
    'weapon\'s description.',
  applicableCategories: 'all',
};

export const propThrown: ItemProperty = {
  id: 'srd-prop-thrown',
  name: 'thrown',
  description:
    'If a weapon has the thrown property, you can throw the weapon to make a ranged attack. If ' +
    'the weapon is a melee weapon, you use the same ability modifier for that attack roll and ' +
    'damage roll that you would use for a melee attack with the weapon. For example, if you throw ' +
    'a handaxe, you use your Strength.',
  applicableCategories: ['weapon'],
};

export const propTwoHanded: ItemProperty = {
  id: 'srd-prop-two-handed',
  name: 'two-handed',
  description:
    'This weapon requires two hands when you attack with it. This property is relevant only when ' +
    'you attack with the weapon, not when you simply hold it.',
  applicableCategories: ['weapon'],
};

export const propVersatile: ItemProperty = {
  id: 'srd-prop-versatile',
  name: 'versatile',
  description:
    'This weapon can be used with one or two hands. The damage value in parentheses appears ' +
    'alongside the property — use that die when wielding the weapon with two hands to make a ' +
    'melee attack.',
  applicableCategories: ['weapon'],
};

// ─────────────────────────────────────────────────────────────
// ARMOUR PROPERTIES
// ─────────────────────────────────────────────────────────────

export const propStealthDisadvantage: ItemProperty = {
  id: 'srd-prop-stealth-disadvantage',
  name: 'stealth disadvantage',
  description:
    'The wearer has disadvantage on Dexterity (Stealth) checks while wearing this armour. The ' +
    'bulky or rigid construction of the armour makes silent movement very difficult.',
  applicableCategories: ['armor', 'shield'],
};

// ─────────────────────────────────────────────────────────────
// WEAPON MASTERY PROPERTIES  (2024 Player's Handbook)
// Each is isMastery: true — only shown when character is proficient
// ─────────────────────────────────────────────────────────────

export const masteryBurn: ItemProperty = {
  id: 'srd-mastery-burn',
  name: 'burn',
  description:
    'If you hit a creature with this weapon, you can force the creature to make a Constitution ' +
    'saving throw (DC 8 + your Proficiency Bonus + your ability modifier). On a failed save, the ' +
    'creature has the Burning condition.',
  applicableCategories: ['weapon'],
  isMastery: true,
};

export const masteryCleave: ItemProperty = {
  id: 'srd-mastery-cleave',
  name: 'cleave',
  description:
    'If you hit a creature with a melee attack roll using this weapon, you can make a melee attack ' +
    'roll with the weapon against a second creature within 5 feet of the first that is also within ' +
    'your reach. On a hit, the second creature takes the weapon\'s damage, but don\'t add your ' +
    'ability modifier to this damage unless that modifier is negative. You can make this extra ' +
    'attack only once per turn.',
  applicableCategories: ['weapon'],
  isMastery: true,
};

export const masteryGraze: ItemProperty = {
  id: 'srd-mastery-graze',
  name: 'graze',
  description:
    'If your attack roll with this weapon misses a creature, you can deal damage to that creature ' +
    'equal to the ability modifier you used to make the attack roll. This damage is the same type ' +
    'dealt by the weapon, and the damage can\'t be reduced or avoided.',
  applicableCategories: ['weapon'],
  isMastery: true,
};

export const masteryNick: ItemProperty = {
  id: 'srd-mastery-nick',
  name: 'nick',
  description:
    'When you make the extra attack of the Light property, you can make it as part of the Attack ' +
    'action instead of as a Bonus Action. You can still make this extra attack only once per turn.',
  applicableCategories: ['weapon'],
  isMastery: true,
};

export const masteryPush: ItemProperty = {
  id: 'srd-mastery-push',
  name: 'push',
  description:
    'If you hit a creature with this weapon, you can push the creature up to 10 feet straight away ' +
    'from yourself if it is Large or smaller.',
  applicableCategories: ['weapon'],
  isMastery: true,
};

export const masterySap: ItemProperty = {
  id: 'srd-mastery-sap',
  name: 'sap',
  description:
    'If you hit a creature with this weapon, that creature has Disadvantage on its next attack ' +
    'roll before the start of your next turn.',
  applicableCategories: ['weapon'],
  isMastery: true,
};

export const masterySlow: ItemProperty = {
  id: 'srd-mastery-slow',
  name: 'slow',
  description:
    'If you hit a creature with this weapon and deal damage to it, you can reduce that creature\'s ' +
    'Speed by 10 feet until the start of your next turn. If the creature is hit more than once with ' +
    'this property, the speed reduction doesn\'t stack.',
  applicableCategories: ['weapon'],
  isMastery: true,
};

export const masteryTopple: ItemProperty = {
  id: 'srd-mastery-topple',
  name: 'topple',
  description:
    'If you hit a creature with this weapon, you can force the creature to make a Constitution ' +
    'saving throw (DC 8 + your Proficiency Bonus + your ability modifier used to make the attack ' +
    'roll). On a failed save, the creature has the Prone condition.',
  applicableCategories: ['weapon'],
  isMastery: true,
};

export const masteryVex: ItemProperty = {
  id: 'srd-mastery-vex',
  name: 'vex',
  description:
    'If you hit a creature with this weapon and deal damage to the creature, you have Advantage on ' +
    'your next attack roll against that creature before the end of your next turn.',
  applicableCategories: ['weapon'],
  isMastery: true,
};

// ─────────────────────────────────────────────────────────────
// FULL COLLECTION
// ─────────────────────────────────────────────────────────────

export const SRD_PROPERTIES: ItemProperty[] = [
  // Standard weapon properties
  propAmmunition,
  propFinesse,
  propHeavy,
  propLight,
  propLoading,
  propReach,
  propSpecial,
  propThrown,
  propTwoHanded,
  propVersatile,
  // Armour properties
  propStealthDisadvantage,
  // Mastery properties
  masteryCleave,
  masteryGraze,
  masteryNick,
  masteryPush,
  masterySap,
  masterySlow,
  masteryTopple,
  masteryVex,
];

// ─────────────────────────────────────────────────────────────
// SEED FUNCTION
// ─────────────────────────────────────────────────────────────

/**
 * Upserts all SRD item properties into the database.
 * Safe to run multiple times — existing records are updated, not duplicated.
 */
export async function seedSrdProperties(): Promise<void> {
  for (const prop of SRD_PROPERTIES) {
    await upsertItemProperty(prop);
  }
}
