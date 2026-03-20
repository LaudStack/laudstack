/**
 * Create admin user in Supabase Auth + update our users table with the correct supabase_id.
 * Uses the service role key to bypass email confirmation.
 */

const SUPABASE_URL = 'https://ehnlovnzpfvaxwwmgppj.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVobmxvdm56cGZ2YXh3d21ncHBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzI1NDE2OCwiZXhwIjoyMDg4ODMwMTY4fQ.aCOyOrFHgQ2r25KdYN9xhMbuwR3-M-HeK0maqRl5-xo';

const ADMIN_EMAIL = 'team@laudstack.com';
const ADMIN_PASSWORD = 'LaudStack@Admin2026';

import postgres from 'postgres';

const sql = postgres('postgresql://postgres.ehnlovnzpfvaxwwmgppj:LaudStack2026%21Secure@aws-1-us-east-2.pooler.supabase.com:5432/postgres', {
  ssl: 'require',
});

async function main() {
  console.log(`Creating admin user in Supabase Auth: ${ADMIN_EMAIL}`);

  // Step 1: Create user in Supabase Auth via Admin API
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
    },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true, // auto-confirm email
      user_metadata: {
        full_name: 'LaudStack Team',
      },
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    // If user already exists, try to get their ID
    if (data.msg?.includes('already been registered') || data.message?.includes('already been registered') || JSON.stringify(data).includes('already')) {
      console.log('User already exists in Supabase Auth. Fetching existing user...');
      
      // List users to find this one
      const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=50`, {
        headers: {
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'apikey': SERVICE_ROLE_KEY,
        },
      });
      const listData = await listRes.json();
      const existingUser = listData.users?.find(u => u.email === ADMIN_EMAIL);
      
      if (existingUser) {
        console.log(`Found existing auth user: ${existingUser.id}`);
        
        // Update password
        const updateRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${existingUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            'apikey': SERVICE_ROLE_KEY,
          },
          body: JSON.stringify({
            password: ADMIN_PASSWORD,
            email_confirm: true,
          }),
        });
        
        if (updateRes.ok) {
          console.log('Password updated successfully.');
        }
        
        // Update our users table with the correct supabase_id
        await sql`UPDATE users SET supabase_id = ${existingUser.id} WHERE email = ${ADMIN_EMAIL}`;
        console.log(`Updated users table supabase_id to: ${existingUser.id}`);
      } else {
        console.error('Could not find existing user. Full response:', JSON.stringify(listData, null, 2));
      }
    } else {
      console.error('Failed to create user:', JSON.stringify(data, null, 2));
    }
  } else {
    const newUserId = data.id;
    console.log(`Created auth user with ID: ${newUserId}`);

    // Step 2: Update our users table with the real Supabase auth ID
    await sql`UPDATE users SET supabase_id = ${newUserId} WHERE email = ${ADMIN_EMAIL}`;
    console.log(`Updated users table supabase_id to: ${newUserId}`);
  }

  // Step 3: Verify
  const [admin] = await sql`SELECT id, name, email, role, supabase_id, email_verified FROM users WHERE email = ${ADMIN_EMAIL}`;
  console.log('\n=== Admin user in DB ===');
  console.log(admin);

  // Step 4: Test sign-in
  console.log('\nTesting sign-in...');
  const signInRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVobmxvdm56cGZ2YXh3d21ncHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNTQxNjgsImV4cCI6MjA4ODgzMDE2OH0.v8n6AohLg2ecoV8eIPaDGvqR-IXcYlQVJW21WUiEEYY',
    },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }),
  });

  const signInData = await signInRes.json();
  if (signInRes.ok) {
    console.log('Sign-in successful! Access token received.');
    console.log(`User ID from auth: ${signInData.user?.id}`);
  } else {
    console.error('Sign-in failed:', JSON.stringify(signInData, null, 2));
  }

  await sql.end();
  console.log('\n=== Admin Login Credentials ===');
  console.log(`Email: ${ADMIN_EMAIL}`);
  console.log(`Password: ${ADMIN_PASSWORD}`);
}

main().catch(console.error);
