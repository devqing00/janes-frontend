import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

function initAdmin() {
  if (getApps().length > 0) return getApp();

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin: missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY"
    );
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

// Lazy singleton — never initialized at import time, only on first use
let _auth: Auth | null = null;

function getAdminAuthInstance(): Auth {
  if (!_auth) _auth = getAuth(initAdmin());
  return _auth;
}

/**
 * Drop-in replacement for firebase-admin Auth — lazily initialized.
 * Safe to import in Next.js routes; won't crash during `next build`.
 */
export const adminAuth = new Proxy({} as Auth, {
  get(_: Auth, prop: string | symbol) {
    const instance = getAdminAuthInstance();
    const value = (instance as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

export default adminAuth;
