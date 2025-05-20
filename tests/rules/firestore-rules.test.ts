import * as firebase from "@firebase/rules-unit-testing"
import { readFileSync } from "fs"

const PROJECT_ID = "mix-and-mingle-test"

describe("Firestore Security Rules", () => {
  let adminApp
  let userApp
  let unauthApp

  beforeAll(async () => {
    // Load rules file
    const rules = readFileSync("firebase/firestore.rules", "utf8")

    // Create test apps
    adminApp = firebase.initializeTestApp({
      projectId: PROJECT_ID,
      auth: { uid: "admin", email: "admin@example.com" },
    })

    userApp = firebase.initializeTestApp({
      projectId: PROJECT_ID,
      auth: { uid: "user1", email: "user1@example.com" },
    })

    unauthApp = firebase.initializeTestApp({
      projectId: PROJECT_ID,
    })

    // Apply rules
    await firebase.loadFirestoreRules({
      projectId: PROJECT_ID,
      rules,
    })

    // Set up test data
    const adminDb = adminApp.firestore()
    await adminDb.collection("admins").doc("admin").set({ isAdmin: true })
    await adminDb.collection("users").doc("user1").set({
      displayName: "Test User",
      email: "user1@example.com",
      isBetaTester: true,
    })

    // Create a chat room
    await adminDb.collection("chatRooms").doc("room1").set({
      name: "Test Room",
      isPublic: false,
      createdBy: "user1",
    })

    // Add user as member
    await adminDb.collection("chatRooms").doc("room1").collection("members").doc("user1").set({
      joinedAt: firebase.firestore.FieldValue.serverTimestamp(),
      isAdmin: true,
    })
  })

  afterAll(async () => {
    await firebase.clearFirestoreData({ projectId: PROJECT_ID })
    await Promise.all(firebase.apps().map((app) => app.delete()))
  })

  // User profiles
  test("Anyone can read user profiles", async () => {
    const db = unauthApp.firestore()
    await firebase.assertSucceeds(db.collection("users").doc("user1").get())
  })

  test("Users can update their own profile", async () => {
    const db = userApp.firestore()
    await firebase.assertSucceeds(
      db.collection("users").doc("user1").update({
        displayName: "Updated Name",
      }),
    )
  })

  test("Users cannot update other user profiles", async () => {
    const db = userApp.firestore()
    await firebase.assertFails(
      db.collection("users").doc("user2").update({
        displayName: "Hacked",
      }),
    )
  })

  // Private user data
  test("Users can access their private data", async () => {
    const db = userApp.firestore()
    await firebase.assertSucceeds(
      db.collection("users").doc("user1").collection("private").doc("settings").set({
        theme: "dark",
      }),
    )
  })

  test("Users cannot access other users private data", async () => {
    const db = userApp.firestore()
    await firebase.assertFails(db.collection("users").doc("user2").collection("private").doc("settings").get())
  })

  // Chat rooms
  test("Members can read private chat rooms", async () => {
    const db = userApp.firestore()
    await firebase.assertSucceeds(db.collection("chatRooms").doc("room1").get())
  })

  test("Non-members cannot read private chat rooms", async () => {
    const otherUserApp = firebase.initializeTestApp({
      projectId: PROJECT_ID,
      auth: { uid: "user2", email: "user2@example.com" },
    })

    const db = otherUserApp.firestore()
    await firebase.assertFails(db.collection("chatRooms").doc("room1").get())
  })

  test("Room members can post messages", async () => {
    const db = userApp.firestore()
    await firebase.assertSucceeds(
      db.collection("chatRooms").doc("room1").collection("messages").add({
        text: "Hello world",
        senderId: "user1",
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      }),
    )
  })

  test("Users cannot post messages with incorrect senderId", async () => {
    const db = userApp.firestore()
    await firebase.assertFails(
      db.collection("chatRooms").doc("room1").collection("messages").add({
        text: "Fake message",
        senderId: "user2", // Not the current user
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      }),
    )
  })

  // Admin access
  test("Admins can access any user data", async () => {
    const db = adminApp.firestore()
    await firebase.assertSucceeds(
      db.collection("users").doc("user2").set({
        displayName: "New User",
      }),
    )
  })

  test("Admins can access private chat rooms", async () => {
    const db = adminApp.firestore()
    await firebase.assertSucceeds(db.collection("chatRooms").doc("room1").get())
  })
})
