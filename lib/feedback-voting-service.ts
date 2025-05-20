import { db } from "@/lib/firebase"
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  increment,
  serverTimestamp,
  limit,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore"
import { notificationService } from "@/lib/notification-service"
import { badgeService } from "@/lib/badge-service"

// Vote type
export type VoteType = "upvote" | "downvote"

// Vote interface
export interface Vote {
  id: string
  feedbackId: string
  userId: string
  type: VoteType
  createdAt: Date
}

// Feedback with votes
export interface FeedbackWithVotes {
  id: string
  userId: string
  userName: string
  userEmail?: string
  userPhotoURL?: string
  type: "bug" | "suggestion" | "general"
  content: string
  status: "pending" | "in-progress" | "completed" | "rejected" | "confirmed"
  createdAt: Date
  upvotes: number
  downvotes: number
  userVote?: VoteType | null
}

class FeedbackVotingService {
  // Vote on feedback
  async vote(feedbackId: string, userId: string, voteType: VoteType): Promise<boolean> {
    try {
      // Check if feedback exists
      const feedbackRef = doc(db, "betaFeedback", feedbackId)
      const feedbackDoc = await getDoc(feedbackRef)

      if (!feedbackDoc.exists()) {
        console.error(`Feedback ${feedbackId} not found`)
        return false
      }

      const feedbackData = feedbackDoc.data()
      const feedbackUserId = feedbackData.userId

      // Don't allow voting on your own feedback
      if (feedbackUserId === userId) {
        console.error("Cannot vote on your own feedback")
        return false
      }

      // Check if user has already voted
      const voteId = `${feedbackId}_${userId}`
      const voteRef = doc(db, "feedbackVotes", voteId)
      const voteDoc = await getDoc(voteRef)

      if (voteDoc.exists()) {
        const existingVote = voteDoc.data()
        const existingVoteType = existingVote.type

        // If same vote type, remove the vote
        if (existingVoteType === voteType) {
          // Remove vote
          await deleteDoc(voteRef)

          // Update feedback vote counts
          await updateDoc(feedbackRef, {
            [`${voteType}s`]: increment(-1),
          })

          return true
        } else {
          // Change vote type
          await updateDoc(voteRef, {
            type: voteType,
            updatedAt: serverTimestamp(),
          })

          // Update feedback vote counts
          await updateDoc(feedbackRef, {
            [`${voteType}s`]: increment(1),
            [`${existingVoteType}s`]: increment(-1),
          })

          // Notify feedback author of vote change
          if (voteType === "upvote") {
            await this.notifyFeedbackAuthor(feedbackId, feedbackUserId, userId, "changed_to_upvote")
          }

          return true
        }
      } else {
        // Create new vote
        await setDoc(voteRef, {
          id: voteId,
          feedbackId,
          userId,
          type: voteType,
          createdAt: serverTimestamp(),
        })

        // Initialize vote counts if they don't exist
        const updateData: Record<string, any> = {
          [`${voteType}s`]: increment(1),
        }

        if (feedbackData.upvotes === undefined) {
          updateData.upvotes = voteType === "upvote" ? 1 : 0
        }

        if (feedbackData.downvotes === undefined) {
          updateData.downvotes = voteType === "downvote" ? 1 : 0
        }

        // Update feedback vote counts
        await updateDoc(feedbackRef, updateData)

        // Notify feedback author of new vote
        if (voteType === "upvote") {
          await this.notifyFeedbackAuthor(feedbackId, feedbackUserId, userId, "upvote")
        }

        // Check for voting badges
        await this.checkVotingBadges(userId)

        // Check for feedback author badges (if they received upvotes)
        if (voteType === "upvote") {
          await this.checkFeedbackAuthorBadges(feedbackUserId)
        }

        return true
      }
    } catch (error) {
      console.error("Error voting on feedback:", error)
      return false
    }
  }

  // Get user's vote on feedback
  async getUserVote(feedbackId: string, userId: string): Promise<VoteType | null> {
    try {
      const voteId = `${feedbackId}_${userId}`
      const voteDoc = await getDoc(doc(db, "feedbackVotes", voteId))

      if (voteDoc.exists()) {
        return voteDoc.data().type as VoteType
      }

      return null
    } catch (error) {
      console.error("Error getting user vote:", error)
      return null
    }
  }

