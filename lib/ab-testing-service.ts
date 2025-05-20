import { db } from "./firebase-admin"
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where } from "firebase/firestore"
import { v4 as uuidv4 } from "uuid"

export interface ABTestVariant {
  id: string
  name: string
  description?: string
  weight: number // Percentage of users to assign to this variant (0-100)
}

export interface ABTest {
  id: string
  name: string
  description?: string
  status: "draft" | "active" | "paused" | "completed"
  startDate?: Date
  endDate?: Date
  variants: ABTestVariant[]
  targetAudience?: {
    allUsers: boolean
    specificUserGroups?: string[] // e.g., 'premium', 'new-users', etc.
  }
  metrics: {
    primary: string // e.g., 'click-through-rate', 'time-on-page', etc.
    secondary?: string[]
  }
  results?: {
    [variantId: string]: {
      impressions: number
      conversions: number
      conversionRate: number
      events: {
        [eventName: string]: number
      }
    }
  }
  createdAt: Date
  updatedAt: Date
}

export interface ABTestAssignment {
  userId: string
  testId: string
  variantId: string
  assignedAt: Date
}

export interface ABTestEvent {
  userId: string
  testId: string
  variantId: string
  eventName: string
  timestamp: Date
  metadata?: Record<string, any>
}

const COLLECTION_TESTS = "abTests"
const COLLECTION_ASSIGNMENTS = "abTestAssignments"
const COLLECTION_EVENTS = "abTestEvents"

