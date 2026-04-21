/**
 * encode-service-account.js
 * 
 * Run this script ONCE on your local machine to generate the Base64 value
 * you need to paste into Render's environment variables.
 *
 * Usage:
 *   node scripts/encode-service-account.js path\to\your-service-account.json
 *
 * Example:
 *   node scripts/encode-service-account.js C:\Users\ajlol\Downloads\aegistnet-firebase-adminsdk.json
 */

const fs   = require('fs');
const path = require('path');

const filePath = process.argv[2];

if (!filePath) {
  console.error('❌ Usage: node scripts/encode-service-account.js <path-to-service-account.json>');
  process.exit(1);
}

const resolved = path.resolve(filePath);

if (!fs.existsSync(resolved)) {
  console.error(`❌ File not found: ${resolved}`);
  process.exit(1);
}

try {
  const raw     = fs.readFileSync(resolved, 'utf8');
  const parsed  = JSON.parse(raw); // Validate it's real JSON
  const base64  = Buffer.from(raw).toString('base64');

  console.log('\n✅ Service account validated!');
  console.log(`   Project ID : ${parsed.project_id}`);
  console.log(`   Client Email: ${parsed.client_email}`);
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 Copy the value below and paste it into Render as:');
  console.log('   Environment Variable Name:  FIREBASE_SERVICE_ACCOUNT_BASE64');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(base64);
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
} catch (e) {
  console.error('❌ Could not read or parse the file:', e.message);
  process.exit(1);
}