  // Get feedback with votes
  async getFeedbackWithVotes(
    userId: string | null = null,
    sortBy: "newest" | "oldest" | "most_upvoted" | "most_controversial" = "newest",
    filterType: "all" | "bug" | "suggestion" | "general" = "all",
    filterStatus: "all" | "pending" | "in-progress" | "completed" | "rejected" | "confirmed" = "all",
    limitCount = 20,
  ): Promise<FeedbackWithVotes[]> {
    try {
      // Build query
      const feedbackQuery = collection(db, "betaFeedback")
      const constraints = []

      // Apply type filter
      if (filterType !== "all") {
        constraints.push(where("type", "==", filterType))
      }

      // Apply status filter
      if (filterStatus !== "all") {
        constraints.push(where("status", "==", filterStatus))
      }

      // Apply sorting
      if (sortBy === "newest") {
        constraints.push(orderBy("createdAt", "desc"))
      } else if (sortBy === "oldest") {
        constraints.push(orderBy("createdAt", "asc"))
      } else if (sortBy === "most_upvoted") {
        constraints.push(orderBy("upvotes", "desc"))
      } else if (sortBy === "most_controversial") {
        constraints.push(orderBy("upvotes", "desc"))
        constraints.push(orderBy("downvotes", "desc"))
      }

      // Apply limit
      constraints.push(limit(limitCount))

      // Execute query
      const q = query(feedbackQuery, ...constraints)
      const querySnapshot = await getDocs(q)

      // Process results
      const feedbackItems: FeedbackWithVotes[] = []
      const votePromises: Promise<VoteType | null>[] = []

      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data()

        feedbackItems.push({
          id: doc.id,
          userId: data.userId,
          userName: data.userName || "Anonymous",
          userEmail: data.userEmail,
          userPhotoURL: data.userPhotoURL,
          type: data.type,
          content: data.content,
          status: data.status || "pending",
          createdAt: data.createdAt?.toDate() || new Date(),
          upvotes: data.upvotes || 0,
          downvotes: data.downvotes || 0,
          userVote: null,
        })

        // If userId is provided, get user's vote for each feedback
        if (userId) {
          votePromises.push(this.getUserVote(doc.id, userId))
        } else {
          votePromises.push(Promise.resolve(null))
        }
      })

      // Get user votes if userId is provided
      if (votePromises.length > 0) {
        const votes = await Promise.all(votePromises)

        votes.forEach((vote, index) => {
          if (feedbackItems[index]) {
            feedbackItems[index].userVote = vote
          }
        })
      }

      return feedbackItems
    } catch (error) {
      console.error("Error getting feedback with votes:", error)
      return []
    }
  }

  // Get top voted feedback
  async getTopVotedFeedback(limit = 5): Promise<FeedbackWithVotes[]> {
    return this.getFeedbackWithVotes(null, "most_upvoted", "all", "all", limit)
  }

  // Notify feedback author of vote
  private async notifyFeedbackAuthor(
    feedbackId: string,
    authorId: string,
    voterId: string,
    action: "upvote" | "changed_to_upvote",
  ): Promise<void> {
    try {
      // Get voter information
      const voterDoc = await getDoc(doc(db, "users", voterId))

      if (!voterDoc.exists()) {
        return
      }

      const voterData = voterDoc.data()
      const voterName = voterData.displayName || "A beta tester"
      const voterPhoto = voterData.photoURL || null

      // Get feedback content (truncated)
      const feedbackDoc = await getDoc(doc(db, "betaFeedback", feedbackId))

      if (!feedbackDoc.exists()) {
        return
      }

      const feedbackData = feedbackDoc.data()
      const feedbackContent = feedbackData.content || ""
      const truncatedContent = feedbackContent.length > 40 ? `${feedbackContent.substring(0, 40)}...` : feedbackContent

      // Create notification
      await notificationService.createNotification({
        userId: authorId,
        type: "system",
        title: action === "upvote" ? "Your feedback was upvoted!" : "Vote changed to upvote!",
        body: `${voterName} ${action === "upvote" ? "upvoted" : "changed their vote to upvote"} your feedback: "${truncatedContent}"`,
        image: voterPhoto,
        data: {
          feedbackId,
          voterId,
        },
      })
    } catch (error) {
      console.error("Error notifying feedback author:", error)
    }
  }

  // Check for voting badges
  private async checkVotingBadges(userId: string): Promise<void> {
    try {
      // Count user's votes
      const votesQuery = query(collection(db, "feedbackVotes"), where("userId", "==", userId))
      const votesSnapshot = await getDocs(votesQuery)
      const voteCount = votesSnapshot.size

      // Award badges based on vote count
      if (voteCount >= 1) {
        await badgeService.awardBadge(userId, "first_vote")
      }

      if (voteCount >= 20) {
        await badgeService.awardBadge(userId, "helpful_voter")
      }

      if (voteCount >= 50) {
        await badgeService.awardBadge(userId, "super_voter")
      }
    } catch (error) {
      console.error("Error checking voting badges:", error)
    }
  }

  // Check for feedback author badges
  private async checkFeedbackAuthorBadges(userId: string): Promise<void> {
    try {
      // Get all feedback by this user
      const feedbackQuery = query(collection(db, "betaFeedback"), where("userId", "==", userId))
      const feedbackSnapshot = await getDocs(feedbackQuery)

      let totalUpvotes = 0

      // Count total upvotes across all feedback
      feedbackSnapshot.forEach((doc) => {
        const data = doc.data()
        totalUpvotes += data.upvotes || 0
      })

      // Award badges based on upvote count
      if (totalUpvotes >= 10) {
        await badgeService.awardBadge(userId, "top_voted")
      }

      if (totalUpvotes >= 50) {
        await badgeService.awardBadge(userId, "community_favorite")
      }
    } catch (error) {
      console.error("Error checking feedback author badges:", error)
    }
  }
}

export const feedbackVotingService = new FeedbackVotingService()
