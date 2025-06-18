// Firebase client setup for notifications and analytics
import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { getAnalytics, isSupported as analyticsSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Only initialize app once (for hot reload/dev)
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Only access analytics and messaging in the browser
let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  analyticsSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

let messaging: Messaging | null = null;
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  try {
    messaging = getMessaging(app);
  } catch (e) {
    messaging = null;
  }
}

export { analytics, messaging };

// Example: Request notification permission and get token
export async function requestFirebaseNotificationPermission() {
  if (!messaging) return null;
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY });
      return token;
    }
  } catch (err) {
    console.error('Unable to get permission to notify.', err);
  }
  return null;
}

// Example: Listen for foreground messages
export function onFirebaseMessage(callback: (payload: unknown) => void) {
  if (!messaging) return;
  onMessage(messaging, callback);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function someFunction(e: unknown) {
  // ...existing code...
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function anotherFunction(param: unknown) {
  // ...existing code...
}
