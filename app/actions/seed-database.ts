"use server"

import { createClient } from "@/lib/supabase-server"
import { v4 as uuidv4 } from "uuid"
import { seedInterests } from "@/lib/seed-interests"

export async function seedDatabase() {
  const supabase = createClient()

  try {
    await seedInterests()

    // Create sample profiles
    const profiles = [
      {
        id: uuidv4(),
        first_name: "Alex",
        last_name: "Johnson",
        email: "alex@example.com",
        bio: "I love hiking, photography, and trying new foods.",
        avatar_url: "/diverse-person-portrait.png",
        location: "New York, NY",
      },
      {
        id: uuidv4(),
        first_name: "Jamie",
        last_name: "Smith",
        email: "jamie@example.com",
        bio: "Music lover, coffee enthusiast, and avid reader.",
        avatar_url: "/diverse-group-conversation.png",
        location: "Los Angeles, CA",
      },
      {
        id: uuidv4(),
        first_name: "Taylor",
        last_name: "Brown",
        email: "taylor@example.com",
        bio: "Tech geek, fitness junkie, and travel addict.",
        avatar_url: "/diverse-group-meeting.png",
        location: "Chicago, IL",
      },
      {
        id: uuidv4(),
        first_name: "Jordan",
        last_name: "Davis",
        email: "jordan@example.com",
        bio: "Film buff, amateur chef, and dog lover.",
        avatar_url: "/diverse-group-meeting.png",
        location: "Austin, TX",
      },
      {
        id: uuidv4(),
        first_name: "Casey",
        last_name: "Wilson",
        email: "casey@example.com",
        bio: "Artist, yoga instructor, and nature enthusiast.",
        avatar_url: "/diverse-group-five.png",
        location: "Seattle, WA",
      },
    ]

    // Insert profiles
    for (const profile of profiles) {
      const { error } = await supabase.from("profiles").upsert(profile, { onConflict: "email" })

      if (error) {
        console.error("Error inserting profile:", error)
      }
    }

    // Get inserted profiles
    const { data: insertedProfiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email")
      .in(
        "email",
        profiles.map((p) => p.email),
      )

    if (profilesError) {
      console.error("Error fetching inserted profiles:", profilesError)
      return { success: false, error: profilesError.message }
    }

    // Create user interests
    const interests = [
      "Art",
      "Books",
      "Cooking",
      "Fitness",
      "Gaming",
      "Hiking",
      "Movies",
      "Music",
      "Photography",
      "Sports",
      "Technology",
      "Travel",
      "Writing",
      "Yoga",
      "Dancing",
    ]

    for (const profile of insertedProfiles || []) {
      // Randomly select 3-5 interests for each user
      const numInterests = Math.floor(Math.random() * 3) + 3
      const userInterests = [...interests].sort(() => 0.5 - Math.random()).slice(0, numInterests)

      for (const interest of userInterests) {
        const { error } = await supabase.from("user_interests").upsert(
          {
            id: uuidv4(),
            user_id: profile.id,
            interest,
          },
          { onConflict: "user_id, interest" },
        )

        if (error) {
          console.error("Error inserting user interest:", error)
        }
      }
    }

    // Create user locations
    for (const profile of insertedProfiles || []) {
      const { error } = await supabase.from("user_locations").upsert(
        {
          id: uuidv4(),
          user_id: profile.id,
          latitude: Math.random() * 180 - 90,
          longitude: Math.random() * 360 - 180,
          city: profile.location.split(",")[0].trim(),
          state: profile.location.split(",")[1]?.trim() || "",
          country: "USA",
        },
        { onConflict: "user_id" },
      )

      if (error) {
        console.error("Error inserting user location:", error)
      }
    }

    // Create matches between users
    if (insertedProfiles && insertedProfiles.length >= 2) {
      for (let i = 0; i < insertedProfiles.length; i++) {
        for (let j = i + 1; j < insertedProfiles.length; j++) {
          // Only create matches with 70% probability
          if (Math.random() > 0.3) {
            const matchScore = Math.random() * 50 + 50 // Score between 50-100
            const status = Math.random() > 0.3 ? "accepted" : "pending"

            const { error } = await supabase.from("matches").upsert(
              {
                id: uuidv4(),
                user1_id: insertedProfiles[i].id,
                user2_id: insertedProfiles[j].id,
                match_score: matchScore,
                status,
              },
              { onConflict: "user1_id, user2_id" },
            )

            if (error) {
              console.error("Error inserting match:", error)
            }
          }
        }
      }
    }

    // Create notifications
    for (const profile of insertedProfiles || []) {
      // Create 1-3 notifications per user
      const numNotifications = Math.floor(Math.random() * 3) + 1

      for (let i = 0; i < numNotifications; i++) {
        const notificationType = ["match", "message", "system"][Math.floor(Math.random() * 3)]
        let title, content

        switch (notificationType) {
          case "match":
            title = "New Match!"
            content = "You have a new match! Check it out and start a conversation."
            break
          case "message":
            title = "New Message"
            content = "You have received a new message from a connection."
            break
          case "system":
            title = "Welcome to Mix-and-Mingle"
            content = "Thanks for joining! Complete your profile to get better matches."
            break
        }

        const { error } = await supabase.from("notifications").insert({
          id: uuidv4(),
          user_id: profile.id,
          title,
          content,
          is_read: Math.random() > 0.7, // 30% chance of being unread
        })

        if (error) {
          console.error("Error inserting notification:", error)
        }
      }
    }

    return { success: true, message: "Database seeded successfully" }
  } catch (error) {
    console.error("Error seeding database:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
