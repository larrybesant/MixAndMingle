// Audio service for playing notification sounds
import { soundSettingsService, type SoundSettings } from "@/lib/sound-settings-service"

class AudioService {
  private sounds: Record<string, HTMLAudioElement> = {}
  private initialized = false
  private muted = false
  private typeSettings: Record<string, boolean> = {}
  private userId: string | null = null
  private unsubscribe: (() => void) | null = null
  private quietHoursCheckInterval: NodeJS.Timeout | null = null
  private isInQuietHours = false

  // Available notification types
  readonly notificationTypes = ["message", "mention", "roomInvite", "friendRequest", "gift", "system", "videoCall"]

  // Initialize the audio service with sound files
  initialize(): void {
    if (this.initialized || typeof window === "undefined") return

    // Load sound files
    this.sounds = {
      message: new Audio("/sounds/message.mp3"),
      mention: new Audio("/sounds/mention.mp3"),
      roomInvite: new Audio("/sounds/room-invite.mp3"),
      friendRequest: new Audio("/sounds/friend-request.mp3"),
      gift: new Audio("/sounds/gift.mp3"),
      system: new Audio("/sounds/system.mp3"),
      videoCall: new Audio("/sounds/video-call.mp3"),
    }

    // Preload sounds
    Object.values(this.sounds).forEach((audio) => {
      audio.load()
    })

    // Load settings from localStorage as a fallback
    this.loadLocalSettings()

    this.initialized = true
  }

  // Initialize with a user ID for Firestore sync
  async initializeWithUser(userId: string): Promise<void> {
    if (!this.initialized) {
      this.initialize()
    }

    // If we're already initialized with this user, do nothing
    if (this.userId === userId) return

    // Clean up previous subscription if any
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
    }

    this.userId = userId

