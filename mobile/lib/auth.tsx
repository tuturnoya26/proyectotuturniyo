import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { type Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import type { AuthSessionResult } from 'expo-web-browser';
import { isSupabaseConfigured, supabase } from './supabase';
import type { Profile, UserRole } from '@/types/database';

WebBrowser.maybeCompleteAuthSession();

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signInWithGoogle: (role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  updateRole: (role: UserRole) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getRedirectUrl() {
  return Linking.createURL('auth/callback');
}

function getCodeFromCallback(result: AuthSessionResult) {
  if (result.type !== 'success') return null;

  const parsed = Linking.parse(result.url);
  const queryCode =
    typeof parsed.queryParams?.code === 'string' ? parsed.queryParams.code : null;

  if (queryCode) return queryCode;

  if (parsed.fragment) {
    const params = new URLSearchParams(parsed.fragment);
    return params.get('code');
  }

  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        if (!mounted) return;
        setSession(session);
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('No se pudo restaurar la sesion', error);
        if (!mounted) return;
        setSession(null);
        setProfile(null);
        setLoading(false);
      });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (_event, nextSession) => {
        if (!mounted) return;
        setSession(nextSession);
        if (nextSession?.user) {
          await loadProfile(nextSession.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  async function loadProfile(userId: string) {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('No se pudo cargar el perfil', error);
      setProfile(null);
    }
    setLoading(false);
  }

  async function refreshProfile() {
    if (!isSupabaseConfigured || !session?.user) return;
    await loadProfile(session.user.id);
  }

  async function signInWithGoogle(role: UserRole) {
    if (!isSupabaseConfigured) {
      throw new Error('Configura tus credenciales reales de Supabase en mobile/.env');
    }

    const redirectTo = getRedirectUrl();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;
    if (!data?.url) {
      throw new Error('No se pudo iniciar el flujo de Google');
    }

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

    if (result.type === 'cancel' || result.type === 'dismiss') {
      throw new Error('Se cancelo el login con Google');
    }

    const code = getCodeFromCallback(result);
    if (!code) {
      throw new Error('Google no devolvio un codigo de autenticacion valido');
    }

    const { data: sessionData, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) throw exchangeError;
    if (!sessionData.session?.user) {
      throw new Error('No se pudo crear la sesion con Google');
    }

    setSession(sessionData.session);
    await updateRole(role, sessionData.session.user.id);
    await loadProfile(sessionData.session.user.id);
  }

  async function signOut() {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
  }

  async function updateRole(role: UserRole, userIdOverride?: string) {
    if (!isSupabaseConfigured) {
      throw new Error('Configura tus credenciales reales de Supabase en mobile/.env');
    }

    const userId = userIdOverride ?? session?.user?.id;
    if (!userId) return;

    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);
    if (error) throw error;

    if (!userIdOverride) {
      await refreshProfile();
    }
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        loading,
        signInWithGoogle,
        signOut,
        updateRole,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
