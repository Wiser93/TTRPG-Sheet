import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Character, ActiveCondition, InventoryEntry, EquippedSlots, SpellSlotState, ResourceState, KnownSpell } from '@/types/character';
import { updateCharacter } from '@/db/characterDatabase';

// ============================================================
// STORE STATE
// ============================================================

interface CharacterStore {
  /** Currently loaded character, or null */
  character: Character | null;
  /** Loading/saving states */
  isLoading: boolean;
  isSaving: boolean;
  /** Debounced save timer handle */
  _saveTimer: ReturnType<typeof setTimeout> | null;

  // ── Lifecycle ──────────────────────────────────────────────
  loadCharacter: (character: Character) => void;
  unloadCharacter: () => void;

  // ── Health ─────────────────────────────────────────────────
  setCurrentHP: (hp: number) => void;
  setTempHP: (hp: number) => void;
  setMaxHPOverride: (hp: number | undefined) => void;
  addDeathSave: (type: 'success' | 'failure') => void;
  resetDeathSaves: () => void;

  // ── Conditions ─────────────────────────────────────────────
  addCondition: (condition: ActiveCondition) => void;
  removeCondition: (id: string) => void;
  updateCondition: (id: string, changes: Partial<ActiveCondition>) => void;

  // ── Inventory ──────────────────────────────────────────────
  addInventoryEntry: (entry: InventoryEntry) => void;
  updateInventoryEntry: (id: string, changes: Partial<InventoryEntry>) => void;
  removeInventoryEntry: (id: string) => void;
  setEquipped: (slots: EquippedSlots) => void;

  // ── Spell slots ────────────────────────────────────────────
  expendSlot: (level: number) => void;
  restoreSlot: (level: number) => void;
  setSlots: (slots: SpellSlotState[]) => void;

  // ── Resources ──────────────────────────────────────────────
  expendResource: (id: string, amount?: number) => void;
  restoreResource: (id: string, amount?: number) => void;
  setResourceMax: (id: string, max: number) => void;
  addResource: (resource: ResourceState) => void;

  // ── Spells ─────────────────────────────────────────────────
  addKnownSpell: (spell: KnownSpell) => void;
  removeKnownSpell: (spellId: string, classId: string) => void;
  toggleSpellPrepared: (spellId: string, classId: string) => void;
  setConcentration: (spellId: string | undefined) => void;

  // ── Rests ──────────────────────────────────────────────────
  shortRest: (hitDieResults: number) => void;
  longRest: () => void;

  // ── Inspiration ────────────────────────────────────────────
  setInspiration: (value: boolean) => void;

  // ── Character Builder ─────────────────────────────────────
  setSpecies: (speciesId: string | undefined) => void;
  setBackground: (backgroundId: string | undefined) => void;
  /** Add a class at level 1 (or increase level if already present) */
  addClassLevel: (classId: string, hitDie: number) => void;
  /** Remove the highest level from a class (removes its hpRoll too) */
  removeClassLevel: (classId: string) => void;
  /** Store a per-level HP roll from the builder */
  setHpRoll: (classId: string, level: number, roll: number) => void;
  /** Save a resolved choice (creation or level-up) */
  resolveBuilderChoice: (choice: import('@/types/character').ResolvedChoice, sourceType: 'class' | 'species' | 'background') => void;
  /** Set all six base stats at once */
  setBaseStats: (stats: import('@/types/character').StatBlock) => void;
  /** Set a single base stat */
  setBaseStat: (stat: import('@/types/game').StatKey, value: number) => void;

  // ── Elemental Embodiment ──────────────────────────────────
  setElementalEmbodiment: (element: Character['elementalEmbodiment']) => void;

  // ── Sync derived resource maxes back to stored max ─────────
  syncResourceMaxes: (resourceMaxes: Record<string, number>) => void;

  // ── Generic patch (escape hatch) ───────────────────────────
  patchCharacter: (changes: Partial<Character>) => void;
}

// ============================================================
// HELPERS
// ============================================================

const AUTOSAVE_DELAY_MS = 1500;

function scheduleAutosave(
  get: () => CharacterStore,
  set: (fn: (s: CharacterStore) => void) => void
) {
  const store = get();
  if (store._saveTimer) clearTimeout(store._saveTimer);

  const timer = setTimeout(async () => {
    const { character } = get();
    if (!character) return;
    set(s => { s.isSaving = true; });
    try {
      await updateCharacter(character.meta.id, character);
    } finally {
      set(s => { s.isSaving = false; s._saveTimer = null; });
    }
  }, AUTOSAVE_DELAY_MS);

  set(s => { s._saveTimer = timer; });
}

function mutate(
  set: (fn: (s: CharacterStore) => void) => void,
  get: () => CharacterStore,
  fn: (char: Character) => void
) {
  set(s => {
    if (!s.character) return;
    fn(s.character);
  });
  scheduleAutosave(get, set);
}

