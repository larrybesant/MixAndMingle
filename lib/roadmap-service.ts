import { db } from "./firebase-admin"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  FieldValue,
  setDoc,
} from "firebase/firestore"

export type RoadmapStatus = "planned" | "in-progress" | "completed" | "on-hold"

export type RoadmapCategory = "feature" | "enhancement" | "bug-fix" | "performance" | "ui-ux" | "infrastructure"

export interface RoadmapItem {
  id: string
  title: string
  description: string
  status: RoadmapStatus
  category: RoadmapCategory
  priority: number // 1-5, 5 being highest
  estimatedCompletion?: string // ISO date string
  createdAt: Timestamp
  updatedAt: Timestamp
  relatedFeedbackIds: string[] // IDs of feedback items that inspired this
  votes: number // Total votes from users
  assignedTo?: string // UID of team member assigned
  tags: string[]
  changelog?: {
    date: Timestamp
    description: string
    status: RoadmapStatus
  }[]
}

export interface RoadmapUpdate {
  id: string
  roadmapItemId: string
  description: string
  createdAt: Timestamp
}

const ROADMAP_COLLECTION = "roadmap"
const ROADMAP_UPDATES_COLLECTION = "roadmapUpdates"
const ROADMAP_VOTES_COLLECTION = "roadmapVotes"

export const getRoadmapItems = async () => {
  try {
    const roadmapRef = collection(db, ROADMAP_COLLECTION)
    const q = query(roadmapRef, orderBy("priority", "desc"), orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)

    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as RoadmapItem,
    )
  } catch (error) {
    console.error("Error getting roadmap items:", error)
    throw error
  }
}

export const getRoadmapItemsByStatus = async (status: RoadmapStatus) => {
  try {
    const roadmapRef = collection(db, ROADMAP_COLLECTION)
    const q = query(
      roadmapRef,
      where("status", "==", status),
      orderBy("priority", "desc"),
      orderBy("createdAt", "desc"),
    )
    const snapshot = await getDocs(q)

    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as RoadmapItem,
    )
  } catch (error) {
    console.error(`Error getting roadmap items with status ${status}:`, error)
    throw error
  }
}

export const getRoadmapItemById = async (id: string) => {
  try {
    const docRef = doc(db, ROADMAP_COLLECTION, id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as RoadmapItem
    } else {
      return null
    }
  } catch (error) {
    console.error(`Error getting roadmap item with ID ${id}:`, error)
    throw error
  }
}

export const getRoadmapItemsByFeedbackId = async (feedbackId: string) => {
  try {
    const roadmapRef = collection(db, ROADMAP_COLLECTION)
    const q = query(roadmapRef, where("relatedFeedbackIds", "array-contains", feedbackId))
    const snapshot = await getDocs(q)

    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as RoadmapItem,
    )
  } catch (error) {
    console.error(`Error getting roadmap items related to feedback ${feedbackId}:`, error)
    throw error
  }
}

export const createRoadmapItem = async (
  item: Omit<RoadmapItem, "id" | "createdAt" | "updatedAt" | "votes" | "changelog">,
) => {
  try {
    const now = Timestamp.now()
    const newItem = {
      ...item,
      createdAt: now,
      updatedAt: now,
      votes: 0,
      changelog: [
        {
          date: now,
          description: "Item created",
          status: item.status,
        },
      ],
    }

    const docRef = await addDoc(collection(db, ROADMAP_COLLECTION), newItem)
    return {
      id: docRef.id,
      ...newItem,
    } as RoadmapItem
  } catch (error) {
    console.error("Error creating roadmap item:", error)
    throw error
  }
}

export const updateRoadmapItem = async (
  id: string,
  updates: Partial<Omit<RoadmapItem, "id" | "createdAt" | "updatedAt" | "changelog">>,
) => {
  try {
    const docRef = doc(db, ROADMAP_COLLECTION, id)
    const currentDoc = await getDoc(docRef)
    const currentData = currentDoc.data() as Omit<RoadmapItem, "id">

    // Create changelog entry if status changed
    let changelog = currentData.changelog || []
    if (updates.status && updates.status !== currentData.status) {
      changelog = [
        ...changelog,
        {
          date: Timestamp.now(),
          description: `Status changed from ${currentData.status} to ${updates.status}`,
          status: updates.status,
        },
      ]
    }

    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
      changelog,
    })

    return {
      id,
      ...currentData,
      ...updates,
      updatedAt: Timestamp.now(),
      changelog,
    }
  } catch (error) {
    console.error(`Error updating roadmap item with ID ${id}:`, error)
    throw error
  }
}

export const deleteRoadmapItem = async (id: string) => {
  try {
    await deleteDoc(doc(db, ROADMAP_COLLECTION, id))
    return true
  } catch (error) {
    console.error(`Error deleting roadmap item with ID ${id}:`, error)
    throw error
  }
}

