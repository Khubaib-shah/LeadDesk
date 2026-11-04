/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, doc, setDoc, type Firestore } from 'firebase/firestore';

// Client-side Firebase configuration loaded exclusively from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'atomic-casing-dtgzl.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'atomic-casing-dtgzl',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'atomic-casing-dtgzl.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '535514239581',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:535514239581:web:7c3d90e255fd53f4f633b4',
};

const firestoreDbId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || 'ai-studio-leaddesk-f7356773-eda0-4611-b6e3-dc82182847ae';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

// Only initialize if VITE_FIREBASE_API_KEY is configured
if (firebaseConfig.apiKey && firebaseConfig.apiKey.trim() !== '') {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app, firestoreDbId);
  } catch (err) {
    console.warn('[Firebase] Non-blocking initialization notice:', (err as Error).message);
  }
} else {
  console.log('[Firebase] VITE_FIREBASE_API_KEY is not set. Running with local push notifications.');
}

export { app, db };

// Helper to save push notification subscription / device token
export async function savePushSubscriptionToFirestore(subscriptionData: {
  endpoint?: string;
  userAgent?: string;
  token?: string;
}): Promise<boolean> {
  if (!db) {
    return false;
  }
  try {
    const id = `sub-${Date.now()}`;
    const subRef = doc(db, 'notification_subscriptions', id);
    await setDoc(subRef, {
      id,
      endpoint: subscriptionData.endpoint || '',
      userAgent: subscriptionData.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : ''),
      token: subscriptionData.token || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log('[Firebase] Push subscription saved to Firestore:', id);
    return true;
  } catch (err) {
    console.warn('[Firebase] Non-blocking push subscription save error:', (err as Error).message);
    return false;
  }
}

// Helper to log dispatched notification to Firestore
export async function logNotificationToFirestore(log: {
  leadId: string;
  leadName: string;
  title: string;
  body: string;
  reminderStage: '2h_before' | '1h_before' | '10m_before' | 'at_time' | 'overdue';
  channel: 'push' | 'email' | 'both';
  emailRecipient?: string;
  status: 'sent' | 'pending' | 'failed';
}): Promise<boolean> {
  if (!db) {
    return false;
  }
  try {
    const logId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const logRef = doc(db, 'notification_logs', logId);
    await setDoc(logRef, {
      id: logId,
      ...log,
      sentAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.warn('[Firebase] Notification log sync to Firestore skipped:', (err as Error).message);
    return false;
  }
}
