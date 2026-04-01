/**
 * supabase.js — GokulCV Supabase Service Layer v2
 * Auth + CV saving + Version control + ATS scan history
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// ── Auth ───────────────────────────────────────────────────────────────────

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

export const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const onAuthChange = (callback) =>
  supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });

// ── Saved CVs ─────────────────────────────────────────────────────────────

export const saveCV = async ({ title, sector, cvData, atsScore = null, atsJobType = null, atsSector = null, savedCvId = null }) => {
  const user = await getUser();
  if (!user) throw new Error('Not logged in');

  if (savedCvId) {
    const { data, error } = await supabase
      .from('saved_cvs')
      .update({
        title,
        sector,
        cv_data: cvData,
        ats_score: atsScore,
        ats_job_type: atsJobType,
        ats_sector: atsSector,
      })
      .eq('id', savedCvId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from('saved_cvs')
    .insert({
      user_id: user.id,
      title,
      sector,
      cv_data: cvData,
      ats_score: atsScore,
      ats_job_type: atsJobType,
      ats_sector: atsSector,
      version_number: 1,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getSavedCVs = async () => {
  const user = await getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('saved_cvs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const updateCVScore = async (cvId, atsScore, atsJobType = null, atsSector = null) => {
  const { error } = await supabase
    .from('saved_cvs')
    .update({ ats_score: atsScore, ats_job_type: atsJobType, ats_sector: atsSector })
    .eq('id', cvId);

  if (error) throw error;
};

export const deleteCV = async (cvId) => {
  const { error } = await supabase
    .from('saved_cvs')
    .delete()
    .eq('id', cvId);

  if (error) throw error;
};

// ── CV Versions ───────────────────────────────────────────────────────────

/**
 * Save a new version of a CV with its ATS score.
 * Call this every time a CV is generated or regenerated.
 */
export const saveCVVersion = async ({ savedCvId = null, cvData, sector, atsScore = null, atsJobType = null, notes = null }) => {
  const user = await getUser();
  if (!user) return null; // silently skip if not logged in

  // Get next version number for this CV
  let versionNumber = 1;
  if (savedCvId) {
    const { data: existing } = await supabase
      .from('cv_versions')
      .select('version_number')
      .eq('saved_cv_id', savedCvId)
      .order('version_number', { ascending: false })
      .limit(1);

    if (existing?.length) {
      versionNumber = existing[0].version_number + 1;
    }
  }

  const { data, error } = await supabase
    .from('cv_versions')
    .insert({
      user_id: user.id,
      saved_cv_id: savedCvId,
      version_number: versionNumber,
      cv_data: cvData,
      sector,
      ats_score: atsScore,
      ats_job_type: atsJobType,
      notes,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to save CV version:', error);
    return null;
  }
  return data;
};

/**
 * Get all versions of a specific saved CV, ordered by version number.
 */
export const getCVVersions = async (savedCvId) => {
  const { data, error } = await supabase
    .from('cv_versions')
    .select('*')
    .eq('saved_cv_id', savedCvId)
    .order('version_number', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Get all CV versions for the current user (for version history dashboard).
 */
export const getAllVersions = async () => {
  const user = await getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('cv_versions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data || [];
};

// ── ATS Scan History ──────────────────────────────────────────────────────

/**
 * Save an ATS scan result for the logged-in user.
 * Call this after every successful ATS analysis.
 */
export const saveATSScan = async ({ score, jobType, sector, matchedCount, missingCount, jobTitle = null, companyHint = null }) => {
  const user = await getUser();
  if (!user) return null; // silently skip if not logged in

  const { data, error } = await supabase
    .from('ats_scans')
    .insert({
      user_id: user.id,
      score,
      job_type: jobType,
      sector,
      matched_count: matchedCount,
      missing_count: missingCount,
      job_title: jobTitle,
      company_hint: companyHint,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to save ATS scan:', error);
    return null;
  }
  return data;
};

/**
 * Get the user's ATS scan history, most recent first.
 */
export const getATSScanHistory = async (limit = 20) => {
  const user = await getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('ats_scans')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
};

/**
 * Get the user's best ATS score ever and their score trend.
 */
export const getATSScoreTrend = async () => {
  const history = await getATSScanHistory(10);
  if (!history.length) return { best: null, latest: null, trend: null, history: [] };

  const scores = history.map(s => s.score);
  const best = Math.max(...scores);
  const latest = scores[0];
  const previous = scores[1] || null;
  const trend = previous !== null ? latest - previous : null;

  return { best, latest, trend, history };
};
