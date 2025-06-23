'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOnboarding } from '@/contexts/onboarding-context';
import { X, ArrowLeft, ArrowRight, Music, Users, MessageCircle, Calendar } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  target?: string;
  position: 'center' | 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: '🎉 Welcome to Mix & Mingle!',
    description: 'You\'re now part of a vibrant community of music lovers and DJs. Let\'s take a quick tour to get you started!',
    icon: <Music className="w-6 h-6" />,
    position: 'center',
  },
  {
    id: 'discover',
    title: '🎵 Discover Music',
    description: 'Explore trending mixes, find new artists, and discover music that matches your taste. The Discover page is your gateway to endless musical exploration.',
    icon: <Music className="w-6 h-6" />,
    target: '[data-tour=\"discover\"]',
    position: 'bottom',
  },
  {
    id: 'connect',
    title: '👥 Connect with People',
    description: 'Find fellow music enthusiasts, DJs, and potential friends. Browse profiles, send likes, and start meaningful connections.',
    icon: <Users className="w-6 h-6" />,
    target: '[data-tour=\"friends\"]',
    position: 'bottom',
  },
  {
    id: 'messages',
    title: '💬 Start Conversations',
    description: 'Chat with your connections, share music recommendations, and build real relationships through meaningful conversations.',
    icon: <MessageCircle className="w-6 h-6" />,
    target: '[data-tour=\"messages\"]',
    position: 'bottom',
  },
  {
    id: 'events',
    title: '🎪 Join Events',
    description: 'Discover local music events, DJ performances, and community gatherings. Never miss out on the action!',
    icon: <Calendar className="w-6 h-6" />,
    target: '[data-tour=\"events\"]',
    position: 'bottom',
  },
  {
    id: 'complete',
    title: '🚀 You\'re All Set!',
    description: 'Congratulations! You\'re ready to explore, connect, and enjoy everything Mix & Mingle has to offer. Have fun!',
    icon: <Music className="w-6 h-6" />,
    position: 'center',
  },
];

interface OnboardingTourProps {
  onCompleteAction: () => void;
  onSkipAction: () => void;
}

export function OnboardingTour({ onCompleteAction, onSkipAction }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const { unlockAchievement, markTourComplete } = useOnboarding();

  const currentTourStep = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;
  const isFirstStep = currentStep === 0;

  useEffect(() => {
    // Highlight current target element
    if (currentTourStep.target) {
      const element = document.querySelector(currentTourStep.target);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('tour-highlight');
      }
    }

    // Cleanup previous highlights
    return () => {
      document.querySelectorAll('.tour-highlight').forEach(el => {
        el.classList.remove('tour-highlight');
      });
    };
  }, [currentStep, currentTourStep.target]);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };
  const handleComplete = async () => {
    await markTourComplete();
    await unlockAchievement('tour_master');
    setIsVisible(false);
    onCompleteAction();
  };

  const handleSkip = () => {
    setIsVisible(false);
    onSkipAction();
  };

  if (!isVisible) return null;

  const getOverlayStyle = () => {
    if (currentTourStep.target) {
      const element = document.querySelector(currentTourStep.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        return {
          clipPath: `polygon(0% 0%, 0% 100%, ${rect.left}px 100%, ${rect.left}px ${rect.top}px, ${rect.right}px ${rect.top}px, ${rect.right}px ${rect.bottom}px, ${rect.left}px ${rect.bottom}px, ${rect.left}px 100%, 100% 100%, 100% 0%)`,
        };
      }
    }
    return {};
  };

  const getTooltipPosition = () => {
    if (!currentTourStep.target) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const element = document.querySelector(currentTourStep.target);
    if (!element) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const rect = element.getBoundingClientRect();
    const { position } = currentTourStep;

    switch (position) {
      case 'top':
        return {
          top: `${rect.top - 20}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translate(-50%, -100%)',
        };
      case 'bottom':
        return {
          top: `${rect.bottom + 20}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translate(-50%, 0)',
        };
      case 'left':
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.left - 20}px`,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.right + 20}px`,
          transform: 'translate(0, -50%)',
        };
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 transition-all duration-300"
        style={getOverlayStyle()}
      />
      
      {/* Tour tooltip */}
      <div
        className="absolute z-10 max-w-sm"
        style={getTooltipPosition()}
      >
        <Card className="shadow-2xl border-2 border-purple-200 bg-white">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-full">
                  {currentTourStep.icon}
                </div>
                <Badge variant="outline" className="text-xs">
                  Step {currentStep + 1} of {tourSteps.length}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {currentTourStep.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {currentTourStep.description}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 mb-4">
              <div className="flex space-x-1">
                {tourSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 rounded-full flex-1 transition-colors duration-300 ${
                      index <= currentStep ? 'bg-purple-500' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                disabled={isFirstStep}
                className="flex items-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>

              <div className="flex space-x-2">
                {!isLastStep && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Skip Tour
                  </Button>
                )}
                
                <Button
                  size="sm"
                  onClick={handleNext}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex items-center space-x-1"
                >
                  <span>{isLastStep ? 'Get Started!' : 'Next'}</span>
                  {!isLastStep && <ArrowRight className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Achievement notification for last step */}
            {isLastStep && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">🏆</span>
                  <span className="text-sm font-medium text-green-800">
                    Achievement Unlocked: Tour Master!
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default OnboardingTour;
