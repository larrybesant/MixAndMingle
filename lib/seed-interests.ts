import { supabase } from "./supabase-client"
import { interests } from "./data"

export async function seedInterests() {
  try {
    console.log("Seeding interests...")

    // Check if interests already exist
    const { data: existingInterests, error: checkError } = await supabase.from("interests").select("name")

    if (checkError) {
      console.error("Error checking existing interests:", checkError)
      return
    }

    const existingInterestNames = new Set(existingInterests?.map((i) => i.name) || [])

    // Filter out interests that already exist
    const interestsToAdd = interests.filter((interest) => !existingInterestNames.has(interest))

    if (interestsToAdd.length === 0) {
      console.log("All interests already exist in the database.")
      return
    }

    // Prepare interests for insertion
    const interestsData = interestsToAdd.map((interest) => ({
      name: interest,
      category: getCategoryForInterest(interest),
    }))

    // Insert interests
    const { error: insertError } = await supabase.from("interests").insert(interestsData)

    if (insertError) {
      console.error("Error seeding interests:", insertError)
      return
    }

    console.log(`Successfully seeded ${interestsToAdd.length} interests.`)
  } catch (error) {
    console.error("Error in seedInterests:", error)
  }
}

// Helper function to categorize interests
function getCategoryForInterest(interest: string): string {
  const categories: Record<string, string[]> = {
    "Arts & Culture": ["Art", "Books", "Writing", "History", "Crafts"],
    "Food & Drink": ["Cooking"],
    "Health & Fitness": ["Fitness", "Yoga", "Meditation"],
    Entertainment: ["Gaming", "Movies", "Music", "Dancing"],
    Outdoors: ["Hiking", "Travel", "Gardening"],
    Technology: ["Technology", "Science"],
    Social: ["Volunteering", "Politics", "Entrepreneurship"],
    Hobbies: ["Photography", "Fashion", "Pets", "Sports"],
  }

  for (const [category, interestsInCategory] of Object.entries(categories)) {
    if (interestsInCategory.includes(interest)) {
      return category
    }
  }

  return "Other"
}
