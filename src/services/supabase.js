/**
 * supabase.js — Supabase client + auth + saved-CV helpers
 *
 * Required Supabase table (create via SQL Editor):
 *
 *   create table saved_cvs (
 *     id         uuid primary key default gen_random_uuid(),
 *     user_id    uuid references auth.users(id) on delete cascade not null,
 *     title      text not null default 'Untitled CV',
 *     resume_data jsonb not null,
 *     created_at  timestamptz default now(),
 *     updated_at  timestamptz default now()
 *   );
 *
 *   alter table saved_cvs enable row level security;
 *
 *   create policy "Users can view own CVs"
 *     on saved_cvs for select using (auth.uid() = user_id);
 *   create policy "Users can insert own CVs"
 *     on saved_cvs for insert with check (auth.uid() = user_id);
 *   create policy "Users can update own CVs"
 *     on saved_cvs for update using (auth.uid() = user_id);
 *   create policy "Users can delete own CVs"
 *     on saved_cvs for delete using (auth.uid() = user_id);
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnon);

// ─── Auth helpers ────────────────────────────────────────────

export const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
    return data;
};

export const signInWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
};

export const signUpWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
    });
    if (error) throw error;
    return data;
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

export const getSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
};

// ─── Saved-CV helpers ────────────────────────────────────────

export const fetchSavedCVs = async () => {
    const { data, error } = await supabase
        .from('saved_cvs')
        .select('id, title, updated_at')
        .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
};

export const loadCV = async (id) => {
    const { data, error } = await supabase
        .from('saved_cvs')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
};

export const saveCV = async (resumeData, title = 'Untitled CV', existingId = null) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    if (existingId) {
        const { data, error } = await supabase
            .from('saved_cvs')
            .update({ resume_data: resumeData, title, updated_at: new Date().toISOString() })
            .eq('id', existingId)
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    const { data, error } = await supabase
        .from('saved_cvs')
        .insert({ user_id: user.id, resume_data: resumeData, title })
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const deleteCV = async (id) => {
    const { error } = await supabase
        .from('saved_cvs')
        .delete()
        .eq('id', id);
    if (error) throw error;
};
