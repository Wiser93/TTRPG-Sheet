/**
 * Elemental Path features — Water, Earth, Fire, Air
 *
 * Each is an isPath feature with 4 tiers (Stillness/Current/Tide/Ocean, etc.).
 * Include in elementalShaperFeatures for DB seeding.
 */

import type { Feature } from '@/types/game';

// ── Water ──────────────────────────────────────────────────────

export const pathWater: Feature = {
  id: 'path-water',
  name: 'Water Path',
  description: 'You walk the path of Water, mastering flow, deflection, and healing.',
  actionType: 'passive',
  tags: ['elemental-path', 'water'],
  color: '#61afef',
  icon: '💧',
  isPath: true,
  pathTiers: [
    {
      tier: 1,
      name: 'Stillness',
      rechargeDescription: 'If you are the target of an attack and use a reaction during a single round, regain 1 expended EC.',
      boostDescription: '',
      features: [
        {
          id: 'path-water-t1-riptide-step',
          name: 'Riptide Step',
          actionType: 'reaction',
          cost: '1 EC',
          description: 'When you are hit with a melee attack, spend 1 EC to move 10ft without provoking opportunity attacks and reduce the damage by your WIS modifier.',
          tags: ['water', 'reaction', 'defensive'],
        },
        {
          id: 'path-water-t1-flowing-form',
          name: 'Flowing Form',
          actionType: 'passive',
          description: 'You can move through spaces occupied by hostile creatures as if they were difficult terrain. You have advantage on checks to escape grapples or being restrained.',
          tags: ['water', 'passive', 'mobility'],
        },
      ],
    },
    {
      tier: 2,
      name: 'Current',
      boostDescription: 'If an ally within 10 feet is targeted by a melee attack, you may use Riptide Step to swap places with them before the attack roll, becoming the new target. If you are hit, you may continue with Riptide Step\'s original function as part of the same reaction.',
      choices: [
        {
          id: 'water-t2-augment',
          label: 'Water Augment (Tier 2)',
          type: 'custom_feature',
          count: 1,
          options: [
            {
              id: 'crashing-wave',
              label: 'Crashing Wave',
              description: 'Action / 2 EC — Send a 15ft wide wave 15ft out. Strength save or pushed back; collisions knock prone and deal 2d6 bludgeoning.',
            },
            {
              id: 'mist-veil',
              label: 'Mist Veil',
              description: 'Bonus / 1 EC — Until next turn: lightly obscured, disadvantage on first ranged attack against you. If you move 10ft+, make a Stealth check even if observed.',
            },
            {
              id: 'hydrostatic-armor',
              label: 'Hydrostatic Armor',
              description: 'Passive — When you have no armour or shield, AC = 13 + WIS modifier.',
            },
          ],
        },
      ],
    },
    {
      tier: 3,
      name: 'Tide',
      boostDescription: 'If Riptide Step is used to swap with an ally, impose disadvantage on the attack; you can utilise the move after the attack, even if it misses. When you move away using Riptide Step you may leave a slick 5ft radius (DEX save to move through, fail = prone).',
      choices: [
        {
          id: 'water-t3-augment',
          label: 'Water Augment (Tier 3)',
          type: 'custom_feature',
          count: 1,
          options: [
            {
              id: 'healing-wave',
              label: 'Healing Wave',
              description: 'Action / 3 EC — Restore (Prof)d6 + WIS HP to a creature within 30ft.',
            },
            {
              id: 'tidal-chains',
              label: 'Tidal Chains',
              description: 'Action / 1 EC — Pull a creature within 30ft 15ft toward you. Strength save to prevent; on fail, movement halved until end of next turn.',
            },
            {
              id: 'ebb-and-flow',
              label: 'Ebb and Flow',
              description: 'Passive — Once per turn, when a creature misses you with a melee attack, make an attack roll against a different creature within 5ft. Deals damage equal to your WIS modifier of the original attack\'s type.',
            },
          ],
        },
      ],
    },
    {
      tier: 4,
      name: 'Ocean',
      boostDescription: 'Riptide now has no EC cost, the step expands to allies within 15ft and the movement afterwards increases to 15ft. Gain 1 Water Augment you didn\'t take from a previous tier.',
      choices: [
        {
          id: 'water-t4-augment',
          label: 'Water Augment (Tier 4)',
          type: 'custom_feature',
          count: 1,
          options: [
            {
              id: 'flowmasters-grace',
              label: "Flowmaster's Grace",
              description: 'Passive — When you move through a hostile creature\'s space, they must succeed on a DEX save or be unbalanced until end of their next turn: can\'t take reactions, speed halved.',
            },
            {
              id: 'ice-prison',
              label: 'Ice Prison',
              description: 'Action / 5 EC — Conjure a 15ft sphere of ice centred within 30ft (1 min, AC 12, 75 HP, vulnerable to fire). Transparent or opaque. Enemies inside take 1d6 cold at start of their turn.',
            },
            {
              id: 'moonwater',
              label: 'Moonwater',
              description: 'Action / X EC — Choose up to WIS modifier creatures within 15ft. Each regains Xd6 HP, moves 5ft freely, and ends one condition: Blinded, Charmed, Deafened, Frightened, Incapacitated, Paralyzed, Poisoned, or Stunned.',
            },
          ],
        },
      ],
    },
  ],
};

