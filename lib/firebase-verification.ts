import { auth, db, storage, Timestamp, FieldValue } from "@/lib/firebase-client-safe"
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  limit,
  serverTimestamp,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore"
import { ref, uploadString, getDownloadURL, deleteObject } from "firebase/storage"
import { signInAnonymously, signOut, onAuthStateChanged, deleteUser } from "firebase/auth"

export interface TestResult {
  name: string
  status: "success" | "error" | "pending"
  message: string
  details?: string
}

export class FirebaseVerification {
  private results: TestResult[] = []
  private unsubscribes: (() => void)[] = []
  private testUser: { uid: string; email: string } | null = null
  private testDocId: string | null = null
  private testStoragePath: string | null = null

  constructor() {
    // Initialize with pending tests
    this.results = [
      { name: "Firebase Auth Import", status: "pending", message: "Testing Firebase Auth imports..." },
      { name: "Firebase Firestore Import", status: "pending", message: "Testing Firebase Firestore imports..." },
      { name: "Firebase Storage Import", status: "pending", message: "Testing Firebase Storage imports..." },
      { name: "Firebase Timestamp", status: "pending", message: "Testing Firebase Timestamp..." },
      { name: "Firebase FieldValue", status: "pending", message: "Testing Firebase FieldValue..." },
      { name: "Auth Anonymous Sign In", status: "pending", message: "Testing anonymous sign in..." },
      { name: "Auth State Change", status: "pending", message: "Testing auth state change..." },
      { name: "Firestore Write", status: "pending", message: "Testing Firestore write operation..." },
      { name: "Firestore Read", status: "pending", message: "Testing Firestore read operation..." },
      { name: "Firestore Query", status: "pending", message: "Testing Firestore query operation..." },
      { name: "Firestore Real-time Updates", status: "pending", message: "Testing Firestore real-time updates..." },
      { name: "Storage Upload", status: "pending", message: "Testing Storage upload operation..." },
      { name: "Storage Download", status: "pending", message: "Testing Storage download operation..." },
    ]
  }

  getResults() {
    return [...this.results]
  }

  updateResult(name: string, status: "success" | "error" | "pending", message: string, details?: string) {
    const index = this.results.findIndex((result) => result.name === name)
    if (index !== -1) {
      this.results[index] = { name, status, message, details }
    }
    return [...this.results]
  }

  async runAllTests() {
    try {
      // Test imports first
      this.testAuthImport()
      this.testFirestoreImport()
      this.testStorageImport()
      this.testTimestamp()
      this.testFieldValue()

      // Test functionality
      await this.testAnonymousSignIn()
      this.testAuthStateChange()
      await this.testFirestoreWrite()
      await this.testFirestoreRead()
      await this.testFirestoreQuery()
      await this.testFirestoreRealtime()
      await this.testStorageUpload()
      await this.testStorageDownload()

      // Clean up
      await this.cleanup()
    } catch (error) {
      console.error("Error running tests:", error)
    }
  }

  private testAuthImport() {
    try {
      if (auth) {
        this.updateResult(
          "Firebase Auth Import",
          "success",
          "Firebase Auth is imported correctly",
          "The auth object is available from firebase-client-safe.ts",
        )
      } else {
        this.updateResult(
          "Firebase Auth Import",
          "error",
          "Firebase Auth import failed",
          "The auth object is not available from firebase-client-safe.ts",
        )
      }
    } catch (error) {
      this.updateResult(
        "Firebase Auth Import",
        "error",
        "Firebase Auth import failed",
        `Error: ${(error as Error).message}`,
      )
    }
  }

  private testFirestoreImport() {
    try {
      if (db) {
        this.updateResult(
          "Firebase Firestore Import",
          "success",
          "Firebase Firestore is imported correctly",
          "The db object is available from firebase-client-safe.ts",
        )
      } else {
        this.updateResult(
          "Firebase Firestore Import",
          "error",
          "Firebase Firestore import failed",
          "The db object is not available from firebase-client-safe.ts",
        )
      }
    } catch (error) {
      this.updateResult(
        "Firebase Firestore Import",
        "error",
        "Firebase Firestore import failed",
        `Error: ${(error as Error).message}`,
      )
    }
  }

