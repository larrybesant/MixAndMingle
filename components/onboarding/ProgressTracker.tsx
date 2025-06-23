'use client';

import { useOnboarding } from '@/contexts/onboarding-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Star, Trophy, Target } from 'lucide-react';

interface ProgressTrackerProps {
  showDetailed?: boolean;
  compact?: boolean;
}

export function ProgressTracker({ showDetailed = false, compact = false }: ProgressTrackerProps) {
  const { 
    onboardingState, 
    getOnboardingProgress, 
    getNextOnboardingStep,
    shouldShowRetentionNudge,
  } = useOnboarding();

  const progress = getOnboardingProgress();
  const nextStep = getNextOnboardingStep();
  const showNudge = shouldShowRetentionNudge();

  const onboardingSteps = [
    {
      id: 'profile',
      title: 'Complete Profile',
      description: 'Add your photo, bio, and music preferences',
      completed: onboardingState.profileComplete,
      icon: <Target className="w-4 h-4" />,
    },
    {
      id: 'tour',
      title: 'Take the Tour',
      description: 'Learn about all the amazing features',
      completed: onboardingState.tourComplete,
      icon: <Star className="w-4 h-4" />,
    },
    {
      id: 'first_login',
      title: 'Get Started',
      description: 'Explore the community and make connections',
      completed: onboardingState.firstLoginComplete,
      icon: <CheckCircle className="w-4 h-4" />,
    },
    {
      id: 'engagement',
      title: 'Start Connecting',
      description: 'Send your first message or like profiles',
      completed: onboardingState.engagementMetrics.messagesExchanged > 0 || onboardingState.engagementMetrics.connectionsLiked > 0,
      icon: <Trophy className="w-4 h-4" />,
    },
  ];

  const completedSteps = onboardingSteps.filter(step => step.completed).length;

  if (compact) {
    return (
      <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Your Progress</span>
            <span className="text-sm text-purple-600 font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        {onboardingState.achievementsUnlocked.length > 0 && (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Trophy className="w-3 h-3 mr-1" />
            {onboardingState.achievementsUnlocked.length}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Getting Started</h3>
            <p className="text-sm text-gray-600">Complete these steps to get the most out of Mix & Mingle</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{progress}%</div>
            <div className="text-xs text-gray-500">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <Progress value={progress} className="h-3" />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{completedSteps} of {onboardingSteps.length} steps</span>
            <span>{progress === 100 ? 'All done! 🎉' : `${100 - progress}% remaining`}</span>
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-3">
          {onboardingSteps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                step.completed
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className={`flex-shrink-0 ${step.completed ? 'text-green-600' : 'text-gray-400'}`}>
                {step.completed ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className={`text-sm font-medium ${step.completed ? 'text-green-900' : 'text-gray-900'}`}>
                    {step.title}
                  </h4>
                  {step.completed && (
                    <Badge variant="outline" className="bg-green-100 text-green-700 text-xs">
                      ✓ Done
                    </Badge>
                  )}
                </div>
                <p className={`text-xs ${step.completed ? 'text-green-700' : 'text-gray-600'}`}>
                  {step.description}
                </p>
              </div>

              <div className={`flex-shrink-0 ${step.completed ? 'text-green-600' : 'text-gray-400'}`}>
                {step.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Achievements Section */}
        {onboardingState.achievementsUnlocked.length > 0 && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <h4 className="text-sm font-medium text-yellow-900">Achievements Unlocked</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {onboardingState.achievementsUnlocked.map((achievement) => (
                <Badge key={achievement} variant="outline" className="bg-yellow-100 text-yellow-800 text-xs">
                  🏆 {achievement.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Next Step Suggestion */}
        {nextStep && showNudge && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Star className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-900 mb-1">Next Step</h4>
                <p className="text-xs text-blue-700 mb-2">
                  {getNextStepDescription(nextStep)}
                </p>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs">
                  {getNextStepAction(nextStep)}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Engagement Metrics */}
        {showDetailed && (
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">
                {onboardingState.engagementMetrics.messagesExchanged}
              </div>
              <div className="text-xs text-purple-700">Messages Sent</div>
            </div>
            <div className="text-center p-3 bg-pink-50 rounded-lg">
              <div className="text-lg font-bold text-pink-600">
                {onboardingState.engagementMetrics.connectionsLiked}
              </div>
              <div className="text-xs text-pink-700">Profiles Liked</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getNextStepDescription(step: string): string {
  switch (step) {
    case 'complete_profile':
      return 'Finish setting up your profile to start connecting with other music lovers.';
    case 'take_tour':
      return 'Take a quick tour to discover all the amazing features available to you.';
    case 'first_engagement':
      return 'Start exploring the community and discover new music connections.';
    case 'send_message':
      return 'Break the ice by sending your first message to someone interesting.';
    case 'like_profiles':
      return 'Show some love by liking profiles that catch your eye.';
    default:
      return 'Continue exploring to unlock more features and achievements.';
  }
}

function getNextStepAction(step: string): string {
  switch (step) {
    case 'complete_profile':
      return 'Complete Profile';
    case 'take_tour':
      return 'Start Tour';
    case 'first_engagement':
      return 'Explore Now';
    case 'send_message':
      return 'Find Someone';
    case 'like_profiles':
      return 'Browse Profiles';
    default:
      return 'Continue';
  }
}

export default ProgressTracker;
