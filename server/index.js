/**
 * AegisNet Notification Server
 * Free alternative to Firebase Cloud Functions.
 * Deploy on Render.com free tier — no credit card needed.
 */

'use strict';

const express = require('express');
const admin   = require('firebase-admin');

// ── Global crash guards ───────────────────────────────────────────────────────
// Prevent any unhandled rejection or exception from killing the process.
process.on('uncaughtException',  (err) => console.error('[CRASH GUARD] uncaughtException:',  err.message));
process.on('unhandledRejection', (err) => console.error('[CRASH GUARD] unhandledRejection:', err));

// ── Validate env vars ─────────────────────────────────────────────────────────
const REQUIRED_VARS = ['FIREBASE_SERVICE_ACCOUNT', 'FIREBASE_DATABASE_URL'];
for (const v of REQUIRED_VARS) {
  if (!process.env[v]) {
    console.error(`[Server] FATAL: Missing required environment variable: ${v}`);
    process.exit(1);
  }
}

// ── Parse service account JSON ────────────────────────────────────────────────
// Render.com sometimes wraps the value in extra quotes or escapes newlines.
// We handle both raw JSON and the "stringified" version safely.
let serviceAccount;
try {
  let raw = process.env.FIREBASE_SERVICE_ACCOUNT.trim();

  // If Render added surrounding quotes, strip them
  if (raw.startsWith('"') && raw.endsWith('"')) {
    raw = raw.slice(1, -1);
  }

  // Render sometimes escapes newlines inside the private key as \\n → fix them
  raw = raw.replace(/\\n/g, '\n');

  serviceAccount = JSON.parse(raw);
  console.log('[Server] ✅ Service account parsed. Project:', serviceAccount.project_id);
} catch (e) {
  console.error('[Server] FATAL: Could not parse FIREBASE_SERVICE_ACCOUNT as JSON.');
  console.error('[Server] Tip: paste the raw JSON value (not the file path) into the Render env var.');
  console.error('[Server] Parse error:', e.message);
  process.exit(1);
}

// ── Init Firebase Admin ───────────────────────────────────────────────────────
try {
  admin.initializeApp({
    credential:  admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
  console.log('[Firebase] ✅ Admin SDK initialised.');
} catch (e) {
  console.error('[Firebase] FATAL: initializeApp failed:', e.message);
  process.exit(1);
}

const db     = admin.database();
const app    = express();
const PORT   = process.env.PORT   || 3001;
const APP_URL = process.env.APP_URL || 'https://aegistnet.firebaseapp.com';

app.use(express.json());

// ── State ─────────────────────────────────────────────────────────────────────
const processedIncidents = new Set();
let   startupComplete    = false;

// ── HTTP Endpoints ────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({ status: '✅ AegisNet Notification Server is running' });
});

app.get('/health', (_req, res) => {
  res.json({
    status:             'ok',
    startupComplete,
    processedIncidents: processedIncidents.size,
    uptime:             Math.floor(process.uptime()) + 's',
    timestamp:          new Date().toISOString(),
  });
});

// ── Start HTTP Server ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[Server] Listening on port ${PORT}`);
  connectToDatabase();
});

// ── Connect and Listen to RTDB ────────────────────────────────────────────────
function connectToDatabase() {
  console.log('[Firebase] Connecting to Realtime Database…');

  // Test the connection first with a simple read
  db.ref('.info/connected').on('value', (snap) => {
    if (snap.val() === true) {
      console.log('[Firebase] ✅ Connected to Realtime Database.');
    } else {
      console.log('[Firebase] ⏳ Waiting for database connection…');
    }
  });

  const childsRef = db.ref('/users/childs');

  // Listen for each child device (current + future)
  childsRef.on(
    'child_added',
    (childSnap) => {
      const childId = childSnap.key;
      console.log(`[Firebase] Monitoring child: ${childId}`);
      watchIncidents(childId);
    },
    (err) => console.error('[Firebase] childsRef error:', err.message)
  );

  // Mark startup complete after 8 s — all pre-existing data has been loaded
  setTimeout(() => {
    startupComplete = true;
    console.log(
      `[Firebase] ✅ Startup complete — ${processedIncidents.size} pre-existing incidents ignored. Watching for NEW incidents.`
    );
  }, 8000);
}