export const abTestingService = {
  // Test management
  async createTest(test: Omit<ABTest, "id" | "createdAt" | "updatedAt">): Promise<ABTest> {
    const id = uuidv4()
    const now = new Date()

    const newTest: ABTest = {
      ...test,
      id,
      createdAt: now,
      updatedAt: now,
      results: {},
    }

    await setDoc(doc(db, COLLECTION_TESTS, id), newTest)
    return newTest
  },

  async getTest(id: string): Promise<ABTest | null> {
    const testDoc = await getDoc(doc(db, COLLECTION_TESTS, id))
    return testDoc.exists() ? (testDoc.data() as ABTest) : null
  },

  async updateTest(id: string, updates: Partial<ABTest>): Promise<void> {
    const updatedData = {
      ...updates,
      updatedAt: new Date(),
    }

    await updateDoc(doc(db, COLLECTION_TESTS, id), updatedData)
  },

  async deleteTest(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION_TESTS, id))
  },

  async getAllTests(): Promise<ABTest[]> {
    const testsSnapshot = await getDocs(collection(db, COLLECTION_TESTS))
    return testsSnapshot.docs.map((doc) => doc.data() as ABTest)
  },

  async getActiveTests(): Promise<ABTest[]> {
    const testsQuery = query(collection(db, COLLECTION_TESTS), where("status", "==", "active"))

    const testsSnapshot = await getDocs(testsQuery)
    return testsSnapshot.docs.map((doc) => doc.data() as ABTest)
  },

  // User assignment
  async assignUserToVariant(userId: string, testId: string): Promise<string> {
    // Check if user is already assigned
    const existingAssignment = await this.getUserTestAssignment(userId, testId)
    if (existingAssignment) {
      return existingAssignment.variantId
    }

    // Get test details
    const test = await this.getTest(testId)
    if (!test || test.status !== "active") {
      throw new Error(`Test ${testId} is not active`)
    }

    // Randomly assign user to a variant based on weights
    const variantId = this.selectVariantByWeight(test.variants)

    // Save assignment
    const assignment: ABTestAssignment = {
      userId,
      testId,
      variantId,
      assignedAt: new Date(),
    }

    const assignmentId = `${userId}_${testId}`
    await setDoc(doc(db, COLLECTION_ASSIGNMENTS, assignmentId), assignment)

    return variantId
  },

  async getUserTestAssignment(userId: string, testId: string): Promise<ABTestAssignment | null> {
    const assignmentId = `${userId}_${testId}`
    const assignmentDoc = await getDoc(doc(db, COLLECTION_ASSIGNMENTS, assignmentId))
    return assignmentDoc.exists() ? (assignmentDoc.data() as ABTestAssignment) : null
  },

  async getUserAssignments(userId: string): Promise<ABTestAssignment[]> {
    const assignmentsQuery = query(collection(db, COLLECTION_ASSIGNMENTS), where("userId", "==", userId))

    const assignmentsSnapshot = await getDocs(assignmentsQuery)
    return assignmentsSnapshot.docs.map((doc) => doc.data() as ABTestAssignment)
  },

  // Event tracking
  async trackEvent(event: Omit<ABTestEvent, "timestamp">): Promise<void> {
    const eventWithTimestamp: ABTestEvent = {
      ...event,
      timestamp: new Date(),
    }

    const eventId = uuidv4()
    await setDoc(doc(db, COLLECTION_EVENTS, eventId), eventWithTimestamp)

    // Update test results
    await this.updateTestResults(event.testId)
  },

  async getTestEvents(testId: string): Promise<ABTestEvent[]> {
    const eventsQuery = query(collection(db, COLLECTION_EVENTS), where("testId", "==", testId))

    const eventsSnapshot = await getDocs(eventsQuery)
    return eventsSnapshot.docs.map((doc) => doc.data() as ABTestEvent)
  },

  // Results calculation
  async updateTestResults(testId: string): Promise<void> {
    const test = await this.getTest(testId)
    if (!test) {
      throw new Error(`Test ${testId} not found`)
    }

    const events = await this.getTestEvents(testId)
    const results: ABTest["results"] = {}

    // Initialize results for each variant
    test.variants.forEach((variant) => {
      results[variant.id] = {
        impressions: 0,
        conversions: 0,
        conversionRate: 0,
        events: {},
      }
    })

    // Count impressions and events
    events.forEach((event) => {
      if (!results[event.variantId]) {
        results[event.variantId] = {
          impressions: 0,
          conversions: 0,
          conversionRate: 0,
          events: {},
        }
      }

      if (event.eventName === "impression") {
        results[event.variantId].impressions++
      } else if (event.eventName === "conversion") {
        results[event.variantId].conversions++
      }

      // Count all events
      if (!results[event.variantId].events[event.eventName]) {
        results[event.variantId].events[event.eventName] = 0
      }
      results[event.variantId].events[event.eventName]++
    })

    // Calculate conversion rates
    Object.keys(results).forEach((variantId) => {
      const { impressions, conversions } = results[variantId]
      results[variantId].conversionRate = impressions > 0 ? (conversions / impressions) * 100 : 0
    })

    // Update test with results
    await this.updateTest(testId, { results })
  },

  // Helper methods
  selectVariantByWeight(variants: ABTestVariant[]): string {
    const totalWeight = variants.reduce((sum, variant) => sum + variant.weight, 0)
    let random = Math.random() * totalWeight

    for (const variant of variants) {
      random -= variant.weight
      if (random <= 0) {
        return variant.id
      }
    }

    // Fallback to first variant if something goes wrong
    return variants[0].id
  },

  // Statistical significance calculation
  calculateStatisticalSignificance(test: ABTest): {
    hasSignificantResult: boolean
    winningVariantId?: string
    confidenceLevel?: number
    pValue?: number
  } {
    if (!test.results || Object.keys(test.results).length < 2) {
      return { hasSignificantResult: false }
    }

    // Implement statistical significance calculation
    // This is a simplified version - in production, use a proper statistical library

    const variants = Object.keys(test.results)
    let maxConversionRate = 0
    let winningVariantId = ""

    variants.forEach((variantId) => {
      const conversionRate = test.results![variantId].conversionRate
      if (conversionRate > maxConversionRate) {
        maxConversionRate = conversionRate
        winningVariantId = variantId
      }
    })

    // Simple z-test for proportion comparison
    // In a real implementation, use a proper statistical test
    const controlVariantId = test.variants[0].id
    const controlResults = test.results[controlVariantId]
    const testResults = test.results[winningVariantId]

    if (
      controlVariantId === winningVariantId ||
      !controlResults ||
      !testResults ||
      controlResults.impressions < 100 ||
      testResults.impressions < 100
    ) {
      return { hasSignificantResult: false }
    }

    const p1 = controlResults.conversions / controlResults.impressions
    const p2 = testResults.conversions / testResults.impressions
    const n1 = controlResults.impressions
    const n2 = testResults.impressions

    const pooledProportion =
      (controlResults.conversions + testResults.conversions) / (controlResults.impressions + testResults.impressions)

    const standardError = Math.sqrt(pooledProportion * (1 - pooledProportion) * (1 / n1 + 1 / n2))

    const zScore = (p2 - p1) / standardError
    const pValue = this.calculatePValueFromZScore(Math.abs(zScore))

    const confidenceLevel = (1 - pValue) * 100
    const hasSignificantResult = pValue < 0.05 // 95% confidence level

    return {
      hasSignificantResult,
      winningVariantId: hasSignificantResult ? winningVariantId : undefined,
      confidenceLevel,
      pValue,
    }
  },

  calculatePValueFromZScore(zScore: number): number {
    // Approximation of the cumulative distribution function of the standard normal distribution
    // In production, use a proper statistical library
    if (zScore < 0) {
      return 0.5
    }

    const t = 1 / (1 + 0.2316419 * zScore)
    const d = 0.3989423 * Math.exp((-zScore * zScore) / 2)
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))

    return 0.5 - p
  },
}
