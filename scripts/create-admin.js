/**
 * One-time script to create a dedicated admin account.
 * Run:  node scripts/create-admin.js
 *
 * After running, you can log in with:
 *   Email:    admin@aegistnet.com
 *   Password: Admin@12345
 */

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, updateProfile } = require('firebase/auth');
const { getDatabase, ref, set } = require('firebase/database');

const firebaseConfig = {
    apiKey: 'AIzaSyDnC0HvvB-7rQnWeFKV0ttH3mPeNY8AdSU',
    authDomain: 'aegistnet.firebaseapp.com',
    projectId: 'aegistnet',
    storageBucket: 'aegistnet.firebasestorage.app',
    messagingSenderId: '468468639315',
    appId: '1:468468639315:web:64a5197a2e99c7357388a6',
    databaseURL: 'https://aegistnet-default-rtdb.firebaseio.com',
};

const ADMIN_EMAIL = 'admin@aegistnet.com';
const ADMIN_PASSWORD = 'Admin@12345';
const ADMIN_NAME = 'System Admin';

async function createAdmin() {
    console.log('🔧 Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const database = getDatabase(app);

    console.log(`📧 Creating admin account: ${ADMIN_EMAIL}`);

    try {
        const userCred = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
        const user = userCred.user;

        await updateProfile(user, { displayName: ADMIN_NAME });

        console.log(`✅ Auth user created: ${user.uid}`);

        // Write admin profile to Realtime Database
        await set(ref(database, `users/parents/${user.uid}`), {
            uid: user.uid,
            email: ADMIN_EMAIL,
            name: ADMIN_NAME,
            createdAt: Date.now(),
            role: 'parent',
            isAdmin: true,
            idVerification: {
                dateOfBirth: '1990-01-01',
                idFileUrl: '',
                idFileName: '',
                status: 'approved',
                submittedAt: Date.now(),
                reviewedAt: Date.now(),
                reviewedBy: 'system-setup',
            },
        });

        console.log('✅ Database profile created with admin privileges');
        console.log('');
        console.log('╔══════════════════════════════════════════╗');
        console.log('║       ADMIN ACCOUNT CREATED!             ║');
        console.log('╠══════════════════════════════════════════╣');
        console.log(`║  Email:    ${ADMIN_EMAIL}      ║`);
        console.log(`║  Password: ${ADMIN_PASSWORD}            ║`);
        console.log('╠══════════════════════════════════════════╣');
        console.log('║  Login at: http://localhost:3000/login   ║');
        console.log('║  Admin:    http://localhost:3000/admin   ║');
        console.log('╚══════════════════════════════════════════╝');

        process.exit(0);
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            console.log('⚠️  Admin account already exists! You can log in with:');
            console.log(`   Email:    ${ADMIN_EMAIL}`);
            console.log(`   Password: ${ADMIN_PASSWORD}`);
        } else {
            console.error('❌ Error:', error.message);
        }
        process.exit(1);
    }
}

createAdmin();
