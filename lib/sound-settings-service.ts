import { doc, getDoc, setDoc, onSnapshot, type Unsubscribe } from "firebase/firestore"
import { db } from "@/lib/firebase"

// Define the structure of quiet hours settings
export interface QuietHoursSettings {
  enabled: boolean
  startTime: string // 24-hour format, e.g., "22:00"
  endTime: string // 24-hour format, e.g., "07:00"
  daysOfWeek: boolean[] // Array of 7 booleans, starting with Sunday
}

// Define the structure of sound settings
export interface SoundSettings {
  muted: boolean
  volume: number
  typeSettings: Record<string, boolean>
  quietHours: QuietHoursSettings
  lastUpdated: string // ISO date string
}

// Default quiet hours settings
const defaultQuietHours: QuietHoursSettings = {
  enabled: false,
  startTime: "22:00",
  endTime: "07:00",
  daysOfWeek: [true, true, true, true, true, true, true], // All days enabled by default
}

// Default sound settings
export const defaultSoundSettings: SoundSettings = {
  muted: false,
  volume: 0.5,
  typeSettings: {
    message: true,
    mention: true,
    roomInvite: true,
    friendRequest: true,
    gift: true,
    system: true,
    videoCall: true,
  },
  quietHours: defaultQuietHours,
  lastUpdated: new Date().toISOString(),
}

class SoundSettingsService {
  private listeners: Array<(settings: SoundSettings) => void> = []
  private unsubscribe: Unsubscribe | null = null
  private currentSettings: SoundSettings | null = null
  private isInitialized = false

  // Initialize the service for a specific user
  async initialize(userId: string): Promise<SoundSettings> {
    if (this.isInitialized) {
      return this.currentSettings || defaultSoundSettings
    }

    try {
      // Get initial settings from Firestore
      const settings = await this.fetchSettings(userId)
      this.currentSettings = settings

      // Subscribe to real-time updates
      this.unsubscribe = onSnapshot(doc(db, "userSettings", userId), (doc) => {
        if (doc.exists()) {
          const settings = doc.data() as SoundSettings
          this.currentSettings = settings
          this.notifyListeners(settings)
        }
      })

      this.isInitialized = true
      return settings
    } catch (error) {
      console.error("Error initializing sound settings service:", error)
      return defaultSoundSettings
    }
  }

  // Fetch settings from Firestore
  private async fetchSettings(userId: string): Promise<SoundSettings> {
    try {
      const docRef = doc(db, "userSettings", userId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<SoundSettings>

        // Ensure all fields exist with defaults if missing
        return {
          ...defaultSoundSettings,
          ...data,
          quietHours: {
            ...defaultQuietHours,
            ...data.quietHours,
          },
        }
      } else {
        // If no settings exist, create default settings
        await this.saveSettings(userId, defaultSoundSettings)
        return defaultSoundSettings
      }
    } catch (error) {
      console.error("Error fetching sound settings:", error)
      return defaultSoundSettings
    }
  }

  // Save settings to Firestore
  async saveSettings(userId: string, settings: SoundSettings): Promise<void> {
    if (!userId) {
      console.warn("Cannot save settings: No user ID provided")
      return
    }

    try {
      // Update timestamp
      const updatedSettings = {
        ...settings,
        lastUpdated: new Date().toISOString(),
      }

      // Save to Firestore
      await setDoc(doc(db, "userSettings", userId), updatedSettings)

      // Update local cache
      this.currentSettings = updatedSettings
      this.notifyListeners(updatedSettings)
    } catch (error) {
      console.error("Error saving sound settings:", error)
    }
  }

  // Update specific settings
  async updateSettings(userId: string, updates: Partial<Omit<SoundSettings, "lastUpdated">>): Promise<void> {
    if (!userId) {
      console.warn("Cannot update settings: No user ID provided")
      return
    }

    try {
      const currentSettings = this.currentSettings || (await this.fetchSettings(userId))
      const updatedSettings = {
        ...currentSettings,
        ...updates,
        lastUpdated: new Date().toISOString(),
      }

      await this.saveSettings(userId, updatedSettings)
    } catch (error) {
      console.error("Error updating sound settings:", error)
    }
  }

  // Update quiet hours settings
  async updateQuietHours(userId: string, quietHours: Partial<QuietHoursSettings>): Promise<void> {
    if (!userId) {
      console.warn("Cannot update quiet hours: No user ID provided")
      return
    }

    try {
      const currentSettings = this.currentSettings || (await this.fetchSettings(userId))
      const updatedSettings = {
        ...currentSettings,
        quietHours: {
          ...currentSettings.quietHours,
          ...quietHours,
        },
        lastUpdated: new Date().toISOString(),
      }

      await this.saveSettings(userId, updatedSettings)
    } catch (error) {
      console.error("Error updating quiet hours settings:", error)
    }
  }

  // Check if current time is within quiet hours
  isQuietHoursActive(settings?: SoundSettings): boolean {
    const currentSettings = settings || this.currentSettings
    if (!currentSettings || !currentSettings.quietHours.enabled) {
      return false
    }

    const { quietHours } = currentSettings

    // Check if today is enabled in quiet hours
    const today = new Date().getDay() // 0 = Sunday, 1 = Monday, etc.
    if (!quietHours.daysOfWeek[today]) {
      return false
    }

    // Parse start and end times
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTime = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`

    const startTime = quietHours.startTime
    const endTime = quietHours.endTime

    // Handle cases where quiet hours span across midnight
    if (startTime > endTime) {
      // If start time is after end time, it means quiet hours span across midnight
      // e.g., start: 22:00, end: 07:00
      return currentTime >= startTime || currentTime < endTime
    } else {
      // Normal case, e.g., start: 08:00, end: 17:00
      return currentTime >= startTime && currentTime < endTime
    }
  }

  // Subscribe to settings changes
  subscribe(callback: (settings: SoundSettings) => void): () => void {
    this.listeners.push(callback)

    // If we already have settings, notify immediately
    if (this.currentSettings) {
      callback(this.currentSettings)
    }

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== callback)
    }
  }

  // Notify all listeners of settings changes
  private notifyListeners(settings: SoundSettings): void {
    this.listeners.forEach((listener) => listener(settings))
  }

  // Clean up when no longer needed
  cleanup(): void {
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
    }
    this.listeners = []
    this.isInitialized = false
  }

  // Get current settings
  getCurrentSettings(): SoundSettings | null {
    return this.currentSettings
  }
}

export const soundSettingsService = new SoundSettingsService()
