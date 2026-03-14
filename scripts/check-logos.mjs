import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await conn.execute('SELECT id, name, slug, logoUrl FROM stacks ORDER BY id');

const broken = [];
for (const r of rows) {
  if (r.logoUrl === null || r.logoUrl === undefined) {
    broken.push({ id: r.id, name: r.name, slug: r.slug, reason: 'NULL' });
    continue;
  }
  try {
    const resp = await fetch(r.logoUrl, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(5000),
    });
    if (resp.status >= 400) {
      broken.push({ id: r.id, name: r.name, slug: r.slug, status: resp.status, url: r.logoUrl });
    }
  } catch (e) {
    broken.push({ id: r.id, name: r.name, slug: r.slug, error: e.message, url: r.logoUrl });
  }
}

console.log('Broken logos:', broken.length);
for (const b of broken) {
  console.log(JSON.stringify(b));
}
await conn.end();
