(function () {
  const SUPABASE_URL = 'https://ncxgjtcxymfkekmwqxta.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_g7u6v_H5QXdoOYPM4sL6hQ_r4lkZHVs';

  const supabaseLib = window.supabase;
  if (!supabaseLib || typeof supabaseLib.createClient !== 'function') {
    alert('Supabase library failed to load.');
    return;
  }

  const client = supabaseLib.createClient(SUPABASE_URL, SUPABASE_KEY);
  window.sb = client;

  // ---------- Auth ----------
  async function signUpWithPassword(email, password) {
    const { error } = await client.auth.signUp({ email, password });
    if (error) {
      alert('Sign up failed: ' + error.message);
      return false;
    }
    alert('Sign up successful. You can now log in.');
    return true;
  }

  async function signInWithPassword(email, password) {
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      alert('Login failed: ' + error.message);
      return false;
    }
    return true;
  }

  async function signOut() {
    const { error } = await client.auth.signOut();
    if (error) {
      alert('Sign out failed: ' + error.message);
      return false;
    }
    return true;
  }

  async function getCurrentUser() {
    const { data, error } = await client.auth.getUser();
    if (error) return null;
    return data?.user ?? null;
  }

  async function requireUser() {
    const user = await getCurrentUser();
    if (!user) {
      alert('Please log in first.');
      return null;
    }
    return user;
  }

  // ---------- Current World (local UI state only) ----------
  // Save BOTH id and display fields so every page can safely query Supabase
  function setCurrentWorld(worldId, worldName, genre, theme) {
    localStorage.setItem(
      'currentWorld',
      JSON.stringify({
        id: worldId ?? null,
        name: worldName ?? '',
        genre: genre ?? '',
        theme: theme ?? ''
      })
    );
    localStorage.setItem('lastWorldName', worldName ?? '');
  }

  function getCurrentWorld() {
    const raw = localStorage.getItem('currentWorld');
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  function clearCurrentWorld() {
    localStorage.removeItem('currentWorld');
  }

  // ---------- Worlds ----------
  // NOTE: your worlds table uses: id, user_id, world_name, genre, theme, created_at
  async function saveWorld(worldName, genre, theme) {
    const user = await requireUser();
    if (!user) return false;

    const { data, error } = await client
      .from('worlds')
      .insert([{
        user_id: user.id,
        user_email: user.email,
        world_name: worldName,
        genre,
        theme
      }])
      .select('id, world_name, genre, theme')
      .single();

    if (error) {
      alert('Error saving world: ' + error.message);
      return false;
    }

    // Set newly created world as current
    setCurrentWorld(data.id, data.world_name, data.genre, data.theme);
    return true;
  }

  async function getUserWorlds() {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data, error } = await client
      .from('worlds')
      .select('id, world_name, genre, theme, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      return [];
    }
    return data || [];
  }

  async function getWorldById(worldId) {
    const user = await requireUser();
    if (!user) return null;

    const { data, error } = await client
      .from('worlds')
      .select('id, world_name, genre, theme, created_at')
      .eq('id', worldId)
      .eq('user_id', user.id)
      .single();

    if (error) return null;
    return data;
  }

  async function updateWorld(worldId, worldName, genre, theme) {
    const user = await requireUser();
    if (!user) return false;

    const { error } = await client
      .from('worlds')
      .update({ world_name: worldName, genre, theme })
      .eq('id', worldId)
      .eq('user_id', user.id);

    if (error) {
      alert('Error updating world: ' + error.message);
      return false;
    }

    const current = getCurrentWorld();
    if (current && String(current.id) === String(worldId)) {
      setCurrentWorld(worldId, worldName, genre, theme);
    }
    return true;
  }

  async function deleteWorldById(worldId) {
    const user = await requireUser();
    if (!user) return false;

    const { error } = await client
      .from('worlds')
      .delete()
      .eq('id', worldId)
      .eq('user_id', user.id);

    if (error) {
      alert('Error deleting world: ' + error.message);
      return false;
    }

    const current = getCurrentWorld();
    if (current && String(current.id) === String(worldId)) {
      clearCurrentWorld();
    }
    return true;
  }

  // ---------- Kingdoms ----------
  // kingdoms schema assumed:
  // id bigint, user_id uuid, world_id bigint, name text, type text, description text
  async function createKingdom(worldId, name, type, description) {
    const user = await requireUser();
    if (!user) return null;

    const { data, error } = await client
      .from('kingdoms')
      .insert([{
        user_id: user.id,
        world_id: worldId,
        name,
        type: type || 'Unknown',
        description: description || 'No description provided'
      }])
      .select('id, world_id, name, type, description, created_at, updated_at')
      .single();

    if (error) {
      alert('Error creating kingdom: ' + error.message);
      return null;
    }
    return data;
  }

  async function getKingdomsByWorldId(worldId) {
    const user = await requireUser();
    if (!user) return [];

    const { data, error } = await client
      .from('kingdoms')
      .select('id, world_id, name, type, description, created_at, updated_at')
      .eq('user_id', user.id)
      .eq('world_id', worldId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      return [];
    }
    return data || [];
  }

  async function getKingdomById(kingdomId) {
    const user = await requireUser();
    if (!user) return null;

    const { data, error } = await client
      .from('kingdoms')
      .select('id, world_id, name, type, description, created_at, updated_at')
      .eq('user_id', user.id)
      .eq('id', kingdomId)
      .single();

    if (error) return null;
    return data;
  }

  async function updateKingdom(kingdomId, fields) {
    const user = await requireUser();
    if (!user) return false;

    const payload = {};
    if (typeof fields.name === 'string') payload.name = fields.name;
    if (typeof fields.type === 'string') payload.type = fields.type || 'Unknown';
    if (typeof fields.description === 'string') payload.description = fields.description || 'No description provided';

    const { error } = await client
      .from('kingdoms')
      .update(payload)
      .eq('user_id', user.id)
      .eq('id', kingdomId);

    if (error) {
      alert('Error updating kingdom: ' + error.message);
      return false;
    }
    return true;
  }

  async function deleteKingdomById(kingdomId) {
    const user = await requireUser();
    if (!user) return false;

    const { error } = await client
      .from('kingdoms')
      .delete()
      .eq('user_id', user.id)
      .eq('id', kingdomId);

    if (error) {
      alert('Error deleting kingdom: ' + error.message);
      return false;
    }
    return true;
  }

  // ---------- Country Profiles ----------
  // country_profiles schema assumed:
  // kingdom_id bigint UNIQUE, plus profile fields
  async function getCountryProfileByKingdomId(kingdomId) {
    const user = await requireUser();
    if (!user) return null;

    const { data, error } = await client
      .from('country_profiles')
      .select('id, kingdom_id, capital_city, population, culture, economy, military, notes, created_at, updated_at')
      .eq('user_id', user.id)
      .eq('kingdom_id', kingdomId)
      .maybeSingle();

    if (error) {
      console.error(error);
      return null;
    }
    return data || null;
  }

  async function upsertCountryProfileByKingdomId(kingdomId, profile) {
    const user = await requireUser();
    if (!user) return false;

    // Because kingdom_id is UNIQUE, this upsert is safe
    const { error } = await client
      .from('country_profiles')
      .upsert([{
        user_id: user.id,
        kingdom_id: kingdomId,
        capital_city: profile.capital_city ?? null,
        population: profile.population ?? null,
        culture: profile.culture ?? null,
        economy: profile.economy ?? null,
        military: profile.military ?? null,
        notes: profile.notes ?? null
      }], { onConflict: 'kingdom_id' });

    if (error) {
      alert('Error saving country profile: ' + error.message);
      return false;
    }
    return true;
  }

  // ---------- Utility ----------
  function kingdomSlug(name) {
    return String(name || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  // ---------- Expose globally ----------
  window.signUpWithPassword = signUpWithPassword;
  window.signInWithPassword = signInWithPassword;
  window.signOut = signOut;
  window.getCurrentUser = getCurrentUser;

  window.setCurrentWorld = setCurrentWorld;
  window.getCurrentWorld = getCurrentWorld;
  window.clearCurrentWorld = clearCurrentWorld;

  window.saveWorld = saveWorld;
  window.getUserWorlds = getUserWorlds;
  window.getWorldById = getWorldById;
  window.updateWorld = updateWorld;
  window.deleteWorldById = deleteWorldById;

  window.createKingdom = createKingdom;
  window.getKingdomsByWorldId = getKingdomsByWorldId;
  window.getKingdomById = getKingdomById;
  window.updateKingdom = updateKingdom;
  window.deleteKingdomById = deleteKingdomById;

  window.getCountryProfileByKingdomId = getCountryProfileByKingdomId;
  window.upsertCountryProfileByKingdomId = upsertCountryProfileByKingdomId;

  window.kingdomSlug = kingdomSlug;
})();
