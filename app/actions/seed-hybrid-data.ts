"use server"

import { createClient } from "@/lib/supabase-server"
import { v4 as uuidv4 } from "uuid"

export async function seedHybridData() {
  const supabase = createClient()

  try {
    // Create sample profiles if they don't exist
    const profiles = [
      {
        id: uuidv4(),
        first_name: "Alex",
        last_name: "Johnson",
        email: "alex@example.com",
        bio: "Music lover and social butterfly. Always looking for new connections and sounds.",
        avatar_url: "/diverse-person-portrait.png",
        location: "New York, NY",
      },
      {
        id: uuidv4(),
        first_name: "Jamie",
        last_name: "Smith",
        email: "jamie@example.com",
        bio: "DJ and producer by night, software engineer by day. Let's connect!",
        avatar_url: "/diverse-group-conversation.png",
        location: "Los Angeles, CA",
      },
      {
        id: uuidv4(),
        first_name: "Taylor",
        last_name: "Brown",
        email: "taylor@example.com",
        bio: "Passionate about deep house and techno. Always looking for new music recommendations.",
        avatar_url: "/diverse-group-meeting.png",
        location: "Chicago, IL",
      },
      {
        id: uuidv4(),
        first_name: "Jordan",
        last_name: "Davis",
        email: "jordan@example.com",
        bio: "Music festival enthusiast and amateur DJ. Let's share playlists!",
        avatar_url: "/diverse-group-meeting.png",
        location: "Austin, TX",
      },
      {
        id: uuidv4(),
        first_name: "Casey",
        last_name: "Wilson",
        email: "casey@example.com",
        bio: "Vinyl collector and music history buff. Looking for friends with similar interests.",
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

    // Create DJ profiles for some users
    const djProfiles = [
      {
        user_id: insertedProfiles?.find((p) => p.email === "jamie@example.com")?.id,
        artist_name: "DJ Synapse",
        bio: "Spinning deep house and techno since 2015. Known for seamless transitions and groovy basslines.",
        experience_years: 7,
        hourly_rate: 150,
      },
      {
        user_id: insertedProfiles?.find((p) => p.email === "jordan@example.com")?.id,
        artist_name: "Rhythm Pulse",
        bio: "Specializing in drum & bass and jungle. High energy sets that keep the crowd moving.",
        experience_years: 5,
        hourly_rate: 120,
      },
    ]

    // Insert DJ profiles
    for (const djProfile of djProfiles) {
      if (!djProfile.user_id) continue

      const { data, error } = await supabase
        .from("dj_profiles")
        .upsert(
          {
            id: uuidv4(),
            ...djProfile,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        )
        .select()

      if (error) {
        console.error("Error inserting DJ profile:", error)
      }
    }

    // Get DJ profiles
    const { data: djProfilesData, error: djProfilesError } = await supabase.from("dj_profiles").select("*")

    if (djProfilesError) {
      console.error("Error fetching DJ profiles:", djProfilesError)
      return { success: false, error: djProfilesError.message }
    }

    // Create music preferences for users
    for (const profile of insertedProfiles || []) {
      // Create random music preferences
      const { error } = await supabase.from("user_music_preferences").upsert(
        {
          user_id: profile.id,
          mainstream_vs_underground: Math.floor(Math.random() * 100),
          familiar_vs_discover: Math.floor(Math.random() * 100),
          chill_vs_energetic: Math.floor(Math.random() * 100),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      )

      if (error) {
        console.error("Error inserting music preferences:", error)
      }
    }

    // Get music genres
    const { data: genres, error: genresError } = await supabase.from("music_genres").select("*")

    if (genresError) {
      console.error("Error fetching genres:", genresError)
      return { success: false, error: genresError.message }
    }

    // Assign random genres to users
    for (const profile of insertedProfiles || []) {
      // Select 3-5 random genres
      const numGenres = Math.floor(Math.random() * 3) + 3
      const selectedGenres = [...(genres || [])]
        .sort(() => 0.5 - Math.random())
        .slice(0, numGenres)
        .map((genre) => genre.id)

      // Add genres to user
      for (const genreId of selectedGenres) {
        const { error } = await supabase.from("user_genre_preferences").upsert(
          {
            id: uuidv4(),
            user_id: profile.id,
            genre_id: genreId,
            created_at: new Date().toISOString(),
          },
          { onConflict: "user_id, genre_id" },
        )

        if (error) {
          console.error("Error inserting user genre preference:", error)
        }
      }

      // Add genres to DJ profiles
      const djProfile = djProfilesData?.find((dj) => dj.user_id === profile.id)
      if (djProfile) {
        for (const genreId of selectedGenres) {
          const { error } = await supabase.from("dj_genres").upsert(
            {
              id: uuidv4(),
              dj_id: djProfile.id,
              genre_id: genreId,
              created_at: new Date().toISOString(),
            },
            { onConflict: "dj_id, genre_id" },
          )

          if (error) {
            console.error("Error inserting DJ genre:", error)
          }
        }
      }
    }

    // Create some live streams
    const streams = [
      {
        dj_id: djProfilesData?.[0]?.id,
        title: "Deep House Vibes",
        description: "Join me for a journey through deep house classics and new releases.",
        scheduled_start: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        status: "scheduled",
        thumbnail_url: "/dj-stream-1.png",
        is_public: true,
      },
      {
        dj_id: djProfilesData?.[1]?.id,
        title: "Drum & Bass Night",
        description: "High energy drum & bass to get your weekend started right.",
        scheduled_start: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
        status: "scheduled",
        thumbnail_url: "/dj-stream-2.png",
        is_public: true,
      },
      {
        dj_id: djProfilesData?.[0]?.id,
        title: "Chill Lofi Beats",
        description: "Relaxing lofi beats to study/work to.",
        scheduled_start: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        actual_start: new Date(Date.now() - 86400000).toISOString(),
        ended_at: new Date(Date.now() - 79200000).toISOString(), // 2 hours later
        status: "ended",
        thumbnail_url: "/dj-stream-3.png",
        is_public: true,
        viewer_count: 0,
        max_viewers: 120,
      },
    ]

    // Insert streams
    for (const stream of streams) {
      if (!stream.dj_id) continue

      const { error } = await supabase.from("live_streams").insert({
        id: uuidv4(),
        ...stream,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (error) {
        console.error("Error inserting stream:", error)
      }
    }

    // Create some chat rooms
    const chatRooms = [
      {
        name: "Deep House Lounge",
        description: "A place to discuss deep house music and share tracks.",
        image_url: "/chat-room-1.png",
        created_by: insertedProfiles?.[0]?.id,
        is_private: false,
      },
      {
        name: "Vinyl Collectors",
        description: "For vinyl enthusiasts to discuss collections and finds.",
        image_url: "/chat-room-2.png",
        created_by: insertedProfiles?.[4]?.id,
        is_private: false,
      },
      {
        name: "Music Production Tips",
        description: "Share and learn music production techniques.",
        image_url: "/chat-room-3.png",
        created_by: insertedProfiles?.[1]?.id,
        is_private: false,
      },
    ]

    // Insert chat rooms
    for (const room of chatRooms) {
      if (!room.created_by) continue

      const { data, error } = await supabase
        .from("chat_rooms")
        .insert({
          id: uuidv4(),
          ...room,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()

      if (error) {
        console.error("Error inserting chat room:", error)
      }
    }

    return { success: true, message: "Hybrid data seeded successfully" }
  } catch (error) {
    console.error("Error seeding hybrid data:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
