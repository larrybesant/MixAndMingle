import * as functions from "firebase-functions"
import * as admin from "firebase-admin"

// Initialize Firebase Admin
admin.initializeApp()

// Trigger when a new notification is created in Firestore
export const onNotificationCreated = functions.firestore
  .document("notifications/{notificationId}")
  .onCreate(async (snapshot, context) => {
    const notificationData = snapshot.data()
    const notificationId = context.params.notificationId

    try {
      // Get user document to check notification preferences
      const userDoc = await admin.firestore().collection("users").doc(notificationData.userId).get()

      if (!userDoc.exists) {
        console.log(`User ${notificationData.userId} not found`)
        return null
      }

      const userData = userDoc.data()
      const preferences = userData?.notificationPreferences || {}

      // Check if user has enabled this type of notification
      const notificationType = notificationData.type
      const preferenceKey = `${notificationType}Notifications`

      if (preferences[preferenceKey] === false) {
        console.log(`User has disabled ${notificationType} notifications`)
        return null
      }

      // Check if push notifications are enabled
      if (!preferences.pushEnabled) {
        console.log("Push notifications are disabled")
        return null
      }

      const fcmTokens = userData?.fcmTokens || []

      if (fcmTokens.length === 0) {
        console.log("No FCM tokens found for user")
        return null
      }

      // Send push notification
      const message = {
        notification: {
          title: notificationData.title,
          body: notificationData.body,
          image: notificationData.image,
        },
        data: {
          notificationId,
          type: notificationData.type,
          ...(notificationData.data || {}),
        },
        tokens: fcmTokens,
      }

      const response = await admin.messaging().sendMulticast(message)

      console.log(`Successfully sent message: ${response.successCount} successful, ${response.failureCount} failed`)

      // Handle token cleanup if needed
      if (response.failureCount > 0) {
        const failedTokens: string[] = []

        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(fcmTokens[idx])
          }
        })

        // Remove failed tokens
        if (failedTokens.length > 0) {
          const validTokens = fcmTokens.filter((token) => !failedTokens.includes(token))
          await admin.firestore().collection("users").doc(notificationData.userId).update({
            fcmTokens: validTokens,
          })

          console.log(`Removed ${failedTokens.length} invalid tokens`)
        }
      }

      return null
    } catch (error) {
      console.error("Error sending notification:", error)
      return null
    }
  })

// Trigger when a new message is created in Firestore
export const onMessageCreated = functions.firestore
  .document("messages/{messageId}")
  .onCreate(async (snapshot, context) => {
    const messageData = snapshot.data()
    const messageId = context.params.messageId

    try {
      // Get room information
      const roomDoc = await admin.firestore().collection("rooms").doc(messageData.roomId).get()

      if (!roomDoc.exists) {
        console.log(`Room ${messageData.roomId} not found`)
        return null
      }

      const roomData = roomDoc.data()
      const roomName = roomData?.name || "Chat Room"

      // Get sender information
      const senderDoc = await admin.firestore().collection("users").doc(messageData.senderId).get()

      if (!senderDoc.exists) {
        console.log(`Sender ${messageData.senderId} not found`)
        return null
      }

      const senderData = senderDoc.data()
      const senderName = senderData?.displayName || "User"
      const senderImage = senderData?.photoURL || null

      // Get room members
      const membersSnapshot = await admin
        .firestore()
        .collection("roomMembers")
        .where("roomId", "==", messageData.roomId)
        .get()

      if (membersSnapshot.empty) {
        console.log(`No members found for room ${messageData.roomId}`)
        return null
      }

      // Extract mentions from message
      const mentionRegex = /@(\w+)/g
      const messageText = messageData.text || ""
      const mentionMatches = [...messageText.matchAll(mentionRegex)]
      const mentionedUsernames = mentionMatches.map((match) => match[1])

      // Get mentioned users
      let mentionedUsers: any[] = []

      if (mentionedUsernames.length > 0) {
        const mentionedUsersSnapshot = await admin
          .firestore()
          .collection("users")
          .where("username", "in", mentionedUsernames)
          .get()

        mentionedUsers = mentionedUsersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      }

      // Create notifications for room members
      const notifications: Promise<any>[] = []

      membersSnapshot.forEach((doc) => {
        const memberId = doc.data().userId

        // Skip notification for the sender
        if (memberId === messageData.senderId) {
          return
        }

        // Check if user is mentioned
        const isMentioned = mentionedUsers.some((user) => user.id === memberId)

        // Create notification
        const notificationRef = admin.firestore().collection("notifications").doc()

        if (isMentioned) {
          // Create mention notification
          notifications.push(
            notificationRef.set({
              userId: memberId,
              type: "mention",
              title: `${senderName} mentioned you in ${roomName}`,
              body: messageText.length > 100 ? `${messageText.substring(0, 100)}...` : messageText,
              image: senderImage,
              data: {
                roomId: messageData.roomId,
                messageId,
                senderId: messageData.senderId,
                senderName,
              },
              read: false,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
            }),
          )
        } else {
          // Create regular message notification
          notifications.push(
            notificationRef.set({
              userId: memberId,
              type: "message",
              title: `New message from ${senderName} in ${roomName}`,
              body: messageText.length > 100 ? `${messageText.substring(0, 100)}...` : messageText,
              image: senderImage,
              data: {
                roomId: messageData.roomId,
                messageId,
                senderId: messageData.senderId,
                senderName,
              },
              read: false,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
            }),
          )
        }
      })

      // Wait for all notifications to be created
      await Promise.all(notifications)

      console.log(`Created ${notifications.length} notifications for message ${messageId}`)

      return null
    } catch (error) {
      console.error("Error creating message notifications:", error)
      return null
    }
  })

