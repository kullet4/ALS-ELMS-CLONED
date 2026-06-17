import express from 'express';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());

// ---------------------------------------------------------------------------
// Firebase Admin SDK Initialization
// ---------------------------------------------------------------------------
// Priority 1: GOOGLE_APPLICATION_CREDENTIALS env var (points to a JSON file)
// Priority 2: SERVICE_ACCOUNT_JSON env var (the JSON content as a string)
// Priority 3: serviceAccountKey.json file next to this server file
// ---------------------------------------------------------------------------
function initAdmin() {
  if (admin.apps.length > 0) return; // already initialized

  const credFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const credJson = process.env.SERVICE_ACCOUNT_JSON;
  const localKeyPath = path.join(__dirname, 'serviceAccountKey.json');

  if (credFilePath && fs.existsSync(credFilePath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(credFilePath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('[Admin] Initialized via GOOGLE_APPLICATION_CREDENTIALS file.');
  } else if (credJson) {
    const serviceAccount = JSON.parse(credJson);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('[Admin] Initialized via SERVICE_ACCOUNT_JSON env var.');
  } else if (fs.existsSync(localKeyPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(localKeyPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('[Admin] Initialized via local serviceAccountKey.json.');
  } else {
    console.error(
      '[Admin] ERROR: No Firebase Admin credentials found.\n' +
      '  Option A: Place your serviceAccountKey.json next to server.ts\n' +
      '  Option B: Set GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json\n' +
      '  Option C: Set SERVICE_ACCOUNT_JSON=<json string>\n' +
      '  Download your service account key from:\n' +
      '  Firebase Console → Project Settings → Service Accounts → Generate New Private Key'
    );
    process.exit(1);
  }
}

initAdmin();

// ---------------------------------------------------------------------------
// DELETE /api/auth-user?email=someone@als.edu
// Deletes a user from Firebase Authentication by email.
// ---------------------------------------------------------------------------
app.delete('/api/auth-user', async (req, res) => {
  const email = (req.query.email as string)?.trim().toLowerCase();

  if (!email) {
    res.status(400).json({ error: 'Missing required query param: email' });
    return;
  }

  try {
    // Look up the UID by email first
    const userRecord = await admin.auth().getUserByEmail(email);
    await admin.auth().deleteUser(userRecord.uid);
    console.log(`[Admin] Deleted Firebase Auth user: ${email} (uid: ${userRecord.uid})`);
    res.json({ success: true, email, uid: userRecord.uid });
  } catch (err: any) {
    if (err.code === 'auth/user-not-found') {
      // Not in Auth — treat as a soft success (already gone)
      console.warn(`[Admin] Auth user not found for email: ${email} — skipping Auth delete.`);
      res.json({ success: true, email, skipped: true, reason: 'auth/user-not-found' });
    } else {
      console.error(`[Admin] Failed to delete Auth user ${email}:`, err.message);
      res.status(500).json({ error: err.message, code: err.code });
    }
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ALS-ELMS Admin API' });
});

const PORT = process.env.ADMIN_API_PORT || 3001;
app.listen(PORT, () => {
  console.log(`[Admin] ALS-ELMS Admin API running on http://localhost:${PORT}`);
});
