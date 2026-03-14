import { create } from 'zustand';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthStore {
  user:    User | null;
  session: Session | null;
  loading: boolean;

  /** Sign up with email + password. Returns error message or null on success. */
  signUp:   (email: string, password: string, name: string) => Promise<string | null>;
  /** Sign in with email + password. Returns error message or null on success. */
  signIn:   (email: string, password: string)               => Promise<string | null>;
  signOut:  ()                                              => Promise<void>;
  /** Called once on app mount to restore session from storage. */
  init:     ()                                              => Promise<void>;
}

function errMsg(e: AuthError | Error | unknown): string {
  if (e && typeof e === 'object' && 'message' in e) return (e as { message: string }).message;
  return 'Unknown error';
}

export const useAuthStore = create<AuthStore>()(set => ({
  user:    null,
  session: null,
  loading: true,

  init: async () => {
    if (!supabase) { set({ loading: false }); return; }

    // Restore existing session
    const { data: { session } } = await supabase.auth.getSession();
    set({ session, user: session?.user ?? null, loading: false });

    // Listen for auth changes (sign in, sign out, token refresh)
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
    });
  },

  signUp: async (email, password, name) => {
    if (!supabase) return 'Supabase not configured';
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    });
    return error ? errMsg(error) : null;
  },

  signIn: async (email, password) => {
    if (!supabase) return 'Supabase not configured';
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? errMsg(error) : null;
  },

  signOut: async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },
}));
