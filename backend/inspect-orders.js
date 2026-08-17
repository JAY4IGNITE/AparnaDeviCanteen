const supabase = require('./db');

async function inspectOrdersTable() {
  try {
    const { data, error } = await supabase.from('orders').select('*').limit(1);
    if (error) {
      console.error('Error selecting from orders:', error);
    } else {
      console.log('Successfully queried orders table. Sample order:', data);
    }
  } catch (e) {
    console.error('Exception:', e);
  }
}

inspectOrdersTable();
