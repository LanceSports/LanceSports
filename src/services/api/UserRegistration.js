
const supabase = require('../../../scripts/supabase');

async function ensureUser(googleId) {
  const { error } = await supabase
    .from('app_users')
    .upsert([{ google_id: googleId }], { onConflict: 'google_id' });

  if (error) throw error;
}

async function addPreference(googleId, sport, league) {
  const { error } = await supabase
    .from('user_preferences')
    .upsert([{ google_id: googleId, sport, league }], { onConflict: 'google_id,sport,league' });

  if (error) throw error;
}

async function setPreferences(googleId, prefs) {
  // Remove old prefs
  let { error: delError } = await supabase
    .from('user_preferences')
    .delete()
    .eq('google_id', googleId);

  if (delError) throw delError;

  // Insert new prefs
  let { error: insError } = await supabase
    .from('user_preferences')
    .insert(prefs.map(p => ({ google_id: googleId, ...p })));

  if (insError) throw insError;
}

async function getPreferences(googleId) {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('sport, league')
    .eq('google_id', googleId);

  if (error) throw error;
  return data;
}

module.exports = {
  ensureUser,
  addPreference,
  setPreferences,
  getPreferences,
};
