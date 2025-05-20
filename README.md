# Mix & Mingle - Music Streaming Social Platform

A Next.js application for streaming and enjoying live DJ sets with a dark neon-themed UI.

## Features

- **Live DJ Streaming**: Create rooms and stream your DJ sets live
- **User Authentication**: Sign up, login, and manage your profile
- **Chat System**: Real-time chat in DJ rooms
- **Room Discovery**: Browse and search for DJ rooms by genre
- **Dark Neon Theme**: Modern UI with vibrant neon accents

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/mix-and-mingle.git
   cd mix-and-mingle
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. Create a `.env.local` file in the root directory with your Firebase configuration:
   \`\`\`
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   \`\`\`

4. Run the development server:
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Firebase Setup

1. Create a new Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Enable Storage
5. Add a web app to your Firebase project and copy the configuration

## Deployment

The easiest way to deploy this app is using Vercel:

1. Push your code to a GitHub repository
2. Import the project in Vercel
3. Add your environment variables
4. Deploy!

## License

This project is licensed under the MIT License - see the LICENSE file for details.
