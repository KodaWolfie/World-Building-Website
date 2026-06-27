// Supabase Configuration
const SUPABASE_URL = 'https://ncxgjtcxymfkekmwqxta.supabase.co';
const SUPABASE_KEY = 'sb_publishable_g7u6v_H5QXdoOYPM4sL6hQ_r4lkZHVs';

// Initialize Supabase using the window.supabase object from the CDN
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ---------- Auth (Email + Password) ----------
async function signUpWithPassword(email, password) {
  const { error } = await supabaseClient.auth.signUp({
    email,
    password
  });

  if (error) {
    alert('Sign up failed: ' + error.message);
    return false;
  }

  alert('Sign up successful. You can now log in.');
  return true;
}

async function signInWithPassword(email, password) {
  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert('Login failed: ' + error.message);
    return false;
  }

  return true;
}

async function signOut() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    alert('Sign out failed: ' + error.message);
    return false;
  }
  return true;
}

async function getCurrentUser() {
  const { data, error } = await supabaseClient.auth.getUser();
  if (error) {
    console.error(error);
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

  const { error } = await supabaseClient.from('worlds').insert([row]);

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

  const { data, error } = await supabaseClient
    .from('worlds')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching worlds:', error);
    return [];
  }

  return data || [];
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

//---- Photos Countries Clients Stuff ------
const supabaseUrl = "YOUR_SUPABASE_URL";
const supabaseKey = "YOUR_SUPABASE_ANON_KEY";
window.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