// ── Earth ──────────────────────────────────────────────────────

export const pathEarth: Feature = {
  id: 'path-earth',
  name: 'Earth Path',
  description: 'You walk the path of Earth, mastering control, endurance, and stone.',
  actionType: 'passive',
  tags: ['elemental-path', 'earth'],
  color: '#e5c07b',
  icon: '🪨',
  isPath: true,
  pathTiers: [
    {
      tier: 1,
      name: 'Rooted',
      rechargeDescription: 'When you don\'t move on your turn (including forced movement), regain 1 expended EC.',
      features: [
        {
          id: 'path-earth-t1-earthen-grasp',
          name: 'Earthen Grasp',
          actionType: 'action',
          cost: '1 EC',
          description: 'Expend 1 EC to create a grasping hand of stone. A target within 30ft must make a Strength save or be restrained (save ends at end of turn).',
          tags: ['earth', 'control'],
        },
        {
          id: 'path-earth-t1-stones-endurance',
          name: "Stone's Endurance",
          actionType: 'passive',
          description: 'When a creature\'s attack roll against you exceeds your AC by less than your proficiency bonus, reduce the damage you take by your WIS modifier.',
          tags: ['earth', 'passive', 'defensive'],
        },
      ],
    },
    {
      tier: 2,
      name: 'Mantle',
      boostDescription: 'Earthen Grasp can now affect up to 2 creatures within 30ft (one target per EC spent). You may also choose to knock the target prone instead of restraining it.',
      choices: [
        {
          id: 'earth-t2-augment',
          label: 'Earth Augment (Tier 2)',
          type: 'custom_feature',
          count: 1,
          options: [
            {
              id: 'stonewall',
              label: 'Stonewall',
              description: 'Action / 1 EC — Create a 10ft×10ft×2ft wall of stone within 30ft (AC 12, 20 HP). May be at an angle, including horizontal.',
            },
            {
              id: 'bulwark-step',
              label: 'Bulwark Step',
              description: 'Reaction / 1 EC — When you or an ally within 5ft is hit by an attack, raise a slab of stone reducing damage by 1d10 + WIS.',
            },
            {
              id: 'gravity-anchor',
              label: 'Gravity Anchor',
              description: 'Passive — Advantage on checks and saves against forced movement or being knocked prone.',
            },
          ],
        },
      ],
    },
    {
      tier: 3,
      name: 'Pillar',
      boostDescription: 'While a creature is restrained or prone due to your Earth techniques it cannot take reactions and takes bludgeoning damage equal to your WIS modifier at the start of its turn.',
      choices: [
        {
          id: 'earth-t3-augment',
          label: 'Earth Augment (Tier 3)',
          type: 'custom_feature',
          count: 1,
          options: [
            {
              id: 'tectonic-tremor',
              label: 'Tectonic Tremor',
              description: 'Action / 2 EC — All creatures of your choice in a 20ft radius make a Strength save or fall prone and take (Prof)d6 bludgeoning. Area is difficult terrain until cleared.',
            },
            {
              id: 'living-stone',
              label: 'Living Stone',
              description: 'Bonus / 2 EC — Gain resistance to all damage until the start of your next turn.',
            },
            {
              id: 'geomantic-pulse',
              label: 'Geomantic Pulse',
              description: "Passive — Whenever you end your turn on stone or earth, regain 1 temp HP per EC remaining (up to the amount from the last Stone's Endurance). Happens after recharge trigger.",
            },
          ],
        },
      ],
    },
    {
      tier: 4,
      name: 'Mountain',
      boostDescription: 'Earthen Grasp can now be used as a bonus action. You also create a 5ft radius zone of difficult terrain around the target. Gain 1 Earth Augment you didn\'t take from a previous tier.',
      choices: [
        {
          id: 'earth-t4-augment',
          label: 'Earth Augment (Tier 4)',
          type: 'custom_feature',
          count: 1,
          options: [
            {
              id: 'ironcore-bastion',
              label: 'Ironcore Bastion',
              description: 'Action / 5 EC — For 1 minute, emit an aura (10ft radius) granting you and allies +3 AC and creating difficult terrain that moves with you.',
            },
            {
              id: 'stonecrush',
              label: 'Stonecrush',
              description: 'Action / 3 EC — Choose a target restrained by Earthen Grasp; deal 3d6 bludgeoning and inflict a level of exhaustion.',
            },
            {
              id: 'stonegrip-mantle',
              label: 'Stonegrip Mantle',
              description: 'Passive — When you have fewer than 5 EC and are hit by a melee attack, the attacker makes a Strength save. On a fail, push back 15ft and restrain with Earthen Grasp (no EC cost). Once per turn, can trigger even if unconscious.',
            },
          ],
        },
      ],
    },
  ],
};

