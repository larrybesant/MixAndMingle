# 🎵 Mix & Mingle - Live Streaming + Dating Platform

**Where Music Meets Connection** 🎶❤️

A revolutionary platform combining live music streaming with smart matchmaking. Create your DJ room, find your perfect match through music preferences, and connect in real-time!

## ✨ Features

### 🎵 **Live Streaming Platform**

- **Daily.co Integration**: Professional-grade video streaming
- **DJ Rooms**: Create and customize your own streaming rooms
- **Real-time Chat**: Interactive messaging during streams
- **Room Discovery**: Browse and join live streams

### 💕 **Smart Matchmaking**

- **Swipe Interface**: Tinder-style matching system
- **Music-Based Matching**: Algorithm considers music preferences
- **Real-time Notifications**: Instant match alerts
- **Profile Management**: Rich user profiles with music preferences

### 🔐 **Authentication & Safety**

- **Supabase Auth**: Secure user authentication
- **Profile Verification**: Safe and verified user experience
- **Privacy Controls**: User safety and privacy features

### 🎨 **Modern UI/UX**

- **Dark Theme**: Neon-styled, club-inspired design
- **Responsive**: Perfect on mobile and desktop
- **Smooth Animations**: Polished user experience
- **Accessibility**: Screen reader and keyboard navigation support

## 🚀 Quick Start

### 1. **Clone & Install**

```bash
git clone <your-repo>
cd mix-and-mingle
npm install
```

### 2. **Environment Setup**

Create `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Daily.co Video Streaming
DAILY_API_KEY=your_daily_api_key

# Optional: Additional services
STRIPE_SECRET_KEY=your_stripe_key (for future premium features)
```

### 3. **Database Setup**

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to SQL Editor
3. Copy and run the contents of `database/quick-setup.sql`
4. Or use the automated setup at `/mvp` (Launch tab)

### 4. **Start Development**

```bash
npm run dev
```

Visit `http://localhost:3000/mvp` for the setup dashboard!

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Supabase (Database, Auth, Real-time)
- **Streaming**: Daily.co (Video/Audio)
- **Styling**: Tailwind CSS, shadcn/ui
- **Deployment**: Vercel (recommended)

## 📋 MVP Completion Status

### ✅ **Completed Features (85%)**

- ✅ User Authentication (Signup/Login)
- ✅ Profile Management
- ✅ Matchmaking System (Swipe Interface)
- ✅ Live Streaming (Daily.co Integration)
- ✅ Real-time Chat
- ✅ Room Management
- ✅ Responsive UI/UX
- ✅ Error Handling

### 🚧 **Final Steps (15%)**

1. **Database Setup** (2 min) - Run SQL script
2. **Daily.co API Key** (5 min) - Add streaming credentials
3. **Production Testing** (10 min) - Test all features
4. **Deployment** (10 min) - Deploy to Vercel

## 🎯 User Journey

1. **Sign Up** → Create account with music preferences
2. **Complete Profile** → Add bio, photos, music taste
3. **Discover Matches** → Swipe through potential connections
4. **Go Live** → Create your own DJ room and stream
5. **Join Rooms** → Watch streams and chat with others
6. **Connect** → Match with people who love your music

## 🚀 Deployment

### **Vercel (Recommended)**

1. Push code to GitHub
2. Connect repo to [Vercel](https://vercel.com)
3. Set environment variables in Vercel dashboard
4. Deploy!

### **Manual Deployment**

```bash
npm run build
npm start
```

## 📱 Testing

Visit these pages to test your app:

- `/mvp` - Setup and health dashboard
- `/signup` - User registration
- `/matchmaking` - Swipe interface
- `/go-live` - Create streaming room
- `/rooms` - Browse live streams
- `/dashboard` - User profile management

## 🔧 Configuration

### **Supabase Setup**

1. Create project at [Supabase](https://supabase.com)
2. Get your project URL and API keys
3. Run the database setup script
4. Configure Row Level Security (RLS) policies

### **Daily.co Setup**

1. Sign up at [Daily.co](https://daily.co)
2. Create a new project
3. Copy your API key
4. Add to environment variables

## 📚 API Endpoints

- `GET /api/health` - System health check
- `POST /api/daily-room` - Create Daily.co room
- `POST /api/auto-setup-db` - Automated database setup
- `GET /api/matching/potential` - Get potential matches
- `POST /api/matching/swipe` - Record swipe action

## 🎨 Customization

### **Branding**

- **Colors**: Neon Blue (#00f5ff), Neon Purple (#bf00ff)
- **Theme**: Dark mode with neon accents
- **Fonts**: Modern, club-inspired typography

### **Features to Add**

- Push notifications
- Premium subscriptions
- Advanced matching filters
- Music integration (Spotify/Apple Music)
- Group streaming rooms
- Event scheduling

## 🐛 Troubleshooting

### Common Issues:

1. **Database errors**: Ensure SQL script is run completely
2. **Streaming not working**: Check Daily.co API key
3. **Build errors**: Verify all environment variables
4. **Authentication issues**: Check Supabase configuration

### **Health Check**

Visit `/api/health` to verify system status

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For support and questions:

- Check the `/mvp` dashboard for setup guidance
- Review the deployment checklist
- Test with the automated setup tools

---

**🎉 Ready to Launch!**

Your Mix & Mingle MVP is ready for beta testing. Follow the setup guide at `/mvp` and you'll be live in under 30 minutes!