  private testStorageImport() {
    try {
      if (storage) {
        this.updateResult(
          "Firebase Storage Import",
          "success",
          "Firebase Storage is imported correctly",
          "The storage object is available from firebase-client-safe.ts",
        )
      } else {
        this.updateResult(
          "Firebase Storage Import",
          "error",
          "Firebase Storage import failed",
          "The storage object is not available from firebase-client-safe.ts",
        )
      }
    } catch (error) {
      this.updateResult(
        "Firebase Storage Import",
        "error",
        "Firebase Storage import failed",
        `Error: ${(error as Error).message}`,
      )
    }
  }

  private testTimestamp() {
    try {
      if (Timestamp) {
        this.updateResult(
          "Firebase Timestamp",
          "success",
          "Firebase Timestamp is imported correctly",
          "The Timestamp object is available from firebase-client-safe.ts",
        )
      } else {
        this.updateResult(
          "Firebase Timestamp",
          "error",
          "Firebase Timestamp import failed",
          "The Timestamp object is not available from firebase-client-safe.ts",
        )
      }
    } catch (error) {
      this.updateResult(
        "Firebase Timestamp",
        "error",
        "Firebase Timestamp import failed",
        `Error: ${(error as Error).message}`,
      )
    }
  }

  private testFieldValue() {
    try {
      if (FieldValue) {
        this.updateResult(
          "Firebase FieldValue",
          "success",
          "Firebase FieldValue is imported correctly",
          "The FieldValue object is available from firebase-client-safe.ts",
        )
      } else {
        this.updateResult(
          "Firebase FieldValue",
          "error",
          "Firebase FieldValue import failed",
          "The FieldValue object is not available from firebase-client-safe.ts",
        )
      }
    } catch (error) {
      this.updateResult(
        "Firebase FieldValue",
        "error",
        "Firebase FieldValue import failed",
        `Error: ${(error as Error).message}`,
      )
    }
  }

  private async testAnonymousSignIn() {
    try {
      this.updateResult("Auth Anonymous Sign In", "pending", "Attempting anonymous sign in...")

      // Sign out first to ensure clean state
      await signOut(auth)

      // Sign in anonymously
      const userCredential = await signInAnonymously(auth)

      if (userCredential.user) {
        this.updateResult(
          "Auth Anonymous Sign In",
          "success",
          "Anonymous sign in successful",
          `User ID: ${userCredential.user.uid}`,
        )
      } else {
        this.updateResult(
          "Auth Anonymous Sign In",
          "error",
          "Anonymous sign in failed",
          "No user returned from signInAnonymously",
        )
      }
    } catch (error) {
      this.updateResult(
        "Auth Anonymous Sign In",
        "error",
        "Anonymous sign in failed",
        `Error: ${(error as Error).message}`,
      )
    }
  }