// ── Fire ───────────────────────────────────────────────────────

export const pathFire: Feature = {
  id: 'path-fire',
  name: 'Fire Path',
  description: 'You walk the path of Fire, mastering aggression, momentum, and burning.',
  actionType: 'passive',
  tags: ['elemental-path', 'fire'],
  color: '#e06c75',
  icon: '🔥',
  isPath: true,
  pathTiers: [
    {
      tier: 1,
      name: 'The Flame Within',
      rechargeDescription: 'When you reduce an enemy to 0 hit points with Fire damage, regain 1 expended EC.',
      features: [
        {
          id: 'path-fire-t1-flame-lash',
          name: 'Flame Lash',
          actionType: 'bonus_action',
          cost: '1 EC',
          description: 'Create a whip of flame. Make a melee spell attack (reach 15ft); on hit, deal (Prof)d6 Fire damage and pull the target up to 10ft toward you.',
          tags: ['fire', 'attack', 'pull'],
        },
        {
          id: 'path-fire-t1-kindled-motion',
          name: 'Kindled Motion',
          actionType: 'passive',
          description: 'Your movement speed increases by 10ft while below half hit points.',
          tags: ['fire', 'passive', 'mobility'],
        },
      ],
    },
    {
      tier: 2,
      name: 'Kindling',
      boostDescription: 'Flame Lash now deals (Prof)d8 Fire and Ignites the target (1d6 at the start of their turn, DC 13 Con save ends at end of turn).',
      choices: [
        {
          id: 'fire-t2-augment',
          label: 'Fire Augment (Tier 2)',
          type: 'custom_feature',
          count: 1,
          options: [
            {
              id: 'scorching-arc',
              label: 'Scorching Arc',
              description: 'Action / 2 EC — 30ft × 5ft line. DEX save or 4d6 fire + Ignite.',
            },
            {
              id: 'firebrand',
              label: 'Firebrand',
              description: 'Reaction / 1 EC — When hit by a melee attack, the attacker takes (Prof)d4 Fire damage.',
            },
            {
              id: 'searing-momentum',
              label: 'Searing Momentum',
              description: 'Passive — After using all of your movement, your next melee attack that turn deals +1d8 Fire.',
            },
          ],
        },
      ],
    },
    {
      tier: 3,
      name: 'Blaze',
      boostDescription: 'Fire damage from class features ignores resistance. Flame Lash range increases to 20ft, the pull increases to 15ft.',
      choices: [
        {
          id: 'fire-t3-augment',
          label: 'Fire Augment (Tier 3)',
          type: 'custom_feature',
          count: 1,
          options: [
            {
              id: 'inferno-halo',
              label: 'Inferno Halo',
              description: 'Passive — At the start of your turn, enemies within 5ft take 1 Fire damage per EC you have.',
            },
            {
              id: 'ashen-grasp',
              label: 'Ashen Grasp',
              description: 'Action / 1 EC — Touch attack. Until end of their next turn, target is Ash-Marked: takes 1d10 Fire damage whenever they take an action, a bonus action, or move.',
            },
            {
              id: 'explosive-cast',
              label: 'Explosive Cast',
              description: 'Passive — If you reduce a creature to 0 HP with Fire damage, creatures within 5ft take Fire damage equal to your WIS modifier.',
            },
          ],
        },
      ],
    },
    {
      tier: 4,
      name: 'Inferno',
      boostDescription: 'Flame Lash now Ignites enemies within 5ft of the target at any point during the pull. Gain 1 Fire Augment you didn\'t take from a previous tier.',
      choices: [
        {
          id: 'fire-t4-augment',
          label: 'Fire Augment (Tier 4)',
          type: 'custom_feature',
          count: 1,
          options: [
            {
              id: 'phoenix-bloom',
              label: 'Phoenix Bloom',
              description: 'Bonus / X EC (1/long rest) — Burst in a 20ft radius: allies regain Xd6 HP, enemies take Xd6 Fire damage.',
            },
            {
              id: 'meteor-drop',
              label: 'Meteor Drop',
              description: 'Action / 5 EC — Jump up to double your speed and slam down in a 10ft radius. Deal 10d6 damage, push targets 10ft back. STR save or knocked prone.',
            },
            {
              id: 'burning-dominion',
              label: 'Burning Dominion',
              description: 'Passive — When you spend 2 or more EC in a single turn, enemies within a 10ft radius are Ignited.',
            },
          ],
        },
      ],
    },
  ],
};

