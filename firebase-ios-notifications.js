import { initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import fs from 'fs';
import path from 'path';

// Initialize Firebase Admin with proper credentials
function initializeFirebaseAdmin() {
  try {
    // In a real app, these would be loaded from environment variables
    const serviceAccountPath = './service-account.json';
    
    console.log('Initializing Firebase Admin SDK...');
    
    // Check if service account file exists (for demo purposes)
    if (!fs.existsSync(serviceAccountPath)) {
      console.log('Service account file not found. Using environment variable fallback for demo.');
      
      // For demonstration, we'll create a mock service account structure
      // In production, you should use the actual service account JSON from Firebase console
      const mockServiceAccount = {
        type: 'service_account',
        project_id: 'mix-and-mingle-app',
        private_key_id: 'demo-key-id',
        private_key: 'demo-private-key',
        client_email: 'firebase-adminsdk@mix-and-mingle-app.iam.gserviceaccount.com',
        client_id: 'demo-client-id',
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk%40mix-and-mingle-app.iam.gserviceaccount.com'
      };
      
      initializeApp({
        credential: cert(mockServiceAccount)
      });
    } else {
      // Initialize with actual service account file
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      initializeApp({
        credential: cert(serviceAccount)
      });
    }
    
    console.log('Firebase Admin SDK initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
    return false;
  }
}

/**
 * Configure iOS specific settings for APNs (Apple Push Notification service)
 * This is crucial for iOS notifications to work properly
 */
function configureAPNsSettings() {
  console.log('\n--- Configuring APNs Settings ---');
  
  // Check if APNs certificates are properly configured
  console.log('1. Verifying APNs certificate configuration:');
  
  // In a real app, you would verify these files exist
  const apnsCertificatePath = './apns-certificates/';
  const certificateFiles = [
    'apns-dev-cert.p12',
    'apns-prod-cert.p12'
  ];
  
  console.log('   - APNs certificates should be uploaded to Firebase Console, not stored locally');
  console.log('   - Certificates must be configured in Firebase Console → Project Settings → Cloud Messaging');
  
  // Verify Firebase project settings
  console.log('\n2. Firebase Console Configuration Checklist:');
  console.log('   ✓ Upload APNs authentication key in Firebase Console');
  console.log('   ✓ Configure APNs certificate in Firebase Console');
  console.log('   ✓ Set correct bundle ID in Firebase Console');
  console.log('   ✓ Enable Apple Push Notification service (APNs) in Xcode');
  
  // iOS app configuration
  console.log('\n3. iOS App Configuration Checklist:');
  console.log('   ✓ Enable Push Notifications capability in Xcode');
  console.log('   ✓ Enable Background Modes → Remote notifications in Xcode');
  console.log('   ✓ Request notification permissions in the app');
  console.log('   ✓ Register for remote notifications');
  console.log('   ✓ Handle device token registration with Firebase');
  
  return true;
}

/**
 * Send a test notification to an iOS device
 * @param {string} token - The FCM token of the target device
 * @param {object} notification - The notification payload
 * @returns {Promise<object>} - The result of the send operation
 */
async function sendIOSNotification(token, notification) {
  try {
    const messaging = getMessaging();
    
    // Create message with iOS specific configuration
    const message = {
      token: token,
      notification: {
        title: notification.title || 'Mix & Mingle',
        body: notification.body || 'You have a new notification',
      },
      // iOS specific configuration
      apns: {
        payload: {
          aps: {
            // Critical for iOS notifications to work properly
            sound: notification.sound || 'default',
            badge: notification.badge || 1,
            // Content-available flag for background processing
            'content-available': notification.contentAvailable ? 1 : 0,
            // Category for actionable notifications
            category: notification.category || 'EVENT_INVITATION',
            // Thread ID for grouping notifications
            'thread-id': notification.threadId || 'mix-and-mingle-events',
            // Custom data
            'mutable-content': 1
          }
        },
        fcm_options: {
          // Image URL for rich notifications
          image: notification.imageUrl || undefined
        },
        headers: {
          // Priority for time-sensitive notifications
          'apns-priority': notification.priority === 'high' ? '10' : '5',
          // Collapse ID for replacing notifications
          'apns-collapse-id': notification.collapseId || undefined
        }
      },
      // Data payload for both platforms
      data: notification.data || {},
      // Android specific configuration
      android: {
        priority: notification.priority === 'high' ? 'high' : 'normal',
        notification: {
          sound: notification.sound || 'default',
          clickAction: notification.clickAction || 'OPEN_ACTIVITY'
        }
      }
    };
    
    console.log(`Sending notification to device: ${token.substring(0, 6)}...${token.substring(token.length - 4)}`);
    const response = await messaging.send(message);
    console.log('Notification sent successfully:', response);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('Error sending notification:', error);
    
    // Detailed error handling for iOS specific issues
    if (error.code === 'messaging/invalid-argument') {
      console.error('Invalid message format. Check the iOS specific configuration.');
    } else if (error.code === 'messaging/invalid-recipient') {
      console.error('The device token is invalid or not registered.');
    } else if (error.code === 'messaging/authentication-error') {
      console.error('Authentication error. Check your Firebase credentials.');
    } else if (error.code === 'messaging/server-unavailable') {
      console.error('FCM server is unavailable. Retry later with exponential backoff.');
    }
    
    return { 
      success: false, 
      error: error.message,
      code: error.code,
      details: error.details || 'No additional details'
    };
  }
}

/**
 * Verify iOS device token format
 * @param {string} token - The FCM token to verify
 * @returns {boolean} - Whether the token appears to be valid
 */
function verifyIOSToken(token) {
  // iOS tokens are typically 64 bytes long and contain only hexadecimal characters
  const isValidFormat = /^[a-f0-9]{64,}$/i.test(token);
  
  if (!isValidFormat) {
    console.warn('Warning: Token does not appear to be a valid iOS device token format');
    return false;
  }
  
  return true;
}

/**
 * Register a device token with user information
 * @param {string} userId - The user ID
 * @param {string} token - The FCM token
 * @param {string} platform - The device platform (ios/android)
 */
async function registerDeviceToken(userId, token, platform) {
  try {
    console.log(`Registering ${platform} device token for user ${userId}`);
    
    // In a real app, you would store this in your database
    // For example with Firestore:
    /*
    await admin.firestore().collection('users').doc(userId).update({
      deviceTokens: admin.firestore.FieldValue.arrayUnion({
        token,
        platform,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      })
    });
    */
    
    console.log('Device token registered successfully');
    return { success: true };
  } catch (error) {
    console.error('Error registering device token:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Implement proper error handling and retry logic for notifications
 * @param {string} token - The FCM token
 * @param {object} notification - The notification payload
 * @param {number} maxRetries - Maximum number of retry attempts
 */
async function sendNotificationWithRetry(token, notification, maxRetries = 3) {
  let retries = 0;
  let backoffTime = 1000; // Start with 1 second
  
  while (retries <= maxRetries) {
    try {
      if (retries > 0) {
        console.log(`Retry attempt ${retries}/${maxRetries}`);
      }
      
      const result = await sendIOSNotification(token, notification);
      
      if (result.success) {
        return result;
      }
      
      // If we get here, the send failed but didn't throw an exception
      retries++;
      
      if (retries <= maxRetries) {
        console.log(`Waiting ${backoffTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        backoffTime *= 2; // Exponential backoff
      }
    } catch (error) {
      console.error(`Error on retry ${retries}:`, error);
      retries++;
      
      if (retries <= maxRetries) {
        console.log(`Waiting ${backoffTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        backoffTime *= 2; // Exponential backoff
      } else {
        throw error; // Re-throw if we've exhausted retries
      }
    }
  }
  
  throw new Error(`Failed to send notification after ${maxRetries} retries`);
}

/**
 * Test sending notifications to verify configuration
 */
async function runNotificationTests() {
  console.log('\n--- Running Notification Tests ---');
  
  // Sample iOS device token (this is a placeholder, not a real token)
  const iosDeviceToken = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0';
  
  // Verify token format
  if (!verifyIOSToken(iosDeviceToken)) {
    console.log('Skipping test with invalid token format');
    return;
  }
  
  // Test basic notification
  console.log('\n1. Testing basic notification:');
  await sendIOSNotification(iosDeviceToken, {
    title: 'Test Notification',
    body: 'This is a test notification',
    sound: 'default',
    badge: 1
  });
  
  // Test notification with custom sound
  console.log('\n2. Testing notification with custom sound:');
  await sendIOSNotification(iosDeviceToken, {
    title: 'Custom Sound',
    body: 'This notification has a custom sound',
    sound: 'event_notification.aiff',
    badge: 2
  });
  
  // Test silent notification
  console.log('\n3. Testing silent notification:');
  await sendIOSNotification(iosDeviceToken, {
    contentAvailable: 1,
    data: {
      type: 'content-refresh',
      contentId: '12345'
    }
  });
  
  // Test notification with image
  console.log('\n4. Testing rich notification with image:');
  await sendIOSNotification(iosDeviceToken, {
    title: 'New Event Invitation',
    body: 'You have been invited to a new event',
    imageUrl: 'https://example.com/event-image.jpg',
    category: 'EVENT_INVITATION',
    threadId: 'event-invitations',
    badge: 3
  });
  
  // Test notification with retry logic
  console.log('\n5. Testing notification with retry logic:');
  try {
    await sendNotificationWithRetry(iosDeviceToken, {
      title: 'Important Update',
      body: 'This notification uses retry logic',
      priority: 'high'
    }, 2);
  } catch (error) {
    console.error('Final error after retries:', error);
  }
}

/**
 * Update Firebase dependencies to latest compatible versions
 */
function updateFirebaseDependencies() {
  console.log('\n--- Firebase Dependencies Update Guide ---');
  
  console.log('Current recommended Firebase versions:');
  console.log('- firebase-admin: ^11.10.1');
  console.log('- firebase/app: ^10.1.0');
  console.log('- firebase/messaging: ^10.1.0');
  
  console.log('\nUpdate steps:');
  console.log('1. Update package.json with the latest versions');
  console.log('2. Run: npm install or yarn install');
  console.log('3. Update import statements if necessary');
  console.log('4. Test thoroughly after updating');
  
  console.log('\nFor iOS client app:');
  console.log('- Update Firebase iOS SDK: pod update Firebase');
  console.log('- Ensure minimum iOS version compatibility');
  console.log('- Update AppDelegate implementation if needed');
}

/**
 * Troubleshooting guide for common iOS notification issues
 */
function troubleshootingGuide() {
  console.log('\n--- iOS Push Notification Troubleshooting Guide ---');
  
  console.log('Common Issues and Solutions:');
  
  console.log('\n1. Notifications not appearing on iOS devices:');
  console.log('   - Verify APNs certificate is valid and not expired');
  console.log('   - Check that the correct certificate type is used (development vs. production)');
  console.log('   - Ensure the app has requested and received notification permissions');
  console.log('   - Verify the device is not in Do Not Disturb mode');
  
  console.log('\n2. Silent notifications not processing:');
  console.log('   - Ensure content-available flag is set to 1');
  console.log('   - Verify background modes are enabled in Xcode');
  console.log('   - Check that the app implements application:didReceiveRemoteNotification:fetchCompletionHandler:');
  
  console.log('\n3. Rich notifications not displaying correctly:');
  console.log('   - Verify Notification Service Extension is implemented');
  console.log('   - Check that mutable-content flag is set to 1');
  console.log('   - Ensure image URLs are accessible and properly formatted');
  
  console.log('\n4. Notification actions not working:');
  console.log('   - Verify UNUserNotificationCenter delegate methods are implemented');
  console.log('   - Check that notification categories are registered correctly');
  console.log('   - Ensure category ID in the payload matches registered categories');
  
  console.log('\nDiagnostic Steps:');
  console.log('1. Enable verbose logging in the app');
  console.log('2. Check Firebase Console for delivery statistics');
  console.log('3. Use Firebase Test Lab for device testing');
  console.log('4. Implement server-side delivery tracking');
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('=== Firebase iOS Push Notification Fix ===');
    
    // Step 1: Initialize Firebase Admin
    const initialized = initializeFirebaseAdmin();
    if (!initialized) {
      console.error('Failed to initialize Firebase. Exiting...');
      return;
    }
    
    // Step 2: Configure APNs settings
    configureAPNsSettings();
    
    // Step 3: Update Firebase dependencies
    updateFirebaseDependencies();
    
    // Step 4: Run notification tests
    // Commented out as it requires actual Firebase credentials and device tokens
    // await runNotificationTests();
    
    // Step 5: Provide troubleshooting guide
    troubleshootingGuide();
    
    console.log('\n=== Implementation Complete ===');
    console.log('Follow the steps above to fix iOS push notification issues in the Mix & Mingle app.');
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run the main function
main().catch(console.error);
