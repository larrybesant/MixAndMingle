// Import and configure the Firebase SDK
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js")

const firebase = self.firebase // Declare the firebase variable

firebase.initializeApp({
  apiKey: "AIzaSyDKMDdDQ1OcJNoznSAMfMtVh9wwtyyFaHc",
  authDomain: "mixandmingle-1c898.firebaseapp.com",
  projectId: "mixandmingle-1c898",
  storageBucket: "mixandmingle-1c898.firebasestorage.app",
  messagingSenderId: "1099369771281",
  appId: "1:1099369771281:web:de15fff5a55a2eedb65cb0",
  measurementId: "G-ZKQ6D7EXYY",
})

const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("Received background message:", payload)

  const notificationTitle = payload.notification.title
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icon-192x192.png",
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})