// ── Air ────────────────────────────────────────────────────────

export const pathAir: Feature = {
  id: 'path-air',
  name: 'Air Path',
  description: 'You walk the path of Air, mastering speed, evasion, and storm.',
  actionType: 'passive',
  tags: ['elemental-path', 'air'],
  color: '#98c379',
  icon: '💨',
  isPath: true,
  pathTiers: [
    {
      tier: 1,
      name: 'Whisper',
      rechargeDescription: 'If you move 20ft on your turn and have not been hit by an attack since the start of your last turn, regain 1 expended EC.',
      features: [
        {
          id: 'path-air-t1-cyclone-palm',
          name: 'Cyclone Palm',
          actionType: 'action',
          cost: '1 EC',
          description: 'As part of the Attack action, expend 1 EC to unleash a burst of air. The target must succeed on a Strength save or be pushed 15ft and knocked prone.',
          tags: ['air', 'attack', 'push'],
        },
        {
          id: 'path-air-t1-whisperstep',
          name: 'Whisperstep',
          actionType: 'action',
          description: 'Your speed is halved this turn; you have advantage on Stealth checks.',
          tags: ['air', 'stealth', 'mobility'],
        },
      ],
    },
    {
      tier: 2,
      name: 'Gale',
      boostDescription: 'When you hit a creature with Cyclone Palm, you may now choose the direction they are pushed, and they provoke opportunity attacks from your allies during this forced movement.',
      choices: [
        {
          id: 'air-t2-augment',
          label: 'Air Augment (Tier 2)',
          type: 'custom_feature',
          count: 1,
          options: [
            {
              id: 'gale-step',
              label: 'Gale Step',
              description: 'Reaction / 1 EC — When a creature ends its movement within 5ft, teleport 10ft to an unoccupied space and impose disadvantage on its next attack roll against you.',
            },
            {
              id: 'spiral-momentum',
              label: 'Spiral Momentum',
              description: 'Passive/Bonus / —/1 EC — Your speed increases by 10ft. You may dash as a bonus action without provoking opportunity attacks.',
            },
            {
              id: 'cyclone-flurry',
              label: 'Cyclone Flurry',
              description: 'Passive — If you move 20ft in a straight line before using Cyclone Palm, the EC cost is refunded if the target fails the save.',
            },
          ],
        },
      ],
    },
    {
      tier: 3,
      name: 'Storm',
      boostDescription: 'Whisperstep no longer requires a surface — you may ignore terrain and elevation. If you end your movement next to a hostile creature, force a Strength save or knock them off balance (disadvantage on their next attack).',
      choices: [
        {
          id: 'air-t3-augment',
          label: 'Air Augment (Tier 3)',
          type: 'custom_feature',
          count: 1,
          options: [
            {
              id: 'shearing-vortex',
              label: 'Shearing Vortex',
              description: 'Action / 2 EC — 10ft radius vortex within 30ft. Strength save or pushed to edge, knocked prone, movement halved until start of your next turn.',
            },
            {
              id: 'eye-of-the-storm',
              label: 'Eye of the Storm',
              description: 'Passive — You and allies within 10ft gain advantage on DEX saves against effects you can see. Does not function in heavy armour.',
            },
            {
              id: 'aerial-sentry',
              label: 'Aerial Sentry',
              description: 'Bonus / — — Hover up to 5ft for 1 minute. Ignore ground-level difficult terrain (including magical), +1 AC against ranged attacks, move through hostile creature spaces (can\'t end turn there).',
            },
          ],
        },
      ],
    },
    {
      tier: 4,
      name: 'Tempest',
      boostDescription: 'Cyclone Palm can now be used on each weapon attack (1 EC per attack). Your movement speed cannot be reduced and opportunity attacks automatically miss if you have already moved 20ft this turn. Gain 1 Air Augment you didn\'t take from a previous tier.',
      choices: [
        {
          id: 'air-t4-augment',
          label: 'Air Augment (Tier 4)',
          type: 'custom_feature',
          count: 1,
          options: [
            {
              id: 'sovereign-winds',
              label: 'Sovereign Winds',
              description: 'Bonus / 1/long rest — For 1 minute, flying speed = walking speed + 20ft, hover. Move through enemy spaces; they make STR save or knocked prone and lose reactions until next turn.',
            },
            {
              id: 'reed-in-the-wind',
              label: 'Reed in the Wind',
              description: 'Bonus / 5 EC — For 1 minute, AC = 10 + unused EC.',
            },
            {
              id: 'skywardens-rebuke',
              label: "Skywarden's Rebuke",
              description: 'Reaction / 4 EC — When a creature within 30ft targets you or an ally with an attack or harmful effect, unleash wind. Attacker makes STR save or the action is wasted and effect negated.',
            },
          ],
        },
      ],
    },
  ],
};

// ── All path features ──────────────────────────────────────────

export const elementalPathFeatures: Feature[] = [pathWater, pathEarth, pathFire, pathAir];

export const ELEMENTAL_PATH_IDS = {
  water: 'path-water',
  earth: 'path-earth',
  fire:  'path-fire',
  air:   'path-air',
} as const;
