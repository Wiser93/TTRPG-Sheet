/**
 * Elemental Path features — Water, Earth, Fire, Air
 *
 * Every tier feature, augment, and recharge trigger is a proper named Feature export.
 * Recharge triggers are informational card features on the combat tab.
 * Tier 1 base features and recharge are granted via featureRefs.
 * Tier 2–4 augment choices grant features via ChoiceOption.featureIds.
 */

import type { Feature } from '@/types/game';

/** Matches ELEMENTAL_SHAPER_ID in elementalShaper.ts — kept inline to avoid circular imports */
const ELEMENTAL_SHAPER_ID = 'elemental-shaper';

// ═══════════════════════════════════════════════════════════════
// WATER PATH
// ═══════════════════════════════════════════════════════════════

// ── Recharge trigger ─────────────────────────────────────────
export const waterRecharge: Feature = {
  id: 'path-water-recharge',
  sourceId: 'path-water',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Water Recharge',
  description: 'If you are the target of an attack and use a reaction during a single round, regain 1 expended EC.',
  actionType: 'passive',
  tags: ['water', 'recharge'],
  isCard: false,
};

// ── Tier 1 ───────────────────────────────────────────────────
export const riptideStep: Feature = {
  id: 'path-water-riptide-step',
  sourceId: 'path-water',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Riptide Step',
  actionType: 'reaction',
  cost: '1 EC',
  description: 'When you are hit with a melee attack, spend 1 EC to move 10 ft without provoking opportunity attacks and reduce the damage by your WIS modifier.',
  tags: ['water', 'defensive'],
};

export const flowingForm: Feature = {
  id: 'path-water-flowing-form',
  sourceId: 'path-water',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Flowing Form',
  actionType: 'passive',
  description: 'You can move through spaces occupied by hostile creatures as if they were difficult terrain. You have advantage on checks to escape grapples or being restrained.',
  tags: ['water', 'mobility'],
};

// ── Tier 2 augments ──────────────────────────────────────────
export const crashingWave: Feature = {
  id: 'path-water-crashing-wave',
  sourceId: 'path-water',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Crashing Wave',
  actionType: 'action',
  cost: '2 EC',
  description: 'Send a 15 ft wide wave 15 ft out from you. Creatures in the area make a Strength save or are pushed back; those who collide with a solid object are knocked prone and take 2d6 bludgeoning damage.',
  tags: ['water', 'control'],
};

export const mistVeil: Feature = {
  id: 'path-water-mist-veil',
  sourceId: 'path-water',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Mist Veil',
  actionType: 'bonus_action',
  cost: '1 EC',
  description: 'Until the start of your next turn you are lightly obscured and the first ranged attack against you has disadvantage. If you move 10 ft or more, you may make a Stealth check even if observed.',
  tags: ['water', 'defensive'],
};

export const hydrostaticArmor: Feature = {
  id: 'path-water-hydrostatic-armor',
  sourceId: 'path-water',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Hydrostatic Armor',
  actionType: 'passive',
  description: 'While wearing no armour and carrying no shield, your AC equals 13 + your WIS modifier.',
  tags: ['water', 'defensive'],
};

// ── Tier 3 augments ──────────────────────────────────────────
export const healingWave: Feature = {
  id: 'path-water-healing-wave',
  sourceId: 'path-water',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Healing Wave',
  actionType: 'action',
  cost: '3 EC',
  description: 'Restore (proficiency bonus)d6 + WIS modifier hit points to a creature you can see within 30 ft.',
  tags: ['water', 'healing'],
};

export const tidalChains: Feature = {
  id: 'path-water-tidal-chains',
  sourceId: 'path-water',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Tidal Chains',
  actionType: 'action',
  cost: '1 EC',
  description: 'Pull a creature within 30 ft up to 15 ft toward you. The creature makes a Strength save; on a failure its movement speed is halved until the end of its next turn.',
  tags: ['water', 'control'],
};

