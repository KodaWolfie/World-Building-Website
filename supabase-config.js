// Supabase Configuration
const SUPABASE_URL = 'https://ncxgjtcxymfkekmwqxta.supabase.co';
const SUPABASE_KEY = 'sb_publishable_g7u6v_H5QXdoOYPM4sL6hQ_r4lkZHVs';

// Create ONE shared client and expose it globally as `supabase`
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ---------- Auth (Email + Password) ----------
async function signUpWithPassword(email, password) {
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    alert('Sign up failed: ' + error.message);
    return false;
  }

  alert('Sign up successful. You can now log in.');
  return true;
}

async function signInWithPassword(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    alert('Login failed: ' + error.message);
    return false;
  }

  return true;
}

async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    alert('Sign out failed: ' + error.message);
    return false;
  }

  return true;
}

async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }

  return data?.user ?? null;
}

// ---------- Worlds ----------
async function saveWorld(worldName, genre, theme) {
  const user = await getCurrentUser();
  if (!user) {
    alert('Please log in first.');
    return false;
  }

  const row = {
    user_id: user.id,
    user_email: user.email,
    world_name: worldName,
    genre,
    theme
  };

  const { error } = await supabase.from('worlds').insert([row]);

  if (error) {
    console.error('Error saving world:', error);
    alert('Error saving world: ' + error.message);
    return false;
  }

  alert('World created successfully!');
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

  if (error) {
    console.error('Error fetching worlds:', error);
    return [];
  }

  return data || [];
}

async function updateWorld(worldId, worldName, genre, theme) {
  const user = await getCurrentUser();
  if (!user) {
    alert('Please log in first.');
    return false;
  }

  const { error } = await supabase
    .from('worlds')
    .update({
      world_name: worldName,
      genre,
      theme
    })
    .eq('id', worldId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error updating world:', error);
    alert('Error updating world: ' + error.message);
    return false;
  }

  return true;
}

async function deleteWorldById(worldId) {
  const user = await getCurrentUser();
  if (!user) {
    alert('Please log in first.');
    return false;
  }

  const { error } = await supabase
    .from('worlds')
    .delete()
    .eq('id', worldId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting world:', error);
    alert('Error deleting world: ' + error.message);
    return false;
  }

  return true;
}

// ---------- Existing local UI state ----------
function setCurrentWorld(worldName, genre, theme) {
  localStorage.setItem(
    'currentWorld',
    JSON.stringify({ name: worldName, genre, theme })
  );
}

function getCurrentWorld() {
  const world = localStorage.getItem('currentWorld');
  return world ? JSON.parse(world) : null;
}