  private testAuthStateChange() {
    try {
      this.updateResult("Auth State Change", "pending", "Setting up auth state listener...")

      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          this.updateResult("Auth State Change", "success", "Auth state change detected", `User ID: ${user.uid}`)
        } else {
          this.updateResult(
            "Auth State Change",
            "success",
            "Auth state change detected (signed out)",
            "No user is signed in",
          )
        }
      })

      this.unsubscribes.push(unsubscribe)
    } catch (error) {
      this.updateResult(
        "Auth State Change",
        "error",
        "Auth state change listener failed",
        `Error: ${(error as Error).message}`,
      )
    }
  }

  private async testFirestoreWrite() {
    try {
      this.updateResult("Firestore Write", "pending", "Writing test document to Firestore...")

      // Create a test collection for verification
      const testCollection = collection(db, "firebase_verification_tests")

      // Add a document
      const docRef = await addDoc(testCollection, {
        testField: "test value",
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString(),
      })

      this.testDocId = docRef.id

      this.updateResult("Firestore Write", "success", "Firestore write successful", `Document ID: ${docRef.id}`)
    } catch (error) {
      this.updateResult("Firestore Write", "error", "Firestore write failed", `Error: ${(error as Error).message}`)
    }
  }

  private async testFirestoreRead() {
    try {
      if (!this.testDocId) {
        this.updateResult("Firestore Read", "error", "Firestore read failed", "No test document ID available")
        return
      }

      this.updateResult("Firestore Read", "pending", "Reading test document from Firestore...")

      // Get the document
      const docRef = doc(db, "firebase_verification_tests", this.testDocId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        this.updateResult(
          "Firestore Read",
          "success",
          "Firestore read successful",
          `Document data: ${JSON.stringify(docSnap.data())}`,
        )
      } else {
        this.updateResult("Firestore Read", "error", "Firestore read failed", "Document does not exist")
      }
    } catch (error) {
      this.updateResult("Firestore Read", "error", "Firestore read failed", `Error: ${(error as Error).message}`)
    }
  }

  private async testFirestoreQuery() {
    try {
      this.updateResult("Firestore Query", "pending", "Querying Firestore...")

      // Create a query
      const testCollection = collection(db, "firebase_verification_tests")
      const q = query(testCollection, where("testField", "==", "test value"), limit(1))

      // Execute the query
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        this.updateResult(
          "Firestore Query",
          "success",
          "Firestore query successful",
          `Found ${querySnapshot.size} document(s)`,
        )
      } else {
        this.updateResult("Firestore Query", "error", "Firestore query failed", "No documents found matching the query")
      }
    } catch (error) {
      this.updateResult("Firestore Query", "error", "Firestore query failed", `Error: ${(error as Error).message}`)
    }
  }

  private async testFirestoreRealtime() {
    try {
      if (!this.testDocId) {
        this.updateResult(
          "Firestore Real-time Updates",
          "error",
          "Firestore real-time updates failed",
          "No test document ID available",
        )
        return
      }

      this.updateResult("Firestore Real-time Updates", "pending", "Setting up real-time listener...")

      // Set up a real-time listener
      const docRef = doc(db, "firebase_verification_tests", this.testDocId)
      const unsubscribe = onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
          this.updateResult(
            "Firestore Real-time Updates",
            "success",
            "Firestore real-time updates working",
            `Received update: ${JSON.stringify(doc.data())}`,
          )
        } else {
          this.updateResult(
            "Firestore Real-time Updates",
            "error",
            "Firestore real-time updates failed",
            "Document does not exist",
          )
        }
      })

      this.unsubscribes.push(unsubscribe)

      // Update the document to trigger the listener
      setTimeout(async () => {
        try {
          await addDoc(collection(db, "firebase_verification_tests"), {
            testField: "real-time test",
            timestamp: serverTimestamp(),
          })
        } catch (error) {
          console.error("Error updating document for real-time test:", error)
        }
      }, 1000)
    } catch (error) {
      this.updateResult(
        "Firestore Real-time Updates",
        "error",
        "Firestore real-time updates failed",
        `Error: ${(error as Error).message}`,
      )
    }
  }

  private async testStorageUpload() {
    try {
      this.updateResult("Storage Upload", "pending", "Uploading test file to Storage...")

      // Create a test file path
      const testFilePath = `firebase_verification_tests/test-${Date.now()}.txt`
      this.testStoragePath = testFilePath

      // Create a reference
      const storageRef = ref(storage, testFilePath)

      // Upload a string
      const snapshot = await uploadString(storageRef, "This is a test file for Firebase Storage verification")

      this.updateResult(
        "Storage Upload",
        "success",
        "Storage upload successful",
        `File path: ${testFilePath}, Size: ${snapshot.totalBytes} bytes`,
      )
    } catch (error) {
      this.updateResult("Storage Upload", "error", "Storage upload failed", `Error: ${(error as Error).message}`)
    }
  }

  private async testStorageDownload() {
    try {
      if (!this.testStoragePath) {
        this.updateResult("Storage Download", "error", "Storage download failed", "No test file path available")
        return
      }

      this.updateResult("Storage Download", "pending", "Downloading test file from Storage...")

      // Create a reference
      const storageRef = ref(storage, this.testStoragePath)

      // Get the download URL
      const url = await getDownloadURL(storageRef)

      this.updateResult("Storage Download", "success", "Storage download successful", `Download URL: ${url}`)
    } catch (error) {
      this.updateResult("Storage Download", "error", "Storage download failed", `Error: ${(error as Error).message}`)
    }
  }

  private async cleanup() {
    try {
      // Clean up unsubscribes
      this.unsubscribes.forEach((unsubscribe) => unsubscribe())
      this.unsubscribes = []

      // Clean up test document
      if (this.testDocId) {
        const docRef = doc(db, "firebase_verification_tests", this.testDocId)
        await deleteDoc(docRef)
      }

      // Clean up test storage file
      if (this.testStoragePath) {
        const storageRef = ref(storage, this.testStoragePath)
        await deleteObject(storageRef)
      }

      // Clean up test user
      if (this.testUser) {
        const user = auth.currentUser
        if (user) {
          await deleteUser(user)
        }
      } else {
        // Sign out anonymous user
        await signOut(auth)
      }

      console.log("Cleanup completed successfully")
    } catch (error) {
      console.error("Error during cleanup:", error)
    }
  }
}
