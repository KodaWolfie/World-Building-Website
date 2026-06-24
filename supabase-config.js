// Supabase Configuration
const SUPABASE_URL = 'https://ncxgjtcxymfkekmwqxta.supabase.co';
const SUPABASE_KEY = 'sb_publishable_g7u6v_H5QXdoOYPM4sL6hQ_r4lkZHVs';

// Initialize Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Get user email (for now, using localStorage)
function getUserEmail() {
  let email = localStorage.getItem('userEmail');
  if (!email) {
    email = prompt('Please enter your email to get started:');
    if (email) {
      localStorage.setItem('userEmail', email);
    }
  }
  return email;
}

// Save a world to Supabase
async function saveWorld(worldName, genre, theme) {
  const userEmail = getUserEmail();
  if (!userEmail) {
    alert('Email is required to save worlds');
    return false;
  }

  try {
    const { data, error } = await supabase
      .from('worlds')
      .insert([
        {
          user_email: userEmail,
          world_name: worldName,
          genre: genre,
          theme: theme
        }
      ]);

    if (error) {
      console.error('Error saving world:', error);
      alert('Error saving world: ' + error.message);
      return false;
    }

    console.log('World saved:', data);
    return true;
  } catch (err) {
    console.error('Unexpected error:', err);
    alert('Unexpected error: ' + err.message);
    return false;
  }
}

// Get all worlds for current user
async function getUserWorlds() {
  const userEmail = getUserEmail();
  if (!userEmail) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('worlds')
      .select('*')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching worlds:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error:', err);
    return [];
  }
}

// Store current world in localStorage for the building ideas page
function setCurrentWorld(worldName, genre, theme) {
  localStorage.setItem('currentWorld', JSON.stringify({
    name: worldName,
    genre: genre,
    theme: theme
  }));
}

// Get current world from localStorage
function getCurrentWorld() {
  const world = localStorage.getItem('currentWorld');
  return world ? JSON.parse(world) : null;
}