import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  /** Current authenticated user */
  user: User | null;
  /** Current Supabase session */
  session: Session | null;
  /** Whether auth state is being loaded */
  isLoading: boolean;
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Whether the user chose to continue as guest */
  isGuest: boolean;
  /** Whether the store has been initialized */
  isInitialized: boolean;

  // Actions
  /** Initialize auth listener (call once on app mount) */
  initialize: () => void;
  /** Sign in with email and password */
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  /** Sign up with email, password, and username */
  signUp: (email: string, password: string, username: string) => Promise<{ error: string | null; needsConfirmation?: boolean }>;
  /** Sign out the current user */
  signOut: () => Promise<void>;
  /** Continue as guest without authentication */
  continueAsGuest: () => void;
  /** Exit guest mode and return to auth screen */
  exitGuest: () => void;
}

export const useAuthStore = create<AuthState>()((set, get) => {
  let authListener: ReturnType<ReturnType<typeof createClient>['auth']['onAuthStateChange']> | null = null;

  return {
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    isGuest: false,
    isInitialized: false,

    initialize: () => {
      if (get().isInitialized) return;

      const supabase = createClient();

      // Listen for auth state changes
      authListener = supabase.auth.onAuthStateChange((_event, session) => {
        set({
          user: session?.user ?? null,
          session,
          isAuthenticated: !!session,
          isLoading: false,
          isInitialized: true,
          // If user signs in, turn off guest mode
          isGuest: session ? false : get().isGuest,
        });
      });

      // Also check current session
      supabase.auth.getSession().then(({ data: { session } }) => {
        set({
          user: session?.user ?? null,
          session,
          isAuthenticated: !!session,
          isLoading: false,
          isInitialized: true,
        });
      });
    },

    signIn: async (email, password) => {
      set({ isLoading: true });
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          set({ isLoading: false });
          return { error: error.message };
        }

        // Auth state change listener will update the store
        return { error: null };
      } catch {
        set({ isLoading: false });
        return { error: 'An unexpected error occurred' };
      }
    },

    signUp: async (email, password, username) => {
      set({ isLoading: true });
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
            },
          },
        });

        if (error) {
          set({ isLoading: false });
          return { error: error.message };
        }

        set({ isLoading: false });
        // Supabase may require email confirmation
        return { error: null, needsConfirmation: true };
      } catch {
        set({ isLoading: false });
        return { error: 'An unexpected error occurred' };
      }
    },

    signOut: async () => {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch {
        // Still reset local state even if signOut fails
      }
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isGuest: false,
        isLoading: false,
      });
    },

    continueAsGuest: () => {
      set({
        isGuest: true,
        isLoading: false,
      });
    },

    exitGuest: () => {
      set({
        isGuest: false,
        isLoading: false,
      });
    },
  };
});
