const fs = require('fs');
const path = require('path');

const targetProvider = process.argv[2]?.toLowerCase();

if (!targetProvider || (targetProvider !== 'postgresql' && targetProvider !== 'sqlite')) {
  console.error('Usage: node scripts/switch-db.js <postgresql|sqlite>');
  process.exit(1);
}

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

const regex = /datasource\s+db\s+\{\s*provider\s*=\s*"[^"]*"/;
const replacement = `datasource db {\n  provider = "${targetProvider}"`;

if (!regex.test(schema)) {
  console.error('Could not find datasource db block in schema.prisma');
  process.exit(1);
}

schema = schema.replace(regex, replacement);
fs.writeFileSync(schemaPath, schema, 'utf8');

console.log(`[Database Switcher] Successfully updated prisma/schema.prisma datasource provider to: "${targetProvider}"`);
if (targetProvider === 'postgresql') {
  console.log('[Info] Make sure your DATABASE_URL in .env begins with postgresql:// or postgres://');
  console.log('[Next step] Run "npx prisma generate" and "npm run db:push"');
} else {
  console.log('[Info] Make sure your DATABASE_URL in .env begins with file:./dev.db');
  console.log('[Next step] Run "npx prisma generate"');
}
