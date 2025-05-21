const { spawn } = require("child_process")
const fs = require("fs")
const path = require("path")

// Check if seed data directory exists
const seedDataDir = path.join(__dirname, "..", "seed-data")
if (!fs.existsSync(seedDataDir)) {
  console.error("Error: seed-data directory not found. Creating it now...")
  fs.mkdirSync(seedDataDir)
  fs.mkdirSync(path.join(seedDataDir, "firestore"))
  fs.mkdirSync(path.join(seedDataDir, "storage"))
  fs.mkdirSync(path.join(seedDataDir, "auth"))
}

// Create sample users if they don't exist
const usersDataPath = path.join(seedDataDir, "firestore", "users.json")
if (!fs.existsSync(usersDataPath)) {
  console.log("Creating sample users data...")
  const sampleUsers = {
    __collections__: {
      users: {
        user1: {
          displayName: "John Doe",
          email: "john@example.com",
          photoURL: "/avatars/john.png",
          createdAt: { __type__: "timestamp", value: { _seconds: 1620000000, _nanoseconds: 0 } },
          isOnline: true,
          bio: "I love music and chatting!",
          __collections__: {},
        },
        user2: {
          displayName: "Jane Smith",
          email: "jane@example.com",
          photoURL: "/avatars/jane.png",
          createdAt: { __type__: "timestamp", value: { _seconds: 1620100000, _nanoseconds: 0 } },
          isOnline: true,
          bio: "Tech enthusiast and coffee lover",
          __collections__: {},
        },
        user3: {
          displayName: "Alex Johnson",
          email: "alex@example.com",
          photoURL: "/avatars/alex.png",
          createdAt: { __type__: "timestamp", value: { _seconds: 1620200000, _nanoseconds: 0 } },
          isOnline: false,
          bio: "Professional DJ and music producer",
          __collections__: {},
        },
      },
    },
  }
  fs.writeFileSync(usersDataPath, JSON.stringify(sampleUsers, null, 2))
}

// Create sample chat rooms if they don't exist
const chatRoomsDataPath = path.join(seedDataDir, "firestore", "chat-rooms.json")
if (!fs.existsSync(chatRoomsDataPath)) {
  console.log("Creating sample chat rooms data...")
  const sampleChatRooms = {
    __collections__: {
      chatRooms: {
        room1: {
          name: "Music Lovers",
          description: "A place to discuss all things music",
          createdBy: "user1",
          createdAt: { __type__: "timestamp", value: { _seconds: 1620300000, _nanoseconds: 0 } },
          isPublic: true,
          members: ["user1", "user2", "user3"],
          __collections__: {
            messages: {
              msg1: {
                text: "Welcome to the Music Lovers room!",
                senderId: "user1",
                createdAt: { __type__: "timestamp", value: { _seconds: 1620300100, _nanoseconds: 0 } },
                __collections__: {},
              },
              msg2: {
                text: "Thanks for having me! What's everyone listening to lately?",
                senderId: "user2",
                createdAt: { __type__: "timestamp", value: { _seconds: 1620300200, _nanoseconds: 0 } },
                __collections__: {},
              },
            },
          },
        },
        room2: {
          name: "Tech Talk",
          description: "Discuss the latest in technology",
          createdBy: "user2",
          createdAt: { __type__: "timestamp", value: { _seconds: 1620400000, _nanoseconds: 0 } },
          isPublic: true,
          members: ["user1", "user2"],
          __collections__: {
            messages: {
              msg1: {
                text: "Hey everyone! What do you think about the latest smartphone releases?",
                senderId: "user2",
                createdAt: { __type__: "timestamp", value: { _seconds: 1620400100, _nanoseconds: 0 } },
                __collections__: {},
              },
            },
          },
        },
      },
    },
  }
  fs.writeFileSync(chatRoomsDataPath, JSON.stringify(sampleChatRooms, null, 2))
}

// Create sample video rooms if they don't exist
const videoRoomsDataPath = path.join(seedDataDir, "firestore", "video-rooms.json")
if (!fs.existsSync(videoRoomsDataPath)) {
  console.log("Creating sample video rooms data...")
  const sampleVideoRooms = {
    __collections__: {
      videoRooms: {
        vroom1: {
          name: "DJ Session",
          description: "Live DJ session with Alex",
          createdBy: "user3",
          createdAt: { __type__: "timestamp", value: { _seconds: 1620500000, _nanoseconds: 0 } },
          isActive: true,
          participants: ["user3"],
          __collections__: {},
        },
        vroom2: {
          name: "Tech Meetup",
          description: "Weekly tech discussion",
          createdBy: "user2",
          createdAt: { __type__: "timestamp", value: { _seconds: 1620600000, _nanoseconds: 0 } },
          isActive: false,
          participants: [],
          __collections__: {},
        },
      },
    },
  }
  fs.writeFileSync(videoRoomsDataPath, JSON.stringify(sampleVideoRooms, null, 2))
}

console.log("Seed data prepared. Starting import to emulators...")

// Import the seed data to Firestore emulator
console.log("Importing Firestore data...")
const importFirestore = spawn(
  "npx",
  ["firebase", "emulators:start", "--only", "firestore", "--import", seedDataDir, "--export-on-exit", seedDataDir],
  {
    stdio: "inherit",
    shell: true,
  },
)

// Handle process exit
process.on("SIGINT", () => {
  console.log("Stopping data import...")
  importFirestore.kill("SIGINT")
  process.exit(0)
})

importFirestore.on("close", (code) => {
  console.log(`Data import exited with code ${code}`)
  process.exit(code)
})
