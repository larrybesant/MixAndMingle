"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Heart, X, Star, MapPin, Music } from 'lucide-react';
import { PotentialMatch } from '@/types/matching';

interface SwipeCardProps {
  user: PotentialMatch;
  onSwipeAction: (action: 'like' | 'pass' | 'super_like') => void;
  isAnimating: boolean;
}

export function SwipeCard({ user, onSwipeAction, isAnimating }: SwipeCardProps) {
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const startX = e.clientX;
    const startY = e.clientY;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      setDragOffset({ x: deltaX, y: deltaY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      const threshold = 100;
        if (Math.abs(dragOffset.x) > threshold) {
        if (dragOffset.x > 0) {
          onSwipeAction('like');
        } else {
          onSwipeAction('pass');
        }
      }
      
      setDragOffset({ x: 0, y: 0 });
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const cardRotation = dragOffset.x * 0.1;
  const cardOpacity = Math.max(0.6, 1 - Math.abs(dragOffset.x) / 300);

  return (
    <Card 
      className={`
        relative w-full max-w-sm h-[600px] mx-auto cursor-grab active:cursor-grabbing
        bg-gradient-to-b from-slate-800/90 to-slate-900/90 backdrop-blur-xl 
        border border-white/10 rounded-3xl overflow-hidden shadow-2xl
        transition-all duration-300 hover:scale-[1.02]
        ${isAnimating ? 'pointer-events-none' : ''}
      `}
      style={{
        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${cardRotation}deg)`,
        opacity: cardOpacity,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <div 
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: user.avatar_url 
              ? `url(${user.avatar_url})` 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
      </div>

      {/* DJ Badge */}
      {user.is_dj && (
        <div className="absolute top-4 right-4 z-10">
          <Badge className="bg-purple-600/90 text-white border-purple-400/50 backdrop-blur-sm">
            <Music className="w-3 h-3 mr-1" />
            DJ
          </Badge>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end p-6">
        <div className="space-y-3">
          {/* Name and Age */}
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border-2 border-white/20">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback className="bg-purple-600 text-white">
                {user.full_name?.[0] || user.username?.[0] || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-2xl font-bold text-white">
                {user.full_name || user.username}
              </h3>
              <p className="text-white/80 text-sm">
                {user.age} years old
              </p>
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="text-white/90 text-sm leading-relaxed line-clamp-3">
              {user.bio}
            </p>
          )}

          {/* Music Preferences */}
          {user.music_preferences && user.music_preferences.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {user.music_preferences.slice(0, 3).map((genre, index) => (
                <Badge 
                  key={index}
                  variant="secondary"
                  className="bg-white/10 text-white border-white/20 backdrop-blur-sm text-xs"
                >
                  {genre}
                </Badge>
              ))}
              {user.music_preferences.length > 3 && (
                <Badge 
                  variant="secondary"
                  className="bg-white/10 text-white border-white/20 backdrop-blur-sm text-xs"
                >
                  +{user.music_preferences.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4 z-20">        <button
          onClick={(e) => {
            e.stopPropagation();
            onSwipeAction('pass');
          }}
          className="w-14 h-14 rounded-full bg-red-500/20 border-2 border-red-500/50 
                     flex items-center justify-center backdrop-blur-sm
                     hover:bg-red-500/30 hover:scale-110 transition-all duration-200"
        >
          <X className="w-6 h-6 text-red-400" />
        </button>        <button
          onClick={(e) => {
            e.stopPropagation();
            onSwipeAction('super_like');
          }}
          className="w-14 h-14 rounded-full bg-blue-500/20 border-2 border-blue-500/50 
                     flex items-center justify-center backdrop-blur-sm
                     hover:bg-blue-500/30 hover:scale-110 transition-all duration-200"
        >
          <Star className="w-6 h-6 text-blue-400" />
        </button>        <button
          onClick={(e) => {
            e.stopPropagation();
            onSwipeAction('like');
          }}
          className="w-14 h-14 rounded-full bg-green-500/20 border-2 border-green-500/50 
                     flex items-center justify-center backdrop-blur-sm
                     hover:bg-green-500/30 hover:scale-110 transition-all duration-200"
        >
          <Heart className="w-6 h-6 text-green-400" />
        </button>
      </div>

      {/* Swipe Indicators */}
      {dragOffset.x > 50 && (
        <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 rounded-3xl">
          <div className="bg-green-500 text-white px-6 py-3 rounded-full font-bold text-lg">
            LIKE
          </div>
        </div>
      )}
      
      {dragOffset.x < -50 && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 rounded-3xl">
          <div className="bg-red-500 text-white px-6 py-3 rounded-full font-bold text-lg">
            PASS
          </div>
        </div>
      )}
    </Card>
  );
}
