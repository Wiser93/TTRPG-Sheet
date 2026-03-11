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
  /** Toggle equip for an inventory entry. Passing slot puts it there; omitting removes it. */
  equipItem: (inventoryEntryId: string, slot: import('@/types/game').EquipSlot) => void;
  unequipItem: (inventoryEntryId: string) => void;

  // ── Spell slots ────────────────────────────────────────────
  expendSlot: (level: number) => void;
  restoreSlot: (level: number) => void;
  setSlots: (slots: SpellSlotState[]) => void;

  // ── Resources ──────────────────────────────────────────────
  expendResource: (id: string, amount?: number, derivedMax?: number) => void;
  restoreResource: (id: string, amount?: number, derivedMax?: number) => void;
  setResourceMax: (id: string, max: number) => void;
  addResource: (resource: ResourceState) => void;

  // ── Spells ─────────────────────────────────────────────────
  addKnownSpell: (spell: KnownSpell) => void;
  removeKnownSpell: (spellId: string, classId: string) => void;
  toggleSpellPrepared: (spellId: string, classId: string) => void;
  setConcentration: (spellId: string | undefined) => void;

  // ── Rests ──────────────────────────────────────────────────
  shortRest: (healAmount: number, diceSpent?: Record<string, number>) => void;
  longRest: (grantInspiration?: boolean, maxHP?: number) => void;

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
  /** Set or clear the chosen subclass for a class entry */
  setSubclass: (classId: string, subclassId: string | undefined) => void;
  /** Advance (or set) a path feature's tier on a class entry */
  /** Set all six base stats at once */
  setBaseStats: (stats: import('@/types/character').StatBlock) => void;
  /** Set a single base stat */
  setBaseStat: (stat: import('@/types/game').StatKey, value: number) => void;

  // ── Sheet Config ───────────────────────────────────────────
  patchSheetConfig: (changes: Partial<import('@/types/character').SheetConfig>) => void;

  // ── Bio / Meta ─────────────────────────────────────────────
  patchMeta: (changes: Partial<import('@/types/character').CharacterMeta>) => void;
  patchAppearance: (changes: Partial<import('@/types/character').CharacterAppearance>) => void;
  patchBiography: (changes: Partial<import('@/types/character').CharacterBiography>) => void;

  // ── Elemental Embodiment ──────────────────────────────────
  setFeatureCardState: (featureId: string, value: string | null) => void;

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
    loadCharacter: (character) => set(s => {
      // Backfill fields added in later schema versions so existing saved
      // characters don't crash when mutations access them.
      if (!character.hpRolls) (character as Character).hpRolls = [];
      s.character = character as never;
      s.isLoading = false;
    }),
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

    equipItem: (inventoryEntryId, slot) => mutate(set, get, c => {
      // Remove from any existing slot first
      for (const s of Object.keys(c.equipped) as import('@/types/game').EquipSlot[]) {
        if (c.equipped[s] === inventoryEntryId) delete c.equipped[s];
      }
      c.equipped[slot] = inventoryEntryId;
    }),

    unequipItem: (inventoryEntryId) => mutate(set, get, c => {
      for (const s of Object.keys(c.equipped) as import('@/types/game').EquipSlot[]) {
        if (c.equipped[s] === inventoryEntryId) delete c.equipped[s];
      }
    }),

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
    expendResource: (id, amount = 1, derivedMax) => mutate(set, get, c => {
      let r = c.resources.find(x => x.id === id);
      if (!r) {
        // Synthetic resource (from isResource feature) — auto-register so current is persisted
        const max = derivedMax ?? 1;
        r = { id, name: id, current: max, max, rechargeOn: 'long_rest' };
        c.resources.push(r as never);
        r = c.resources[c.resources.length - 1] as typeof r;
      } else if (derivedMax !== undefined) {
        r.max = derivedMax;
      }
      r!.current = Math.max(0, r!.current - amount);
    }),
    restoreResource: (id, amount, derivedMax) => mutate(set, get, c => {
      let r = c.resources.find(x => x.id === id);
      if (!r) {
        const max = derivedMax ?? 1;
        r = { id, name: id, current: 0, max, rechargeOn: 'long_rest' };
        c.resources.push(r as never);
        r = c.resources[c.resources.length - 1] as typeof r;
      } else if (derivedMax !== undefined) {
        r.max = derivedMax;
      }
      const max = derivedMax ?? r!.max;
      r!.current = Math.min(max, r!.current + (amount ?? max));
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
    shortRest: (healAmount, diceSpent = {}) => mutate(set, get, c => {
      c.health.current = Math.min(c.health.max, c.health.current + healAmount);
      if (!c.health.hitDiceUsed) c.health.hitDiceUsed = {};
      for (const [classId, count] of Object.entries(diceSpent) as [string, number][]) {
        c.health.hitDiceUsed[classId] = (c.health.hitDiceUsed[classId] ?? 0) + count;
      }
      c.resources
        .filter(r => r.rechargeOn === 'short_rest')
        .forEach(r => { r.current = r.max; });
    }),
    longRest: (grantInspiration = false, maxHP?: number) => mutate(set, get, c => {
      const resolvedMax = maxHP ?? c.health.max;
      c.health.current = resolvedMax;
      c.health.max = resolvedMax;
      c.health.temp = 0;
      c.health.deathSaves = { successes: 0, failures: 0 };
      c.health.stable = false;
      // Restore hit dice: regain up to half total level (rounded up), capped per class
      const used = c.health.hitDiceUsed ?? {};
      const restored: Record<string, number> = {};
      let remaining = Math.ceil(c.classes.reduce((s, cl) => s + cl.level, 0) / 2);
      for (const cls of c.classes) {
        const spent = used[cls.classId] ?? 0;
        if (spent > 0 && remaining > 0) {
          const restore = Math.min(spent, remaining);
          restored[cls.classId] = (used[cls.classId] ?? 0) - restore;
          remaining -= restore;
        } else {
          restored[cls.classId] = used[cls.classId] ?? 0;
        }
      }
      c.health.hitDiceUsed = restored;
      c.spellSlots.forEach(s => { s.current = s.max; });
      if (c.pactSlots) c.pactSlots.current = c.pactSlots.max;
      c.resources
        .filter(r => r.rechargeOn === 'short_rest' || r.rechargeOn === 'long_rest')
        .forEach(r => { r.current = r.max; });
      // Auto-grant Heroic Inspiration from features (e.g. Resourceful)
      if (grantInspiration) c.combat.inspiration = true;
      // Clear rest-duration embodiment
      c.featureCardStates = {};
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
      if (!c.hpRolls) c.hpRolls = [];
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
      if (!c.hpRolls) c.hpRolls = [];
      c.hpRolls = c.hpRolls.filter(r => !(r.classId === classId && r.level === removedLevel));
      // Remove choices made at that level
      if (existing) {
        existing.choices = existing.choices.filter(ch => ch.level !== removedLevel);
      }
    }),

    setHpRoll: (classId, level, roll) => mutate(set, get, c => {
      if (!c.hpRolls) c.hpRolls = [];
      const existing = c.hpRolls.find(r => r.classId === classId && r.level === level);
      if (existing) {
        existing.roll = roll;
      } else {
        c.hpRolls.push({ classId, level, roll });
      }
    }),

    setSubclass: (classId, subclassId) => mutate(set, get, c => {
      const cls = c.classes.find(e => e.classId === classId);
      if (!cls) return;
      cls.subclassId = subclassId;
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

    // ── Sheet Config ────────────────────────────────────────
    patchSheetConfig: (changes) => mutate(set, get, c => {
      c.sheetConfig = { ...(c.sheetConfig ?? {}), ...changes };
    }),

    // ── Bio / Meta ──────────────────────────────────────────
    patchMeta: (changes) => mutate(set, get, c => {
      Object.assign(c.meta, changes);
    }),
    patchAppearance: (changes) => mutate(set, get, c => {
      c.appearance = { ...c.appearance, ...changes };
    }),
    patchBiography: (changes) => mutate(set, get, c => {
      c.biography = { ...c.biography, ...changes };
    }),

    // ── Elemental Embodiment ─────────────────────────────────
    setFeatureCardState: (featureId, value) => mutate(set, get, c => {
      if (!c.featureCardStates) c.featureCardStates = {};
      c.featureCardStates[featureId] = value;
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
