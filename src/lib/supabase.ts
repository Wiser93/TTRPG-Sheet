/// <reference types="vite/client" />
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL  as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !key) {
  console.warn('[Supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set — sync disabled.');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Supa = SupabaseClient<any>;

export const supabase: Supa | null = (url && key)
  ? createClient(url, key)
  : null;

export function isSupabaseConfigured(): boolean {
  return !!supabase;
}

export interface CampaignRow {
  id: string;
  name: string;
  join_code: string;
  dm_user_id: string;
  created_at: string;
}

export interface CharacterRow {
  id: string;
  user_id: string;
  campaign_id: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  updated_at: string;
}
