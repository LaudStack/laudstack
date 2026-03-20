import postgres from 'postgres';

const sql = postgres('postgresql://postgres.ehnlovnzpfvaxwwmgppj:LaudStack2026%21Secure@aws-1-us-east-2.pooler.supabase.com:5432/postgres', {
  ssl: 'require',
});

async function main() {
  // Check admin users in our users table
  const admins = await sql`SELECT id, name, email, role, supabase_id, email_verified FROM users WHERE role IN ('admin', 'super_admin')`;
  console.log('=== Admin users in users table ===');
  console.log(admins);

  // Check all users
  const allUsers = await sql`SELECT id, name, email, role, supabase_id, email_verified FROM users LIMIT 20`;
  console.log('\n=== All users ===');
  console.log(allUsers);

  await sql.end();
}

main().catch(console.error);
