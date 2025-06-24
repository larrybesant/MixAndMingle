import { 
  Music, 
  Mic, 
  Gamepad2, 
  Palette, 
  BookOpen, 
  Coffee,
  Heart,
  Dumbbell,
  Camera,
  Utensils,
  type LucideIcon
} from 'lucide-react';

export interface RoomGenre {
  id: string;
  name: string;
  description: string;
  isPopular?: boolean;
}

export interface RoomCategory {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  genres: RoomGenre[];
  isPopular?: boolean;
}

export const ROOM_CATEGORIES: RoomCategory[] = [
  {
    id: 'music',
    name: 'Music',
    description: 'DJ sets, live performances, and music discovery',
    icon: Music,
    color: 'neon-purple',
    isPopular: true,
    genres: [
      { id: 'electronic', name: 'Electronic', description: 'EDM, house, techno, and electronic beats', isPopular: true },
      { id: 'hip-hop', name: 'Hip-Hop', description: 'Rap, trap, and hip-hop culture', isPopular: true },
      { id: 'house', name: 'House', description: 'Deep house, tech house, progressive house', isPopular: true },
      { id: 'techno', name: 'Techno', description: 'Underground techno and industrial beats' },
      { id: 'trance', name: 'Trance', description: 'Uplifting trance and progressive trance' },
      { id: 'dubstep', name: 'Dubstep', description: 'Heavy bass drops and dubstep wobbles' },
      { id: 'drum-bass', name: 'Drum & Bass', description: 'Fast breakbeats and heavy bass' },
      { id: 'ambient', name: 'Ambient', description: 'Chill, atmospheric, and downtempo' },
      { id: 'jazz', name: 'Jazz', description: 'Smooth jazz, bebop, and improvisation' },
      { id: 'rock', name: 'Rock', description: 'Classic rock, indie rock, alternative' },
      { id: 'pop', name: 'Pop', description: 'Top 40, mainstream pop hits' },
      { id: 'rnb', name: 'R&B', description: 'Soul, rhythm and blues, neo-soul' },
      { id: 'reggae', name: 'Reggae', description: 'Reggae, dancehall, and island vibes' },
      { id: 'country', name: 'Country', description: 'Country music and folk' },
      { id: 'classical', name: 'Classical', description: 'Classical music and orchestral pieces' },
      { id: 'blues', name: 'Blues', description: 'Blues, soul, and acoustic sets' },
      { id: 'funk', name: 'Funk', description: 'Groovy funk and disco vibes' },
      { id: 'lofi', name: 'Lo-Fi', description: 'Chill lo-fi beats for studying and relaxing' },
      { id: 'indie', name: 'Indie', description: 'Independent and alternative music' },
      { id: 'metal', name: 'Metal', description: 'Heavy metal, rock, and hardcore' },
    ]
  },  {
    id: 'talk',
    name: 'Talk & Podcast',
    description: 'Conversations, interviews, and discussions',
    icon: Mic,
    color: 'neon-blue',
    isPopular: true,
    genres: [
      { id: 'podcast', name: 'Podcast', description: 'Live podcast recordings and discussions', isPopular: true },
      { id: 'interview', name: 'Interview', description: 'Guest interviews and Q&A sessions' },
      { id: 'comedy', name: 'Comedy', description: 'Stand-up, comedy shows, and humor', isPopular: true },
      { id: 'dating-advice', name: 'Dating Advice', description: 'Relationship tips and dating discussions', isPopular: true },
      { id: 'news', name: 'News & Current Events', description: 'Breaking news and current affairs' },
      { id: 'politics', name: 'Politics', description: 'Political discussions and debates' },
      { id: 'sports', name: 'Sports Talk', description: 'Sports analysis and commentary' },
      { id: 'technology', name: 'Technology', description: 'Tech news, gadgets, and innovation' },
      { id: 'lifestyle', name: 'Lifestyle', description: 'Life advice, wellness, and personal growth' },
      { id: 'business', name: 'Business', description: 'Entrepreneurship and business insights' },
      { id: 'storytelling', name: 'Storytelling', description: 'Personal stories and narrative podcasts' },
      { id: 'debate', name: 'Debate', description: 'Structured debates and discussions' },
      { id: 'ama', name: 'Ask Me Anything', description: 'Open Q&A sessions with hosts' },
    ]
  },  {
    id: 'social',
    name: 'Social & Dating',
    description: 'Meet people, chat, and make connections',
    icon: Heart,
    color: 'neon-pink',
    isPopular: true,
    genres: [
      { id: 'speed-dating', name: 'Speed Dating', description: 'Quick dating rounds and connections', isPopular: true },
      { id: 'singles-hangout', name: 'Singles Hangout', description: 'Casual meetups for single people', isPopular: true },
      { id: 'couples-chat', name: 'Couples Chat', description: 'Discussions for couples and relationships' },
      { id: 'friendship', name: 'Making Friends', description: 'Meet new friends and build connections', isPopular: true },
      { id: 'just-chatting', name: 'Just Chatting', description: 'Casual conversations and hanging out', isPopular: true },
      { id: 'icebreakers', name: 'Icebreaker Games', description: 'Fun games to break the ice and meet people' },
      { id: 'virtual-dates', name: 'Virtual Dates', description: 'Online dating experiences and activities' },
      { id: 'community', name: 'Community', description: 'Building communities and group discussions' },
      { id: 'support-groups', name: 'Support Groups', description: 'Supportive discussions and mental health' },
      { id: 'networking', name: 'Networking', description: 'Professional networking and career connections' },
      { id: 'late-night', name: 'Late Night Chat', description: 'Night owls and late-night conversations' },
    ]
  },
  {
    id: 'gaming',
    name: 'Gaming',
    description: 'Video games, esports, and gaming culture',
    icon: Gamepad2,
    color: 'neon-green',
    genres: [
      { id: 'fps', name: 'FPS Games', description: 'First-person shooters and competitive gaming', isPopular: true },
      { id: 'battle-royale', name: 'Battle Royale', description: 'Fortnite, Apex Legends, PUBG' },
      { id: 'mmo', name: 'MMO Games', description: 'Massively multiplayer online games' },
      { id: 'strategy', name: 'Strategy', description: 'RTS, turn-based strategy, and tactical games' },
      { id: 'rpg', name: 'RPG', description: 'Role-playing games and character development' },
      { id: 'racing', name: 'Racing', description: 'Racing games and driving simulations' },
      { id: 'sports-games', name: 'Sports Games', description: 'FIFA, NBA 2K, and sports simulations' },
      { id: 'fighting', name: 'Fighting', description: 'Street Fighter, Tekken, and fighting games' },
      { id: 'indie-games', name: 'Indie Games', description: 'Independent and unique gaming experiences' },
      { id: 'retro-gaming', name: 'Retro Gaming', description: 'Classic games and nostalgic gaming' },
      { id: 'mobile-gaming', name: 'Mobile Gaming', description: 'Smartphone and tablet games' },
      { id: 'esports', name: 'Esports', description: 'Competitive gaming and tournaments' },
    ]
  },
  {
    id: 'creative',
    name: 'Creative Arts',
    description: 'Art, design, crafts, and creative expression',
    icon: Palette,
    color: 'neon-yellow',
    genres: [
      { id: 'digital-art', name: 'Digital Art', description: 'Digital drawing, painting, and design', isPopular: true },
      { id: 'traditional-art', name: 'Traditional Art', description: 'Painting, drawing, and sketching' },
      { id: 'photography', name: 'Photography', description: 'Photo shoots, editing, and photography tips' },
      { id: 'graphic-design', name: 'Graphic Design', description: 'Logo design, branding, and visual design' },
      { id: 'fashion', name: 'Fashion & Style', description: 'Fashion design, styling, and trends', isPopular: true },
      { id: 'makeup', name: 'Makeup & Beauty', description: 'Makeup tutorials and beauty tips', isPopular: true },
      { id: 'crafts', name: 'Arts & Crafts', description: 'DIY projects and handmade creations' },
      { id: 'writing', name: 'Creative Writing', description: 'Poetry, storytelling, and creative writing' },
      { id: 'tattoo-art', name: 'Tattoo Art', description: 'Tattoo design and body art' },
      { id: 'jewelry', name: 'Jewelry Making', description: 'Handmade jewelry and accessories' },
      { id: 'interior-design', name: 'Interior Design', description: 'Home decoration and space design' },
    ]
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle & Wellness',
    description: 'Health, fitness, cooking, and personal development',
    icon: Dumbbell,
    color: 'neon-cyan',
    genres: [
      { id: 'fitness', name: 'Fitness & Workouts', description: 'Live workouts and fitness tips', isPopular: true },
      { id: 'yoga', name: 'Yoga & Meditation', description: 'Mindfulness, yoga sessions, and relaxation', isPopular: true },
      { id: 'cooking', name: 'Cooking & Recipes', description: 'Live cooking shows and recipe sharing', isPopular: true },
      { id: 'nutrition', name: 'Nutrition & Diet', description: 'Healthy eating and nutrition advice' },
      { id: 'mental-health', name: 'Mental Health', description: 'Wellness discussions and self-care' },
      { id: 'productivity', name: 'Productivity', description: 'Life hacks and productivity tips' },
      { id: 'minimalism', name: 'Minimalism', description: 'Simple living and decluttering' },
      { id: 'travel', name: 'Travel & Adventure', description: 'Travel tips and destination guides' },
      { id: 'personal-finance', name: 'Personal Finance', description: 'Money management and investing' },
      { id: 'spirituality', name: 'Spirituality', description: 'Spiritual discussions and growth' },
      { id: 'astrology', name: 'Astrology & Tarot', description: 'Astrology readings and spiritual guidance' },
    ]
  },
  {
    id: 'learning',
    name: 'Education & Learning',
    description: 'Tutorials, study sessions, and skill development',
    icon: BookOpen,
    color: 'neon-orange',
    genres: [
      { id: 'programming', name: 'Programming & Code', description: 'Live coding and programming tutorials', isPopular: true },
      { id: 'language-learning', name: 'Language Learning', description: 'Foreign language practice and lessons', isPopular: true },
      { id: 'study-sessions', name: 'Study Sessions', description: 'Group study and focus sessions', isPopular: true },
      { id: 'tutorials', name: 'How-To Tutorials', description: 'Step-by-step guides and tutorials' },
      { id: 'science', name: 'Science & Research', description: 'Scientific discussions and discoveries' },
      { id: 'history', name: 'History & Culture', description: 'Historical events and cultural discussions' },
      { id: 'philosophy', name: 'Philosophy', description: 'Philosophical debates and deep thinking' },
      { id: 'mathematics', name: 'Mathematics', description: 'Math help and problem solving' },
      { id: 'book-club', name: 'Book Club', description: 'Book discussions and literary analysis' },
      { id: 'career-advice', name: 'Career Development', description: 'Job search tips and career guidance' },
      { id: 'exam-prep', name: 'Exam Preparation', description: 'Test prep and study strategies' },
    ]
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    description: 'Movies, shows, comedy, and fun activities',
    icon: Camera,
    color: 'neon-red',
    genres: [
      { id: 'movie-watch', name: 'Movie Watch Party', description: 'Watch movies together with chat', isPopular: true },
      { id: 'tv-shows', name: 'TV Show Discussion', description: 'Discuss favorite shows and episodes' },
      { id: 'stand-up-comedy', name: 'Stand-Up Comedy', description: 'Live comedy performances', isPopular: true },
      { id: 'trivia', name: 'Trivia & Quizzes', description: 'Interactive trivia games and competitions' },
      { id: 'karaoke', name: 'Karaoke', description: 'Sing-along sessions and karaoke fun', isPopular: true },
      { id: 'magic-shows', name: 'Magic & Illusions', description: 'Magic tricks and illusions' },
      { id: 'improv', name: 'Improv & Theater', description: 'Improvisational comedy and acting' },
      { id: 'celebrity-talk', name: 'Celebrity & Gossip', description: 'Celebrity news and entertainment gossip' },
      { id: 'memes', name: 'Memes & Internet Culture', description: 'Meme reviews and internet trends' },
      { id: 'virtual-events', name: 'Virtual Events', description: 'Online parties and special events' },
    ]
  },
  {
    id: 'food',
    name: 'Food & Drink',
    description: 'Cooking, baking, food reviews, and culinary arts',
    icon: Utensils,
    color: 'neon-lime',
    genres: [
      { id: 'live-cooking', name: 'Live Cooking', description: 'Cook along with the host in real-time', isPopular: true },
      { id: 'baking', name: 'Baking & Pastry', description: 'Baking tutorials and sweet treats', isPopular: true },
      { id: 'food-reviews', name: 'Food Reviews', description: 'Restaurant reviews and food critiques' },
      { id: 'cocktails', name: 'Cocktails & Mixology', description: 'Drink recipes and bartending skills', isPopular: true },
      { id: 'wine-tasting', name: 'Wine & Beer Tasting', description: 'Alcohol tastings and pairings' },
      { id: 'international-cuisine', name: 'International Cuisine', description: 'Explore cuisines from around the world' },
      { id: 'healthy-recipes', name: 'Healthy Recipes', description: 'Nutritious cooking and meal prep' },
      { id: 'street-food', name: 'Street Food', description: 'Street food adventures and quick eats' },
      { id: 'vegan-cooking', name: 'Vegan & Plant-Based', description: 'Plant-based cooking and lifestyle' },
      { id: 'coffee-culture', name: 'Coffee Culture', description: 'Coffee brewing, reviews, and culture' },
    ]
  }
];

