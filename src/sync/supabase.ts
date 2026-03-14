/**
 * sync/supabase.ts — Character sync with Supabase
 *
 * Strategy: local-first.
 *   - Dexie (IndexedDB) is the source of truth.
 *   - On push: send all characters with isDirty=true to Supabase.
 *   - On pull: fetch all characters for the current user.
 *   - Conflict resolution: last-write-wins on updated_at.
 */

import { supabase } from '@/lib/supabase';
import { db } from '@/db/schema';
import type { Character } from '@/types/character';
import type { DBCharacter } from '@/db/schema';

// ── Observable status ──────────────────────────────────────────

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

export interface SyncResult {
  pushed: number; pulled: number; conflicts: number; errors: string[];
}

let _status: SyncStatus = 'idle';
let _lastError: string | null = null;
const _listeners = new Set<() => void>();

function setStatus(s: SyncStatus, err?: string) {
  _status = s; _lastError = err ?? null;
  _listeners.forEach(fn => fn());
}
export const getSyncStatus  = () => _status;
export const getLastError   = () => _lastError;
export function onSyncStatusChange(fn: () => void) {
  _listeners.add(fn); return () => _listeners.delete(fn);
}

// ── Push ──────────────────────────────────────────────────────

export async function pushDirtyCharacters(): Promise<number> {
  if (!supabase) return 0;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const dirty = await db.characters
    .filter(c => !!(c as { meta: { isDirty?: boolean } }).meta.isDirty && !c.deletedAt)
    .toArray();
  if (!dirty.length) return 0;

  setStatus('syncing');
  const rows = dirty.map(c => ({
    id:          c.id,
    user_id:     user.id,
    campaign_id: (c as unknown as { meta: { campaignId?: string } }).meta.campaignId ?? null,
    data:        c as unknown,
    updated_at:  (c as unknown as { meta: { updatedAt: string } }).meta.updatedAt,
  }));

  const { error } = await supabase.from('characters').upsert(rows, { onConflict: 'id' });
  if (error) { setStatus('error', error.message); return 0; }

  await Promise.all(dirty.map(c =>
    db.characters.update(c.id, { 'meta.isDirty': false } as Partial<DBCharacter>)
  ));
  setStatus('idle');
  return dirty.length;
}

// ── Pull ──────────────────────────────────────────────────────

export async function pullMyCharacters(): Promise<number> {
  if (!supabase) return 0;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  setStatus('syncing');
  const { data, error } = await supabase
    .from('characters').select('*').eq('user_id', user.id);
  if (error) { setStatus('error', error.message); return 0; }
  if (!data?.length) { setStatus('idle'); return 0; }

  let pulled = 0;
  for (const row of data) {
    const remote = row.data as DBCharacter;
    const local  = await db.characters.get(row.id);
    const remoteTs = new Date(row.updated_at).getTime();
    const localTs  = local
      ? new Date((local as unknown as { meta: { updatedAt: string } }).meta.updatedAt).getTime()
      : 0;
    if (!local || remoteTs > localTs) {
      await db.characters.put({ ...remote, 'meta.isDirty': false } as DBCharacter);
      pulled++;
    }
  }
  setStatus('idle');
  return pulled;
}

/** Pull all characters in a campaign — for DM view (read-only, not stored locally). */
export async function pullCampaignCharacters(
  campaignId: string
): Promise<(Character & { id: string })[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('characters').select('id, data, updated_at')
    .eq('campaign_id', campaignId);
  if (error || !data) return [];
  return data.map(row => ({ ...(row.data as Character), id: row.id }));
}

// ── Full sync ─────────────────────────────────────────────────

export async function syncAll(): Promise<SyncResult> {
  const result: SyncResult = { pushed: 0, pulled: 0, conflicts: 0, errors: [] };
  if (!supabase) { result.errors.push('Supabase not configured'); return result; }
  try {
    result.pushed = await pushDirtyCharacters();
    result.pulled = await pullMyCharacters();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    result.errors.push(msg);
    setStatus('error', msg);
  }
  return result;
}

// ── Campaign management ────────────────────────────────────────

export async function createCampaign(name: string): Promise<{ id: string; join_code: string } | null> {
  if (!supabase) { console.error('[createCampaign] Supabase not configured'); return null; }
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) { console.error('[createCampaign] getUser error:', userError); return null; }
  if (!user) { console.error('[createCampaign] No authenticated user'); return null; }
  console.log('[createCampaign] user.id:', user.id, 'name:', name);
  const { data, error } = await supabase
    .from('campaigns').insert({ name, dm_user_id: user.id })
    .select('id, join_code').single();
  console.log('[createCampaign] data:', data, 'error:', error);
  if (error || !data) { return null; }
  return data;
}

export async function joinCampaign(
  joinCode: string, characterId: string
): Promise<{ name: string } | null> {
  if (!supabase) return null;
  const { data: campaign, error } = await supabase
    .from('campaigns').select('id, name')
    .eq('join_code', joinCode.toUpperCase().trim()).single();
  if (error || !campaign) return null;
  await db.characters.update(characterId, {
    'meta.campaignId': campaign.id,
    'meta.isDirty':    true,
    'meta.updatedAt':  new Date().toISOString(),
  } as Partial<DBCharacter>);
  await pushDirtyCharacters();
  return { name: campaign.name };
}

export async function leaveCampaign(characterId: string): Promise<void> {
  await db.characters.update(characterId, {
    'meta.campaignId': undefined,
    'meta.isDirty':    true,
    'meta.updatedAt':  new Date().toISOString(),
  } as Partial<DBCharacter>);
  await pushDirtyCharacters();
}

export async function getMyCampaigns(): Promise<
  { id: string; name: string; join_code: string; dm_user_id: string }[]
> {
  if (!supabase) return [];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('campaigns').select('id, name, join_code, dm_user_id')
    .eq('dm_user_id', user.id);
  return (error || !data) ? [] : data;
}
