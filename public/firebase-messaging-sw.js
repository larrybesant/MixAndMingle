// Scripts for firebase and firebase messaging
importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js")

// Declare the firebase variable
const firebase = self.firebase

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID",
})

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging()

// Custom notification sounds based on notification type
const notificationSounds = {
  message: "/sounds/message.mp3",
  mention: "/sounds/mention.mp3",
  roomInvite: "/sounds/room-invite.mp3",
  friendRequest: "/sounds/friend-request.mp3",
  gift: "/sounds/gift.mp3",
  system: "/sounds/system.mp3",
  videoCall: "/sounds/video-call.mp3",
}

// Modify the messaging.onBackgroundMessage handler to include sound information
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message ", payload)

  const notificationType = payload.data?.type || "system"
  const soundUrl = notificationSounds[notificationType] || notificationSounds.system

  // Customize notification
  const notificationTitle = payload.notification.title
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image || "/logo.png",
    badge: "/badge.png",
    data: payload.data,
    // We'll handle sound manually in the client
    silent: true,
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})
