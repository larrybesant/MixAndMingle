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

## What You Have
- Core authentication (sign up, login, forgot/reset password, Google OAuth)
- User profile (view/edit, user name)
- Dashboard and admin dashboard (admin-only access)
- Matching, chat, and room features (per your file structure)
- Modern UI with dark mode and neon accents
- README with beta tester instructions and checklist

---

## What You Might Be Missing

### 1. **Feature Completeness**
- **Profile photo upload** (if not already implemented)
- **Live DJ streaming** (is it working end-to-end?)
- **Real-time chat** (test for reliability and edge cases)
- **Matchmaking flow** (is it intuitive and bug-free?)
- **Room discovery/search** (can users easily find and join rooms?)
- **Notification system** (in-app or email notifications for matches/messages)
- **Admin tools** (user moderation, analytics, etc.)

### 2. **User Experience**
- **Clear error/success messages** throughout all flows
- **Mobile responsiveness** (test on various devices)
- **Loading states** for all async actions
- **Consistent and visible form field styling** (as you’ve been improving)
- **Accessible navigation** (keyboard, screen reader support)

### 3. **Security & Privacy**
- **Protected routes** (no access to dashboard/admin when logged out)
- **Age verification** (if required for 18+)
- **No sensitive data leaks** in UI or network

### 4. **Testing & Feedback**
- **Manual testing of all user flows** (use the checklist in your README)
- **Automated tests** (unit/integration, if possible)
- **Easy way for testers to report bugs/feedback** (GitHub Issues, in-app form, or email)

### 5. **Deployment**
- **Production build works** (`npm run build` and `npm start`)
- **Environment variables set for production**
- **Domain and SSL configured**
- **OAuth redirect URIs set for production domain**

### 6. **Documentation**
- **README fully up to date**
- **Onboarding instructions for new users/testers**
- **Privacy policy and terms**

---

## Feature Ideas for Mix & Mingle

- **Profile Customization**
  - Profile photo and cover image upload
  - Bio, favorite genres, and social links
  - Custom profile themes or color accents

- **Advanced Matching**
  - Match by music taste, location, or event interest
  - “Super Like” or “Boost” features
  - Daily/weekly match suggestions

- **Live & Social Features**
  - Group rooms for listening parties or DJ battles
  - Live chat with emoji reactions and GIFs
  - Virtual gifts or tipping for DJs/hosts
  - Event calendar and RSVP system

- **Discovery & Content**
  - Explore trending rooms, DJs, or playlists
  - User-generated playlists or mixes
  - In-app music player with queue and history

- **Notifications & Engagement**
  - Push/email notifications for matches, messages, and events
  - Activity feed (who joined, who matched, etc.)
  - Achievements, badges, or leaderboards

- **Safety & Moderation**
  - Block/report users and content
  - Admin/moderator tools for live rooms
  - Age verification and content filters

- **Monetization (Optional)**
  - Premium features (ad-free, advanced filters, etc.)
  - In-app purchases or subscriptions

---

**Your feedback is crucial to making Mix & Mingle a great experience! Thank you for testing.**

This project is designed for Gen Z and millennials who love music, live events, and networking. The app blends the best of Twitch, Spotify, Clubhouse, and Tinder into a premium nightlife digital experience.
