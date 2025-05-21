export interface UserProfile {
  uid: string
  displayName: string
  email: string
  photoURL?: string
  bio?: string
  location?: string
  interests?: string[]
  socialLinks?: {
    twitter?: string
    instagram?: string
    facebook?: string
    website?: string
  }
  createdAt: Date | string
  updatedAt?: Date | string
  isOnline?: boolean
  lastSeen?: Date | string
  role?: "user" | "moderator" | "admin"
  premium?: boolean
  premiumTier?: "basic" | "standard" | "premium"
  badges?: string[]
  followers?: number
  following?: number
}

export interface ProfileFormData {
  displayName: string
  bio: string
  location: string
  interests: string[]
  socialLinks: {
    twitter: string
    instagram: string
    facebook: string
    website: string
  }
}
