"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Rocket, 
  CheckCircle, 
  Clock,
  ExternalLink,
  Database,
  Settings,
  Video,
  Globe,
  Users,
  Terminal
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium';
  estimatedTime: string;
  completed: boolean;
  category: 'setup' | 'test' | 'deploy';
  instructions?: string[];
  links?: { label: string; url: string }[];
}

export function DeploymentChecklist() {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: 'database-setup',
      title: 'Database Setup',
      description: 'Create tables and initial data in Supabase',
      priority: 'critical',
      estimatedTime: '5 min',
      completed: false,
      category: 'setup',
      instructions: [
        'Go to your Supabase project dashboard',
        'Navigate to SQL Editor',
        'Copy the contents of database/quick-setup.sql',
        'Execute the SQL script',
        'Verify tables are created'
      ],
      links: [
        { label: 'Supabase Dashboard', url: 'https://supabase.com/dashboard' }
      ]
    },
    {
      id: 'daily-api',
      title: 'Daily.co API Configuration',
      description: 'Set up video streaming API key',
      priority: 'critical',
      estimatedTime: '10 min',
      completed: false,
      category: 'setup',
      instructions: [
        'Sign up for Daily.co account',
        'Create a new project',
        'Copy your API key from the dashboard',
        'Add DAILY_API_KEY to your .env.local file',
        'Restart your development server'
      ],
      links: [
        { label: 'Daily.co Signup', url: 'https://daily.co' },
        { label: 'Daily.co Dashboard', url: 'https://dashboard.daily.co' }
      ]
    },
    {
      id: 'test-auth',
      title: 'Test Authentication Flow',
      description: 'Verify signup/login works correctly',
      priority: 'high',
      estimatedTime: '5 min',
      completed: false,
      category: 'test',
      instructions: [
        'Go to /signup and create a test account',
        'Verify email confirmation works',
        'Test login with the new account',
        'Check that profile creation works',
        'Test logout functionality'
      ]
    },
    {
      id: 'test-matching',
      title: 'Test Matchmaking System',
      description: 'Verify swiping and matching works',
      priority: 'high',
      estimatedTime: '5 min',
      completed: false,
      category: 'test',
      instructions: [
        'Go to /matchmaking',
        'Test swiping left and right',
        'Verify matches appear in /matches',
        'Check that preferences affect suggestions',
        'Test super likes functionality'
      ]
    },
    {
      id: 'test-streaming',
      title: 'Test Live Streaming',
      description: 'Verify Daily.co integration works',
      priority: 'high',
      estimatedTime: '10 min',
      completed: false,
      category: 'test',
      instructions: [
        'Go to /go-live',
        'Create a new room',
        'Start streaming',
        'Test camera and microphone',
        'Join the room from another browser/device',
        'Test chat functionality'
      ]
    },
    {
      id: 'test-rooms',
      title: 'Test Room Discovery',
      description: 'Verify room browsing and joining',
      priority: 'medium',
      estimatedTime: '5 min',
      completed: false,
      category: 'test',
      instructions: [
        'Go to /rooms',
        'Browse available rooms',
        'Join a live room',
        'Test chat in the room',
        'Test leaving the room'
      ]
    },
    {
      id: 'build-check',
      title: 'Production Build Test',
      description: 'Ensure app builds without errors',
      priority: 'critical',
      estimatedTime: '5 min',
      completed: false,
      category: 'deploy',
      instructions: [
        'Run npm run build',
        'Check for any build errors',
        'Run npm start to test production build',
        'Test key features in production mode'
      ]
    },
    {
      id: 'env-production',
      title: 'Production Environment Variables',
      description: 'Configure environment for deployment',
      priority: 'critical',
      estimatedTime: '5 min',
      completed: false,
      category: 'deploy',
      instructions: [
        'Set up production environment variables',
        'Configure Supabase production keys',
        'Set Daily.co production API key',
        'Verify all URLs point to production'
      ]
    },
    {
      id: 'deploy-vercel',
      title: 'Deploy to Vercel',
      description: 'Deploy the application to production',
      priority: 'high',
      estimatedTime: '15 min',
      completed: false,
      category: 'deploy',
      instructions: [
        'Connect your GitHub repo to Vercel',
        'Set environment variables in Vercel dashboard',
        'Deploy the application',
        'Test the deployed application',
        'Set up custom domain (optional)'
      ],
      links: [
        { label: 'Vercel Dashboard', url: 'https://vercel.com/dashboard' }
      ]
    },
    {
      id: 'final-test',
      title: 'Final Production Test',
      description: 'Complete end-to-end testing in production',
      priority: 'high',
      estimatedTime: '20 min',
      completed: false,
      category: 'deploy',
      instructions: [
        'Test full user journey on production URL',
        'Create accounts and test all features',
        'Test from multiple devices',
        'Verify performance and loading times',
        'Check error handling and edge cases'
      ]
    }
  ]);

  const toggleItem = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const categories = {
    setup: { name: 'Setup', icon: <Settings className="w-4 h-4" />, color: 'text-blue-400' },
    test: { name: 'Testing', icon: <CheckCircle className="w-4 h-4" />, color: 'text-green-400' },
    deploy: { name: 'Deployment', icon: <Rocket className="w-4 h-4" />, color: 'text-purple-400' }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'medium': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const completedCount = checklist.filter(item => item.completed).length;
  const totalCount = checklist.length;
  const progressPercentage = Math.round((completedCount / totalCount) * 100);

  return (
    <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 shadow-2xl">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Rocket className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Deployment Checklist</h2>
              <p className="text-white/60 text-sm">Complete these steps to launch your MVP</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">{completedCount}/{totalCount}</div>
            <p className="text-white/60 text-sm">{progressPercentage}% Complete</p>
          </div>
        </div>

        {/* Progress Summary */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          {Object.entries(categories).map(([key, category]) => {
            const categoryItems = checklist.filter(item => item.category === key);
            const categoryCompleted = categoryItems.filter(item => item.completed).length;
            
            return (
              <div key={key} className="bg-slate-700/30 p-4 rounded-lg text-center">
                <div className={`${category.color} mb-2 flex justify-center`}>
                  {category.icon}
                </div>
                <div className="text-white font-medium">{category.name}</div>
                <div className="text-white/60 text-sm">
                  {categoryCompleted}/{categoryItems.length} complete
                </div>
              </div>
            );
          })}
        </div>

        {/* Checklist Items */}
        <div className="space-y-4">
          {Object.entries(categories).map(([categoryKey, category]) => {
            const categoryItems = checklist.filter(item => item.category === categoryKey);
            
            return (
              <div key={categoryKey}>
                <h3 className={`text-lg font-bold ${category.color} mb-3 flex items-center space-x-2`}>
                  {category.icon}
                  <span>{category.name}</span>
                </h3>
                
                <div className="space-y-3">
                  {categoryItems.map((item) => (
                    <div 
                      key={item.id}
                      className={`p-4 rounded-lg border transition-all ${
                        item.completed 
                          ? 'bg-green-900/20 border-green-500/30' 
                          : 'bg-slate-700/30 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start space-x-3 flex-1">
                          <Checkbox
                            checked={item.completed}
                            onCheckedChange={() => toggleItem(item.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className={`font-medium ${item.completed ? 'text-green-400 line-through' : 'text-white'}`}>
                                {item.title}
                              </h4>
                              <Badge variant="outline" className={getPriorityColor(item.priority)}>
                                {item.priority}
                              </Badge>
                              <Badge variant="outline" className="text-white/60">
                                {item.estimatedTime}
                              </Badge>
                            </div>
                            <p className={`text-sm ${item.completed ? 'text-green-300/70 line-through' : 'text-white/70'}`}>
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {!item.completed && item.instructions && (
                        <div className="ml-8 mt-3 space-y-2">
                          <h5 className="text-white/80 text-sm font-medium">Instructions:</h5>
                          <ol className="text-white/60 text-sm space-y-1">
                            {item.instructions.map((instruction, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <span className="text-purple-400 font-medium">{index + 1}.</span>
                                <span>{instruction}</span>
                              </li>
                            ))}
                          </ol>
                          
                          {item.links && (
                            <div className="flex space-x-2 mt-2">
                              {item.links.map((link, index) => (
                                <Button
                                  key={index}
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(link.url, '_blank')}
                                >
                                  <ExternalLink className="w-3 h-3 mr-1" />
                                  {link.label}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Completion Message */}
        {progressPercentage === 100 && (
          <div className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg text-center">
            <Rocket className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <h3 className="text-green-400 font-bold text-lg">🎉 Ready for Launch!</h3>
            <p className="text-green-300 text-sm">
              Congratulations! Your Mix & Mingle MVP is ready for users.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
