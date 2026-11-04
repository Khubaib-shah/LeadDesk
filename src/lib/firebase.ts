/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Cloud Firestore database with the assigned Database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export { app };

// Helper to save push notification subscription / device token
export async function savePushSubscriptionToFirestore(subscriptionData: {
  endpoint?: string;
  userAgent?: string;
  token?: string;
}): Promise<boolean> {
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
