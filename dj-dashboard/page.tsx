'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DJSetupPanel from '@/components/dj/DJSetupPanel';
import { 
  Headphones, 
  Radio, 
  Play, 
  Users, 
  MessageCircle,
  BarChart3,
  Settings,
  HelpCircle,
  ExternalLink,
  Camera
} from 'lucide-react';

export default function DJDashboardPage() {
  const [isLive, setIsLive] = useState(false);
  const [viewers, setViewers] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🎧 DJ Dashboard</h1>
            <p className="text-gray-600">Professional DJ streaming and mixing tools</p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <Button variant="outline" className="flex items-center space-x-2">
              <HelpCircle className="w-4 h-4" />
              <span>Streaming Guide</span>
              <ExternalLink className="w-3 h-3" />
            </Button>
            
            {isLive ? (
              <div className="flex items-center space-x-2">
                <Badge className="bg-red-600 animate-pulse">🔴 LIVE</Badge>
                <span className="text-sm text-gray-600">{viewers} viewers</span>
              </div>
            ) : (
              <Badge variant="outline">Offline</Badge>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Radio className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">3</div>
                  <div className="text-xs text-gray-500">Streams This Week</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">147</div>
                  <div className="text-xs text-gray-500">Total Followers</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Play className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">8.5h</div>
                  <div className="text-xs text-gray-500">Stream Time</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold">92%</div>
                  <div className="text-xs text-gray-500">Engagement Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="mixer" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="mixer">🎛️ DJ Mixer</TabsTrigger>
            <TabsTrigger value="stream">📡 Stream Control</TabsTrigger>
            <TabsTrigger value="audience">👥 Audience</TabsTrigger>
            <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
          </TabsList>

          {/* DJ Mixer Tab */}
          <TabsContent value="mixer">
            <DJSetupPanel />
          </TabsContent>

          {/* Stream Control Tab */}
          <TabsContent value="stream" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Stream Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Radio className="w-5 h-5" />
                    <span>Stream Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Stream Title</label>
                    <input
                      type="text"
                      placeholder="Late Night House Vibes 🏠"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      placeholder="Playing the best deep house and techno tracks..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Genre Tags</label>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="cursor-pointer hover:bg-purple-100">House</Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-purple-100">Techno</Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-purple-100">Electronic</Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-purple-100">+ Add Tag</Badge>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button 
                      className={`w-full ${isLive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                      onClick={() => setIsLive(!isLive)}
                    >
                      {isLive ? (
                        <>
                          <Radio className="w-4 h-4 mr-2" />
                          Stop Stream
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Go Live
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Stream Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Stream Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center text-gray-400">
                      <Camera className="w-12 h-12 mx-auto mb-2" />
                      <p>Camera Preview</p>
                      <p className="text-sm">Click to enable video</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Audio Level:</span>
                      <div className="flex space-x-1">
                        <div className="w-2 h-4 bg-green-500 rounded-sm"></div>
                        <div className="w-2 h-4 bg-green-500 rounded-sm"></div>
                        <div className="w-2 h-4 bg-yellow-500 rounded-sm"></div>
                        <div className="w-2 h-4 bg-gray-300 rounded-sm"></div>
                        <div className="w-2 h-4 bg-gray-300 rounded-sm"></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Quality:</span>
                      <Badge variant="outline" className="bg-green-100 text-green-800">720p @ 30fps</Badge>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Bitrate:</span>
                      <span className="text-gray-600">2.5 Mbps</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Audience Tab */}
          <TabsContent value="audience" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Live Chat */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5" />
                    <span>Live Chat</span>
                    {isLive && <Badge className="bg-green-600">Active</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-50 rounded-lg p-3 mb-3 overflow-y-auto">
                    {isLive ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start space-x-2">
                          <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs text-white">M</div>
                          <div>
                            <div className="font-medium">MusicLover23</div>
                            <div className="text-gray-600">This track is fire! 🔥</div>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white">D</div>
                          <div>
                            <div className="font-medium">DJFan2024</div>
                            <div className="text-gray-600">Can you play some deep house next?</div>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs text-white">B</div>
                          <div>
                            <div className="font-medium">BeatMaster</div>
                            <div className="text-gray-600">Loving the mix! Keep it up! 🎵</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                          <MessageCircle className="w-8 h-8 mx-auto mb-2" />
                          <p>Go live to see chat messages</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      disabled={!isLive}
                    />
                    <Button disabled={!isLive}>Send</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Viewer List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Current Viewers</span>
                    <Badge variant="outline">{isLive ? 23 : 0}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {isLive ? (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-sm text-white">M</div>
                            <div>
                              <div className="font-medium text-sm">MusicLover23</div>
                              <div className="text-xs text-gray-500">Following</div>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-purple-100 text-purple-800">VIP</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm text-white">D</div>
                            <div>
                              <div className="font-medium text-sm">DJFan2024</div>
                              <div className="text-xs text-gray-500">New viewer</div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">Follow</Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-sm text-white">B</div>
                            <div>
                              <div className="font-medium text-sm">BeatMaster</div>
                              <div className="text-xs text-gray-500">Regular</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="pt-2 text-center">
                          <Button variant="outline" size="sm" className="w-full">
                            View All Followers
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <Users className="w-8 h-8 mx-auto mb-2" />
                        <p>No viewers yet</p>
                        <p className="text-sm">Start streaming to see your audience</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>📈 Stream Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Average Viewers</span>
                      <span className="text-lg font-bold text-purple-600">42</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Peak Viewers</span>
                      <span className="text-lg font-bold text-blue-600">89</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Watch Time</span>
                      <span className="text-lg font-bold text-green-600">3.2h</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Chat Messages</span>
                      <span className="text-lg font-bold text-orange-600">156</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium mb-2">Stream Quality</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Audio Quality</span>
                        <Badge className="bg-green-600">Excellent</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Connection Stability</span>
                        <Badge className="bg-green-600">Stable</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Latency</span>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">2.3s</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>🕐 Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <div className="text-sm font-medium">Stream ended</div>
                        <div className="text-xs text-gray-500">2 hours ago • 1.5h duration</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <div className="text-sm font-medium">New follower</div>
                        <div className="text-xs text-gray-500">3 hours ago • @MusicFan2024</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <div>
                        <div className="text-sm font-medium">Peak viewers reached</div>
                        <div className="text-xs text-gray-500">5 hours ago • 89 viewers</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <div>
                        <div className="text-sm font-medium">Equipment connected</div>
                        <div className="text-xs text-gray-500">1 day ago • Pioneer DDJ-400</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
