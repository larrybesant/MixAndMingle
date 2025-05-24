import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"

// User data interface (keep existing interface)
export interface UserData {
  uid: string
  email: string
  displayName: string
  firstName: string
  lastName: string
  username: string
  bio: string
  location: string
  website: string
  photoURL: string
  subscriptionTier: "free" | "premium" | "vip"
  joinDate: any
  lastActive: any
  stats: {
    messagesSent: number
    videoCalls: number
    connections: number
    giftsReceived: number
  }
  settings: {
    notifications: {
      messages: boolean
      videoCalls: boolean
      friendRequests: boolean
      gifts: boolean
      marketing: boolean
    }
    privacy: {
      profileVisible: boolean
      onlineStatus: boolean
      readReceipts: boolean
      allowDirectMessages: boolean
    }
  }
}

// Lazy load Firebase services to prevent initialization errors
const getFirebaseServices = async () => {
  const { auth, db } = await import("@/lib/firebase")
  return { auth, db }
}

// Auth providers
const googleProvider = new GoogleAuthProvider()
const facebookProvider = new FacebookAuthProvider()

// Sign up with email and password
export const signUpWithEmail = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  username: string,
) => {
  try {
    const { auth, db } = await getFirebaseServices()

    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Update the user's display name
    await updateProfile(user, {
      displayName: `${firstName} ${lastName}`,
    })

    // Create user document in Firestore
    const userData: UserData = {
      uid: user.uid,
      email: user.email!,
      displayName: `${firstName} ${lastName}`,
      firstName,
      lastName,
      username,
      bio: "",
      location: "",
      website: "",
      photoURL: user.photoURL || "",
      subscriptionTier: "free",
      joinDate: serverTimestamp(),
      lastActive: serverTimestamp(),
      stats: {
        messagesSent: 0,
        videoCalls: 0,
        connections: 0,
        giftsReceived: 0,
      },
      settings: {
        notifications: {
          messages: true,
          videoCalls: true,
          friendRequests: true,
          gifts: true,
          marketing: false,
        },
        privacy: {
          profileVisible: true,
          onlineStatus: true,
          readReceipts: true,
          allowDirectMessages: true,
        },
      },
    }

    await setDoc(doc(db, "users", user.uid), userData)
    return { user, userData }
  } catch (error: any) {
    console.error("Sign up error:", error)
    throw new Error(error.message || "Failed to create account")
  }
}

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { auth, db } = await getFirebaseServices()

    const userCredential = await signInWithEmailAndPassword(auth, email, password)

    // Update last active timestamp
    await setDoc(
      doc(db, "users", userCredential.user.uid),
      {
        lastActive: serverTimestamp(),
      },
      { merge: true },
    )

    return userCredential.user
  } catch (error: any) {
    console.error("Sign in error:", error)
    throw new Error(error.message || "Failed to sign in")
  }
}

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const { auth, db } = await getFirebaseServices()

    const result = await signInWithPopup(auth, googleProvider)
    const user = result.user

    // Check if user document exists
    const userDoc = await getDoc(doc(db, "users", user.uid))

    if (!userDoc.exists()) {
      // Create new user document for Google sign-in
      const names = user.displayName?.split(" ") || ["", ""]
      const userData: UserData = {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || "",
        firstName: names[0] || "",
        lastName: names.slice(1).join(" ") || "",
        username: user.email?.split("@")[0] || "",
        bio: "",
        location: "",
        website: "",
        photoURL: user.photoURL || "",
        subscriptionTier: "free",
        joinDate: serverTimestamp(),
        lastActive: serverTimestamp(),
        stats: {
          messagesSent: 0,
          videoCalls: 0,
          connections: 0,
          giftsReceived: 0,
        },
        settings: {
          notifications: {
            messages: true,
            videoCalls: true,
            friendRequests: true,
            gifts: true,
            marketing: false,
          },
          privacy: {
            profileVisible: true,
            onlineStatus: true,
            readReceipts: true,
            allowDirectMessages: true,
          },
        },
      }
      await setDoc(doc(db, "users", user.uid), userData)
    } else {
      // Update last active for existing user
      await setDoc(
        doc(db, "users", user.uid),
        {
          lastActive: serverTimestamp(),
        },
        { merge: true },
      )
    }

    return user
  } catch (error: any) {
    console.error("Google sign in error:", error)
    throw new Error(error.message || "Failed to sign in with Google")
  }
}

// Sign in with Facebook
export const signInWithFacebook = async () => {
  try {
    const { auth, db } = await getFirebaseServices()

    const result = await signInWithPopup(auth, facebookProvider)
    const user = result.user

    // Check if user document exists
    const userDoc = await getDoc(doc(db, "users", user.uid))

    if (!userDoc.exists()) {
      // Create new user document for Facebook sign-in
      const names = user.displayName?.split(" ") || ["", ""]
      const userData: UserData = {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || "",
        firstName: names[0] || "",
        lastName: names.slice(1).join(" ") || "",
        username: user.email?.split("@")[0] || "",
        bio: "",
        location: "",
        website: "",
        photoURL: user.photoURL || "",
        subscriptionTier: "free",
        joinDate: serverTimestamp(),
        lastActive: serverTimestamp(),
        stats: {
          messagesSent: 0,
          videoCalls: 0,
          connections: 0,
          giftsReceived: 0,
        },
        settings: {
          notifications: {
            messages: true,
            videoCalls: true,
            friendRequests: true,
            gifts: true,
            marketing: false,
          },
          privacy: {
            profileVisible: true,
            onlineStatus: true,
            readReceipts: true,
            allowDirectMessages: true,
          },
        },
      }
      await setDoc(doc(db, "users", user.uid), userData)
    } else {
      // Update last active for existing user
      await setDoc(
        doc(db, "users", user.uid),
        {
          lastActive: serverTimestamp(),
        },
        { merge: true },
      )
    }

    return user
  } catch (error: any) {
    console.error("Facebook sign in error:", error)
    throw new Error(error.message || "Failed to sign in with Facebook")
  }
}

// Sign out
export const signOutUser = async () => {
  try {
    const { auth } = await getFirebaseServices()
    await signOut(auth)
  } catch (error: any) {
    console.error("Sign out error:", error)
    throw new Error(error.message || "Failed to sign out")
  }
}

// Get user data from Firestore
export const getUserData = async (uid: string): Promise<UserData | null> => {
  try {
    const { db } = await getFirebaseServices()
    const userDoc = await getDoc(doc(db, "users", uid))
    if (userDoc.exists()) {
      return userDoc.data() as UserData
    }
    return null
  } catch (error) {
    console.error("Error getting user data:", error)
    return null
  }
}
