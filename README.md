This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Mix & Mingle

**Tagline:** Where Music Meets Connection

**IMPORTANT:** This is an 18+ adult platform. Age verification is required for all users. Please include appropriate warnings and compliance measures throughout the app.

## Branding & Visual Identity
- Dark mode, neon accents, glowing buttons, animated waveforms
- Neon-styled typography with music + social symbols
- Futuristic and club-style fonts
- Colors:
  - Primary: Neon Blue (#00f5ff)
  - Secondary: Neon Purple (#bf00ff)
  - Accent: Neon Green (#39ff14)
  - Warning: Neon Pink (#ff1493)
  - Background: Deep black with purple gradients

## Features
- Live DJ streaming
- Matchmaking (swipe-style)
- Real-time chat and reactions
- Social discovery (room grid/list)
- 18+ age verification
- User profiles (photo, bio, music interests)
- Room discovery/search
- Notification system
- Admin dashboard (moderation, analytics)

## Tech Stack
- Next.js 14+ (App Router, TypeScript)
- TailwindCSS (custom neon palette)
- shadcn/ui components
- Lucide React icons
- Firebase (Auth, Firestore, Storage, Functions)
- WebRTC or third-party streaming
- Responsive, mobile-first design

## Visual Style
- Gradient backgrounds, neon glow, glassmorphism, animated music visualizer, pulsing LIVE indicators, custom scrollbars, floating elements

## Environment Variables
See `.env.example` for Firebase setup.

---

## Beta Tester Instructions

Thank you for helping test Mix & Mingle! Please follow these steps:

### 1. Setup
- Clone the repository and install dependencies:
  ```bash
  npm install
  ```
- Copy `.env.example` to `.env.local` and fill in your Firebase and other required credentials.
- Start the development server:
  ```bash
  npm run dev
  ```
- Or build and run in production mode:
  ```bash
  npm run build && npm start
  ```

### 2. What to Test
- Sign up, log in, and log out
- Complete your profile and upload a photo
- Try matching/discovering users
- Start and participate in chats
- Join or create rooms/live streams
- Test on both desktop and mobile
- Try to break things! (invalid input, network errors, etc.)

### 3. Reporting Bugs & Feedback
- Note the steps to reproduce any bug
- Include screenshots or screen recordings if possible
- Report issues via [GitHub Issues](https://github.com/your-repo/issues) or the feedback form in the app (if available)

### 4. Manual Testing Checklist
- [ ] Sign up, log in, log out
- [ ] Reset password and verify email (if required)
- [ ] Edit profile and upload photo
- [ ] Match/discover users
- [ ] Start/join chats and rooms
- [ ] Test on mobile and desktop
- [ ] Try invalid actions and check error handling
- [ ] Confirm you cannot access protected pages when logged out

---

**Your feedback is crucial to making Mix & Mingle a great experience! Thank you for testing.**

This project is designed for Gen Z and millennials who love music, live events, and networking. The app blends the best of Twitch, Spotify, Clubhouse, and Tinder into a premium nightlife digital experience.