// ── Watch a single child's incidents ─────────────────────────────────────────
function watchIncidents(childId) {
  const ref = db.ref(`/users/childs/${childId}/nsfw_incidents`);

  ref.on(
    'child_added',
    (incidentSnap) => {
      // Wrap in a non-async wrapper so Firebase never sees a rejected Promise
      handleNewIncident(childId, incidentSnap).catch((err) =>
        console.error(`[Firebase] handleNewIncident error for ${childId}:`, err.message)
      );
    },
    (err) => console.error(`[Firebase] incidents listener error (${childId}):`, err.message)
  );
}

// ── Handle a new incident (safe async wrapper) ────────────────────────────────
async function handleNewIncident(childId, incidentSnap) {
  const incidentId = incidentSnap.key;
  const key        = `${childId}-${incidentId}`;

  // During startup, mark pre-existing incidents as seen — do NOT notify
  if (!startupComplete) {
    processedIncidents.add(key);
    return;
  }

  if (processedIncidents.has(key)) return;
  processedIncidents.add(key);

  console.log(`[Firebase] 🚨 New NSFW incident! child=${childId}  incident=${incidentId}`);
  await sendNotification(childId, incidentId, incidentSnap.val());
}

// ── Send FCM Push Notification ────────────────────────────────────────────────
async function sendNotification(childId, incidentId, incidentData) {
  try {
    // 1 ── Get child record
    const childSnap = await db.ref(`/users/childs/${childId}`).once('value');
    const childData = childSnap.val();

    if (!childData?.parentEmail) {
      console.warn(`[FCM] No parentEmail for child: ${childId}`);
      return;
    }

    const childName   = childData.name || 'Your child';
    const parentEmail = childData.parentEmail;

    // 2 ── Find parent UID by email
    const parentsSnap = await db.ref('/users/parents').once('value');
    const parentsData = parentsSnap.val() || {};

    let parentUid = null;
    for (const [uid, parent] of Object.entries(parentsData)) {
      if (parent.email === parentEmail) {
        parentUid = uid;
        break;
      }
    }

    if (!parentUid) {
      console.warn(`[FCM] No parent found for email: ${parentEmail}`);
      return;
    }

    // 3 ── Get parent's FCM tokens
    const tokensSnap = await db.ref(`/users/parents/${parentUid}/fcmTokens`).once('value');
    const tokensData = tokensSnap.val();

    if (!tokensData) {
      console.log(`[FCM] No tokens registered for parent: ${parentUid}`);
      return;
    }

    const tokenEntries = Object.entries(tokensData);
    const tokens       = tokenEntries.map(([, e]) => e.token).filter(Boolean);

    if (tokens.length === 0) {
      console.log(`[FCM] Token list empty for parent: ${parentUid}`);
      return;
    }

    // 4 ── Build & send message
    const appName = incidentData?.appName || 'an app';
    const title   = '⚠️ NSFW Content Detected';
    const body    = `NSFW content detected on ${childName}'s device in ${appName}.`;

    const response = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: { title, body },
      data: {
        incidentId,
        childId,
        title,
        body,
        clickAction: '/incidents',
      },
      // webpush block is REQUIRED for Chrome on Android/Desktop
      webpush: {
        notification: {
          title,
          body,
          icon:                '/Aegistnet_48x48.png',
          badge:               '/Aegistnet_48x48.png',
          tag:                 `nsfw-${incidentId}`,
          requireInteraction:  true,
          vibrate:             [200, 100, 200],
          renotify:            true,
        },
        fcmOptions: {
          link: `${APP_URL}/incidents`,
        },
      },
    });

    console.log(
      `[FCM] ✅ Notified ${tokens.length} device(s) — ` +
      `success: ${response.successCount}  failed: ${response.failureCount}`
    );

    // 5 ── Clean up stale/invalid tokens
    if (response.failureCount > 0) {
      const removals = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const code = resp.error?.code || '';
          if (
            code === 'messaging/invalid-registration-token' ||
            code === 'messaging/registration-token-not-registered'
          ) {
            const stale = tokens[idx];
            const found = tokenEntries.find(([, e]) => e.token === stale);
            if (found) {
              const [tokenKey] = found;
              console.log(`[FCM] Removing stale token key: ${tokenKey}`);
              removals.push(
                db.ref(`/users/parents/${parentUid}/fcmTokens/${tokenKey}`).remove()
              );
            }
          } else {
            console.warn(`[FCM] Token[${idx}] failed — ${resp.error?.message}`);
          }
        }
      });
      await Promise.all(removals);
    }
  } catch (err) {
    console.error('[FCM] sendNotification error:', err.message);
  }
}
