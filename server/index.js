/**
 * AegisNet Notification Server
 * Free alternative to Firebase Cloud Functions.
 * Deploy this to Render.com (free tier) — no credit card needed.
 *
 * What it does:
 *  - Connects to Firebase Realtime Database
 *  - Watches for new NSFW incidents on any child device
 *  - Sends FCM push notifications to the parent's registered devices
 */

const express = require('express');
const admin = require('firebase-admin');

// ── Firebase Admin Init ────────────────────────────────────────────────────────
let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} catch (e) {
  console.error('[Server] ERROR: FIREBASE_SERVICE_ACCOUNT env var is missing or not valid JSON.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const db = admin.database();
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const APP_URL = process.env.APP_URL || 'https://aegistnet.firebaseapp.com';

// ── State ──────────────────────────────────────────────────────────────────────
// Track already-sent notifications so we don't duplicate on server restart
const processedIncidents = new Set();
let startupComplete = false;

// ── Health Check Endpoint (for UptimeRobot keep-alive pings) ─────────────────
app.get('/', (_req, res) => {
  res.json({ status: 'AegisNet Notification Server is running ✅' });
});

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()) + 's',
    processedIncidents: processedIncidents.size,
    timestamp: new Date().toISOString(),
  });
});

// ── Start Server ───────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT}`);
  startListening();
});

// ── RTDB Listener ─────────────────────────────────────────────────────────────
function startListening() {
  console.log('[Firebase] Connecting to Realtime Database...');

  const childsRef = db.ref('/users/childs');

  // For every child device (existing and newly added)
  childsRef.on('child_added', (childSnap) => {
    const childId = childSnap.key;
    console.log(`[Firebase] Watching incidents for child: ${childId}`);

    // Watch that child's nsfw_incidents for new entries
    const incidentsRef = db.ref(`/users/childs/${childId}/nsfw_incidents`);

    incidentsRef.on('child_added', async (incidentSnap) => {
      const incidentId = incidentSnap.key;
      const key = `${childId}-${incidentId}`;

      // During the startup window, mark existing incidents as already seen
      if (!startupComplete) {
        processedIncidents.add(key);
        return;
      }

      // Skip if already processed
      if (processedIncidents.has(key)) return;
      processedIncidents.add(key);

      console.log(`[Firebase] 🚨 New incident! child=${childId} incident=${incidentId}`);
      await sendNotification(childId, incidentId, incidentSnap.val());
    });

    incidentsRef.on('error', (err) => {
      console.error(`[Firebase] Listener error for child ${childId}:`, err.message);
    });
  });

  // After 6 seconds, all pre-existing incidents have been loaded — go live
  setTimeout(() => {
    startupComplete = true;
    console.log(`[Firebase] ✅ Startup complete. Watching for NEW incidents only. (${processedIncidents.size} existing incidents marked as seen)`);
  }, 6000);
}

// ── Send FCM Notification ─────────────────────────────────────────────────────
async function sendNotification(childId, incidentId, incidentData) {
  try {
    // 1. Get child data
    const childSnap = await db.ref(`/users/childs/${childId}`).once('value');
    const childData = childSnap.val();

    if (!childData || !childData.parentEmail) {
      console.error(`[FCM] No parentEmail found for childId: ${childId}`);
      return;
    }

    const childName = childData.name || 'Your child';
    const parentEmail = childData.parentEmail;

    // 2. Find parent UID by email
    const parentsSnap = await db.ref('/users/parents').once('value');
    const parentsData = parentsSnap.val();

    if (!parentsData) {
      console.error('[FCM] No parents in database.');
      return;
    }

    let parentUid = null;
    for (const [uid, parent] of Object.entries(parentsData)) {
      if (parent.email === parentEmail) {
        parentUid = uid;
        break;
      }
    }

    if (!parentUid) {
      console.error(`[FCM] Parent not found for email: ${parentEmail}`);
      return;
    }

    // 3. Get parent's FCM tokens
    const tokensSnap = await db.ref(`/users/parents/${parentUid}/fcmTokens`).once('value');
    const tokensData = tokensSnap.val();

    if (!tokensData) {
      console.log(`[FCM] No FCM tokens for parent: ${parentUid}`);
      return;
    }

    const tokenEntries = Object.entries(tokensData);
    const tokens = tokenEntries.map(([, entry]) => entry.token).filter(Boolean);

    if (tokens.length === 0) {
      console.log(`[FCM] Token list is empty for parent: ${parentUid}`);
      return;
    }

    // 4. Build notification
    const appName = incidentData?.appName || 'an app';
    const title = '⚠️ NSFW Content Detected';
    const body = `NSFW content detected on ${childName}'s device in ${appName}.`;

    // 5. Send via FCM (webpush block is REQUIRED for Chrome on mobile)
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
      webpush: {
        notification: {
          title,
          body,
          icon: '/Aegistnet_48x48.png',
          badge: '/Aegistnet_48x48.png',
          tag: `nsfw-incident-${incidentId}`,
          requireInteraction: true,
          vibrate: [200, 100, 200],
          renotify: true,
        },
        fcmOptions: {
          link: `${APP_URL}/incidents`,
        },
      },
    });

    console.log(`[FCM] ✅ Sent to ${tokens.length} device(s). Success: ${response.successCount} | Failed: ${response.failureCount}`);

    // 6. Remove invalid/expired tokens from DB
    if (response.failureCount > 0) {
      const removalPromises = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const code = resp.error?.code;
          const isStaleToken =
            code === 'messaging/invalid-registration-token' ||
            code === 'messaging/registration-token-not-registered';

          if (isStaleToken) {
            const staleToken = tokens[idx];
            const entry = tokenEntries.find(([, e]) => e.token === staleToken);
            if (entry) {
              const [tokenKey] = entry;
              console.log(`[FCM] Removing stale token: ${tokenKey}`);
              removalPromises.push(
                db.ref(`/users/parents/${parentUid}/fcmTokens/${tokenKey}`).remove()
              );
            }
          } else {
            console.warn(`[FCM] Token ${idx} failed:`, resp.error?.message);
          }
        }
      });
      await Promise.all(removalPromises);
    }
  } catch (err) {
    console.error('[FCM] Unexpected error:', err.message);
  }
}
