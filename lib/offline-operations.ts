import { db } from "@/lib/firebase-browser"
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore"

// Check if we're online
const isOnline = () => {
  return typeof navigator !== "undefined" ? navigator.onLine : true
}

// Check if offline queue is available
const hasOfflineQueue = () => {
  return typeof window !== "undefined" && window.offlineQueue !== undefined
}

// Add a document with offline support
export async function addDocument(collectionPath: string, data: any) {
  try {
    if (isOnline()) {
      // We're online, add directly to Firestore
      return await addDoc(collection(db, collectionPath), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    } else if (hasOfflineQueue()) {
      // We're offline, add to queue
      const operationId = window.offlineQueue.add(collectionPath, data)
      return {
        id: `pending_${operationId}`,
        pending: true,
      }
    } else {
      throw new Error("Offline operations not available")
    }
  } catch (error) {
    console.error("Error in addDocument:", error)
    throw error
  }
}

// Update a document with offline support
export async function updateDocument(collectionPath: string, docId: string, data: any) {
  try {
    if (isOnline()) {
      // We're online, update directly in Firestore
      const docRef = doc(db, collectionPath, docId)
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      })
      return { id: docId }
    } else if (hasOfflineQueue()) {
      // We're offline, add to queue
      const operationId = window.offlineQueue.update(collectionPath, docId, data)
      return {
        id: docId,
        pending: true,
        operationId,
      }
    } else {
      throw new Error("Offline operations not available")
    }
  } catch (error) {
    console.error("Error in updateDocument:", error)
    throw error
  }
}

// Delete a document with offline support
export async function deleteDocument(collectionPath: string, docId: string) {
  try {
    if (isOnline()) {
      // We're online, delete directly from Firestore
      const docRef = doc(db, collectionPath, docId)
      await deleteDoc(docRef)
      return { id: docId }
    } else if (hasOfflineQueue()) {
      // We're offline, add to queue
      const operationId = window.offlineQueue.delete(collectionPath, docId)
      return {
        id: docId,
        pending: true,
        operationId,
      }
    } else {
      throw new Error("Offline operations not available")
    }
  } catch (error) {
    console.error("Error in deleteDocument:", error)
    throw error
  }
}
