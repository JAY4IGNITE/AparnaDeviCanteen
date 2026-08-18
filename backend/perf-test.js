const supabase = require('./db');
const bcrypt = require('bcryptjs');

async function testPerformance() {
  const email = 'admin@aparnacanteen.com';
  const password = 'Admin@1508';

  console.log('--- Phase 1: Testing Supabase User Query ---');
  const startQuery = Date.now();
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('role', 'admin')
    .maybeSingle();
  const endQuery = Date.now();
  
  if (error) {
    console.error('Supabase query error:', error);
    return;
  }
  if (!user) {
    console.error('User not found!');
    return;
  }
  
  console.log(`Supabase query took: ${endQuery - startQuery} ms`);
  console.log('User found:', user.email);

  console.log('\n--- Phase 2: Testing bcrypt.compare ---');
  const startBcrypt = Date.now();
  const isMatch = await bcrypt.compare(password, user.password);
  const endBcrypt = Date.now();
  console.log(`bcrypt.compare took: ${endBcrypt - startBcrypt} ms`);
  console.log(`Password matches: ${isMatch}`);
}

testPerformance();
