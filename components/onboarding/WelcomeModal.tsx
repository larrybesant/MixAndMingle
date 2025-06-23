'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOnboarding } from '@/contexts/onboarding-context';
import { Music, Sparkles, Users, MessageCircle } from 'lucide-react';

interface WelcomeModalProps {
  onStartTourAction: () => void;
  onSkipAction: () => void;
}

export function WelcomeModal({ onStartTourAction, onSkipAction }: WelcomeModalProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { user } = useOnboarding();

  const handleStartTour = () => {
    setIsVisible(false);
    onStartTourAction();
  };

  const handleSkip = () => {
    setIsVisible(false);
    onSkipAction();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <Card className="mx-4 max-w-lg shadow-2xl border-2 border-purple-200">
        <CardHeader className="text-center bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full">
              <Music className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Welcome to Mix & Mingle! 🎉
          </CardTitle>
          <div className="flex items-center justify-center mt-2">            <Badge variant="outline" className="bg-purple-100 text-purple-700">
              {user?.email?.split('@')[0] || 'Music Lover'}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <p className="text-gray-600 leading-relaxed">
              You're now part of a vibrant community where music lovers, DJs, and artists connect, share, and create together.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <Music className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <h4 className="text-sm font-medium text-purple-900">Discover Music</h4>
              <p className="text-xs text-purple-700">Find new artists & mixes</p>
            </div>
            <div className="text-center p-3 bg-pink-50 rounded-lg">
              <Users className="w-6 h-6 text-pink-600 mx-auto mb-2" />
              <h4 className="text-sm font-medium text-pink-900">Connect</h4>
              <p className="text-xs text-pink-700">Meet fellow music lovers</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <MessageCircle className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <h4 className="text-sm font-medium text-blue-900">Chat</h4>
              <p className="text-xs text-blue-700">Share & discuss music</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <Sparkles className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <h4 className="text-sm font-medium text-green-900">Create</h4>
              <p className="text-xs text-green-700">Share your own mixes</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-white rounded-full">
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-purple-900 mb-1">
                  Ready to explore?
                </h4>
                <p className="text-xs text-purple-700">
                  Take a quick tour to discover all the amazing features waiting for you, or jump right in and start exploring on your own.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col space-y-3">
            <Button
              onClick={handleStartTour}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              🚀 Take the Tour (2 minutes)
            </Button>
            
            <Button
              variant="outline"
              onClick={handleSkip}
              className="w-full text-gray-600 hover:text-gray-800"
            >
              Skip for now - I'll explore myself
            </Button>
          </div>

          {/* Fun fact */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              💡 Pro tip: Members who complete the tour are 3x more likely to make meaningful connections!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default WelcomeModal;
