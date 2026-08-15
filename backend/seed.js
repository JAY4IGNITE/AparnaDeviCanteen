const bcrypt = require('bcryptjs');
const supabase = require('./db');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    // Check if admin already exists
    const { data: existingAdmin } = await supabase
      .from('users')
      .select('id, email')
      .eq('role', 'admin')
      .maybeSingle();

    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const { error } = await supabase.from('users').insert({
      name: 'Admin',
      email: 'admin@foodnest.com',
      password: hashedPassword,
      role: 'admin'
    });

    if (error) {
      console.error('❌ Error creating admin:', error.message);
      process.exit(1);
    }

    console.log('✅ Admin account created:');
    console.log('   Email: admin@foodnest.com');
    console.log('   Password: admin123');
    console.log('   ⚠️  Change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