export const ebbAndFlow: Feature = {
  id: 'path-water-ebb-and-flow',
  sourceId: 'path-water',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Ebb and Flow',
  actionType: 'passive',
  description: 'Once per turn, when a creature misses you with a melee attack, you may make an attack roll against a different creature within 5 ft. The attack deals damage equal to your WIS modifier of the same damage type as the original attack.',
  tags: ['water', 'passive'],
};

// ── Tier 4 augments ──────────────────────────────────────────
export const flowmastersGrace: Feature = {
  id: 'path-water-flowmasters-grace',
  sourceId: 'path-water',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: "Flowmaster's Grace",
  actionType: 'passive',
  description: "When you move through a hostile creature's space, that creature must succeed on a DEX save or be unbalanced until the end of its next turn: it can't take reactions and its speed is halved.",
  tags: ['water', 'passive', 'control'],
};

export const icePrison: Feature = {
  id: 'path-water-ice-prison',
  sourceId: 'path-water',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Ice Prison',
  actionType: 'action',
  cost: '5 EC',
  description: 'Conjure a 15 ft radius sphere of ice centred on a point within 30 ft (duration: 1 minute, AC 12, 75 HP, vulnerable to fire). The sphere can be transparent or opaque. Enemies inside take 1d6 cold damage at the start of their turn.',
  tags: ['water', 'control'],
};

export const moonwater: Feature = {
  id: 'path-water-moonwater',
  sourceId: 'path-water',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Moonwater',
  actionType: 'action',
  cost: 'X EC',
  description: 'Choose up to your WIS modifier creatures within 15 ft. Each regains Xd6 HP, may move 5 ft freely, and ends one condition of your choice: Blinded, Charmed, Deafened, Frightened, Incapacitated, Paralyzed, Poisoned, or Stunned.',
  tags: ['water', 'healing'],
};

