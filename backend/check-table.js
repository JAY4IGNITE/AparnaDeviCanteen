const supabase = require('./db');

async function test() {
  const { data, error } = await supabase.from('announcements').select('*').limit(1);
  if (error) {
    console.error('Error querying announcements table:', error);
  } else {
    console.log('Announcements table exists! Data:', data);
  }
}

test();
