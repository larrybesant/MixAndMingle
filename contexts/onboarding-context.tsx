'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

interface OnboardingState {
  profileComplete: boolean;
  tourComplete: boolean;
  firstLoginComplete: boolean;
  achievementsUnlocked: string[];
  lastActiveStep: string | null;
  engagementMetrics: {
    profileViews: number;
    messagesExchanged: number;
    eventsAttended: number;
    connectionsLiked: number;
  };
}

interface OnboardingContextType {
  // State
  user: User | null;
  onboardingState: OnboardingState;
  loading: boolean;
  showTour: boolean;
  
  // Actions
  markProfileComplete: () => Promise<void>;
  markTourComplete: () => Promise<void>;
  markFirstLoginComplete: () => Promise<void>;
  unlockAchievement: (achievement: string) => Promise<void>;
  updateEngagementMetric: (metric: keyof OnboardingState['engagementMetrics'], value: number) => Promise<void>;
  setShowTour: (show: boolean) => void;
  checkOnboardingStatus: () => Promise<boolean>;
  
  // Utilities
  getOnboardingProgress: () => number;
  getNextOnboardingStep: () => string | null;
  shouldShowRetentionNudge: () => boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const defaultOnboardingState: OnboardingState = {
  profileComplete: false,
  tourComplete: false,
  firstLoginComplete: false,
  achievementsUnlocked: [],
  lastActiveStep: null,
  engagementMetrics: {
    profileViews: 0,
    messagesExchanged: 0,
    eventsAttended: 0,
    connectionsLiked: 0,
  },
};

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [onboardingState, setOnboardingState] = useState<OnboardingState>(defaultOnboardingState);
  const [loading, setLoading] = useState(true);
  const [showTour, setShowTour] = useState(false);

  // Initialize user and onboarding state
  useEffect(() => {
    async function initializeOnboarding() {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          await loadOnboardingState(user.id);
        }
      } catch (error) {
        console.error('Error initializing onboarding:', error);
      } finally {
        setLoading(false);
      }
    }

