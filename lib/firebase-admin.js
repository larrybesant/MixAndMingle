const admin = require("firebase-admin")

if (!admin.apps.length) {
  try {
    // Prepare the service account object using environment variables.
    const serviceAccount = {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Ensure that literal "\n" sequences are converted to actual newline characters.
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }

    // Initialize the Firebase Admin SDK with our service account.
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    })

    console.log("Firebase Admin initialized successfully.")
  } catch (error) {
    console.error("Error initializing Firebase Admin SDK:", error)
    throw error
  }
}

module.exports = admin
