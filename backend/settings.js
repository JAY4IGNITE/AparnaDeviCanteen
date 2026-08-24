const supabase = require('./db');

/**
 * Gets the current menu visibility status.
 * Defaults to true if not set or on error.
 */
async function getMenuVisibility() {
  try {
    const { data, error } = await supabase
      .from('order_counters')
      .select('last_value')
      .eq('id', 'show_menu')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No row found, default to visible (true)
        return true;
      }
      console.error('Error fetching menu visibility setting:', error.message);
      return true;
    }

    return data ? data.last_value !== 0 : true;
  } catch (err) {
    console.error('Exception fetching menu visibility:', err);
    return true;
  }
}

/**
 * Sets the menu visibility status.
 * @param {boolean} visible 
 */
async function setMenuVisibility(visible) {
  try {
    const { data, error } = await supabase
      .from('order_counters')
      .upsert({ id: 'show_menu', last_value: visible ? 1 : 0 })
      .select();

    if (error) {
      console.error('Error updating menu visibility setting:', error.message);
      throw new Error(error.message);
    }
    return data;
  } catch (err) {
    console.error('Exception setting menu visibility:', err);
    throw err;
  }
}

module.exports = {
  getMenuVisibility,
  setMenuVisibility
};
