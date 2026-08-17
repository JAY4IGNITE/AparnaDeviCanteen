const supabase = require('./db');

async function inspectUsersTable() {
  try {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    if (error) {
      console.error('Error selecting from users:', error);
    } else {
      console.log('Successfully queried users table. Sample user:', data);
    }
  } catch (e) {
    console.error('Exception:', e);
  }
}

inspectUsersTable();
