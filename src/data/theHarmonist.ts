import type { Subclass } from '@/types/game';

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
      features: [
        {
          id: 'biat-balance-in-all-things',
          name: 'The Harmonist',
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
            'This progression ensures you always know all four elements, with only one reaching Tier II.',
          tags: ['subclass', 'elemental', 'passive'],
        },
      ],
      choices: [
        {
          id: 'elemental_path',
          label: 'Elemental Path — Balance Choice (3rd)',
          type: 'custom_feature',
          count: 1,
          options: [
            { id: 'water', label: 'Water — Stillness (Tier 1)', description: 'Riptide Step, Flowing Form. Recharge: reaction used when attacked.', color: '#61afef', icon: '💧' },
            { id: 'earth', label: 'Earth — Rooted (Tier 1)', description: 'Earthen Grasp, Stone\'s Endurance. Recharge: no movement on turn.', color: '#e5c07b', icon: '🪨' },
            { id: 'fire',  label: 'Fire — The Flame Within (Tier 1)', description: 'Flame Lash, Kindled Motion. Recharge: reduce enemy to 0 HP with Fire.', color: '#e06c75', icon: '🔥' },
            { id: 'air',   label: 'Air — Whisper (Tier 1)', description: 'Cyclone Palm, Whisperstep. Recharge: move 20ft unharmed.', color: '#98c379', icon: '💨' },
          ],
        },
      ],
    },
    // ── Level 6 ─────────────────────────────────────────────
    {
      level: 6,
      features: [
        {
          id: 'biat-resonant-overload',
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
        },
      ],
    },
    // ── Level 11 ────────────────────────────────────────────
    {
      level: 11,
      features: [
        {
          id: 'biat-elemental-cascade',
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
        },
      ],
    },
    // ── Level 14 ────────────────────────────────────────────
    {
      level: 14,
      features: [
        {
          id: 'biat-core-of-the-spiral',
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
            'or the benefits of Elemental Resonance, but you may benefit from both in the same round.',
          tags: ['subclass', 'elemental', 'passive', 'combat'],
          isCard: true,
          cardTab: 'combat',
          cardSelectionLabel: 'Choose a Spiral element at the start of your turn.',
          cardOptionSource: { choiceId: 'elemental_path' },
        },
      ],
    },
  ],
};
