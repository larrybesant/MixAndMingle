# Firebase Analytics Guide for Mix & Mingle

This guide explains how to use Firebase Analytics in the Mix & Mingle application to track user engagement and understand user behavior.

## Available Events

Mix & Mingle tracks the following events:

### Authentication Events
- `login`: When a user logs in
- `sign_up`: When a user creates a new account
- `password_reset`: When a user resets their password

### Profile Events
- `profile_view`: When a user views a profile
- `profile_edit`: When a user edits their profile
- `profile_picture_update`: When a user updates their profile picture

### Chat Events
- `chat_room_create`: When a user creates a chat room
- `chat_room_join`: When a user joins a chat room
- `message_send`: When a user sends a message
- `message_read`: When a user reads a message

### Video Room Events
- `video_room_create`: When a user creates a video room
- `video_room_join`: When a user joins a video room
- `video_room_leave`: When a user leaves a video room
- `video_call_duration`: Tracks how long a user stays in a video call

### Subscription Events
- `subscription_view`: When a user views subscription options
- `subscription_start`: When a user starts a subscription
- `subscription_cancel`: When a user cancels a subscription
- `subscription_change`: When a user changes their subscription plan

### Gift Events
- `gift_view`: When a user views available gifts
- `gift_send`: When a user sends a gift
- `gift_receive`: When a user receives a gift

### Badge Events
- `badge_earn`: When a user earns a badge
- `badge_view`: When a user views their badges
- `badge_showcase`: When a user showcases a badge on their profile

### Challenge Events
- `challenge_view`: When a user views available challenges
- `challenge_start`: When a user starts a challenge
- `challenge_complete`: When a user completes a challenge

### Feedback Events
- `feedback_submit`: When a user submits feedback
- `feedback_vote`: When a user votes on feedback
- `feedback_comment`: When a user comments on feedback

### Navigation Events
- `page_view`: When a user views a page
- `feature_discover`: When a user discovers a new feature
- `search`: When a user performs a search

## User Properties

Mix & Mingle tracks the following user properties:

- `user_type`: Free, Premium, or VIP
- `account_age`: How long the user has had an account
- `total_messages_sent`: Total number of messages sent
- `total_video_calls`: Total number of video calls made
- `total_gifts_sent`: Total number of gifts sent
- `total_badges_earned`: Total number of badges earned
- `total_challenges_completed`: Total number of challenges completed
- `preferred_features`: Most used features
- `engagement_score`: Overall engagement score

## How to Track Custom Events

To track custom events in your components, use the `useAnalytics` hook:

\`\`\`tsx
import { useAnalytics } from '@/hooks/use-analytics'

function MyComponent() {
  const { trackEvent } = useAnalytics()
  
  const handleAction = () => {
    // Track the event
    trackEvent('custom_action', {
      parameter1: 'value1',
      parameter2: 'value2'
    })
    
    // Perform the action
    // ...
  }
  
  return (
    <button onClick={handleAction}>Perform Action</button>
  )
}
\`\`\`

## Viewing Analytics Data

Analytics data can be viewed in the Firebase console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select the Mix & Mingle project
3. Click on "Analytics" in the left sidebar
4. Explore the different reports and dashboards

For admin users, analytics data is also available in the Mix & Mingle admin dashboard at `/admin/analytics`.

## Privacy Considerations

- All analytics data is anonymized
- Users can opt out of analytics in their privacy settings
- Sensitive information is never tracked
- Analytics consent is requested during onboarding

## Best Practices

1. **Be Consistent**: Use the predefined event names whenever possible
2. **Add Context**: Include relevant parameters with events
3. **Don't Over-Track**: Focus on meaningful events, not every user action
4. **Respect Privacy**: Never track personally identifiable information
5. **Test Tracking**: Verify that events are being recorded correctly

## Troubleshooting

If events are not appearing in the Firebase console:

1. Check that the user has not opted out of analytics
2. Verify that the event name and parameters are valid
3. Allow up to 24 hours for data to appear in some reports
4. Check the browser console for any errors related to analytics

For additional help, contact the development team.