// ── Path feature ─────────────────────────────────────────────
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
      featureRefs: [waterRecharge.id, riptideStep.id, flowingForm.id],
    },
    {
      tier: 2,
      name: 'Current',
      boostDescription: "If an ally within 10 ft is targeted by a melee attack, you may use Riptide Step to swap places with them before the attack roll, becoming the new target. If you are hit, you may continue with Riptide Step's original function as part of the same reaction.",
      choices: [
        {
          id: 'water-t2-augment',
          label: 'Water Augment (Tier 2)',
          type: 'custom_feature',
          count: 1,
          options: [
            { id: crashingWave.id,      label: crashingWave.name,      description: crashingWave.description,      featureIds: [crashingWave.id] },
            { id: mistVeil.id,          label: mistVeil.name,          description: mistVeil.description,          featureIds: [mistVeil.id] },
            { id: hydrostaticArmor.id,  label: hydrostaticArmor.name,  description: hydrostaticArmor.description,  featureIds: [hydrostaticArmor.id] },
          ],
        },
      ],
    },
    {
      tier: 3,
      name: 'Tide',
      boostDescription: 'If Riptide Step is used to swap with an ally, impose disadvantage on the attack; you can utilise the move after the attack, even if it misses. When you move away using Riptide Step you may leave a slick 5 ft radius (DEX save to move through, fail = prone).',
      choices: [
        {
          id: 'water-t3-augment',
          label: 'Water Augment (Tier 3)',
          type: 'custom_feature',
          count: 1,
          options: [
            { id: healingWave.id,  label: healingWave.name,  description: healingWave.description,  featureIds: [healingWave.id] },
            { id: tidalChains.id,  label: tidalChains.name,  description: tidalChains.description,  featureIds: [tidalChains.id] },
            { id: ebbAndFlow.id,   label: ebbAndFlow.name,   description: ebbAndFlow.description,   featureIds: [ebbAndFlow.id] },
          ],
        },
      ],
    },
    {
      tier: 4,
      name: 'Ocean',
      boostDescription: "Riptide Step now has no EC cost, the range expands to allies within 15 ft, and the movement afterwards increases to 15 ft. Gain 1 Water Augment you didn't take from a previous tier.",
      choices: [
        {
          id: 'water-t4-augment',
          label: 'Water Augment (Tier 4)',
          type: 'custom_feature',
          count: 1,
          options: [
            { id: flowmastersGrace.id,  label: flowmastersGrace.name,  description: flowmastersGrace.description,  featureIds: [flowmastersGrace.id] },
            { id: icePrison.id,         label: icePrison.name,         description: icePrison.description,         featureIds: [icePrison.id] },
            { id: moonwater.id,         label: moonwater.name,         description: moonwater.description,         featureIds: [moonwater.id] },
          ],
        },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// EARTH PATH
// ═══════════════════════════════════════════════════════════════

export const earthRecharge: Feature = {
  id: 'path-earth-recharge',
  sourceId: 'path-earth',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Earth Recharge',
  description: "When you don't move on your turn (including no forced movement), regain 1 expended EC.",
  actionType: 'passive',
  tags: ['earth', 'recharge'],
};

// ── Tier 1 ───────────────────────────────────────────────────
export const earthenGrasp: Feature = {
  id: 'path-earth-earthen-grasp',
  sourceId: 'path-earth',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Earthen Grasp',
  actionType: 'action',
  cost: '1 EC',
  description: 'Expend 1 EC to create a grasping hand of stone targeting a creature within 30 ft. The creature makes a Strength save or is restrained until the end of its turn.',
  tags: ['earth', 'control'],
};

export const stonesEndurance: Feature = {
  id: 'path-earth-stones-endurance',
  sourceId: 'path-earth',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: "Stone's Endurance",
  actionType: 'passive',
  description: "When a creature's attack roll against you exceeds your AC by less than your proficiency bonus, reduce the damage you take by your WIS modifier.",
  tags: ['earth', 'defensive'],
};

// ── Tier 2 augments ──────────────────────────────────────────
export const stonewall: Feature = {
  id: 'path-earth-stonewall',
  sourceId: 'path-earth',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Stonewall',
  actionType: 'action',
  cost: '1 EC',
  description: 'Create a 10 ft × 10 ft × 2 ft wall of stone within 30 ft (AC 12, 20 HP). The wall may be placed at an angle, including horizontally.',
  tags: ['earth', 'terrain'],
};

export const bulwarkStep: Feature = {
  id: 'path-earth-bulwark-step',
  sourceId: 'path-earth',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Bulwark Step',
  actionType: 'reaction',
  cost: '1 EC',
  description: 'When you or an ally within 5 ft is hit by an attack, raise a slab of stone that reduces the damage by 1d10 + your WIS modifier.',
  tags: ['earth', 'defensive'],
};

export const gravityAnchor: Feature = {
  id: 'path-earth-gravity-anchor',
  sourceId: 'path-earth',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Gravity Anchor',
  actionType: 'passive',
  description: 'You have advantage on checks and saving throws against forced movement or being knocked prone.',
  tags: ['earth', 'defensive'],
};

// ── Tier 3 augments ──────────────────────────────────────────
export const tectonicTremor: Feature = {
  id: 'path-earth-tectonic-tremor',
  sourceId: 'path-earth',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Tectonic Tremor',
  actionType: 'action',
  cost: '2 EC',
  description: 'All creatures of your choice within a 20 ft radius make a Strength save or fall prone and take (proficiency bonus)d6 bludgeoning damage. The area becomes difficult terrain until cleared.',
  tags: ['earth', 'control', 'aoe'],
};

export const livingStone: Feature = {
  id: 'path-earth-living-stone',
  sourceId: 'path-earth',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Living Stone',
  actionType: 'bonus_action',
  cost: '2 EC',
  description: 'Gain resistance to all damage until the start of your next turn.',
  tags: ['earth', 'defensive'],
};

export const geomanticPulse: Feature = {
  id: 'path-earth-geomantic-pulse',
  sourceId: 'path-earth',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Geomantic Pulse',
  actionType: 'passive',
  description: "Whenever you end your turn on stone or earth, regain 1 temporary HP per EC remaining (up to the amount reduced by Stone's Endurance since your last turn). This occurs after the recharge trigger.",
  tags: ['earth', 'passive'],
};

// ── Tier 4 augments ──────────────────────────────────────────
export const ironcoreBastion: Feature = {
  id: 'path-earth-ironcore-bastion',
  sourceId: 'path-earth',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Ironcore Bastion',
  actionType: 'action',
  cost: '5 EC',
  description: 'For 1 minute, emit an aura in a 10 ft radius that grants you and your allies +3 AC and creates difficult terrain that moves with you.',
  tags: ['earth', 'aura'],
};

export const stonecrush: Feature = {
  id: 'path-earth-stonecrush',
  sourceId: 'path-earth',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Stonecrush',
  actionType: 'action',
  cost: '3 EC',
  description: 'Target a creature restrained by Earthen Grasp; deal 3d6 bludgeoning damage and inflict one level of exhaustion.',
  tags: ['earth', 'damage'],
};

export const stonegripMantle: Feature = {
  id: 'path-earth-stonegrip-mantle',
  sourceId: 'path-earth',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Stonegrip Mantle',
  actionType: 'passive',
  description: 'When you have fewer than 5 EC and are hit by a melee attack, the attacker makes a Strength save. On a failure, it is pushed back 15 ft and restrained by Earthen Grasp at no EC cost. Triggers once per turn, even if you are unconscious.',
  tags: ['earth', 'passive', 'defensive'],
};

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
      featureRefs: [earthRecharge.id, earthenGrasp.id, stonesEndurance.id],
    },
    {
      tier: 2,
      name: 'Mantle',
      boostDescription: 'Earthen Grasp can now affect up to 2 creatures within 30 ft (one target per EC spent). You may also choose to knock the target prone instead of restraining it.',
      choices: [
        {
          id: 'earth-t2-augment',
          label: 'Earth Augment (Tier 2)',
          type: 'custom_feature',
          count: 1,
          options: [
            { id: stonewall.id,       label: stonewall.name,       description: stonewall.description,       featureIds: [stonewall.id] },
            { id: bulwarkStep.id,     label: bulwarkStep.name,     description: bulwarkStep.description,     featureIds: [bulwarkStep.id] },
            { id: gravityAnchor.id,   label: gravityAnchor.name,   description: gravityAnchor.description,   featureIds: [gravityAnchor.id] },
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
            { id: tectonicTremor.id,  label: tectonicTremor.name,  description: tectonicTremor.description,  featureIds: [tectonicTremor.id] },
            { id: livingStone.id,     label: livingStone.name,     description: livingStone.description,     featureIds: [livingStone.id] },
            { id: geomanticPulse.id,  label: geomanticPulse.name,  description: geomanticPulse.description,  featureIds: [geomanticPulse.id] },
          ],
        },
      ],
    },
    {
      tier: 4,
      name: 'Mountain',
      boostDescription: "Earthen Grasp can now be used as a bonus action. You also create a 5 ft radius zone of difficult terrain around the target. Gain 1 Earth Augment you didn't take from a previous tier.",
      choices: [
        {
          id: 'earth-t4-augment',
          label: 'Earth Augment (Tier 4)',
          type: 'custom_feature',
          count: 1,
          options: [
            { id: ironcoreBastion.id,  label: ironcoreBastion.name,  description: ironcoreBastion.description,  featureIds: [ironcoreBastion.id] },
            { id: stonecrush.id,       label: stonecrush.name,       description: stonecrush.description,       featureIds: [stonecrush.id] },
            { id: stonegripMantle.id,  label: stonegripMantle.name,  description: stonegripMantle.description,  featureIds: [stonegripMantle.id] },
          ],
        },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// FIRE PATH
// ═══════════════════════════════════════════════════════════════

export const fireRecharge: Feature = {
  id: 'path-fire-recharge',
  sourceId: 'path-fire',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Fire Recharge',
  description: 'When you reduce an enemy to 0 hit points with fire damage, regain 1 expended EC.',
  actionType: 'passive',
  tags: ['fire', 'recharge'],
};

// ── Tier 1 ───────────────────────────────────────────────────
export const flameLash: Feature = {
  id: 'path-fire-flame-lash',
  sourceId: 'path-fire',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Flame Lash',
  actionType: 'bonus_action',
  cost: '1 EC',
  description: 'Create a whip of flame. Make a melee spell attack with 15 ft reach; on a hit, deal (proficiency bonus)d6 fire damage and pull the target up to 10 ft toward you.',
  tags: ['fire', 'attack'],
};

export const kindledMotion: Feature = {
  id: 'path-fire-kindled-motion',
  sourceId: 'path-fire',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Kindled Motion',
  actionType: 'passive',
  description: 'Your movement speed increases by 10 ft while you are below half your maximum hit points.',
  tags: ['fire', 'passive', 'mobility'],
};

// ── Tier 2 augments ──────────────────────────────────────────
export const scorchingArc: Feature = {
  id: 'path-fire-scorching-arc',
  sourceId: 'path-fire',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Scorching Arc',
  actionType: 'action',
  cost: '2 EC',
  description: 'Release a 30 ft × 5 ft line of fire. Creatures in the area make a DEX save or take 4d6 fire damage and are Ignited (1d6 fire damage at the start of their turn; CON save at end of turn ends).',
  tags: ['fire', 'aoe', 'damage'],
};

export const firebrand: Feature = {
  id: 'path-fire-firebrand',
  sourceId: 'path-fire',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Firebrand',
  actionType: 'reaction',
  cost: '1 EC',
  description: 'When you are hit by a melee attack, the attacker takes (proficiency bonus)d4 fire damage.',
  tags: ['fire', 'defensive', 'reaction'],
};

export const searingMomentum: Feature = {
  id: 'path-fire-searing-momentum',
  sourceId: 'path-fire',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Searing Momentum',
  actionType: 'passive',
  description: 'After using all of your movement on your turn, your next melee attack that turn deals an additional 1d8 fire damage.',
  tags: ['fire', 'passive'],
};

// ── Tier 3 augments ──────────────────────────────────────────
export const infernoHalo: Feature = {
  id: 'path-fire-inferno-halo',
  sourceId: 'path-fire',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Inferno Halo',
  actionType: 'passive',
  description: 'At the start of your turn, each enemy within 5 ft takes 1 fire damage per EC you currently have.',
  tags: ['fire', 'passive', 'aura'],
};

export const ashenGrasp: Feature = {
  id: 'path-fire-ashen-grasp',
  sourceId: 'path-fire',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Ashen Grasp',
  actionType: 'action',
  cost: '1 EC',
  description: 'Make a melee touch attack. Until the end of the target\'s next turn, it is Ash-Marked: it takes 1d10 fire damage whenever it takes an action, a bonus action, or moves.',
  tags: ['fire', 'control', 'damage'],
};

export const explosiveCast: Feature = {
  id: 'path-fire-explosive-cast',
  sourceId: 'path-fire',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Explosive Cast',
  actionType: 'passive',
  description: 'When you reduce a creature to 0 HP with fire damage, creatures within 5 ft of the target take fire damage equal to your WIS modifier.',
  tags: ['fire', 'passive'],
};

// ── Tier 4 augments ──────────────────────────────────────────
export const phoenixBloom: Feature = {
  id: 'path-fire-phoenix-bloom',
  sourceId: 'path-fire',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Phoenix Bloom',
  actionType: 'bonus_action',
  cost: 'X EC (1/long rest)',
  uses: { max: { type: 'flat', value: 1 }, rechargeOn: 'long_rest' },
  description: 'Burst in a 20 ft radius: allies regain Xd6 HP and enemies take Xd6 fire damage.',
  tags: ['fire', 'aoe', 'healing'],
};

export const meteorDrop: Feature = {
  id: 'path-fire-meteor-drop',
  sourceId: 'path-fire',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Meteor Drop',
  actionType: 'action',
  cost: '5 EC',
  description: 'Leap up to double your movement speed and slam down in a 10 ft radius. Creatures in the area take 10d6 damage and are pushed 10 ft back. STR save or knocked prone.',
  tags: ['fire', 'damage', 'aoe'],
};

export const burningDominion: Feature = {
  id: 'path-fire-burning-dominion',
  sourceId: 'path-fire',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Burning Dominion',
  actionType: 'passive',
  description: 'When you spend 2 or more EC in a single turn, enemies within a 10 ft radius are Ignited.',
  tags: ['fire', 'passive', 'aura'],
};

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
      featureRefs: [fireRecharge.id, flameLash.id, kindledMotion.id],
    },
    {
      tier: 2,
      name: 'Kindling',
      boostDescription: 'Flame Lash now deals (proficiency bonus)d8 fire damage and Ignites the target (1d6 fire at the start of their turn; CON save at end of turn ends).',
      choices: [
        {
          id: 'fire-t2-augment',
          label: 'Fire Augment (Tier 2)',
          type: 'custom_feature',
          count: 1,
          options: [
            { id: scorchingArc.id,      label: scorchingArc.name,      description: scorchingArc.description,      featureIds: [scorchingArc.id] },
            { id: firebrand.id,         label: firebrand.name,         description: firebrand.description,         featureIds: [firebrand.id] },
            { id: searingMomentum.id,   label: searingMomentum.name,   description: searingMomentum.description,   featureIds: [searingMomentum.id] },
          ],
        },
      ],
    },
    {
      tier: 3,
      name: 'Blaze',
      boostDescription: 'Fire damage from class features ignores resistance. Flame Lash range increases to 20 ft, the pull increases to 15 ft.',
      choices: [
        {
          id: 'fire-t3-augment',
          label: 'Fire Augment (Tier 3)',
          type: 'custom_feature',
          count: 1,
          options: [
            { id: infernoHalo.id,     label: infernoHalo.name,     description: infernoHalo.description,     featureIds: [infernoHalo.id] },
            { id: ashenGrasp.id,      label: ashenGrasp.name,      description: ashenGrasp.description,      featureIds: [ashenGrasp.id] },
            { id: explosiveCast.id,   label: explosiveCast.name,   description: explosiveCast.description,   featureIds: [explosiveCast.id] },
          ],
        },
      ],
    },
    {
      tier: 4,
      name: 'Inferno',
      boostDescription: "Flame Lash now Ignites enemies within 5 ft of the target at any point during the pull. Gain 1 Fire Augment you didn't take from a previous tier.",
      choices: [
        {
          id: 'fire-t4-augment',
          label: 'Fire Augment (Tier 4)',
          type: 'custom_feature',
          count: 1,
          options: [
            { id: phoenixBloom.id,      label: phoenixBloom.name,      description: phoenixBloom.description,      featureIds: [phoenixBloom.id] },
            { id: meteorDrop.id,        label: meteorDrop.name,        description: meteorDrop.description,        featureIds: [meteorDrop.id] },
            { id: burningDominion.id,   label: burningDominion.name,   description: burningDominion.description,   featureIds: [burningDominion.id] },
          ],
        },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// AIR PATH
// ═══════════════════════════════════════════════════════════════

export const airRecharge: Feature = {
  id: 'path-air-recharge',
  sourceId: 'path-air',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Air Recharge',
  description: 'If you move 20 ft on your turn and have not been hit by an attack since the start of your last turn, regain 1 expended EC.',
  actionType: 'passive',
  tags: ['air', 'recharge'],
};

// ── Tier 1 ───────────────────────────────────────────────────
export const cyclonePalm: Feature = {
  id: 'path-air-cyclone-palm',
  sourceId: 'path-air',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Cyclone Palm',
  actionType: 'action',
  cost: '1 EC',
  description: 'As part of the Attack action, expend 1 EC to unleash a burst of air. The target makes a Strength save or is pushed 15 ft and knocked prone.',
  tags: ['air', 'attack', 'push'],
};

export const whisperstep: Feature = {
  id: 'path-air-whisperstep',
  sourceId: 'path-air',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Whisperstep',
  actionType: 'action',
  description: 'Your speed is halved this turn; you have advantage on Stealth checks until the end of your turn.',
  tags: ['air', 'stealth'],
};

// ── Tier 2 augments ──────────────────────────────────────────
export const galeStep: Feature = {
  id: 'path-air-gale-step',
  sourceId: 'path-air',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Gale Step',
  actionType: 'reaction',
  cost: '1 EC',
  description: "When a creature ends its movement within 5 ft of you, teleport 10 ft to an unoccupied space and impose disadvantage on that creature's next attack roll against you.",
  tags: ['air', 'defensive', 'mobility'],
};

export const spiralMomentum: Feature = {
  id: 'path-air-spiral-momentum',
  sourceId: 'path-air',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Spiral Momentum',
  actionType: 'passive',
  description: 'Your speed increases by 10 ft. You may Dash as a bonus action without provoking opportunity attacks.',
  tags: ['air', 'passive', 'mobility'],
};

export const cycloneFlurry: Feature = {
  id: 'path-air-cyclone-flurry',
  sourceId: 'path-air',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Cyclone Flurry',
  actionType: 'passive',
  description: 'If you move 20 ft in a straight line before using Cyclone Palm, the EC cost is refunded if the target fails the saving throw.',
  tags: ['air', 'passive'],
};

// ── Tier 3 augments ──────────────────────────────────────────
export const shearingVortex: Feature = {
  id: 'path-air-shearing-vortex',
  sourceId: 'path-air',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Shearing Vortex',
  actionType: 'action',
  cost: '2 EC',
  description: 'Create a 10 ft radius vortex centred on a point within 30 ft. Creatures in the area make a Strength save or are pushed to the edge, knocked prone, and have their movement speed halved until the start of your next turn.',
  tags: ['air', 'control', 'aoe'],
};

export const eyeOfTheStorm: Feature = {
  id: 'path-air-eye-of-the-storm',
  sourceId: 'path-air',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Eye of the Storm',
  actionType: 'passive',
  description: 'You and allies within 10 ft have advantage on DEX saving throws against effects you can see. Does not function while wearing heavy armour.',
  tags: ['air', 'passive', 'aura'],
};

export const aerialSentry: Feature = {
  id: 'path-air-aerial-sentry',
  sourceId: 'path-air',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Aerial Sentry',
  actionType: 'bonus_action',
  description: 'Hover up to 5 ft above the ground for 1 minute. While hovering: ignore ground-level difficult terrain (including magical), gain +1 AC against ranged attacks, and move through hostile creature spaces (you cannot end your turn there).',
  tags: ['air', 'mobility'],
};

// ── Tier 4 augments ──────────────────────────────────────────
export const sovereignWinds: Feature = {
  id: 'path-air-sovereign-winds',
  sourceId: 'path-air',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Sovereign Winds',
  actionType: 'bonus_action',
  cost: '1/long rest',
  uses: { max: { type: 'flat', value: 1 }, rechargeOn: 'long_rest' },
  description: 'For 1 minute, gain a flying speed equal to your walking speed + 20 ft and the ability to hover. You may move through enemy spaces; each creature you pass through makes a STR save or is knocked prone and loses reactions until its next turn.',
  tags: ['air', 'mobility'],
};

export const reedInTheWind: Feature = {
  id: 'path-air-reed-in-the-wind',
  sourceId: 'path-air',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: 'Reed in the Wind',
  actionType: 'bonus_action',
  cost: '5 EC',
  description: 'For 1 minute, your AC equals 10 + the number of EC you currently have unused.',
  tags: ['air', 'defensive'],
};

export const skywardensRebuke: Feature = {
  id: 'path-air-skywardens-rebuke',
  sourceId: 'path-air',
  sourceType: 'path' as const,
  parentClassId: ELEMENTAL_SHAPER_ID,
  name: "Skywarden's Rebuke",
  actionType: 'reaction',
  cost: '4 EC',
  description: 'When a creature within 30 ft targets you or an ally with an attack or harmful effect, unleash a blast of wind. The attacker makes a STR save or their action is wasted and the effect is negated.',
  tags: ['air', 'defensive', 'reaction'],
};

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
      featureRefs: [airRecharge.id, cyclonePalm.id, whisperstep.id],
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
            { id: galeStep.id,         label: galeStep.name,         description: galeStep.description,         featureIds: [galeStep.id] },
            { id: spiralMomentum.id,   label: spiralMomentum.name,   description: spiralMomentum.description,   featureIds: [spiralMomentum.id] },
            { id: cycloneFlurry.id,    label: cycloneFlurry.name,    description: cycloneFlurry.description,    featureIds: [cycloneFlurry.id] },
          ],
        },
      ],
    },
    {
      tier: 3,
      name: 'Storm',
      boostDescription: 'Whisperstep no longer requires a surface — you may ignore terrain and elevation. If you end your movement next to a hostile creature, it makes a Strength save or is knocked off-balance (disadvantage on its next attack).',
      choices: [
        {
          id: 'air-t3-augment',
          label: 'Air Augment (Tier 3)',
          type: 'custom_feature',
          count: 1,
          options: [
            { id: shearingVortex.id,  label: shearingVortex.name,  description: shearingVortex.description,  featureIds: [shearingVortex.id] },
            { id: eyeOfTheStorm.id,   label: eyeOfTheStorm.name,   description: eyeOfTheStorm.description,   featureIds: [eyeOfTheStorm.id] },
            { id: aerialSentry.id,    label: aerialSentry.name,    description: aerialSentry.description,    featureIds: [aerialSentry.id] },
          ],
        },
      ],
    },
    {
      tier: 4,
      name: 'Tempest',
      boostDescription: "Cyclone Palm can now be used on each weapon attack (1 EC per attack). Your movement speed cannot be reduced and opportunity attacks automatically miss if you have already moved 20 ft this turn. Gain 1 Air Augment you didn't take from a previous tier.",
      choices: [
        {
          id: 'air-t4-augment',
          label: 'Air Augment (Tier 4)',
          type: 'custom_feature',
          count: 1,
          options: [
            { id: sovereignWinds.id,     label: sovereignWinds.name,     description: sovereignWinds.description,     featureIds: [sovereignWinds.id] },
            { id: reedInTheWind.id,      label: reedInTheWind.name,      description: reedInTheWind.description,      featureIds: [reedInTheWind.id] },
            { id: skywardensRebuke.id,   label: skywardensRebuke.name,   description: skywardensRebuke.description,   featureIds: [skywardensRebuke.id] },
          ],
        },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export const elementalPathFeatures: Feature[] = [
  // Path features
  pathWater, pathEarth, pathFire, pathAir,
  // Recharge triggers
  waterRecharge, earthRecharge, fireRecharge, airRecharge,
  // Water features
  riptideStep, flowingForm,
  crashingWave, mistVeil, hydrostaticArmor,
  healingWave, tidalChains, ebbAndFlow,
  flowmastersGrace, icePrison, moonwater,
  // Earth features
  earthenGrasp, stonesEndurance,
  stonewall, bulwarkStep, gravityAnchor,
  tectonicTremor, livingStone, geomanticPulse,
  ironcoreBastion, stonecrush, stonegripMantle,
  // Fire features
  flameLash, kindledMotion,
  scorchingArc, firebrand, searingMomentum,
  infernoHalo, ashenGrasp, explosiveCast,
  phoenixBloom, meteorDrop, burningDominion,
  // Air features
  cyclonePalm, whisperstep,
  galeStep, spiralMomentum, cycloneFlurry,
  shearingVortex, eyeOfTheStorm, aerialSentry,
  sovereignWinds, reedInTheWind, skywardensRebuke,
];

export const ELEMENTAL_PATH_IDS = {
  water: 'path-water',
  earth: 'path-earth',
  fire:  'path-fire',
  air:   'path-air',
} as const;
