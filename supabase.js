import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Auth helpers ─────────────────────────────────────────────

export const signInWithGoogle = () =>
  supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });

export const signInWithEmail = (email, password) =>
  supabase.auth.signInWithPassword({ email, password });

export const signUpWithEmail = (email, password) =>
  supabase.auth.signUp({ email, password });

export const signOut = () => supabase.auth.signOut();

export const getUser = () => supabase.auth.getUser();

// ── CV helpers ───────────────────────────────────────────────

export const saveCV = async (userId, title, sector, cvData) => {
  const { data, error } = await supabase
    .from('saved_cvs')
    .insert([{ user_id: userId, title, sector, cv_data: cvData }])
    .select()
    .single();
  return { data, error };
};

export const getSavedCVs = async (userId) => {
  const { data, error } = await supabase
    .from('saved_cvs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const deleteCV = async (id) => {
  const { error } = await supabase
    .from('saved_cvs')
    .delete()
    .eq('id', id);
  return { error };
};
