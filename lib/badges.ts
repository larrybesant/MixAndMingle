// Badge types and categories
export type BadgeRarity = "common" | "uncommon" | "rare" | "epic" | "legendary"
export type BadgeCategory = "feedback" | "testing" | "social" | "achievement" | "special"

export interface Badge {
  id: string
  name: string
  description: string
  imageUrl: string
  category: BadgeCategory
  rarity: BadgeRarity
  points: number
  criteria: string
}

// Badge collection
export const BADGES: Badge[] = [
  {
    id: "first_feedback",
    name: "First Feedback",
    description: "Submitted your first feedback on Mix & Mingle",
    imageUrl: "/badges/first_feedback.png",
    category: "feedback",
    rarity: "common",
    points: 10,
    criteria: "Submit your first feedback",
  },
  {
    id: "bug_hunter",
    name: "Bug Hunter",
    description: "Found and reported a bug in the platform",
    imageUrl: "/badges/bug_hunter.png",
    category: "testing",
    rarity: "uncommon",
    points: 25,
    criteria: "Report a confirmed bug",
  },
  {
    id: "beta_legend",
    name: "Beta Legend",
    description: "Participated in all beta testing phases",
    imageUrl: "/badges/beta_legend.png",
    category: "achievement",
    rarity: "legendary",
    points: 100,
    criteria: "Participate in all beta phases",
  },
  {
    id: "helpful_voter",
    name: "Helpful Voter",
    description: "Voted on 10 feedback items",
    imageUrl: "/badges/helpful_voter.png",
    category: "feedback",
    rarity: "common",
    points: 15,
    criteria: "Vote on 10 feedback items",
  },
  {
    id: "social_butterfly",
    name: "Social Butterfly",
    description: "Connected with 10 other beta testers",
    imageUrl: "/badges/social_butterfly.png",
    category: "social",
    rarity: "uncommon",
    points: 30,
    criteria: "Connect with 10 other beta testers",
  },
  {
    id: "video_tester",
    name: "Video Tester",
    description: "Tested video chat functionality",
    imageUrl: "/badges/video_tester.png",
    category: "testing",
    rarity: "rare",
    points: 50,
    criteria: "Participate in 5 video chat sessions",
  },
  {
    id: "early_adopter",
    name: "Early Adopter",
    description: "Joined the beta in the first week",
    imageUrl: "/badges/badge-background.png",
    category: "special",
    rarity: "epic",
    points: 75,
    criteria: "Join the beta in the first week",
  },
  {
    id: "feature_pioneer",
    name: "Feature Pioneer",
    description: "First to try a new feature",
    imageUrl: "/badges/badge-background.png",
    category: "testing",
    rarity: "rare",
    points: 40,
    criteria: "Be among the first 10 users to try a new feature",
  },
]

// Helper functions for badges
export const getBadgeById = (id: string): Badge | undefined => {
  return BADGES.find((badge) => badge.id === id)
}

export const getBadgesByCategory = (category: BadgeCategory): Badge[] => {
  return BADGES.filter((badge) => badge.category === category)
}

export const getBadgesByRarity = (rarity: BadgeRarity): Badge[] => {
  return BADGES.filter((badge) => badge.rarity === rarity)
}