export const addRoadmapUpdate = async (update: Omit<RoadmapUpdate, "id" | "createdAt">) => {
  try {
    const newUpdate = {
      ...update,
      createdAt: Timestamp.now(),
    }

    const docRef = await addDoc(collection(db, ROADMAP_UPDATES_COLLECTION), newUpdate)
    return {
      id: docRef.id,
      ...newUpdate,
    } as RoadmapUpdate
  } catch (error) {
    console.error("Error adding roadmap update:", error)
    throw error
  }
}

export const getRoadmapUpdates = async (roadmapItemId: string) => {
  try {
    const updatesRef = collection(db, ROADMAP_UPDATES_COLLECTION)
    const q = query(updatesRef, where("roadmapItemId", "==", roadmapItemId), orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)

    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as RoadmapUpdate,
    )
  } catch (error) {
    console.error(`Error getting updates for roadmap item ${roadmapItemId}:`, error)
    throw error
  }
}

export const getRecentRoadmapUpdates = async (limit = 5) => {
  try {
    const updatesRef = collection(db, ROADMAP_COLLECTION)
    const q = query(updatesRef, orderBy("updatedAt", "desc"), limit)
    const snapshot = await getDocs(q)

    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as RoadmapItem,
    )
  } catch (error) {
    console.error("Error getting recent roadmap updates:", error)
    throw error
  }
}

export const linkFeedbackToRoadmap = async (roadmapId: string, feedbackId: string) => {
  try {
    await updateDoc(doc(db, ROADMAP_COLLECTION, roadmapId), {
      relatedFeedbackIds: FieldValue.arrayUnion(feedbackId),
    })

    // Also update the feedback item to reference this roadmap item
    await updateDoc(doc(db, "feedback", feedbackId), {
      roadmapItemId: roadmapId,
      status: "accepted", // Update feedback status to show it's been accepted
    })
  } catch (error) {
    console.error(`Error linking feedback ${feedbackId} to roadmap item ${roadmapId}:`, error)
    throw error
  }
}

export const unlinkFeedbackFromRoadmap = async (roadmapItemId: string, feedbackId: string) => {
  try {
    const docRef = doc(db, ROADMAP_COLLECTION, roadmapItemId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const roadmapItem = docSnap.data() as RoadmapItem
      const updatedFeedbackIds = roadmapItem.relatedFeedbackIds.filter((id) => id !== feedbackId)
      await updateDoc(docRef, {
        relatedFeedbackIds: updatedFeedbackIds,
        updatedAt: Timestamp.now(),
      })
      return true
    } else {
      throw new Error(`Roadmap item with ID ${roadmapItemId} not found`)
    }
  } catch (error) {
    console.error(`Error unlinking feedback ${feedbackId} from roadmap item ${roadmapItemId}:`, error)
    throw error
  }
}

export const updateRoadmapItemVotes = async (roadmapItemId: string) => {
  try {
    const docRef = doc(db, ROADMAP_COLLECTION, roadmapItemId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const roadmapItem = docSnap.data() as RoadmapItem
      let totalVotes = 0

      // For each related feedback, get its vote count
      for (const feedbackId of roadmapItem.relatedFeedbackIds) {
        const feedbackRef = doc(db, "feedback", feedbackId)
        const feedbackSnap = await getDoc(feedbackRef)

        if (feedbackSnap.exists()) {
          const feedback = feedbackSnap.data()
          totalVotes += (feedback.upvotes || 0) - (feedback.downvotes || 0)
        }
      }

      await updateDoc(docRef, {
        votes: totalVotes,
        updatedAt: Timestamp.now(),
      })

      return totalVotes
    } else {
      throw new Error(`Roadmap item with ID ${roadmapItemId} not found`)
    }
  } catch (error) {
    console.error(`Error updating votes for roadmap item ${roadmapItemId}:`, error)
    throw error
  }
}

export const voteForRoadmapItem = async (id: string, userId: string) => {
  try {
    const voteRef = doc(db, ROADMAP_VOTES_COLLECTION, `${id}_${userId}`)
    const voteDoc = await getDoc(voteRef)

    if (voteDoc.exists()) {
      // User already voted, remove vote
      await deleteDoc(voteRef)
      await updateDoc(doc(db, ROADMAP_COLLECTION, id), {
        votes: FieldValue.increment(-1),
      })
      return false // Indicates vote removed
    } else {
      // Add new vote
      await setDoc(voteRef, {
        userId,
        roadmapId: id,
        createdAt: Timestamp.now(),
      })
      await updateDoc(doc(db, ROADMAP_COLLECTION, id), {
        votes: FieldValue.increment(1),
      })
      return true // Indicates vote added
    }
  } catch (error) {
    console.error(`Error voting for roadmap item with ID ${id}:`, error)
    throw error
  }
}
