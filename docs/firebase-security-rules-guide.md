# Firebase Security Rules Guide for Mix & Mingle

This guide explains how to test, validate, and maintain the Firebase security rules for the Mix & Mingle application.

## Overview

Firebase Security Rules protect your data and files in Firestore and Storage. They determine who can read and write data, and under what conditions.

## Deploying Rules

You can deploy the security rules using our custom script:

\`\`\`bash
# Make sure you have the Firebase CLI installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy rules using our script
npx ts-node scripts/deploy-firebase-rules.ts
\`\`\`

Alternatively, you can deploy rules manually:

\`\`\`bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage
\`\`\`

## Testing Rules

### Local Testing with Firebase Emulator

1. Install the Firebase Emulator Suite:
   \`\`\`bash
   firebase setup:emulators:firestore
   firebase setup:emulators:storage
   \`\`\`

2. Start the emulators:
   \`\`\`bash
   firebase emulators:start
   \`\`\`

3. Write and run tests against the emulator.

### Unit Testing with Firebase Rules Test

Firebase provides a rules-unit-testing package for testing security rules:

1. Install the package:
   \`\`\`bash
   npm install --save-dev @firebase/rules-unit-testing
   \`\`\`

2. Create test files in the `tests/rules` directory.

3. Run tests:
   \`\`\`bash
   npm test
   \`\`\`

### Example Test

\`\`\`typescript
import * as firebase from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';

const PROJECT_ID = 'mix-and-mingle-test';

describe('Firestore Security Rules', () => {
  let adminApp;
  let userApp;
  
  beforeAll(async () => {
    // Load rules file
    const rules = readFileSync('firebase/firestore.rules', 'utf8');
    
    // Create test apps
    adminApp = firebase.initializeTestApp({
      projectId: PROJECT_ID,
      auth: { uid: 'admin', email: 'admin@example.com' }
    });
    
    userApp = firebase.initializeTestApp({
      projectId: PROJECT_ID,
      auth: { uid: 'user1', email: 'user1@example.com' }
    });
    
    // Apply rules
    await firebase.loadFirestoreRules({
      projectId: PROJECT_ID,
      rules
    });
    
    // Set up test data
    const adminDb = adminApp.firestore();
    await adminDb.collection('admins').doc('admin').set({ isAdmin: true });
    await adminDb.collection('users').doc('user1').set({ 
      displayName: 'Test User',
      email: 'user1@example.com',
      isBetaTester: true
    });
  });
  
  afterAll(async () => {
    await firebase.clearFirestoreData({ projectId: PROJECT_ID });
    await Promise.all(firebase.apps().map(app => app.delete()));
  });
  
  test('Users can read their own profile', async () => {
    const userDb = userApp.firestore();
    const userProfile = userDb.collection('users').doc('user1');
    await firebase.assertSucceeds(userProfile.get());
  });
  
  test('Users cannot write to other user profiles', async () => {
    const userDb = userApp.firestore();
    const otherUserProfile = userDb.collection('users').doc('user2');
    await firebase.assertFails(otherUserProfile.set({ displayName: 'Hacked' }));
  });
  
  // Add more tests for your specific rules
});
\`\`\`

## Common Rules Patterns

### User Authentication

\`\`\`
function isSignedIn() {
  return request.auth != null;
}
\`\`\`

### User Ownership

\`\`\`
function isOwner(userId) {
  return isSignedIn() && request.auth.uid == userId;
}
\`\`\`

### Role-Based Access

\`\`\`
function isAdmin() {
  return isSignedIn() && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
}
\`\`\`

### Data Validation

\`\`\`
allow create: if isSignedIn() && 
  request.resource.data.name is string &&
  request.resource.data.name.size() > 0 &&
  request.resource.data.name.size() < 100;
\`\`\`

## Best Practices

1. **Deny by Default**: Start with denying all access, then explicitly allow specific operations.
2. **Test Thoroughly**: Write tests for all critical access patterns.
3. **Use Helper Functions**: Create reusable functions for common conditions.
4. **Validate Data**: Check data structure and values before allowing writes.
5. **Limit Document Access**: Use subcollections for private data.
6. **Consider Performance**: Complex rules can slow down operations.
7. **Document Your Rules**: Add comments explaining the purpose of each rule.

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**: Check if your rules match your application's access patterns.
2. **Rules Not Updating**: Make sure you're deploying to the correct project.
3. **Unexpected Access**: Look for overly permissive rules or logic errors.

### Debugging Tips

1. Use the Firebase Console to test rules.
2. Enable debug mode in your application.
3. Check the Firebase logs for detailed error messages.

## Security Considerations

1. **Never Trust Client-Side Code**: Always enforce security on the server.
2. **Protect Sensitive Data**: Use private subcollections and field-level security.
3. **Regularly Audit Rules**: Review and update rules as your application evolves.
4. **Monitor Access Patterns**: Watch for unusual access patterns that might indicate security issues.

## Additional Resources

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/rules)
- [Common Security Rules Patterns](https://firebase.google.com/docs/firestore/security/rules-structure)
- [Testing Security Rules](https://firebase.google.com/docs/firestore/security/test-rules)
\`\`\`

Let's create a simple test file for the rules:
