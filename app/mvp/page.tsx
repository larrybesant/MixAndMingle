"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MVPProgressBar } from '@/components/mvp-progress-bar';
import { DeploymentChecklist } from '@/components/deployment-checklist';
import { LaunchGuide } from '@/components/launch-guide';
import { ProductionSummary } from '@/components/production-summary';
import { 
  Rocket, 
  Database, 
  Video, 
  CheckCircle, 
  AlertTriangle,
  ExternalLink,
  Terminal,
  Play,
  Settings,
  Users,
  Heart,
  MessageCircle
} from 'lucide-react';

interface HealthStatus {
  overall: number;
  database: boolean;
  dailyApi: boolean;
  auth: boolean;
  streaming: boolean;
  details?: string;
}

export default function MVPDashboard() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isDatabaseSetup, setIsDatabaseSetup] = useState(false);

  const checkHealth = async () => {
    setIsChecking(true);
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealthStatus(data);
    } catch (error) {
      console.error('Health check failed:', error);
      setHealthStatus({
        overall: 0,
        database: false,
        dailyApi: false,
        auth: false,
        streaming: false,
        details: 'Health check failed'
      });
    } finally {
      setIsChecking(false);
    }
  };

  const setupDatabase = async () => {
    setIsDatabaseSetup(true);
    try {
      const response = await fetch('/api/setup-database', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        alert('Database setup successful! 🎉');
        checkHealth(); // Refresh health status
      } else {
        alert(`Database setup failed: ${data.error}`);
      }
    } catch (error) {
      alert('Database setup failed. Please check console for details.');
      console.error('Database setup error:', error);
    } finally {
      setIsDatabaseSetup(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const features = [
    {
      name: 'Authentication System',
      status: 'complete',
      description: 'User signup/login with Supabase Auth',
      icon: <Users className="w-5 h-5" />,
      testUrl: '/signup'
    },
    {
      name: 'Matchmaking System', 
      status: 'complete',
      description: 'Swipe-based matching with smart algorithm',
      icon: <Heart className="w-5 h-5" />,
      testUrl: '/matchmaking'
    },
    {
      name: 'Live Streaming',
      status: healthStatus?.dailyApi ? 'complete' : 'needs-setup',
      description: 'Daily.co powered video streaming',
      icon: <Video className="w-5 h-5" />,
      testUrl: '/go-live'
    },
    {
      name: 'Real-time Chat',
      status: 'complete',
      description: 'Live messaging in rooms',
      icon: <MessageCircle className="w-5 h-5" />,
      testUrl: '/rooms'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Rocket className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">Mix & Mingle MVP</h1>
          </div>
          <p className="text-white/70 text-lg">Your live streaming + dating platform is almost ready! 🚀</p>
        </div>

        {/* Health Status */}
        <Card className="bg-slate-800/50 border-white/10">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>System Health</span>
              </h2>
              <Button 
                onClick={checkHealth} 
                disabled={isChecking}
                variant="outline"
                size="sm"
              >
                {isChecking ? 'Checking...' : 'Refresh'}
              </Button>
            </div>

            {healthStatus && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                  <div className={`text-2xl font-bold ${healthStatus.overall >= 80 ? 'text-green-400' : 'text-red-400'}`}>
                    {healthStatus.overall}%
                  </div>
                  <div className="text-white/60 text-sm">Overall Health</div>
                </div>
                <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                  {healthStatus.database ? (
                    <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-1" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-1" />
                  )}
                  <div className="text-white/60 text-sm">Database</div>
                </div>
                <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                  {healthStatus.dailyApi ? (
                    <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-1" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-1" />
                  )}
                  <div className="text-white/60 text-sm">Daily.co API</div>
                </div>
                <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                  {healthStatus.auth ? (
                    <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-1" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-1" />
                  )}
                  <div className="text-white/60 text-sm">Authentication</div>
                </div>
              </div>
            )}
          </div>
        </Card>        <Tabs defaultValue="launch" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-slate-800/50">
            <TabsTrigger value="launch">🚀 Launch</TabsTrigger>
            <TabsTrigger value="summary">📊 Summary</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="test">Test</TabsTrigger>
          </TabsList>

          <TabsContent value="launch">
            <LaunchGuide />
          </TabsContent>

          <TabsContent value="summary">
            <ProductionSummary />
          </TabsContent>

          <TabsContent value="progress">
            <MVPProgressBar />
          </TabsContent>

          <TabsContent value="setup" className="space-y-6">
            {/* Critical Setup Tasks */}
            <Card className="bg-slate-800/50 border-white/10">
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  <span>Critical Setup Tasks</span>
                </h3>
                
                <div className="space-y-4">
                  {/* Database Setup */}
                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Database className="w-5 h-5 text-blue-400" />
                      <div>
                        <h4 className="text-white font-medium">Database Setup</h4>
                        <p className="text-white/60 text-sm">Create tables and sample data</p>
                      </div>
                    </div>
                    <Button 
                      onClick={setupDatabase}
                      disabled={isDatabaseSetup || healthStatus?.database}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isDatabaseSetup ? 'Setting up...' : healthStatus?.database ? 'Complete' : 'Setup Now'}
                    </Button>
                  </div>

                  {/* Daily.co API */}
                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Video className="w-5 h-5 text-purple-400" />
                      <div>
                        <h4 className="text-white font-medium">Daily.co API Key</h4>
                        <p className="text-white/60 text-sm">Required for live streaming</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open('https://daily.co', '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Get API Key
                      </Button>
                      <Badge variant={healthStatus?.dailyApi ? "default" : "destructive"}>
                        {healthStatus?.dailyApi ? 'Configured' : 'Missing'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Environment Setup Instructions */}
                <div className="mt-6 p-4 bg-slate-900/50 rounded-lg">
                  <h4 className="text-white font-medium mb-2 flex items-center space-x-2">
                    <Terminal className="w-4 h-4" />
                    <span>Environment Variables (.env.local)</span>
                  </h4>
                  <pre className="text-green-400 text-sm bg-black/50 p-3 rounded overflow-x-auto">
{`# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Daily.co (add this)
DAILY_API_KEY=your_daily_api_key_here`}
                  </pre>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="checklist">
            <DeploymentChecklist />
          </TabsContent>

          <TabsContent value="test" className="space-y-6">
            {/* Feature Testing */}
            <Card className="bg-slate-800/50 border-white/10">
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <Play className="w-5 h-5 text-green-400" />
                  <span>Test Your Features</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {features.map((feature, index) => (
                    <div key={index} className="p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {feature.icon}
                          <h4 className="text-white font-medium">{feature.name}</h4>
                        </div>
                        <Badge 
                          variant={feature.status === 'complete' ? "default" : "destructive"}
                        >
                          {feature.status === 'complete' ? 'Ready' : 'Setup Required'}
                        </Badge>
                      </div>
                      <p className="text-white/60 text-sm mb-3">{feature.description}</p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full"
                        onClick={() => window.open(feature.testUrl, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Test Feature
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* User Journey Test */}
            <Card className="bg-slate-800/50 border-white/10">
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Complete User Journey Test</h3>
                <div className="space-y-2 text-white/80">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm">1</span>
                    <span>Sign up at <code className="bg-slate-700 px-2 py-1 rounded text-sm">/signup</code></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm">2</span>
                    <span>Complete profile at <code className="bg-slate-700 px-2 py-1 rounded text-sm">/dashboard</code></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm">3</span>
                    <span>Try matchmaking at <code className="bg-slate-700 px-2 py-1 rounded text-sm">/matchmaking</code></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm">4</span>
                    <span>Go live at <code className="bg-slate-700 px-2 py-1 rounded text-sm">/go-live</code></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm">5</span>
                    <span>Browse rooms at <code className="bg-slate-700 px-2 py-1 rounded text-sm">/rooms</code></span>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
