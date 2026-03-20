import postgres from 'postgres';

const sql = postgres('postgresql://postgres.ehnlovnzpfvaxwwmgppj:LaudStack2026%21Secure@aws-1-us-east-2.pooler.supabase.com:5432/postgres', {
  ssl: 'require',
  max: 1,
  idle_timeout: 10,
  connect_timeout: 15,
});

try {
  const users = await sql`SELECT id, email, role, supabase_id, name FROM users`;
  console.log('Users found:', users.length);
  for (const u of users) {
    console.log(JSON.stringify(u, null, 2));
  }
} catch (err) {
  console.error('Error:', err.message);
} finally {
  await sql.end();
}
