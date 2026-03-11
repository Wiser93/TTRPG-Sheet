/**
 * SRD Items — seed data
 *
 * Covers all weapons, armour, shields, ammunition, common adventuring gear,
 * artisan tools, and the basic healing potion from the 5e System Reference
 * Document.
 *
 * Mastery properties (cleave, graze, nick, etc.) are listed in each weapon's
 * properties array. They will only display in the sheet when the character
 * is proficient with that weapon, provided the matching ItemProperty record
 * exists in the database (seed srdProperties first).
 *
 * Seed order: run seedSrdProperties() first, then seedSrdItems().
 *
 * Usage:
 *   import { seedSrdItems } from '@/data/srdItems';
 *   await seedSrdItems();
 */

import type { Item } from '@/types/game';
import { upsertItem } from '@/db/gameDatabase';

// ─────────────────────────────────────────────────────────────
// SIMPLE MELEE WEAPONS
// ─────────────────────────────────────────────────────────────

const club: Item = {
  id: 'srd-club',
  name: 'Club',
  category: 'weapon',
  description: 'A simple wooden club, easy to find and easy to use.',
  weight: 2,
  cost: { amount: 1, currency: 'sp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['mainHand', 'offHand'],
  tags: ['simple', 'melee'],
  weaponStats: {
    damage: { diceCount: 1, dieSize: 4, modifier: 0 },
    damageType: 'bludgeoning',
    properties: ['light', 'slow'],
  },
};

const dagger: Item = {
  id: 'srd-dagger',
  name: 'Dagger',
  category: 'weapon',
  description:
    'A short blade suited to close-quarters fighting. Can be thrown at nearby targets.',
  weight: 1,
  cost: { amount: 2, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['mainHand', 'offHand'],
  tags: ['simple', 'melee'],
  weaponStats: {
    damage: { diceCount: 1, dieSize: 4, modifier: 0 },
    damageType: 'piercing',
    range: { normal: 20, long: 60 },
    properties: ['finesse', 'light', 'thrown', 'nick'],
  },
};

const greatclub: Item = {
  id: 'srd-greatclub',
  name: 'Greatclub',
  category: 'weapon',
  description: 'A massive, unwieldy club that requires two hands to swing effectively.',
  weight: 10,
  cost: { amount: 2, currency: 'sp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['twoHand'],
  tags: ['simple', 'melee'],
  weaponStats: {
    damage: { diceCount: 1, dieSize: 8, modifier: 0 },
    damageType: 'bludgeoning',
    properties: ['two-handed', 'push'],
  },
};

const handaxe: Item = {
  id: 'srd-handaxe',
  name: 'Handaxe',
  category: 'weapon',
  description:
    'A small axe light enough to throw. A staple sidearm for warriors and hunters alike.',
  weight: 2,
  cost: { amount: 5, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['mainHand', 'offHand'],
  tags: ['simple', 'melee'],
  weaponStats: {
    damage: { diceCount: 1, dieSize: 6, modifier: 0 },
    damageType: 'slashing',
    range: { normal: 20, long: 60 },
    properties: ['light', 'thrown', 'vex'],
  },
};

const javelin: Item = {
  id: 'srd-javelin',
  name: 'Javelin',
  category: 'weapon',
  description:
    'A slender throwing spear balanced for both melee and ranged use.',
  weight: 2,
  cost: { amount: 5, currency: 'sp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['mainHand'],
  tags: ['simple', 'melee'],
  weaponStats: {
    damage: { diceCount: 1, dieSize: 6, modifier: 0 },
    damageType: 'piercing',
    range: { normal: 30, long: 120 },
    properties: ['thrown', 'slow'],
  },
};

const lightHammer: Item = {
  id: 'srd-light-hammer',
  name: 'Light Hammer',
  category: 'weapon',
  description:
    'A small hammer light enough to throw. Favoured by dwarves and smiths as a backup weapon.',
  weight: 2,
  cost: { amount: 2, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['mainHand', 'offHand'],
  tags: ['simple', 'melee'],
  weaponStats: {
    damage: { diceCount: 1, dieSize: 4, modifier: 0 },
    damageType: 'bludgeoning',
    range: { normal: 20, long: 60 },
    properties: ['light', 'thrown', 'nick'],
  },
};

const mace: Item = {
  id: 'srd-mace',
  name: 'Mace',
  category: 'weapon',
  description:
    'A heavy metal-headed bludgeon. Simple but brutally effective against armoured foes.',
  weight: 4,
  cost: { amount: 5, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['mainHand'],
  tags: ['simple', 'melee'],
  weaponStats: {
    damage: { diceCount: 1, dieSize: 6, modifier: 0 },
    damageType: 'bludgeoning',
    properties: ['sap'],
  },
};

const quarterstaff: Item = {
  id: 'srd-quarterstaff',
  name: 'Quarterstaff',
  category: 'weapon',
  description:
    'A sturdy wooden pole used as both walking stick and weapon. Can be gripped with two hands ' +
    'for heavier blows (1d8 damage).',
  weight: 4,
  cost: { amount: 2, currency: 'sp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['mainHand'],
  tags: ['simple', 'melee'],
  weaponStats: {
    damage: { diceCount: 1, dieSize: 6, modifier: 0 },
    damageType: 'bludgeoning',
    secondaryDamage: { roll: { diceCount: 1, dieSize: 8, modifier: 0 }, type: 'bludgeoning' },
    properties: ['versatile', 'topple'],
  },
};

const sickle: Item = {
  id: 'srd-sickle',
  name: 'Sickle',
  category: 'weapon',
  description:
    'A curved blade originally designed for harvesting grain, repurposed as a light cutting weapon.',
  weight: 2,
  cost: { amount: 1, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['mainHand', 'offHand'],
  tags: ['simple', 'melee'],
  weaponStats: {
    damage: { diceCount: 1, dieSize: 4, modifier: 0 },
    damageType: 'slashing',
    properties: ['light', 'nick'],
  },
};

const spear: Item = {
  id: 'srd-spear',
  name: 'Spear',
  category: 'weapon',
  description:
    'A pole weapon with a metal tip. Versatile enough for thrusting one-handed or driving ' +
    'two-handed (1d8 damage), and balanced to throw.',
  weight: 3,
  cost: { amount: 1, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['mainHand'],
  tags: ['simple', 'melee'],
  weaponStats: {
    damage: { diceCount: 1, dieSize: 6, modifier: 0 },
    damageType: 'piercing',
    secondaryDamage: { roll: { diceCount: 1, dieSize: 8, modifier: 0 }, type: 'piercing' },
    range: { normal: 20, long: 60 },
    properties: ['thrown', 'versatile', 'sap'],
  },
};

// ─────────────────────────────────────────────────────────────
// SIMPLE RANGED WEAPONS
// ─────────────────────────────────────────────────────────────

const lightCrossbow: Item = {
  id: 'srd-light-crossbow',
  name: 'Light Crossbow',
  category: 'weapon',
  description:
    'A simple mechanical ranged weapon. Slower to reload than a bow but easier to use, ' +
    'requiring little training.',
  weight: 5,
  cost: { amount: 25, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['twoHand'],
  tags: ['simple', 'ranged'],
  weaponStats: {
    damage: { diceCount: 1, dieSize: 8, modifier: 0 },
    damageType: 'piercing',
    range: { normal: 80, long: 320 },
    properties: ['ammunition', 'loading', 'two-handed', 'slow'],
  },
};

const dart: Item = {
  id: 'srd-dart',
  name: 'Dart',
  category: 'weapon',
  description:
    'A small weighted projectile thrown by hand. Light and concealable.',
  weight: 0.25,
  cost: { amount: 5, currency: 'cp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['mainHand', 'offHand'],
  tags: ['simple', 'ranged'],
  weaponStats: {
    damage: { diceCount: 1, dieSize: 4, modifier: 0 },
    damageType: 'piercing',
    range: { normal: 20, long: 60 },
    properties: ['finesse', 'thrown', 'vex'],
  },
};

const shortbow: Item = {
  id: 'srd-shortbow',
  name: 'Shortbow',
  category: 'weapon',
  description:
    'A compact bow suited to skirmishers and scouts. Less powerful than a longbow but ' +
    'easier to use on the move.',
  weight: 2,
  cost: { amount: 25, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['twoHand'],
  tags: ['simple', 'ranged'],
  weaponStats: {
    damage: { diceCount: 1, dieSize: 6, modifier: 0 },
    damageType: 'piercing',
    range: { normal: 80, long: 320 },
    properties: ['ammunition', 'two-handed', 'vex'],
  },
};

const sling: Item = {
  id: 'srd-sling',
  name: 'Sling',
  category: 'weapon',
  description:
    'A simple leather strap used to hurl stones or bullets. Cheap, silent, and effective in ' +
    'the right hands.',
  weight: 0,
  cost: { amount: 1, currency: 'sp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['mainHand'],
  tags: ['simple', 'ranged'],
  weaponStats: {
    damage: { diceCount: 1, dieSize: 4, modifier: 0 },
    damageType: 'bludgeoning',
    range: { normal: 30, long: 120 },
    properties: ['ammunition', 'slow'],
  },
};

// ─────────────────────────────────────────────────────────────
// MARTIAL MELEE WEAPONS
// ─────────────────────────────────────────────────────────────

const battleaxe: Item = {
  id: 'srd-battleaxe',
  name: 'Battleaxe',
  category: 'weapon',
  description:
    'A single- or double-headed axe favoured by warriors. Can be swung with two hands for ' +
    'greater damage (1d10).',
  weight: 4,
  cost: { amount: 10, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['mainHand'],
  tags: ['martial', 'melee'],
  weaponStats: {
    damage: { diceCount: 1, dieSize: 8, modifier: 0 },
    damageType: 'slashing',
    secondaryDamage: { roll: { diceCount: 1, dieSize: 10, modifier: 0 }, type: 'slashing' },
    properties: ['versatile', 'topple'],
  },
};

const flail: Item = {
  id: 'srd-flail',
  name: 'Flail',
  category: 'weapon',
  description:
    'A spiked metal ball on a chain attached to a handle. Its unpredictable arc makes ' +
    'it difficult to parry.',
  weight: 2,
  cost: { amount: 10, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['mainHand'],
  tags: ['martial', 'melee'],
  weaponStats: {
    damage: { diceCount: 1, dieSize: 8, modifier: 0 },
    damageType: 'bludgeoning',
    properties: ['sap'],
  },
};

const glaive: Item = {
  id: 'srd-glaive',
  name: 'Glaive',
  category: 'weapon',
  description:
    'A long pole with a curved blade at the tip. Its reach lets you strike foes before they ' +
    'can close the distance.',
  weight: 6,
  cost: { amount: 20, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['twoHand'],
  tags: ['martial', 'melee'],
  weaponStats: {
    damage: { diceCount: 1, dieSize: 10, modifier: 0 },
    damageType: 'slashing',
    properties: ['heavy', 'reach', 'two-handed', 'graze'],
  },
};

const greataxe: Item = {
  id: 'srd-greataxe',
  name: 'Greataxe',
  category: 'weapon',
  description:
    'A massive two-handed axe that deals devastating cleaving blows. Favoured by barbarians ' +
    'and fighters who want raw damage.',
  weight: 7,
  cost: { amount: 30, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['twoHand'],
  tags: ['martial', 'melee'],
  weaponStats: {
    damage: { diceCount: 1, dieSize: 12, modifier: 0 },
    damageType: 'slashing',
    properties: ['heavy', 'two-handed', 'cleave'],
  },
};

const greatsword: Item = {
  id: 'srd-greatsword',
  name: 'Greatsword',
  category: 'weapon',
  description:
    'A massive two-handed sword. Its twin blades and weight make it one of the most ' +
    'devastating weapons available to martial fighters.',
  weight: 6,
  cost: { amount: 50, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['twoHand'],
  tags: ['martial', 'melee'],
  weaponStats: {
    damage: { diceCount: 2, dieSize: 6, modifier: 0 },
    damageType: 'slashing',
    properties: ['heavy', 'two-handed', 'graze'],
  },
};

const halberd: Item = {
  id: 'srd-halberd',
  name: 'Halberd',
  category: 'weapon',
  description:
    'A polearm combining an axe blade with a spear tip and a back-spike. Excellent at ' +
    'controlling space on the battlefield.',
  weight: 6,
  cost: { amount: 20, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['twoHand'],
  tags: ['martial', 'melee'],
  weaponStats: {
    damage: { diceCount: 1, dieSize: 10, modifier: 0 },
    damageType: 'slashing',
    properties: ['heavy', 'reach', 'two-handed', 'cleave'],
  },
};

const lance: Item = {
  id: 'srd-lance',
  name: 'Lance',
  category: 'weapon',
  description:
    'A long cavalry weapon designed to be used from horseback. You have disadvantage on attack ' +
    'rolls with a lance when you are within 5 feet of your target, and wielding a lance requires ' +
    'one hand while mounted.',
  weight: 6,
  cost: { amount: 10, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['mainHand'],
  tags: ['martial', 'melee'],
  weaponStats: {
    damage: { diceCount: 1, dieSize: 12, modifier: 0 },
    damageType: 'piercing',
    properties: ['reach', 'special', 'topple'],
  },
};

const longsword: Item = {
  id: 'srd-longsword',
  name: 'Longsword',
  category: 'weapon',
  description:
    'The quintessential knightly sword. Balanced for one-handed use, but can be gripped ' +
    'two-handed for heavier strikes (1d10 damage).',
  weight: 3,
  cost: { amount: 15, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['mainHand'],
  tags: ['martial', 'melee'],
  weaponStats: {
    damage: { diceCount: 1, dieSize: 8, modifier: 0 },
    damageType: 'slashing',
    secondaryDamage: { roll: { diceCount: 1, dieSize: 10, modifier: 0 }, type: 'slashing' },
    properties: ['versatile', 'sap'],
  },
};

const maul: Item = {
  id: 'srd-maul',
  name: 'Maul',
  category: 'weapon',
  description:
    'A massive two-headed hammer that crushes armour and bone. Brutally simple and effective.',
  weight: 10,
  cost: { amount: 10, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['twoHand'],
  tags: ['martial', 'melee'],
  weaponStats: {
    damage: { diceCount: 2, dieSize: 6, modifier: 0 },
    damageType: 'bludgeoning',
    properties: ['heavy', 'two-handed', 'topple'],
  },
};

const morningstar: Item = {
  id: 'srd-morningstar',
  name: 'Morningstar',
  category: 'weapon',
  description:
    'A spiked metal ball on a wooden haft. Designed to punch through armour and chain.',
  weight: 4,
  cost: { amount: 15, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['mainHand'],
  tags: ['martial', 'melee'],
  weaponStats: {
    damage: { diceCount: 1, dieSize: 8, modifier: 0 },
    damageType: 'piercing',
    properties: ['sap'],
  },
};

const pike: Item = {
  id: 'srd-pike',
  name: 'Pike',
  category: 'weapon',
  description:
    'An extremely long spear designed for formation fighting. Its exceptional reach lets you ' +
    'threaten enemies well before they can engage you.',
  weight: 18,
  cost: { amount: 5, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['twoHand'],
  tags: ['martial', 'melee'],
  weaponStats: {
    damage: { diceCount: 1, dieSize: 10, modifier: 0 },
    damageType: 'piercing',
    properties: ['heavy', 'reach', 'two-handed', 'push'],
  },
};

const rapier: Item = {
  id: 'srd-rapier',
  name: 'Rapier',
  category: 'weapon',
  description:
    'A slender thrusting sword with exceptional balance. Suited to duelists and rogues who ' +
    'favour speed and precision over brute force.',
  weight: 2,
  cost: { amount: 25, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['mainHand'],
  tags: ['martial', 'melee'],
  weaponStats: {
    damage: { diceCount: 1, dieSize: 8, modifier: 0 },
    damageType: 'piercing',
    properties: ['finesse', 'vex'],
  },
};

const scimitar: Item = {
  id: 'srd-scimitar',
  name: 'Scimitar',
  category: 'weapon',
  description:
    'A curved single-edged sword designed for fast, fluid slashing strikes. Excellent for ' +
    'dual-wielding.',
  weight: 3,
  cost: { amount: 25, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['mainHand', 'offHand'],
  tags: ['martial', 'melee'],
  weaponStats: {
    damage: { diceCount: 1, dieSize: 6, modifier: 0 },
    damageType: 'slashing',
    properties: ['finesse', 'light', 'nick'],
  },
};

const shortsword: Item = {
  id: 'srd-shortsword',
  name: 'Shortsword',
  category: 'weapon',
  description:
    'A nimble one-handed blade suited to close quarters. A staple weapon for rogues, ' +
    'rangers, and off-hand fighters.',
  weight: 2,
  cost: { amount: 10, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['mainHand', 'offHand'],
  tags: ['martial', 'melee'],
  weaponStats: {
    damage: { diceCount: 1, dieSize: 6, modifier: 0 },
    damageType: 'piercing',
    properties: ['finesse', 'light', 'vex'],
  },
};

const trident: Item = {
  id: 'srd-trident',
  name: 'Trident',
  category: 'weapon',
  description:
    'A three-pronged spear historically associated with sea-folk and gladiators. Can be ' +
    'thrown or wielded two-handed (1d8 damage).',
  weight: 4,
  cost: { amount: 5, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['mainHand'],
  tags: ['martial', 'melee'],
  weaponStats: {
    damage: { diceCount: 1, dieSize: 6, modifier: 0 },
    damageType: 'piercing',
    secondaryDamage: { roll: { diceCount: 1, dieSize: 8, modifier: 0 }, type: 'piercing' },
    range: { normal: 20, long: 60 },
    properties: ['thrown', 'versatile', 'topple'],
  },
};

const warPick: Item = {
  id: 'srd-war-pick',
  name: 'War Pick',
  category: 'weapon',
  description:
    'A military pick designed to punch through plate armour. Its narrow point concentrates ' +
    'force into a devastating blow.',
  weight: 2,
  cost: { amount: 5, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['mainHand'],
  tags: ['martial', 'melee'],
  weaponStats: {
    damage: { diceCount: 1, dieSize: 8, modifier: 0 },
    damageType: 'piercing',
    properties: ['sap'],
  },
};

const warhammer: Item = {
  id: 'srd-warhammer',
  name: 'Warhammer',
  category: 'weapon',
  description:
    'A heavy hammer built for war. Can be wielded one- or two-handed (1d10 damage), ' +
    'and excels at shattering armour.',
  weight: 2,
  cost: { amount: 15, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['mainHand'],
  tags: ['martial', 'melee'],
  weaponStats: {
    damage: { diceCount: 1, dieSize: 8, modifier: 0 },
    damageType: 'bludgeoning',
    secondaryDamage: { roll: { diceCount: 1, dieSize: 10, modifier: 0 }, type: 'bludgeoning' },
    properties: ['versatile', 'push'],
  },
};

const whip: Item = {
  id: 'srd-whip',
  name: 'Whip',
  category: 'weapon',
  description:
    'A long flexible lash. Its reach lets you strike at distance while its finesse allows ' +
    'Dexterity-based fighting.',
  weight: 3,
  cost: { amount: 2, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['mainHand'],
  tags: ['martial', 'melee'],
  weaponStats: {
    damage: { diceCount: 1, dieSize: 4, modifier: 0 },
    damageType: 'slashing',
    properties: ['finesse', 'reach', 'slow'],
  },
};

// ─────────────────────────────────────────────────────────────
// MARTIAL RANGED WEAPONS
// ─────────────────────────────────────────────────────────────

const blowgun: Item = {
  id: 'srd-blowgun',
  name: 'Blowgun',
  category: 'weapon',
  description:
    'A narrow tube used to propel needles by breath. Silent and concealable, ideal for ' +
    'assassins and scouts. Deals 1 piercing damage.',
  weight: 1,
  cost: { amount: 10, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['mainHand'],
  tags: ['martial', 'ranged'],
  weaponStats: {
    damage: { diceCount: 1, dieSize: 1, modifier: 0 },
    damageType: 'piercing',
    range: { normal: 25, long: 100 },
    properties: ['ammunition', 'loading', 'vex'],
  },
};

const handCrossbow: Item = {
  id: 'srd-hand-crossbow',
  name: 'Hand Crossbow',
  category: 'weapon',
  description:
    'A compact one-handed crossbow. Light enough to use in the off hand, making it popular ' +
    'with rogues who want to reload and shoot with one hand free.',
  weight: 3,
  cost: { amount: 75, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['mainHand', 'offHand'],
  tags: ['martial', 'ranged'],
  weaponStats: {
    damage: { diceCount: 1, dieSize: 6, modifier: 0 },
    damageType: 'piercing',
    range: { normal: 30, long: 120 },
    properties: ['ammunition', 'light', 'loading', 'vex'],
  },
};

const heavyCrossbow: Item = {
  id: 'srd-heavy-crossbow',
  name: 'Heavy Crossbow',
  category: 'weapon',
  description:
    'A powerful two-handed crossbow with a mechanical spanning mechanism. Hits harder than ' +
    'most bows but is slow to reload.',
  weight: 18,
  cost: { amount: 50, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['twoHand'],
  tags: ['martial', 'ranged'],
  weaponStats: {
    damage: { diceCount: 1, dieSize: 10, modifier: 0 },
    damageType: 'piercing',
    range: { normal: 100, long: 400 },
    properties: ['ammunition', 'heavy', 'loading', 'two-handed', 'push'],
  },
};

const longbow: Item = {
  id: 'srd-longbow',
  name: 'Longbow',
  category: 'weapon',
  description:
    'A tall bow that requires significant strength and training to use. In skilled hands it ' +
    'is one of the most effective ranged weapons available.',
  weight: 2,
  cost: { amount: 50, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['twoHand'],
  tags: ['martial', 'ranged'],
  weaponStats: {
    damage: { diceCount: 1, dieSize: 8, modifier: 0 },
    damageType: 'piercing',
    range: { normal: 150, long: 600 },
    properties: ['ammunition', 'heavy', 'two-handed', 'slow'],
  },
};

const net: Item = {
  id: 'srd-net',
  name: 'Net',
  category: 'weapon',
  description:
    'A weighted net used to restrain opponents. A Large or smaller creature hit by a net is ' +
    'restrained until it is freed. Escaping requires a DC 10 Strength check as an action. The ' +
    'net has no effect on creatures that are formless, or creatures that are Huge or larger. A ' +
    'net deals no damage.',
  weight: 3,
  cost: { amount: 1, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['mainHand'],
  tags: ['martial', 'ranged'],
  weaponStats: {
    damage: { diceCount: 0, dieSize: 4, modifier: 0 },
    damageType: 'bludgeoning',
    range: { normal: 5, long: 15 },
    properties: ['special', 'thrown'],
  },
};

// ─────────────────────────────────────────────────────────────
// LIGHT ARMOUR
// ─────────────────────────────────────────────────────────────

const paddedArmor: Item = {
  id: 'srd-padded-armor',
  name: 'Padded Armour',
  category: 'armor',
  description:
    'Quilted layers of cloth and batting. Cheap and light, but the bulk causes problems with ' +
    'stealth. AC = 11 + DEX modifier.',
  weight: 8,
  cost: { amount: 5, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['body'],
  tags: ['light armor'],
  armorStats: {
    baseAC: 11,
    stealthDisadvantage: true,
    properties: ['stealth disadvantage'],
  },
};

const leatherArmor: Item = {
  id: 'srd-leather-armor',
  name: 'Leather Armour',
  category: 'armor',
  description:
    'Boiled and hardened leather formed into a breastplate, with softer leather elsewhere. ' +
    'The lightest proper armour. AC = 11 + DEX modifier.',
  weight: 10,
  cost: { amount: 10, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['body'],
  tags: ['light armor'],
  armorStats: {
    baseAC: 11,
  },
};

const studdedLeatherArmor: Item = {
  id: 'srd-studded-leather-armor',
  name: 'Studded Leather Armour',
  category: 'armor',
  description:
    'Leather armour reinforced with close-set rivets or spikes. Offers better protection ' +
    'than plain leather while retaining flexibility. AC = 12 + DEX modifier.',
  weight: 13,
  cost: { amount: 45, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['body'],
  tags: ['light armor'],
  armorStats: {
    baseAC: 12,
  },
};

// ─────────────────────────────────────────────────────────────
// MEDIUM ARMOUR
// ─────────────────────────────────────────────────────────────

const hideArmor: Item = {
  id: 'srd-hide-armor',
  name: 'Hide Armour',
  category: 'armor',
  description:
    'Thick furs and pelts sewn together. Crude but available in the wilderness. ' +
    'AC = 12 + DEX modifier (max +2).',
  weight: 12,
  cost: { amount: 10, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['body'],
  tags: ['medium armor'],
  armorStats: {
    baseAC: 12,
    maxDexBonus: 2,
  },
};

const chainShirt: Item = {
  id: 'srd-chain-shirt',
  name: 'Chain Shirt',
  category: 'armor',
  description:
    'A shirt of interlocking metal rings worn over padding. Popular as a discreet ' +
    'protective layer. AC = 13 + DEX modifier (max +2).',
  weight: 20,
  cost: { amount: 50, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['body'],
  tags: ['medium armor'],
  armorStats: {
    baseAC: 13,
    maxDexBonus: 2,
  },
};

const scaleMail: Item = {
  id: 'srd-scale-mail',
  name: 'Scale Mail',
  category: 'armor',
  description:
    'Overlapping metal scales attached to a leather backing. Heavier than chain but offers ' +
    'solid protection. AC = 14 + DEX modifier (max +2). Imposes stealth disadvantage.',
  weight: 45,
  cost: { amount: 50, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['body'],
  tags: ['medium armor'],
  armorStats: {
    baseAC: 14,
    maxDexBonus: 2,
    stealthDisadvantage: true,
    properties: ['stealth disadvantage'],
  },
};

const breastplate: Item = {
  id: 'srd-breastplate',
  name: 'Breastplate',
  category: 'armor',
  description:
    'A fitted metal chest-piece with flexible leather protection for the limbs. Expensive ' +
    'but silent. AC = 14 + DEX modifier (max +2).',
  weight: 20,
  cost: { amount: 400, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['body'],
  tags: ['medium armor'],
  armorStats: {
    baseAC: 14,
    maxDexBonus: 2,
  },
};

const halfPlate: Item = {
  id: 'srd-half-plate',
  name: 'Half Plate',
  category: 'armor',
  description:
    'Shaped metal plates covering most of the body, with flexible sections at the joints. ' +
    'AC = 15 + DEX modifier (max +2). Imposes stealth disadvantage.',
  weight: 40,
  cost: { amount: 750, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['body'],
  tags: ['medium armor'],
  armorStats: {
    baseAC: 15,
    maxDexBonus: 2,
    stealthDisadvantage: true,
    properties: ['stealth disadvantage'],
  },
};

// ─────────────────────────────────────────────────────────────
// HEAVY ARMOUR
// ─────────────────────────────────────────────────────────────

const ringMail: Item = {
  id: 'srd-ring-mail',
  name: 'Ring Mail',
  category: 'armor',
  description:
    'Leather armour with heavy metal rings sewn onto it. An early form of heavy armour, ' +
    'inferior to chain mail but simpler to make. AC = 14. Grants no bonus from DEX.',
  weight: 40,
  cost: { amount: 30, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['body'],
  tags: ['heavy armor'],
  armorStats: {
    baseAC: 14,
    maxDexBonus: 0,
    stealthDisadvantage: true,
    properties: ['stealth disadvantage'],
  },
};

const chainMail: Item = {
  id: 'srd-chain-mail',
  name: 'Chain Mail',
  category: 'armor',
  description:
    'A full suit of interlocking metal rings. Requires a minimum of STR 13 to wear without ' +
    'suffering a speed penalty. AC = 16. Grants no bonus from DEX.',
  weight: 55,
  cost: { amount: 75, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['body'],
  tags: ['heavy armor'],
  armorStats: {
    baseAC: 16,
    maxDexBonus: 0,
    strengthRequired: 13,
    stealthDisadvantage: true,
    properties: ['stealth disadvantage'],
  },
};

const splint: Item = {
  id: 'srd-splint',
  name: 'Splint',
  category: 'armor',
  description:
    'Narrow vertical strips of metal riveted to a leather backing and chain, covering the ' +
    'entire body. Requires STR 15. AC = 17. Grants no bonus from DEX.',
  weight: 60,
  cost: { amount: 200, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['body'],
  tags: ['heavy armor'],
  armorStats: {
    baseAC: 17,
    maxDexBonus: 0,
    strengthRequired: 15,
    stealthDisadvantage: true,
    properties: ['stealth disadvantage'],
  },
};

const plateArmor: Item = {
  id: 'srd-plate-armor',
  name: 'Plate Armour',
  category: 'armor',
  description:
    'The pinnacle of mundane armour, consisting of shaped interlocking metal plates covering ' +
    'the entire body. Requires STR 15. AC = 18. Grants no bonus from DEX.',
  weight: 65,
  cost: { amount: 1500, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['body'],
  tags: ['heavy armor'],
  armorStats: {
    baseAC: 18,
    maxDexBonus: 0,
    strengthRequired: 15,
    stealthDisadvantage: true,
    properties: ['stealth disadvantage'],
  },
};

// ─────────────────────────────────────────────────────────────
// SHIELDS
// ─────────────────────────────────────────────────────────────

const shield: Item = {
  id: 'srd-shield',
  name: 'Shield',
  category: 'shield',
  description:
    'A wooden or metal disc carried in the off hand. Grants a +2 bonus to Armour Class while ' +
    'you are proficient with shields.',
  weight: 6,
  cost: { amount: 10, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  equipSlots: ['offHand'],
  tags: ['shield'],
  shieldStats: {
    acBonus: 2,
  },
};

// ─────────────────────────────────────────────────────────────
// AMMUNITION
// ─────────────────────────────────────────────────────────────

const arrows: Item = {
  id: 'srd-arrows',
  name: 'Arrows (20)',
  category: 'ammunition',
  description: 'A bundle of 20 wooden-shafted arrows for use with a shortbow or longbow.',
  weight: 1,
  cost: { amount: 1, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  stackable: true,
  tags: ['ammunition', 'bow'],
};

const crossbowBolts: Item = {
  id: 'srd-crossbow-bolts',
  name: 'Crossbow Bolts (20)',
  category: 'ammunition',
  description: 'A case of 20 short bolts for use with any crossbow.',
  weight: 1.5,
  cost: { amount: 1, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  stackable: true,
  tags: ['ammunition', 'crossbow'],
};

const blowgunNeedles: Item = {
  id: 'srd-blowgun-needles',
  name: 'Blowgun Needles (50)',
  category: 'ammunition',
  description: 'A pouch of 50 fine needles for use with a blowgun.',
  weight: 1,
  cost: { amount: 1, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  stackable: true,
  tags: ['ammunition', 'blowgun'],
};

const slingBullets: Item = {
  id: 'srd-sling-bullets',
  name: 'Sling Bullets (20)',
  category: 'ammunition',
  description: 'A pouch of 20 lead or stone balls for use with a sling.',
  weight: 1.5,
  cost: { amount: 4, currency: 'cp' },
  rarity: 'common',
  requiresAttunement: false,
  stackable: true,
  tags: ['ammunition', 'sling'],
};

// ─────────────────────────────────────────────────────────────
// ADVENTURING GEAR
// ─────────────────────────────────────────────────────────────

const backpack: Item = {
  id: 'srd-backpack',
  name: 'Backpack',
  category: 'gear',
  description:
    'A leather pack with multiple compartments. Can hold up to 30 pounds of gear and has a ' +
    'capacity of 1 cubic foot.',
  weight: 5,
  cost: { amount: 2, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  tags: ['container', 'exploration'],
};

const bedroll: Item = {
  id: 'srd-bedroll',
  name: 'Bedroll',
  category: 'gear',
  description: 'A padded roll of blankets and a mat. Provides a comfortable place to sleep outdoors.',
  weight: 7,
  cost: { amount: 1, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  tags: ['exploration', 'camp'],
};

const candle: Item = {
  id: 'srd-candle',
  name: 'Candle',
  category: 'gear',
  description:
    'A tallow or wax candle. For 1 hour, a candle sheds bright light in a 5-foot radius and ' +
    'dim light for an additional 5 feet.',
  weight: 0,
  cost: { amount: 1, currency: 'cp' },
  rarity: 'common',
  requiresAttunement: false,
  stackable: true,
  tags: ['light', 'exploration'],
};

const chain10ft: Item = {
  id: 'srd-chain',
  name: 'Chain (10 ft)',
  category: 'gear',
  description:
    'A 10-foot length of iron chain. Has 10 hit points and can be burst with a DC 20 Strength ' +
    'check. Often used to restrain prisoners or secure doors.',
  weight: 10,
  cost: { amount: 5, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  tags: ['exploration', 'utility'],
};

const chalk: Item = {
  id: 'srd-chalk',
  name: 'Chalk (1 piece)',
  category: 'gear',
  description: 'A stick of chalk for marking surfaces. Useful for mapping dungeons or leaving trail markers.',
  weight: 0,
  cost: { amount: 1, currency: 'cp' },
  rarity: 'common',
  requiresAttunement: false,
  stackable: true,
  tags: ['exploration', 'utility'],
};

const crowbar: Item = {
  id: 'srd-crowbar',
  name: 'Crowbar',
  category: 'gear',
  description:
    'A steel pry bar. Using a crowbar grants advantage on Strength checks where the crowbar\'s ' +
    'leverage can be applied, such as forcing open a door or a stuck chest.',
  weight: 5,
  cost: { amount: 2, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  tags: ['exploration', 'utility'],
};

const grapplingHook: Item = {
  id: 'srd-grappling-hook',
  name: 'Grappling Hook',
  category: 'gear',
  description:
    'A metal hook with multiple tines, attached to a rope. Can be thrown to latch onto edges ' +
    'and ledges, allowing you to climb using the attached rope.',
  weight: 4,
  cost: { amount: 2, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  tags: ['exploration', 'climbing'],
};

const hammer: Item = {
  id: 'srd-hammer',
  name: 'Hammer',
  category: 'gear',
  description:
    'A small steel-headed hammer. Used for driving pitons, breaking objects, or light construction.',
  weight: 3,
  cost: { amount: 1, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  tags: ['exploration', 'utility'],
};

const healersKit: Item = {
  id: 'srd-healers-kit',
  name: "Healer's Kit",
  category: 'gear',
  description:
    'A pouch of bandages, salves, and splints. The kit has 10 uses. As an action, you can ' +
    'expend one use to stabilise a creature that has 0 hit points, without needing to make a ' +
    'Wisdom (Medicine) check.',
  weight: 3,
  cost: { amount: 5, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  tags: ['healing', 'utility'],
  charges: { max: 10, rechargeOn: 'never' },
};

const holySymbol: Item = {
  id: 'srd-holy-symbol',
  name: 'Holy Symbol',
  category: 'gear',
  description:
    'A representation of a god or pantheon. A cleric or paladin can use a holy symbol as a ' +
    'spellcasting focus. The symbol can be an amulet, embossed shield, or engraved emblem.',
  weight: 1,
  cost: { amount: 5, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  tags: ['spellcasting', 'focus'],
};

const bullseyeLantern: Item = {
  id: 'srd-bullseye-lantern',
  name: 'Lantern, Bullseye',
  category: 'gear',
  description:
    'A lantern with a focused beam. Casts bright light in a 60-foot cone and dim light for ' +
    'an additional 60 feet. Burns for 6 hours on one flask of oil.',
  weight: 2,
  cost: { amount: 10, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  tags: ['light', 'exploration'],
};

const hoodedLantern: Item = {
  id: 'srd-hooded-lantern',
  name: 'Lantern, Hooded',
  category: 'gear',
  description:
    'A shuttered lantern that sheds bright light in a 30-foot radius and dim light for an ' +
    'additional 30 feet. Can be closed to reduce to dim light in a 5-foot radius. Burns for ' +
    '6 hours on one flask of oil.',
  weight: 2,
  cost: { amount: 5, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  tags: ['light', 'exploration'],
};

const steelMirror: Item = {
  id: 'srd-steel-mirror',
  name: 'Mirror, Steel',
  category: 'gear',
  description:
    'A small, polished steel mirror. Useful for signalling, peeking around corners, or ' +
    'avoiding the direct gaze of basilisks and similar creatures.',
  weight: 0.5,
  cost: { amount: 5, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  tags: ['exploration', 'utility'],
};

const oilFlask: Item = {
  id: 'srd-oil',
  name: 'Oil (flask)',
  category: 'gear',
  description:
    'A glass flask of lamp oil. Can fuel a lantern for 6 hours. As an action, you can splash ' +
    'the oil up to 20 feet. A creature doused in oil that takes fire damage burns for 5 (1d10) ' +
    'fire damage at the start of its next turn.',
  weight: 1,
  cost: { amount: 1, currency: 'sp' },
  rarity: 'common',
  requiresAttunement: false,
  stackable: true,
  tags: ['light', 'utility', 'consumable'],
};

const pouch: Item = {
  id: 'srd-pouch',
  name: 'Pouch',
  category: 'gear',
  description:
    'A cloth or leather pouch that can hold up to 6 pounds and ⅕ of a cubic foot of gear, ' +
    'including up to 1,000 coins.',
  weight: 1,
  cost: { amount: 5, currency: 'sp' },
  rarity: 'common',
  requiresAttunement: false,
  tags: ['container'],
};

const rations: Item = {
  id: 'srd-rations',
  name: 'Rations (1 day)',
  category: 'gear',
  description:
    'One day\'s supply of trail food — dried meat, dried fruit, hardtack, and nuts. Provides ' +
    'enough nutrition to sustain one Medium creature for one day.',
  weight: 2,
  cost: { amount: 5, currency: 'sp' },
  rarity: 'common',
  requiresAttunement: false,
  stackable: true,
  tags: ['food', 'exploration', 'consumable'],
};

const hempenRope: Item = {
  id: 'srd-hempen-rope',
  name: 'Rope, Hempen (50 ft)',
  category: 'gear',
  description:
    'A 50-foot coil of twisted hemp rope. Has 2 hit points and can be burst with a DC 17 ' +
    'Strength check.',
  weight: 10,
  cost: { amount: 1, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  tags: ['exploration', 'climbing', 'utility'],
};

const silkRope: Item = {
  id: 'srd-silk-rope',
  name: 'Rope, Silk (50 ft)',
  category: 'gear',
  description:
    'A 50-foot coil of strong silk rope. Has 2 hit points and can be burst with a DC 17 ' +
    'Strength check. Lighter and easier to handle than hempen rope.',
  weight: 5,
  cost: { amount: 10, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  tags: ['exploration', 'climbing', 'utility'],
};

const spellComponentPouch: Item = {
  id: 'srd-spell-component-pouch',
  name: 'Spell Component Pouch',
  category: 'gear',
  description:
    'A small watertight pouch containing material components for spells, as well as other ' +
    'special items. A spellcaster can use a component pouch in place of any material component ' +
    'that has no listed cost.',
  weight: 2,
  cost: { amount: 25, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  tags: ['spellcasting', 'focus'],
};

const spellbook: Item = {
  id: 'srd-spellbook',
  name: 'Spellbook',
  category: 'gear',
  description:
    'An ornate leather-bound tome of 100 vellum pages. Essential for wizards — contains ' +
    'the magical formulae for spells prepared each day.',
  weight: 3,
  cost: { amount: 50, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  tags: ['spellcasting', 'wizard'],
};

const tinderbox: Item = {
  id: 'srd-tinderbox',
  name: 'Tinderbox',
  category: 'gear',
  description:
    'A small container holding flint, fire steel, and tinder. Using it to light a torch — ' +
    'or anything else with exposed fuel — takes 1 minute. Lighting any other fire takes longer.',
  weight: 1,
  cost: { amount: 5, currency: 'sp' },
  rarity: 'common',
  requiresAttunement: false,
  tags: ['exploration', 'utility'],
};

const torch: Item = {
  id: 'srd-torch',
  name: 'Torch',
  category: 'gear',
  description:
    'A wooden stick wrapped in oil-soaked cloth. Burns for 1 hour, shedding bright light in ' +
    'a 20-foot radius and dim light for an additional 20 feet. Can also be used as a melee ' +
    'weapon dealing 1 fire damage on a hit.',
  weight: 1,
  cost: { amount: 1, currency: 'cp' },
  rarity: 'common',
  requiresAttunement: false,
  stackable: true,
  tags: ['light', 'exploration', 'consumable'],
};

const waterskin: Item = {
  id: 'srd-waterskin',
  name: 'Waterskin',
  category: 'gear',
  description:
    'A leather pouch that can hold 4 pints of liquid. Full weight is 5 lbs; empty weight ' +
    'is 0.5 lbs.',
  weight: 5,
  cost: { amount: 2, currency: 'sp' },
  rarity: 'common',
  requiresAttunement: false,
  tags: ['exploration', 'utility'],
};

// ─────────────────────────────────────────────────────────────
// ARTISAN TOOLS & KITS
// ─────────────────────────────────────────────────────────────

const alchemistsSupplies: Item = {
  id: 'srd-alchemists-supplies',
  name: "Alchemist's Supplies",
  category: 'tool',
  description:
    'Includes two glass beakers, a metal frame for holding a beaker over a flame, a glass ' +
    'stirring rod, a small mortar and pestle, and a pouch of common alchemical ingredients. ' +
    'Proficiency allows you to create alchemical items such as acid or alchemist\'s fire.',
  weight: 8,
  cost: { amount: 50, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  tags: ['artisan tools', 'crafting'],
};

const brewersSupplies: Item = {
  id: 'srd-brewers-supplies',
  name: "Brewer's Supplies",
  category: 'tool',
  description:
    'Includes a large glass jug, a quantity of hops, a siphon, and several feet of tubing. ' +
    'Proficiency allows you to create ales, wines, and other fermented beverages.',
  weight: 9,
  cost: { amount: 20, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  tags: ['artisan tools', 'crafting'],
};

const calligraphersSupplies: Item = {
  id: 'srd-calligraphers-supplies',
  name: "Calligrapher's Supplies",
  category: 'tool',
  description:
    'Includes 5 sheets of parchment, 3 vials of ink, and a selection of quills. Proficiency ' +
    'allows you to produce attractive script and reproduce or forge documents.',
  weight: 5,
  cost: { amount: 10, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  tags: ['artisan tools', 'crafting'],
};

const carpenterTools: Item = {
  id: 'srd-carpenters-tools',
  name: "Carpenter's Tools",
  category: 'tool',
  description:
    'Includes a saw, a hammer, nails, a hatchet, a square, a ruler, an adze, a plane, and ' +
    'a chisel. Proficiency allows you to construct wooden objects and structures.',
  weight: 6,
  cost: { amount: 8, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  tags: ['artisan tools', 'crafting'],
};

const cartographersTools: Item = {
  id: 'srd-cartographers-tools',
  name: "Cartographer's Tools",
  category: 'tool',
  description:
    'Includes a quill, ink, parchment, a pair of compasses, calipers, and a ruler. ' +
    'Proficiency allows you to create accurate maps and determine where you are on an ' +
    'existing map.',
  weight: 6,
  cost: { amount: 15, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  tags: ['artisan tools', 'crafting', 'exploration'],
};

const cobblersTools: Item = {
  id: 'srd-cobblers-tools',
  name: "Cobbler's Tools",
  category: 'tool',
  description:
    'Includes a hammer, an awl, a knife, a shoe stand, a cutter, spare leather, and thread. ' +
    'Proficiency allows you to craft and repair footwear.',
  weight: 5,
  cost: { amount: 5, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  tags: ['artisan tools', 'crafting'],
};

const cooksUtensils: Item = {
  id: 'srd-cooks-utensils',
  name: "Cook's Utensils",
  category: 'tool',
  description:
    'Includes a metal pot, a pan, cutlery, plates, and a stirring spoon. Proficiency allows ' +
    'you to prepare nourishing meals that grant small bonuses to recovery.',
  weight: 8,
  cost: { amount: 1, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  tags: ['artisan tools', 'crafting'],
};

const disguiseKit: Item = {
  id: 'srd-disguise-kit',
  name: 'Disguise Kit',
  category: 'tool',
  description:
    'A pouch containing cosmetics, hair dye, small props, and a few pieces of costume. ' +
    'Proficiency allows you to create disguises that change your appearance.',
  weight: 3,
  cost: { amount: 25, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  tags: ['kit', 'deception'],
};

const forgeryKit: Item = {
  id: 'srd-forgery-kit',
  name: 'Forgery Kit',
  category: 'tool',
  description:
    'A small box containing a variety of papers and parchments, pens and inks, wax, seals, ' +
    'and other materials. Proficiency allows you to create forged documents and copies of ' +
    'existing documents.',
  weight: 5,
  cost: { amount: 15, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  tags: ['kit', 'deception'],
};

const glassblowersTools: Item = {
  id: 'srd-glassblowers-tools',
  name: "Glassblower's Tools",
  category: 'tool',
  description:
    'Includes a blowpipe, a small marver, blocks, and tweezers. Proficiency allows you to ' +
    'craft glass objects such as vials, lenses, and ornaments.',
  weight: 5,
  cost: { amount: 30, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  tags: ['artisan tools', 'crafting'],
};

const herbalismKit: Item = {
  id: 'srd-herbalism-kit',
  name: 'Herbalism Kit',
  category: 'tool',
  description:
    'Includes clippers, a mortar and pestle, pouches, and vials used by herbalists to create ' +
    'remedies and poultices. Proficiency allows you to identify plants and craft items such as ' +
    'antitoxin and healing potions.',
  weight: 3,
  cost: { amount: 5, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  tags: ['kit', 'healing', 'crafting'],
};

const jewelersTools: Item = {
  id: 'srd-jewelers-tools',
  name: "Jeweler's Tools",
  category: 'tool',
  description:
    'Includes a small saw and hammer, files, pliers, and tweezers. Proficiency allows you to ' +
    'identify and appraise gems and jewellery, and craft jewellery items.',
  weight: 2,
  cost: { amount: 25, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  tags: ['artisan tools', 'crafting'],
};

const leatherworkersTools: Item = {
  id: 'srd-leatherworkers-tools',
  name: "Leatherworker's Tools",
  category: 'tool',
  description:
    'Includes a knife, a small mallet, an edger, a hole punch, thread, and leather scraps. ' +
    'Proficiency allows you to craft leather items such as armour, belts, and pouches.',
  weight: 5,
  cost: { amount: 5, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  tags: ['artisan tools', 'crafting'],
};

const masonsTools: Item = {
  id: 'srd-masons-tools',
  name: "Mason's Tools",
  category: 'tool',
  description:
    'Includes a trowel, a hammer, a chisel, brushes, and a square. Proficiency allows you to ' +
    'cut stone, lay brickwork, and construct stone structures.',
  weight: 8,
  cost: { amount: 10, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  tags: ['artisan tools', 'crafting'],
};

const navigatorsTools: Item = {
  id: 'srd-navigators-tools',
  name: "Navigator's Tools",
  category: 'tool',
  description:
    'Includes a sextant, a compass, calipers, a ruler, parchment, ink, and a quill. ' +
    'Proficiency allows you to chart a course, avoid hazards at sea, and determine your ' +
    'position without a map.',
  weight: 2,
  cost: { amount: 25, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  tags: ['artisan tools', 'exploration', 'nautical'],
};

const paintersSupplies: Item = {
  id: 'srd-painters-supplies',
  name: "Painter's Supplies",
  category: 'tool',
  description:
    'Includes an easel, canvas, paints, brushes, charcoal sticks, and a palette. Proficiency ' +
    'allows you to create artwork, copy paintings, or disguise surfaces.',
  weight: 5,
  cost: { amount: 10, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  tags: ['artisan tools', 'crafting'],
};

const poisonersKit: Item = {
  id: 'srd-poisoners-kit',
  name: "Poisoner's Kit",
  category: 'tool',
  description:
    'Includes glass vials, a mortar and pestle, chemicals, and a set of syringes. Proficiency ' +
    'allows you to create poisons and antidotes, and to identify existing poisons.',
  weight: 2,
  cost: { amount: 50, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  tags: ['kit', 'crafting'],
};

const pottersTools: Item = {
  id: 'srd-potters-tools',
  name: "Potter's Tools",
  category: 'tool',
  description:
    'Includes potter\'s needles, ribs, scrapers, a knife, and calipers. Proficiency allows ' +
    'you to create clay items such as pots, jugs, and tiles.',
  weight: 3,
  cost: { amount: 10, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  tags: ['artisan tools', 'crafting'],
};

const smithsTools: Item = {
  id: 'srd-smiths-tools',
  name: "Smith's Tools",
  category: 'tool',
  description:
    'Includes hammers, tongs, a file, a whetstone, and leather apron and gloves. Proficiency ' +
    'allows you to smith metal items including weapons, armour, and ironmongery.',
  weight: 8,
  cost: { amount: 20, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  tags: ['artisan tools', 'crafting'],
};

const thievesTools: Item = {
  id: 'srd-thieves-tools',
  name: "Thieves' Tools",
  category: 'tool',
  description:
    'Includes a small file, a set of lock picks, a small mirror on a metal handle, narrow ' +
    'scissors, and a pair of pliers. Proficiency allows you to pick locks and disarm traps.',
  weight: 1,
  cost: { amount: 25, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  tags: ['kit', 'roguish'],
};

const tinkersTools: Item = {
  id: 'srd-tinkers-tools',
  name: "Tinker's Tools",
  category: 'tool',
  description:
    'Includes a variety of hand tools, thread, needles, a whetstone, scraps of cloth and ' +
    'leather, and small pieces of wood. Proficiency allows you to repair and construct small ' +
    'mechanical devices.',
  weight: 10,
  cost: { amount: 50, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  tags: ['artisan tools', 'crafting', 'mechanical'],
};

const weaversTools: Item = {
  id: 'srd-weavers-tools',
  name: "Weaver's Tools",
  category: 'tool',
  description:
    'Includes thread, needles, and scraps of cloth. Proficiency allows you to create or ' +
    'repair cloth garments and other woven items.',
  weight: 5,
  cost: { amount: 1, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  tags: ['artisan tools', 'crafting'],
};

const woodcarversTools: Item = {
  id: 'srd-woodcarvers-tools',
  name: "Woodcarver's Tools",
  category: 'tool',
  description:
    'Includes a knife, a gouge, and a small saw. Proficiency allows you to carve and shape ' +
    'wood into functional and decorative objects, including wooden weapons and ammunition.',
  weight: 5,
  cost: { amount: 1, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  tags: ['artisan tools', 'crafting'],
};

// ─────────────────────────────────────────────────────────────
// POTIONS
// ─────────────────────────────────────────────────────────────

const potionOfHealing: Item = {
  id: 'srd-potion-healing',
  name: 'Potion of Healing',
  category: 'potion',
  description:
    'A bright-red liquid that glimmers when agitated. Drinking this potion restores 2d4+2 ' +
    'hit points. Drinking or administering a potion takes a bonus action.',
  weight: 0.5,
  cost: { amount: 50, currency: 'gp' },
  rarity: 'common',
  requiresAttunement: false,
  stackable: true,
  tags: ['healing', 'consumable', 'magic'],
};

// ─────────────────────────────────────────────────────────────
// FULL COLLECTION
// ─────────────────────────────────────────────────────────────

export const SRD_ITEMS: Item[] = [
  // Simple melee weapons
  club, dagger, greatclub, handaxe, javelin, lightHammer, mace, quarterstaff, sickle, spear,
  // Simple ranged weapons
  lightCrossbow, dart, shortbow, sling,
  // Martial melee weapons
  battleaxe, flail, glaive, greataxe, greatsword, halberd, lance, longsword, maul,
  morningstar, pike, rapier, scimitar, shortsword, trident, warPick, warhammer, whip,
  // Martial ranged weapons
  blowgun, handCrossbow, heavyCrossbow, longbow, net,
  // Light armour
  paddedArmor, leatherArmor, studdedLeatherArmor,
  // Medium armour
  hideArmor, chainShirt, scaleMail, breastplate, halfPlate,
  // Heavy armour
  ringMail, chainMail, splint, plateArmor,
  // Shields
  shield,
  // Ammunition
  arrows, crossbowBolts, blowgunNeedles, slingBullets,
  // Adventuring gear
  backpack, bedroll, candle, chain10ft, chalk, crowbar, grapplingHook, hammer,
  healersKit, holySymbol, bullseyeLantern, hoodedLantern, steelMirror, oilFlask,
  pouch, rations, hempenRope, silkRope, spellComponentPouch, spellbook, tinderbox,
  torch, waterskin,
  // Tools
  alchemistsSupplies, brewersSupplies, calligraphersSupplies, carpenterTools,
  cartographersTools, cobblersTools, cooksUtensils, disguiseKit, forgeryKit,
  glassblowersTools, herbalismKit, jewelersTools, leatherworkersTools, masonsTools,
  navigatorsTools, paintersSupplies, poisonersKit, pottersTools, smithsTools,
  thievesTools, tinkersTools, weaversTools, woodcarversTools,
  // Potions
  potionOfHealing,
];

// ─────────────────────────────────────────────────────────────
// SEED FUNCTION
// ─────────────────────────────────────────────────────────────

/**
 * Upserts all SRD items into the database.
 * Safe to run multiple times — existing records are updated, not duplicated.
 *
 * Run seedSrdProperties() first so that property tooltips resolve correctly.
 */
export async function seedSrdItems(): Promise<void> {
  for (const item of SRD_ITEMS) {
    await upsertItem(item);
  }
}
