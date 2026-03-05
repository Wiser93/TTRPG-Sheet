import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useCharacterStore } from '@/store/characterStore';
import { getCharacter } from '@/db/characterDatabase';
import { db } from '@/db/schema';
import { deriveStats } from '@/lib/deriveStats';
import type { DerivedStats } from '@/types/character';

/**
 * Loads a character into the store, keeps it live-synced with Dexie,
 * and returns the derived stats.
 */
export function useCharacter(characterId: string | null) {
  const { loadCharacter, unloadCharacter, character, syncResourceMaxes } = useCharacterStore();
  const [derived, setDerived] = useState<DerivedStats | null>(null);

  // Live-query classes, species, etc. for derived stat calculation
  const gameData = useLiveQuery(async () => {
    const [classes, subclasses, species, backgrounds, feats] = await Promise.all([
      db.classes.toArray(),
      db.subclasses.toArray(),
      db.species.toArray(),
      db.backgrounds.toArray(),
      db.feats.toArray(),
    ]);
    return { classes, subclasses, species, backgrounds, feats };
  }, []);

  // Load character into store on mount / id change
  useEffect(() => {
    if (!characterId) {
      unloadCharacter();
      return;
    }
    let cancelled = false;
    getCharacter(characterId).then(c => {
      if (!cancelled && c) loadCharacter(c);
    });
    return () => {
      cancelled = true;
      unloadCharacter();
    };
  }, [characterId, loadCharacter, unloadCharacter]);

  // Recalculate derived stats whenever character or game data changes
  useEffect(() => {
    if (!character || !gameData) return;
    try {
      const d = deriveStats(character, gameData);
      setDerived(d);
      // Sync any formula-based resource maxes back into the store
      if (Object.keys(d.resourceMaxes).length > 0) {
        syncResourceMaxes(d.resourceMaxes);
      }
    } catch (e) {
      console.error('Failed to derive stats:', e);
    }
  }, [character, gameData, syncResourceMaxes]);

  return { character, derived, isLoaded: !!character };
}