    try {
      // Initialize the settings service and get initial settings
      const settings = await soundSettingsService.initialize(userId)
      this.applySettings(settings)

      // Subscribe to settings changes
      this.unsubscribe = soundSettingsService.subscribe((settings) => {
        this.applySettings(settings)
      })

      // Start checking quiet hours
      this.startQuietHoursCheck()
    } catch (error) {
      console.error("Error initializing audio service with user:", error)
      // Fall back to local settings
      this.loadLocalSettings()
    }
  }

  // Start periodic check for quiet hours
  private startQuietHoursCheck(): void {
    // Clear any existing interval
    if (this.quietHoursCheckInterval) {
      clearInterval(this.quietHoursCheckInterval)
    }

    // Check quiet hours status immediately
    this.checkQuietHours()

    // Then check every minute
    this.quietHoursCheckInterval = setInterval(() => {
      this.checkQuietHours()
    }, 60000) // Check every minute
  }

  // Check if we're currently in quiet hours
  private checkQuietHours(): void {
    const settings = soundSettingsService.getCurrentSettings()
    if (!settings) return

    const wasInQuietHours = this.isInQuietHours
    this.isInQuietHours = soundSettingsService.isQuietHoursActive(settings)

    // Log state changes for debugging
    if (wasInQuietHours !== this.isInQuietHours) {
      console.log(`Quiet hours status changed: ${this.isInQuietHours ? "active" : "inactive"}`)
    }
  }

  // Apply settings from Firestore or localStorage
  private applySettings(settings: SoundSettings): void {
    this.muted = settings.muted
    this.typeSettings = { ...settings.typeSettings }
    this.setVolume(settings.volume)

    // Check quiet hours status
    this.isInQuietHours = soundSettingsService.isQuietHoursActive(settings)

    // Save to localStorage as fallback
    this.saveLocalSettings()
  }

  // Load settings from localStorage (fallback for offline or before auth)
  private loadLocalSettings(): void {
    // Load mute preference
    const muteSetting = localStorage.getItem("notification-sounds-muted")
    this.muted = muteSetting === "true"

    // Load volume preference
    const volumeSetting = localStorage.getItem("notification-sounds-volume")
    const volume = volumeSetting ? Number.parseFloat(volumeSetting) : 0.5
    this.setVolume(volume)

    // Load per-type settings
    const typeSettingsJson = localStorage.getItem("notification-sounds-types")
    if (typeSettingsJson) {
      try {
        this.typeSettings = JSON.parse(typeSettingsJson)
      } catch (e) {
        console.error("Failed to parse notification type settings", e)
        this.initializeDefaultTypeSettings()
      }
    } else {
      this.initializeDefaultTypeSettings()
    }
  }

  // Save settings to localStorage (fallback for offline)
  private saveLocalSettings(): void {
    localStorage.setItem("notification-sounds-muted", this.muted.toString())
    localStorage.setItem("notification-sounds-volume", this.getVolume().toString())
    localStorage.setItem("notification-sounds-types", JSON.stringify(this.typeSettings))
  }

  // Initialize default type settings (all enabled)
  private initializeDefaultTypeSettings(): void {
    this.typeSettings = {}
    this.notificationTypes.forEach((type) => {
      this.typeSettings[type] = true
    })
  }

  // Save current settings to Firestore
  private async saveToFirestore(): Promise<void> {
    if (!this.userId) return

    const settings = soundSettingsService.getCurrentSettings()
    if (!settings) return

    const updatedSettings: SoundSettings = {
      ...settings,
      muted: this.muted,
      volume: this.getVolume(),
      typeSettings: { ...this.typeSettings },
      lastUpdated: new Date().toISOString(),
    }

    try {
      await soundSettingsService.saveSettings(this.userId, updatedSettings)
    } catch (error) {
      console.error("Error saving sound settings to Firestore:", error)
      // Still save to localStorage as fallback
      this.saveLocalSettings()
    }
  }

  // Play a sound for a specific notification type
  playSound(type: string): void {
    if (!this.initialized) {
      this.initialize()
    }

    // Don't play if globally muted, this type is disabled, or we're in quiet hours
    if (this.muted || !this.isTypeEnabled(type) || this.isInQuietHours) {
      console.log(
        `Sound not played. Muted: ${this.muted}, Type disabled: ${!this.isTypeEnabled(type)}, Quiet hours: ${this.isInQuietHours}`,
      )
      return
    }

    const sound = this.sounds[type] || this.sounds.system

    // Reset the audio to the beginning if it's already playing
    sound.currentTime = 0

    // Play the sound
    sound.play().catch((error) => {
      // Handle autoplay restrictions
      console.warn("Could not play notification sound:", error)
    })
  }

  // Mute or unmute all sounds
  setMuted(muted: boolean): void {
    this.muted = muted
    this.saveLocalSettings()
    this.saveToFirestore()
  }

  // Get current mute state
  isMuted(): boolean {
    return this.muted
  }

  // Check if we're currently in quiet hours
  isInQuietHoursNow(): boolean {
    return this.isInQuietHours
  }

  // Set volume for all sounds (0.0 to 1.0)
  setVolume(volume: number): void {
    const normalizedVolume = Math.max(0, Math.min(1, volume))

    Object.values(this.sounds).forEach((audio) => {
      audio.volume = normalizedVolume
    })

    this.saveLocalSettings()
    this.saveToFirestore()
  }

  // Get current volume
  getVolume(): number {
    if (!this.initialized || Object.values(this.sounds).length === 0) {
      const savedVolume = localStorage.getItem("notification-sounds-volume")
      return savedVolume ? Number.parseFloat(savedVolume) : 0.5
    }

    // Return the volume of the first sound (they should all be the same)
    return Object.values(this.sounds)[0].volume
  }

  // Enable or disable sound for a specific notification type
  setTypeEnabled(type: string, enabled: boolean): void {
    if (!this.notificationTypes.includes(type)) {
      console.warn(`Unknown notification type: ${type}`)
      return
    }

    this.typeSettings[type] = enabled
    this.saveLocalSettings()
    this.saveToFirestore()
  }

  // Check if sound is enabled for a specific notification type
  isTypeEnabled(type: string): boolean {
    if (!this.notificationTypes.includes(type)) {
      return true // Default to enabled for unknown types
    }

    return this.typeSettings[type] ?? true
  }

  // Get all notification type settings
  getTypeSettings(): Record<string, boolean> {
    return { ...this.typeSettings }
  }

  // Get human-readable names for notification types
  getTypeNames(): Record<string, string> {
    return {
      message: "Chat Messages",
      mention: "Mentions",
      roomInvite: "Room Invites",
      friendRequest: "Friend Requests",
      gift: "Gifts",
      system: "System Notifications",
      videoCall: "Video Calls",
    }
  }

  // Clean up when no longer needed
  cleanup(): void {
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
    }

    if (this.quietHoursCheckInterval) {
      clearInterval(this.quietHoursCheckInterval)
      this.quietHoursCheckInterval = null
    }

    this.userId = null
  }
}

export const audioService = new AudioService()
