// Update your Firestore security rules to include these additional rules for WebRTC signaling

/*
  // Add these rules to your existing security rules

  // Room participants subcollection
  match /rooms/{roomId}/participants/{userId} {
    allow read: if isSignedIn() && (!get(/databases/$(database)/documents/rooms/$(roomId)).data.isPrivate || 
                                   isRoomMember(get(/databases/$(database)/documents/rooms/$(roomId)).data));
    allow write: if isOwner(userId);
  }
  
  // WebRTC signaling collections
  match /rooms/{roomId}/offers/{offerId} {
    allow read, write: if isSignedIn() && (!get(/databases/$(database)/documents/rooms/$(roomId)).data.isPrivate || 
                                          isRoomMember(get(/databases/$(database)/documents/rooms/$(roomId)).data));
  }
  
  match /rooms/{roomId}/answers/{answerId} {
    allow read, write: if isSignedIn() && (!get(/databases/$(database)/documents/rooms/$(roomId)).data.isPrivate || 
                                          isRoomMember(get(/databases/$(database)/documents/rooms/$(roomId)).data));
  }
  
  match /rooms/{roomId}/candidates/{candidateId} {
    allow read, write: if isSignedIn() && (!get(/databases/$(database)/documents/rooms/$(roomId)).data.isPrivate || 
                                          isRoomMember(get(/databases/$(database)/documents/rooms/$(roomId)).data));
  }

  // For userSettings collection
  match /userSettings/{userId} {
    allow read: if request.auth != null && request.auth.uid == userId;
    allow write: if request.auth != null && request.auth.uid == userId;
  }
*/
