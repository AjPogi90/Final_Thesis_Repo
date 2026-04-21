/**
 * test-notification.js
 *
 * Run this script to trigger a test NSFW incident in Firebase.
 * The Render server will detect it and attempt to send a push notification.
 * This helps diagnose whether the issue is the server, FCM, or the phone.
 *
 * Usage:
 *   node scripts/test-notification.js
 */

const admin = require('firebase-admin');
const fs    = require('fs');
const path  = require('path');

// Load service account
const saPath = path.resolve('D:\\421\\aegistnet-firebase-adminsdk-fbsvc-7c752c3bf6.json');
if (!fs.existsSync(saPath)) {
  console.error('❌ Service account file not found at:', saPath);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(saPath, 'utf8'));

admin.initializeApp({
  credential:  admin.credential.cert(serviceAccount),
  databaseURL: 'https://aegistnet-default-rtdb.firebaseio.com',
});

const db = admin.database();

async function runDiagnostic() {
  console.log('\n🔍 AegisNet Push Notification Diagnostic\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 1. Check parents and their FCM tokens
  console.log('Step 1: Checking registered FCM tokens in Firebase...\n');
  const parentsSnap = await db.ref('/users/parents').once('value');
  const parents = parentsSnap.val() || {};

  let totalTokens = 0;
  let parentUidWithTokens = null;
  let firstToken = null;

  for (const [uid, parent] of Object.entries(parents)) {
    const email = parent.email || '(no email)';
    const tokens = parent.fcmTokens ? Object.values(parent.fcmTokens) : [];
    totalTokens += tokens.length;

    console.log(`  Parent: ${email} (uid: ${uid.slice(0,8)}...)`);
    console.log(`  FCM Tokens: ${tokens.length}`);

    if (tokens.length > 0) {
      parentUidWithTokens = uid;
      firstToken = tokens[0].token;
      tokens.forEach((t, i) => {
        const age = t.createdAt
          ? Math.round((Date.now() - t.createdAt) / 3600000) + 'h ago'
          : 'unknown age';
        console.log(`    Token ${i+1}: ${t.token?.slice(0, 30)}... (${age})`);
        console.log(`    Device: ${t.userAgent?.slice(0, 60) || 'unknown'}`);
      });
    } else {
      console.log(`    ⚠️  No tokens — parent has NOT granted notification permission!`);
    }
    console.log('');
  }

  if (totalTokens === 0) {
    console.log('❌ PROBLEM FOUND: No FCM tokens registered for ANY parent!');
    console.log('');
    console.log('   This means no parent has granted notification permission.');
    console.log('   FIX: Open the dashboard on the parent phone → Allow Notifications');
    console.log('');
    process.exit(0);
  }

  console.log(`✅ Found ${totalTokens} FCM token(s) total.\n`);

  // 2. Check children
  console.log('Step 2: Checking child accounts...\n');
  const childsSnap = await db.ref('/users/childs').once('value');
  const childs = childsSnap.val() || {};
  const childIds = Object.keys(childs);

  if (childIds.length === 0) {
    console.log('⚠️  No child accounts found in database.\n');
  } else {
    for (const [cid, child] of Object.entries(childs)) {
      const incidents = child.nsfw_incidents ? Object.keys(child.nsfw_incidents).length : 0;
      console.log(`  Child: ${child.name || cid} | Parent email: ${child.parentEmail || 'MISSING'} | Incidents: ${incidents}`);
    }
  }

  console.log('');

  // 3. Send a DIRECT test FCM message to the first token
  console.log('Step 3: Sending a direct test FCM notification...\n');

  try {
    const title = '🧪 AegisNet Test Notification';
    const body  = 'Push notifications are working! ✅';

    const response = await admin.messaging().sendEachForMulticast({
      tokens: [firstToken],
      notification: { title, body },
      data: { test: 'true', title, body },
      webpush: {
        notification: {
          title, body,
          icon:               '/Aegistnet_48x48.png',
          badge:              '/Aegistnet_48x48.png',
          requireInteraction: true,
          vibrate:            [200, 100, 200],
        },
        fcmOptions: {
          link: 'https://aegistnet.firebaseapp.com/incidents',
        },
      },
    });

    console.log(`  FCM Response:`);
    console.log(`  ✅ Success count: ${response.successCount}`);
    console.log(`  ❌ Failure count: ${response.failureCount}`);

    response.responses.forEach((r, i) => {
      if (r.success) {
        console.log(`  Token ${i+1}: ✅ Delivered — Message ID: ${r.messageId}`);
      } else {
        console.log(`  Token ${i+1}: ❌ Failed — ${r.error?.code}: ${r.error?.message}`);
      }
    });
  } catch (err) {
    console.error('  ❌ FCM send error:', err.message);
  }

  // 4. Write a test incident to Firebase
  console.log('\nStep 4: Writing test incident to Firebase (server should detect this)...\n');
  const testChildId = childIds[0];
  if (testChildId) {
    const testIncidentId = `test_${Date.now()}`;
    await db.ref(`/users/childs/${testChildId}/nsfw_incidents/${testIncidentId}`).set({
      appName:   'DiagnosticTest',
      timestamp: Date.now(),
      isTest:    true,
    });
    console.log(`  ✅ Test incident written: /users/childs/${testChildId}/nsfw_incidents/${testIncidentId}`);
    console.log('  ⏳ Check Render logs — server should log: "🚨 New incident!"');
    console.log('  ⏳ Check your phone in the next 10 seconds for a notification.\n');

    // Clean up after 30s
    setTimeout(async () => {
      await db.ref(`/users/childs/${testChildId}/nsfw_incidents/${testIncidentId}`).remove();
      console.log('  🧹 Test incident cleaned up.');
      process.exit(0);
    }, 30000);
  } else {
    console.log('  ⚠️  No child found to write test incident.\n');
    process.exit(0);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

runDiagnostic().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
