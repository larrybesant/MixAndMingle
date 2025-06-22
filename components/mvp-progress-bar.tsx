"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Rocket,
  Database,
  Video,
  Users,
  MessageCircle,
  Heart,
  Settings
} from 'lucide-react';

interface MVPFeature {
  id: string;
  name: string;
  description: string;
  status: 'complete' | 'inProgress' | 'pending' | 'critical';
  progress: number;
  icon: React.ReactNode;
  priority: 'high' | 'medium' | 'low';
  estimatedTime?: string;
}

export function MVPProgressBar() {
  const [features, setFeatures] = useState<MVPFeature[]>([
    {
      id: 'auth',
      name: 'Authentication System',
      description: 'User signup, login, profile management',
      status: 'complete',
      progress: 100,
      icon: <Users className="w-4 h-4" />,
      priority: 'high'
    },
    {
      id: 'matching',
      name: 'Matchmaking System',
      description: 'Swipe interface, smart matching algorithm',
      status: 'complete',
      progress: 100,
      icon: <Heart className="w-4 h-4" />,
      priority: 'high'
    },
    {
      id: 'streaming',
      name: 'Live Streaming (Daily.co)',
      description: 'Video rooms, host controls, viewer experience',
      status: 'complete',
      progress: 95,
      icon: <Video className="w-4 h-4" />,
      priority: 'high'
    },
    {
      id: 'chat',
      name: 'Real-time Chat',
      description: 'Live messaging in rooms, emoji reactions',
      status: 'complete',
      progress: 100,
      icon: <MessageCircle className="w-4 h-4" />,
      priority: 'high'
    },
    {
      id: 'database',
      name: 'Database Setup',
      description: 'Supabase tables, sample data, relationships',
      status: 'critical',
      progress: 0,
      icon: <Database className="w-4 h-4" />,
      priority: 'high',
      estimatedTime: '30 min'
    },
    {
      id: 'daily-api',
      name: 'Daily.co API Key',
      description: 'Configure streaming infrastructure',
      status: 'critical',
      progress: 0,
      icon: <Settings className="w-4 h-4" />,
      priority: 'high',
      estimatedTime: '10 min'
    }
  ]);

  const totalProgress = Math.round(
    features.reduce((acc, feature) => acc + feature.progress, 0) / features.length
  );

  const criticalTasks = features.filter(f => f.status === 'critical');
  const completedTasks = features.filter(f => f.status === 'complete');

  const getStatusIcon = (status: MVPFeature['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'inProgress':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'critical':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: MVPFeature['status']) => {
    switch (status) {
      case 'complete':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'inProgress':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 shadow-2xl">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Rocket className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">MVP Progress</h2>
              <p className="text-white/60 text-sm">Track your app completion status</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">{totalProgress}%</div>
            <p className="text-white/60 text-sm">Complete</p>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="mb-6">
          <Progress value={totalProgress} className="h-3 bg-white/10">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${totalProgress}%` }}
            />
          </Progress>
          <div className="flex justify-between text-sm text-white/60 mt-2">
            <span>{completedTasks.length} of {features.length} features complete</span>
            <span>{criticalTasks.length} critical tasks remaining</span>
          </div>
        </div>

        {/* Critical Tasks Alert */}
        {criticalTasks.length > 0 && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <h3 className="text-red-400 font-medium">Critical Tasks Required</h3>
            </div>
            <p className="text-red-300 text-sm mb-3">
              Complete these tasks to make your app functional:
            </p>
            <div className="space-y-2">
              {criticalTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between bg-red-900/30 p-2 rounded">
                  <div className="flex items-center space-x-2">
                    {task.icon}
                    <span className="text-red-200 text-sm">{task.name}</span>
                  </div>
                  {task.estimatedTime && (
                    <Badge variant="outline" className="text-red-300 border-red-500/50">
                      {task.estimatedTime}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feature List */}
        <div className="space-y-3">
          {features.map((feature) => (
            <div
              key={feature.id}
              className={`p-4 rounded-lg border ${getStatusColor(feature.status)} transition-colors`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(feature.status)}
                  <div>
                    <h4 className="font-medium">{feature.name}</h4>
                    <p className="text-sm opacity-75">{feature.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {feature.estimatedTime && feature.status === 'critical' && (
                    <Badge variant="outline" className="text-xs">
                      {feature.estimatedTime}
                    </Badge>
                  )}
                  <div className="text-sm font-medium">{feature.progress}%</div>
                </div>
              </div>
              
              {feature.progress < 100 && (
                <Progress value={feature.progress} className="h-1.5 bg-white/10 mt-2">
                  <div 
                    className="h-full bg-current rounded-full transition-all duration-300"
                    style={{ width: `${feature.progress}%` }}
                  />
                </Progress>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        {criticalTasks.length > 0 && (
          <div className="mt-6 flex gap-3">
            <Button 
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
              onClick={() => window.open('/database/quick-setup.sql', '_blank')}
            >
              <Database className="w-4 h-4 mr-2" />
              Setup Database
            </Button>
            <Button 
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              onClick={() => window.open('https://daily.co', '_blank')}
            >
              <Video className="w-4 h-4 mr-2" />
              Get Daily.co API Key
            </Button>
          </div>
        )}

        {totalProgress === 100 && (
          <div className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg text-center">
            <Rocket className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <h3 className="text-green-400 font-bold text-lg">🎉 MVP Complete!</h3>
            <p className="text-green-300 text-sm">Your app is ready for beta testing and deployment!</p>
          </div>
        )}
      </div>
    </Card>
  );
}
