const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.sendNsfwIncidentAlert = functions.database
  .ref('/users/childs/{childId}/nsfw_incidents/{incidentId}')
  .onCreate(async (snapshot, context) => {
    const incidentData = snapshot.val();
    const childId = context.params.childId;

    console.log(`New NSFW incident detected for child ${childId}:`, incidentData);

    try {
      // 1. Get the child's data to find the parentEmail
      const childSnap = await admin.database().ref(`/users/childs/${childId}`).once('value');
      const childData = childSnap.val();

      if (!childData || !childData.parentEmail) {
        console.error(`Cannot find parentEmail for childId: ${childId}`);
        return null;
      }
      
      const parentEmail = childData.parentEmail;
      const childName = childData.name || 'Your child';

      // 2. Find the parent UID using the parentEmail
      // Since Realtime DB doesn't have simple querying by value easily without indexes,
      // and we store parents under uid, let's fetch all parents and find the matching email.
      // A more scalable approach would be to index parentEmail or store parentUid directly on the child.
      const parentsSnap = await admin.database().ref('/users/parents').once('value');
      const parentsData = parentsSnap.val();
      
      if (!parentsData) {
         console.error('No parents found in database');
         return null;
      }

      let parentUid = null;
      for (const [uid, parent] of Object.entries(parentsData)) {
        if (parent.email === parentEmail) {
          parentUid = uid;
          break;
        }
      }

      if (!parentUid) {
        console.error(`Parent not found for email: ${parentEmail}`);
        return null;
      }

      // 3. Get the parent's FCM tokens
      const tokensSnap = await admin.database().ref(`/users/parents/${parentUid}/fcmTokens`).once('value');
      const tokensData = tokensSnap.val();

      if (!tokensData) {
        console.log(`No FCM tokens registered for parent ${parentUid}`);
        return null;
      }

      const tokens = Object.values(tokensData).map(t => t.token);
      
      if (tokens.length === 0) {
        console.log(`No FCM tokens found for parent ${parentUid}`);
        return null;
      }

      // 4. Prepare the push notification payload
      const appName = incidentData.appName || 'an app';
      const notificationTitle = '⚠️ NSFW Content Detected';
      const notificationBody = `NSFW content detected on ${childName}'s device in ${appName}.`;

      const payload = {
        notification: {
          title: notificationTitle,
          body: notificationBody,
        },
        data: {
          incidentId: context.params.incidentId,
          clickAction: '/incidents',
          childId: childId,
          title: notificationTitle,
          body: notificationBody,
        },
        // ─── CRITICAL: webpush block is required for Chrome on Android/Desktop ───
        // Without this, FCM sends an Android-native-style message that Chrome
        // silently drops. The webpush block ensures the Web Push Protocol is used.
        webpush: {
          notification: {
            title: notificationTitle,
            body: notificationBody,
            icon: '/Aegistnet_48x48.png',
            badge: '/Aegistnet_48x48.png',
            tag: `nsfw-incident-${context.params.incidentId}`,
            requireInteraction: true,
            vibrate: [200, 100, 200],
          },
          fcmOptions: {
            // Absolute URL: tapping the notification opens/focuses the incidents page
            link: 'https://aegistnet.firebaseapp.com/incidents',
          },
        },
      };

      // 5. Send the notifications
      console.log(`Sending alerts to ${tokens.length} devices for parent ${parentUid}`);
      const response = await admin.messaging().sendEachForMulticast({
        tokens: tokens,
        notification: payload.notification,
        data: payload.data,
        webpush: payload.webpush,
      });

      console.log('Successfully sent message:', response);
      
      // Optional: Clean up invalid tokens from the database
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
          }
        });
        
        console.log('List of failed tokens:', failedTokens);
        // Clean up logic could go here by matching tokens to keys and removing them.
      }

      return null;
    } catch (error) {
      console.error('Error sending push notification:', error);
      return null;
    }
  });