// ============================================================
// STORE
// ============================================================

export const useCharacterStore = create<CharacterStore>()(
  immer((set, get) => ({
    character: null,
    isLoading: false,
    isSaving: false,
    _saveTimer: null,

    // ── Lifecycle ────────────────────────────────────────────
    loadCharacter: (character) => set(s => { s.character = character as never; s.isLoading = false; }),
    unloadCharacter: () => {
      const { _saveTimer } = get();
      if (_saveTimer) clearTimeout(_saveTimer);
      set(s => { s.character = null; s._saveTimer = null; });
    },

    // ── Health ───────────────────────────────────────────────
    setCurrentHP: (hp) => mutate(set, get, c => { c.health.current = Math.max(0, hp); }),
    setTempHP: (hp) => mutate(set, get, c => { c.health.temp = Math.max(0, hp); }),
    setMaxHPOverride: (hp) => mutate(set, get, c => { c.health.maxOverride = hp; }),
    addDeathSave: (type) => mutate(set, get, c => {
      if (type === 'success') c.health.deathSaves.successes = Math.min(3, c.health.deathSaves.successes + 1);
      else c.health.deathSaves.failures = Math.min(3, c.health.deathSaves.failures + 1);
    }),
    resetDeathSaves: () => mutate(set, get, c => {
      c.health.deathSaves = { successes: 0, failures: 0 };
      c.health.stable = false;
    }),

    // ── Conditions ───────────────────────────────────────────
    addCondition: (condition) => mutate(set, get, c => {
      if (!c.conditions.find(x => x.id === condition.id)) {
        c.conditions.push(condition as never);
      }
    }),
    removeCondition: (id) => mutate(set, get, c => {
      c.conditions = c.conditions.filter(x => x.id !== id);
    }),
    updateCondition: (id, changes) => mutate(set, get, c => {
      const idx = c.conditions.findIndex(x => x.id === id);
      if (idx >= 0) Object.assign(c.conditions[idx], changes);
    }),

    // ── Inventory ────────────────────────────────────────────
    addInventoryEntry: (entry) => mutate(set, get, c => { c.inventory.push(entry as never); }),
    updateInventoryEntry: (id, changes) => mutate(set, get, c => {
      const idx = c.inventory.findIndex(x => x.id === id);
      if (idx >= 0) Object.assign(c.inventory[idx], changes);
    }),
    removeInventoryEntry: (id) => mutate(set, get, c => {
      c.inventory = c.inventory.filter(x => x.id !== id);
    }),
    setEquipped: (slots) => mutate(set, get, c => { c.equipped = slots as never; }),

    // ── Spell slots ──────────────────────────────────────────
    expendSlot: (level) => mutate(set, get, c => {
      const slot = c.spellSlots.find(s => s.level === level);
      if (slot && slot.current > 0) slot.current--;
    }),
    restoreSlot: (level) => mutate(set, get, c => {
      const slot = c.spellSlots.find(s => s.level === level);
      if (slot) slot.current = Math.min(slot.max, slot.current + 1);
    }),
    setSlots: (slots) => mutate(set, get, c => { c.spellSlots = slots as never; }),

    // ── Resources ────────────────────────────────────────────
    expendResource: (id, amount = 1) => mutate(set, get, c => {
      const r = c.resources.find(x => x.id === id);
      if (r) r.current = Math.max(0, r.current - amount);
    }),
    restoreResource: (id, amount) => mutate(set, get, c => {
      const r = c.resources.find(x => x.id === id);
      if (r) r.current = Math.min(r.max, r.current + (amount ?? r.max));
    }),
    setResourceMax: (id, max) => mutate(set, get, c => {
      const r = c.resources.find(x => x.id === id);
      if (r) { r.max = max; r.current = Math.min(r.current, max); }
    }),
    addResource: (resource) => mutate(set, get, c => {
      if (!c.resources.find(x => x.id === resource.id)) {
        c.resources.push(resource as never);
      }
    }),

    // ── Spells ───────────────────────────────────────────────
    addKnownSpell: (spell) => mutate(set, get, c => {
      const exists = c.knownSpells.find(s => s.spellId === spell.spellId && s.classId === spell.classId);
      if (!exists) c.knownSpells.push(spell as never);
    }),
    removeKnownSpell: (spellId, classId) => mutate(set, get, c => {
      c.knownSpells = c.knownSpells.filter(s => !(s.spellId === spellId && s.classId === classId));
    }),
    toggleSpellPrepared: (spellId, classId) => mutate(set, get, c => {
      const s = c.knownSpells.find(s => s.spellId === spellId && s.classId === classId);
      if (s && !s.alwaysPrepared) s.prepared = !s.prepared;
    }),
    setConcentration: (spellId) => mutate(set, get, c => {
      c.concentratingOnSpellId = spellId;
    }),

    // ── Rests ────────────────────────────────────────────────
    shortRest: (hitDieResults) => mutate(set, get, c => {
      c.health.current = Math.min(c.health.max, c.health.current + hitDieResults);
      c.resources
        .filter(r => r.rechargeOn === 'short_rest')
        .forEach(r => { r.current = r.max; });
    }),
    longRest: () => mutate(set, get, c => {
      c.health.current = c.health.max;
      c.health.temp = 0;
      c.health.deathSaves = { successes: 0, failures: 0 };
      c.health.stable = false;
      c.spellSlots.forEach(s => { s.current = s.max; });
      if (c.pactSlots) c.pactSlots.current = c.pactSlots.max;
      c.resources
        .filter(r => r.rechargeOn === 'short_rest' || r.rechargeOn === 'long_rest')
        .forEach(r => { r.current = r.max; });
      // Clear rest-duration embodiment
      c.elementalEmbodiment = null;
    }),

    // ── Inspiration ──────────────────────────────────────────
    setInspiration: (value) => mutate(set, get, c => { c.combat.inspiration = value; }),

    // ── Character Builder ─────────────────────────────────────
    setSpecies: (speciesId) => mutate(set, get, c => {
      c.speciesId = speciesId;
    }),

    setBackground: (backgroundId) => mutate(set, get, c => {
      c.backgroundId = backgroundId;
    }),

    addClassLevel: (classId, hitDie) => mutate(set, get, c => {
      const existing = c.classes.find(e => e.classId === classId);
      if (existing) {
        existing.level += 1;
      } else {
        c.classes.push({ classId, level: 1, choices: [] });
      }
      // Auto-record level 1 as max die if no roll exists yet
      const newLevel = existing ? existing.level : 1;
      const hasRoll = c.hpRolls.some(r => r.classId === classId && r.level === newLevel);
      if (!hasRoll) {
        c.hpRolls.push({ classId, level: newLevel, roll: newLevel === 1 ? hitDie : Math.ceil((hitDie + 1) / 2) });
      }
    }),

    removeClassLevel: (classId) => mutate(set, get, c => {
      const existing = c.classes.find(e => e.classId === classId);
      if (!existing) return;
      const removedLevel = existing.level;
      if (existing.level <= 1) {
        c.classes = c.classes.filter(e => e.classId !== classId);
      } else {
        existing.level -= 1;
      }
      // Remove the hp roll for that level
      c.hpRolls = c.hpRolls.filter(r => !(r.classId === classId && r.level === removedLevel));
      // Remove choices made at that level
      if (existing) {
        existing.choices = existing.choices.filter(ch => ch.level !== removedLevel);
      }
    }),

    setHpRoll: (classId, level, roll) => mutate(set, get, c => {
      const existing = c.hpRolls.find(r => r.classId === classId && r.level === level);
      if (existing) {
        existing.roll = roll;
      } else {
        c.hpRolls.push({ classId, level, roll });
      }
    }),

    resolveBuilderChoice: (choice, sourceType) => mutate(set, get, c => {
      if (sourceType === 'class') {
        const cls = c.classes.find(e => e.classId === choice.sourceId);
        if (!cls) return;
        const idx = cls.choices.findIndex(ch => ch.id === choice.id);
        if (idx >= 0) {
          cls.choices[idx] = choice;
        } else {
          cls.choices.push(choice);
        }
      } else if (sourceType === 'species') {
        const idx = c.speciesChoices.findIndex(ch => ch.id === choice.id);
        if (idx >= 0) { c.speciesChoices[idx] = choice; } else { c.speciesChoices.push(choice); }
      } else if (sourceType === 'background') {
        const idx = c.backgroundChoices.findIndex(ch => ch.id === choice.id);
        if (idx >= 0) { c.backgroundChoices[idx] = choice; } else { c.backgroundChoices.push(choice); }
      }
    }),

    setBaseStats: (stats) => mutate(set, get, c => {
      c.stats.base = stats;
    }),

    setBaseStat: (stat, value) => mutate(set, get, c => {
      c.stats.base[stat] = value;
    }),

    // ── Elemental Embodiment ─────────────────────────────────
    setElementalEmbodiment: (element) => mutate(set, get, c => {
      c.elementalEmbodiment = element;
    }),

    // ── Sync resource maxes from derived stats ────────────────
    // Call this from useCharacter whenever derived stats change.
    syncResourceMaxes: (resourceMaxes) => mutate(set, get, c => {
      for (const r of c.resources) {
        const newMax = resourceMaxes[r.id];
        if (newMax !== undefined && newMax !== r.max) {
          r.max = newMax;
          // Clamp current if it now exceeds the new max
          if (r.current > newMax) r.current = newMax;
        }
      }
    }),

    // ── Generic patch ────────────────────────────────────────
    patchCharacter: (changes) => mutate(set, get, c => { Object.assign(c, changes); }),
  }))
);