// Helper functions
export const getCategoryById = (id: string): RoomCategory | undefined => {
  return ROOM_CATEGORIES.find(category => category.id === id);
};

export const getGenreById = (categoryId: string, genreId: string): RoomGenre | undefined => {
  const category = getCategoryById(categoryId);
  return category?.genres.find(genre => genre.id === genreId);
};

export const getPopularCategories = (): RoomCategory[] => {
  return ROOM_CATEGORIES.filter(category => category.isPopular);
};

export const getPopularGenres = (categoryId: string): RoomGenre[] => {
  const category = getCategoryById(categoryId);
  return category?.genres.filter(genre => genre.isPopular) || [];
};

export const getAllGenres = (): Array<RoomGenre & { categoryId: string; categoryName: string }> => {
  return ROOM_CATEGORIES.flatMap(category => 
    category.genres.map(genre => ({
      ...genre,
      categoryId: category.id,
      categoryName: category.name
    }))
  );
};

// Color mapping for UI
export const getCategoryColor = (categoryId: string): string => {
  const category = getCategoryById(categoryId);
  return category?.color || 'neon-purple';
};

// Search and filter functions
export const searchGenres = (query: string): Array<RoomGenre & { categoryId: string; categoryName: string }> => {
  const allGenres = getAllGenres();
  const searchTerm = query.toLowerCase();
  
  return allGenres.filter(genre => 
    genre.name.toLowerCase().includes(searchTerm) ||
    genre.description.toLowerCase().includes(searchTerm) ||
    genre.categoryName.toLowerCase().includes(searchTerm)
  );
};

export const getRecommendedGenres = (userInterests?: string[]): Array<RoomGenre & { categoryId: string; categoryName: string }> => {
  if (!userInterests || userInterests.length === 0) {
    // Return popular genres from popular categories
    return getPopularCategories()
      .flatMap(category => 
        getPopularGenres(category.id).map(genre => ({
          ...genre,
          categoryId: category.id,
          categoryName: category.name
        }))
      )
      .slice(0, 12);
  }
  
  // Match user interests with genres
  const allGenres = getAllGenres();
  const recommended = allGenres.filter(genre => 
    userInterests.some(interest => 
      genre.name.toLowerCase().includes(interest.toLowerCase()) ||
      genre.description.toLowerCase().includes(interest.toLowerCase())
    )
  );
  
  // If not enough matches, add popular genres
  if (recommended.length < 6) {
    const popular = getPopularCategories()
      .flatMap(category => 
        getPopularGenres(category.id).map(genre => ({
          ...genre,
          categoryId: category.id,
          categoryName: category.name
        }))
      )
      .filter(genre => !recommended.find(r => r.id === genre.id))
      .slice(0, 6 - recommended.length);
    
    recommended.push(...popular);
  }
  
  return recommended.slice(0, 12);
};
