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

  // Feedback votes rules
  match /feedbackVotes/{voteId} {
    // Allow read if authenticated
    allow read: if request.auth != null;
    
    // Allow create/update if:
    // 1. User is authenticated
    // 2. The vote belongs to the authenticated user
    // 3. User is not voting on their own feedback
    allow create, update: if request.auth != null 
      && request.resource.data.userId == request.auth.uid
      && exists(/databases/$(database)/documents/betaFeedback/$(request.resource.data.feedbackId))
      && get(/databases/$(database)/documents/betaFeedback/$(request.resource.data.feedbackId)).data.userId != request.auth.uid;
    
    // Allow delete if user is authenticated and the vote belongs to them
    allow delete: if request.auth != null 
      && resource.data.userId == request.auth.uid;
  }

  // Update betaFeedback rules to allow reading vote counts
  match /betaFeedback/{feedbackId} {
    // Allow read if authenticated
    allow read: if request.auth != null;
    
    // Allow create if authenticated and the feedback belongs to the user
    allow create: if request.auth != null 
      && request.resource.data.userId == request.auth.uid;
    
    // Allow update if:
    // 1. User is authenticated and the feedback belongs to them (can update content)
    // 2. Admin is updating status
    // 3. System is updating vote counts
    allow update: if (request.auth != null && resource.data.userId == request.auth.uid)
      || (request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin')
      || (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['upvotes', 'downvotes']));
  }
*/