    initializeOnboarding();    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if (session?.user) {
        setUser(session.user);
        await loadOnboardingState(session.user.id);
      } else {
        setUser(null);
        setOnboardingState(defaultOnboardingState);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadOnboardingState = async (userId: string) => {
    try {
      // Check profile completion
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, bio, music_preferences, avatar_url, gender, onboarding_data')
        .eq('id', userId)
        .single();

      const profileComplete = !!(
        profile?.username?.trim() &&
        profile?.bio?.trim() &&
        profile?.music_preferences?.trim() &&
        profile?.avatar_url?.trim() &&
        profile?.gender?.trim()
      );

      // Parse onboarding data from profile
      const onboardingData = profile?.onboarding_data || {};
      
      setOnboardingState({
        profileComplete,
        tourComplete: onboardingData.tourComplete || false,
        firstLoginComplete: onboardingData.firstLoginComplete || false,
        achievementsUnlocked: onboardingData.achievementsUnlocked || [],
        lastActiveStep: onboardingData.lastActiveStep || null,
        engagementMetrics: {
          profileViews: onboardingData.engagementMetrics?.profileViews || 0,
          messagesExchanged: onboardingData.engagementMetrics?.messagesExchanged || 0,
          eventsAttended: onboardingData.engagementMetrics?.eventsAttended || 0,
          connectionsLiked: onboardingData.engagementMetrics?.connectionsLiked || 0,
        },
      });

    } catch (error) {
      console.error('Error loading onboarding state:', error);
    }
  };

  const updateOnboardingData = async (updates: Partial<OnboardingState>) => {
    if (!user) return;

    try {
      const newState = { ...onboardingState, ...updates };
      setOnboardingState(newState);

      // Save to database
      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_data: {
            tourComplete: newState.tourComplete,
            firstLoginComplete: newState.firstLoginComplete,
            achievementsUnlocked: newState.achievementsUnlocked,
            lastActiveStep: newState.lastActiveStep,
            engagementMetrics: newState.engagementMetrics,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating onboarding data:', error);
      }
    } catch (error) {
      console.error('Error updating onboarding state:', error);
    }
  };

  const markProfileComplete = async () => {
    await updateOnboardingData({ 
      profileComplete: true,
      lastActiveStep: 'profile_complete'
    });
  };

  const markTourComplete = async () => {
    await updateOnboardingData({ 
      tourComplete: true,
      lastActiveStep: 'tour_complete'
    });
    
    // Unlock tour completion achievement
    if (!onboardingState.achievementsUnlocked.includes('tour_master')) {
      await unlockAchievement('tour_master');
    }
  };

  const markFirstLoginComplete = async () => {
    await updateOnboardingData({ 
      firstLoginComplete: true,
      lastActiveStep: 'first_login_complete'
    });
  };

  const unlockAchievement = async (achievement: string) => {
    if (!onboardingState.achievementsUnlocked.includes(achievement)) {
      const newAchievements = [...onboardingState.achievementsUnlocked, achievement];
      await updateOnboardingData({ 
        achievementsUnlocked: newAchievements,
        lastActiveStep: `achievement_${achievement}`
      });
    }
  };

  const updateEngagementMetric = async (metric: keyof OnboardingState['engagementMetrics'], value: number) => {
    const newMetrics = {
      ...onboardingState.engagementMetrics,
      [metric]: value,
    };
    
    await updateOnboardingData({ 
      engagementMetrics: newMetrics,
      lastActiveStep: `metric_${metric}_${value}`
    });

    // Check for engagement achievements
    if (metric === 'messagesExchanged' && value >= 5 && !onboardingState.achievementsUnlocked.includes('conversation_starter')) {
      await unlockAchievement('conversation_starter');
    }
    if (metric === 'connectionsLiked' && value >= 10 && !onboardingState.achievementsUnlocked.includes('social_butterfly')) {
      await unlockAchievement('social_butterfly');
    }
  };

  const checkOnboardingStatus = async (): Promise<boolean> => {
    if (!user) return false;
    await loadOnboardingState(user.id);
    return onboardingState.profileComplete && onboardingState.tourComplete;
  };

  const getOnboardingProgress = (): number => {
    const steps = [
      onboardingState.profileComplete,
      onboardingState.tourComplete,
      onboardingState.firstLoginComplete,
      onboardingState.achievementsUnlocked.length > 0,
      onboardingState.engagementMetrics.messagesExchanged > 0,
    ];
    
    const completedSteps = steps.filter(Boolean).length;
    return Math.round((completedSteps / steps.length) * 100);
  };

  const getNextOnboardingStep = (): string | null => {
    if (!onboardingState.profileComplete) return 'complete_profile';
    if (!onboardingState.tourComplete) return 'take_tour';
    if (!onboardingState.firstLoginComplete) return 'first_engagement';
    if (onboardingState.engagementMetrics.messagesExchanged === 0) return 'send_message';
    if (onboardingState.engagementMetrics.connectionsLiked === 0) return 'like_profiles';
    return null;
  };

  const shouldShowRetentionNudge = (): boolean => {
    const now = new Date();
    const lastActive = onboardingState.lastActiveStep;
    
    // Show nudge if user hasn't completed onboarding or been active recently
    if (!onboardingState.profileComplete || !onboardingState.tourComplete) return true;
    if (onboardingState.engagementMetrics.messagesExchanged === 0) return true;
    
    return false;
  };

  const contextValue: OnboardingContextType = {
    user,
    onboardingState,
    loading,
    showTour,
    markProfileComplete,
    markTourComplete,
    markFirstLoginComplete,
    unlockAchievement,
    updateEngagementMetric,
    setShowTour,
    checkOnboardingStatus,
    getOnboardingProgress,
    getNextOnboardingStep,
    shouldShowRetentionNudge,
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

export default OnboardingContext;
