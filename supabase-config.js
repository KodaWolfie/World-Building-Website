const SUPABASE_URL = 'https://ncxgjtcxymfkekmwqxta.supabase.co';
const SUPABASE_KEY = 'sb_publishable_g7u6v_H5QXdoOYPM4sL6hQ_r4lkZHVs';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function signUpWithPassword(email, password) {
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) { alert('Sign up failed: ' + error.message); return false; }
  return true;
}

async function signInWithPassword(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) { alert('Login failed: ' + error.message); return false; }
  return true;
}

async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) { alert('Sign out failed: ' + error.message); return false; }
  return true;
}

async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data?.user ?? null;
}

async function saveWorld(worldName, genre, theme) {
  const user = await getCurrentUser();
  if (!user) { alert('Please log in first.'); return false; }

  const { error } = await supabase.from('worlds').insert([{
    user_id: user.id,
    user_email: user.email,
    world_name: worldName,
    genre,
    theme
  }]);

  if (error) { alert('Error saving world: ' + error.message); return false; }
  return true;
}

async function getUserWorlds() {
  const user = await getCurrentUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('worlds')
    .select('id, world_name, genre, theme, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data || [];
}

async function updateWorld(worldId, worldName, genre, theme) {
  const user = await getCurrentUser();
  if (!user) return false;

  const { error } = await supabase
    .from('worlds')
    .update({ world_name: worldName, genre, theme })
    .eq('id', worldId)
    .eq('user_id', user.id);

  return !error;
}

async function deleteWorldById(worldId) {
  const user = await getCurrentUser();
  if (!user) return false;

  const { error } = await supabase
    .from('worlds')
    .delete()
    .eq('id', worldId)
    .eq('user_id', user.id);

  return !error;
}

function setCurrentWorld(worldName, genre, theme) {
  localStorage.setItem('currentWorld', JSON.stringify({ name: worldName, genre, theme }));
}

function getCurrentWorld() {
  const world = localStorage.getItem('currentWorld');
  return world ? JSON.parse(world) : null;
}
