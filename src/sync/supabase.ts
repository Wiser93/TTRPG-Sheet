/**
 * sync/supabase.ts
 *
 * Stub for future Supabase sync integration.
 *
 * The strategy:
 *  1. All local writes set isDirty=true and update the local timestamp.
 *  2. On demand (or on reconnect), push dirty records up.
 *  3. Pull remote changes for characters the user owns (by remoteId).
 *  4. Conflict resolution: last-write-wins on updatedAt (can be upgraded later).
 *
 * To activate, install @supabase/supabase-js, create a project, and set the
 * two environment variables below in your .env file:
 *
 *   VITE_SUPABASE_URL=https://xxxx.supabase.co
 *   VITE_SUPABASE_ANON_KEY=your-anon-key
 *
 * The expected Supabase table schemas mirror the local Dexie types exactly —
 * this makes upserts trivial. Enable Row Level Security with a policy that
 * binds each row to auth.uid() == owner_id.
 */

// ── Placeholder types (replace with real Supabase client once installed) ──

interface SyncResult {
  pushed: number;
  pulled: number;
  conflicts: number;
  errors: string[];
}

type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

let syncStatus: SyncStatus = 'idle';

// ── Auth stub ──────────────────────────────────────────────────────────────

export async function signIn(_email: string, _password: string): Promise<void> {
  throw new Error('Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

export async function signOut(): Promise<void> {
  throw new Error('Supabase not configured.');
}

export function getCurrentUser(): null {
  return null;
}

// ── Sync ───────────────────────────────────────────────────────────────────

export async function syncAll(): Promise<SyncResult> {
  console.warn('[Sync] Supabase sync not yet configured.');
  return { pushed: 0, pulled: 0, conflicts: 0, errors: ['Supabase not configured'] };
}

export async function pushDirtyCharacters(): Promise<number> {
  console.warn('[Sync] Supabase sync not yet configured.');
  return 0;
}

export async function pullCharacter(_remoteId: string): Promise<void> {
  throw new Error('Supabase not configured.');
}

export function getSyncStatus(): SyncStatus {
  return syncStatus;
}

/**
 * When you're ready to implement sync, replace this file with something like:
 *
 * import { createClient } from '@supabase/supabase-js';
 * import { db } from '@/db/schema';
 *
 * const supabase = createClient(
 *   import.meta.env.VITE_SUPABASE_URL,
 *   import.meta.env.VITE_SUPABASE_ANON_KEY
 * );
 *
 * export async function pushDirtyCharacters() {
 *   const dirty = await db.characters.filter(c => !!c.isDirty && !c.deletedAt).toArray();
 *   const { error } = await supabase.from('characters').upsert(
 *     dirty.map(c => ({ ...c, owner_id: supabase.auth.user()?.id }))
 *   );
 *   if (!error) {
 *     await Promise.all(dirty.map(c => db.characters.update(c.id, { isDirty: false })));
 *   }
 *   return dirty.length;
 * }
 */