// Trigger when a new room invite is created
export const onRoomInviteCreated = functions.firestore
  .document("roomInvites/{inviteId}")
  .onCreate(async (snapshot, context) => {
    const inviteData = snapshot.data()
    const inviteId = context.params.inviteId

    try {
      // Get room information
      const roomDoc = await admin.firestore().collection("rooms").doc(inviteData.roomId).get()

      if (!roomDoc.exists) {
        console.log(`Room ${inviteData.roomId} not found`)
        return null
      }

      const roomData = roomDoc.data()
      const roomName = roomData?.name || "Chat Room"

      // Get sender information
      const senderDoc = await admin.firestore().collection("users").doc(inviteData.senderId).get()

      if (!senderDoc.exists) {
        console.log(`Sender ${inviteData.senderId} not found`)
        return null
      }

      const senderData = senderDoc.data()
      const senderName = senderData?.displayName || "User"
      const senderImage = senderData?.photoURL || null

      // Create notification for the invitee
      const notificationRef = admin.firestore().collection("notifications").doc()

      await notificationRef.set({
        userId: inviteData.inviteeId,
        type: "roomInvite",
        title: "Room Invitation",
        body: `${senderName} invited you to join ${roomName}`,
        image: senderImage,
        data: {
          roomId: inviteData.roomId,
          inviteId,
          senderId: inviteData.senderId,
          senderName,
        },
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      })

      console.log(`Created room invite notification for user ${inviteData.inviteeId}`)

      return null
    } catch (error) {
      console.error("Error creating room invite notification:", error)
      return null
    }
  })

// Trigger when a new friend request is created
export const onFriendRequestCreated = functions.firestore
  .document("friendRequests/{requestId}")
  .onCreate(async (snapshot, context) => {
    const requestData = snapshot.data()
    const requestId = context.params.requestId

    try {
      // Get sender information
      const senderDoc = await admin.firestore().collection("users").doc(requestData.senderId).get()

      if (!senderDoc.exists) {
        console.log(`Sender ${requestData.senderId} not found`)
        return null
      }

      const senderData = senderDoc.data()
      const senderName = senderData?.displayName || "User"
      const senderImage = senderData?.photoURL || null

      // Create notification for the recipient
      const notificationRef = admin.firestore().collection("notifications").doc()

      await notificationRef.set({
        userId: requestData.receiverId,
        type: "friendRequest",
        title: "Friend Request",
        body: `${senderName} sent you a friend request`,
        image: senderImage,
        data: {
          requestId,
          senderId: requestData.senderId,
          senderName,
        },
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      })

      console.log(`Created friend request notification for user ${requestData.receiverId}`)

      return null
    } catch (error) {
      console.error("Error creating friend request notification:", error)
      return null
    }
  })

// Trigger when a new gift is sent
export const onGiftSent = functions.firestore.document("gifts/{giftId}").onCreate(async (snapshot, context) => {
  const giftData = snapshot.data()
  const giftId = context.params.giftId

  try {
    // Get sender information
    const senderDoc = await admin.firestore().collection("users").doc(giftData.senderId).get()

    if (!senderDoc.exists) {
      console.log(`Sender ${giftData.senderId} not found`)
      return null
    }

    const senderData = senderDoc.data()
    const senderName = senderData?.displayName || "User"
    const senderImage = senderData?.photoURL || null

    // Get gift information
    const giftTypeDoc = await admin.firestore().collection("giftTypes").doc(giftData.giftTypeId).get()

    if (!giftTypeDoc.exists) {
      console.log(`Gift type ${giftData.giftTypeId} not found`)
      return null
    }

    const giftTypeData = giftTypeDoc.data()
    const giftName = giftTypeData?.name || "Gift"
    const giftImage = giftTypeData?.imageUrl || null

    // Create notification for the recipient
    const notificationRef = admin.firestore().collection("notifications").doc()

    await notificationRef.set({
      userId: giftData.recipientId,
      type: "gift",
      title: "You received a gift!",
      body: `${senderName} sent you a ${giftName}`,
      image: giftImage,
      data: {
        giftId,
        senderId: giftData.senderId,
        senderName,
        giftTypeId: giftData.giftTypeId,
        giftName,
      },
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    console.log(`Created gift notification for user ${giftData.recipientId}`)

    return null
  } catch (error) {
    console.error("Error creating gift notification:", error)
    return null
  }
})

// Clean up old notifications (older than 30 days)
export const cleanupOldNotifications = functions.pubsub.schedule("every 24 hours").onRun(async (context) => {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const oldNotificationsSnapshot = await admin
      .firestore()
      .collection("notifications")
      .where("createdAt", "<", thirtyDaysAgo)
      .get()

    if (oldNotificationsSnapshot.empty) {
      console.log("No old notifications to clean up")
      return null
    }

    const batch = admin.firestore().batch()

    oldNotificationsSnapshot.forEach((doc) => {
      batch.delete(doc.ref)
    })

    await batch.commit()

    console.log(`Cleaned up ${oldNotificationsSnapshot.size} old notifications`)

    return null
  } catch (error) {
    console.error("Error cleaning up old notifications:", error)
    return null
  }
})
