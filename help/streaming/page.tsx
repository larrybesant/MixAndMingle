'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Settings, 
  Headphones, 
  Camera, 
  Mic,
  Radio,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Download,
  Volume2,
  Wifi
} from 'lucide-react';

export default function StreamingHelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🎧 DJ Streaming Guide</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to know about streaming music, connecting DJ controllers, and going live on Mix & Mingle
          </p>
        </div>

        <Tabs defaultValue="setup" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="setup">🛠️ Setup</TabsTrigger>
            <TabsTrigger value="streaming">📡 Going Live</TabsTrigger>
            <TabsTrigger value="troubleshooting">🔧 Troubleshooting</TabsTrigger>
            <TabsTrigger value="advanced">⚡ Advanced</TabsTrigger>
          </TabsList>

          {/* Setup Tab */}
          <TabsContent value="setup" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Hardware Setup */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Headphones className="w-6 h-6" />
                    <span>Hardware Setup</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">Step 1: Connect Your DJ Controller</h4>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800 mb-2">✅ Supported Controllers:</p>
                      <div className="grid grid-cols-1 gap-1 text-xs">
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 justify-start">Pioneer DDJ Series</Badge>
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 justify-start">Native Instruments Traktor</Badge>
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 justify-start">Behringer DJ Controllers</Badge>
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 justify-start">+ Any MIDI-compatible controller</Badge>
                      </div>
                    </div>
                    <ol className="text-sm space-y-2 text-gray-600">
                      <li>1. Connect controller via USB before opening the app</li>
                      <li>2. Install manufacturer drivers if required</li>
                      <li>3. Set controller to MIDI mode (if applicable)</li>
                      <li>4. Test controller in DJ software first</li>
                    </ol>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Step 2: Audio Interface Setup</h4>
                    <ol className="text-sm space-y-2 text-gray-600">
                      <li>1. Connect audio interface to computer</li>
                      <li>2. Connect headphones to interface</li>
                      <li>3. Connect speakers/monitors (optional)</li>
                      <li>4. Set interface as default audio device</li>
                    </ol>
                    
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        <strong>Windows Users:</strong> Install ASIO drivers for best performance. 
                        <a href="#" className="text-blue-600 hover:underline ml-1">Download ASIO4ALL</a>
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>

              {/* Browser Setup */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-6 h-6" />
                    <span>Browser Configuration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">Recommended Browsers</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                        <span className="text-sm font-medium">Google Chrome</span>
                        <Badge className="bg-green-600">Best Performance</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded">
                        <span className="text-sm font-medium">Microsoft Edge</span>
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">Good</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <span className="text-sm font-medium">Firefox</span>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Limited</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Required Permissions</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Mic className="w-4 h-4 text-green-600" />
                        <span>Microphone Access</span>
                        <Badge variant="outline" className="bg-green-100 text-green-800">Required</Badge>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Camera className="w-4 h-4 text-blue-600" />
                        <span>Camera Access</span>
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">Optional</Badge>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Volume2 className="w-4 h-4 text-purple-600" />
                        <span>Audio Device Selection</span>
                        <Badge variant="outline" className="bg-purple-100 text-purple-800">Required</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Browser Settings</h4>
                    <ol className="text-sm space-y-1 text-gray-600">
                      <li>1. Enable hardware acceleration</li>
                      <li>2. Allow audio autoplay for Mix & Mingle</li>
                      <li>3. Disable audio enhancements</li>
                      <li>4. Close unnecessary tabs during streaming</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Setup Checklist */}
            <Card>
              <CardHeader>
                <CardTitle>✅ Quick Setup Checklist</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Hardware</h4>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-xs">
                        <input type="checkbox" className="rounded" />
                        <span>DJ controller connected</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <input type="checkbox" className="rounded" />
                        <span>Audio interface setup</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <input type="checkbox" className="rounded" />
                        <span>Headphones connected</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Software</h4>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-xs">
                        <input type="checkbox" className="rounded" />
                        <span>Chrome/Edge browser</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <input type="checkbox" className="rounded" />
                        <span>Hardware acceleration on</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <input type="checkbox" className="rounded" />
                        <span>Drivers installed</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Permissions</h4>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-xs">
                        <input type="checkbox" className="rounded" />
                        <span>Microphone allowed</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <input type="checkbox" className="rounded" />
                        <span>Camera allowed</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <input type="checkbox" className="rounded" />
                        <span>Audio devices detected</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Network</h4>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-xs">
                        <input type="checkbox" className="rounded" />
                        <span>Stable internet</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <input type="checkbox" className="rounded" />
                        <span>Upload speed &gt;5 Mbps</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <input type="checkbox" className="rounded" />
                        <span>Wired connection</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Streaming Tab */}
          <TabsContent value="streaming" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Going Live Steps */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Radio className="w-6 h-6" />
                    <span>Going Live - Step by Step</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <h4 className="font-medium">Open DJ Setup</h4>
                        <p className="text-sm text-gray-600">Navigate to Dashboard → Go Live → DJ Setup</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <h4 className="font-medium">Initialize Audio System</h4>
                        <p className="text-sm text-gray-600">Click "Initialize Audio System" to detect hardware</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <h4 className="font-medium">Select Audio Source</h4>
                        <p className="text-sm text-gray-600">Choose your DJ controller or audio interface input</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                      <div>
                        <h4 className="font-medium">Setup Camera (Optional)</h4>
                        <p className="text-sm text-gray-600">Enable video feed to show yourself mixing</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">5</div>
                      <div>
                        <h4 className="font-medium">Configure Stream Settings</h4>
                        <p className="text-sm text-gray-600">Set stream title, description, and privacy settings</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">6</div>
                      <div>
                        <h4 className="font-medium">Go Live!</h4>
                        <p className="text-sm text-gray-600">Click "Start Streaming" and start mixing</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stream Quality Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-6 h-6" />
                    <span>Stream Quality Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">Audio Quality</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-green-50 border border-green-200 rounded">
                        <span className="text-sm">320 kbps</span>
                        <Badge className="bg-green-600">Best Quality</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-blue-50 border border-blue-200 rounded">
                        <span className="text-sm">192 kbps</span>
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">Good</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <span className="text-sm">128 kbps</span>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Basic</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Video Quality (Optional)</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-gray-50 border rounded">
                        <span className="text-sm">1080p (1920×1080)</span>
                        <span className="text-xs text-gray-500">High bandwidth</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-green-50 border border-green-200 rounded">
                        <span className="text-sm">720p (1280×720)</span>
                        <Badge variant="outline" className="bg-green-100 text-green-800">Recommended</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-blue-50 border border-blue-200 rounded">
                        <span className="text-sm">480p (854×480)</span>
                        <span className="text-xs text-gray-500">Lower bandwidth</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Latency Settings</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>Ultra Low Latency</span>
                        <Badge variant="outline">Interactive</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Low Latency</span>
                        <Badge variant="outline">Most DJs</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Standard</span>
                        <Badge variant="outline">Stable</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Live Streaming Tips */}
            <Card>
              <CardHeader>
                <CardTitle>🎯 Pro Streaming Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium mb-3 flex items-center">
                      <Volume2 className="w-4 h-4 mr-2" />
                      Audio Tips
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Test audio levels before going live</li>
                      <li>• Use headphones to monitor your mix</li>
                      <li>• Keep levels in the green, avoid red</li>
                      <li>• Check audio sync with video</li>
                      <li>• Have a backup audio source ready</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3 flex items-center">
                      <Camera className="w-4 h-4 mr-2" />
                      Video Tips
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Good lighting on your face</li>
                      <li>• Camera at eye level or slightly above</li>
                      <li>• Show your DJ controller in frame</li>
                      <li>• Clean background or DJ setup</li>
                      <li>• Test camera angle beforehand</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3 flex items-center">
                      <Radio className="w-4 h-4 mr-2" />
                      Engagement Tips
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Interact with chat regularly</li>
                      <li>• Announce track names and artists</li>
                      <li>• Take song requests when possible</li>
                      <li>• Share stories about the music</li>
                      <li>• Schedule regular streaming times</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Troubleshooting Tab */}
          <TabsContent value="troubleshooting" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Common Issues */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="w-6 h-6" />
                    <span>Common Issues & Solutions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="border-l-4 border-red-500 pl-4">
                      <h4 className="font-medium text-red-800">❌ No Audio Detected</h4>
                      <div className="text-sm text-gray-600 mt-2 space-y-1">
                        <p><strong>Causes:</strong> Controller not connected, wrong input selected, or permissions denied</p>
                        <p><strong>Solutions:</strong></p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                          <li>Check USB connection to DJ controller</li>
                          <li>Refresh browser and allow microphone access</li>
                          <li>Select correct audio input device</li>
                          <li>Try different USB port</li>
                        </ul>
                      </div>
                    </div>

                    <div className="border-l-4 border-yellow-500 pl-4">
                      <h4 className="font-medium text-yellow-800">⚠️ High Audio Latency</h4>
                      <div className="text-sm text-gray-600 mt-2 space-y-1">
                        <p><strong>Causes:</strong> Large buffer size, CPU overload, or poor drivers</p>
                        <p><strong>Solutions:</strong></p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                          <li>Reduce buffer size to 256 samples or lower</li>
                          <li>Close unnecessary applications</li>
                          <li>Install ASIO drivers (Windows)</li>
                          <li>Use Chrome browser for best performance</li>
                        </ul>
                      </div>
                    </div>

                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-medium text-blue-800">ℹ️ DJ Controller Not Responding</h4>
                      <div className="text-sm text-gray-600 mt-2 space-y-1">
                        <p><strong>Causes:</strong> MIDI not detected, wrong mode, or driver issues</p>
                        <p><strong>Solutions:</strong></p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                          <li>Connect controller before opening browser</li>
                          <li>Set controller to MIDI mode (if available)</li>
                          <li>Check MIDI settings in DJ software first</li>
                          <li>Try different USB cable</li>
                        </ul>
                      </div>
                    </div>

                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-medium text-purple-800">🔄 Stream Keeps Disconnecting</h4>
                      <div className="text-sm text-gray-600 mt-2 space-y-1">
                        <p><strong>Causes:</strong> Poor internet, browser issues, or server problems</p>
                        <p><strong>Solutions:</strong></p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                          <li>Use wired internet connection</li>
                          <li>Close other bandwidth-heavy applications</li>
                          <li>Refresh browser and restart stream</li>
                          <li>Lower stream quality settings</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Diagnostic Tools */}
              <Card>
                <CardHeader>
                  <CardTitle>🔧 Diagnostic Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Quick Tests</h4>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Mic className="w-4 h-4 mr-2" />
                          Test Microphone
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Headphones className="w-4 h-4 mr-2" />
                          Test Audio Output
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Camera className="w-4 h-4 mr-2" />
                          Test Camera
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Wifi className="w-4 h-4 mr-2" />
                          Test Internet Speed
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3">System Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Browser:</span>
                          <span className="text-gray-600">Chrome 120.0</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Web Audio API:</span>
                          <Badge className="bg-green-600">Supported</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>MIDI Support:</span>
                          <Badge className="bg-green-600">Available</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Audio Devices:</span>
                          <span className="text-gray-600">3 found</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Advanced Audio Routing */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-6 h-6" />
                    <span>Advanced Audio Routing</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">Multi-Channel Setup</h4>
                    <p className="text-sm text-gray-600">
                      For advanced DJs with multi-channel audio interfaces
                    </p>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm">
                      <div className="space-y-1">
                        <div>• Main Output: Channels 1-2 (Audience)</div>
                        <div>• Monitor Output: Channels 3-4 (DJ Headphones)</div>
                        <div>• Record Output: Channels 5-6 (Recording)</div>
                        <div>• Microphone: Channel 7 (DJ Voice)</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Virtual Audio Cables</h4>
                    <p className="text-sm text-gray-600">
                      Route audio between different applications
                    </p>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        VB-Audio Virtual Cable
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        OBS Virtual Audio
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Custom MIDI Mapping</h4>
                    <p className="text-sm text-gray-600">
                      Map any MIDI controller to Mix & Mingle functions
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      Open MIDI Mapper
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Optimization */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="w-6 h-6" />
                    <span>Performance Optimization</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">System Optimization</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span>Audio Priority Process</span>
                        <Badge variant="outline">Recommended</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span>Disable Windows Audio Effects</span>
                        <Badge variant="outline">Required</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span>Power Plan: High Performance</span>
                        <Badge variant="outline">Important</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Browser Optimization</h4>
                    <div className="space-y-2 text-sm">
                      <div>• Enable hardware acceleration</div>
                      <div>• Disable extensions during streaming</div>
                      <div>• Clear cache before long sessions</div>
                      <div>• Use incognito mode for isolated performance</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Network Optimization</h4>
                    <div className="space-y-2 text-sm">
                      <div>• QoS: Prioritize Mix & Mingle traffic</div>
                      <div>• Port forwarding: 1935, 8080 (if needed)</div>
                      <div>• Bandwidth: Reserve 10 Mbps upload minimum</div>
                      <div>• CDN: Choose nearest streaming server</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Integration with DJ Software */}
            <Card>
              <CardHeader>
                <CardTitle>🎛️ DJ Software Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Serato DJ</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>• Use "Mix & Mingle" as external source</div>
                      <div>• Route main output to streaming</div>
                      <div>• Enable split cue for monitoring</div>
                      <div>• Map crossfader to stream volume</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Virtual DJ</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>• Configure streaming output plugin</div>
                      <div>• Set up broadcast quality settings</div>
                      <div>• Use VDJ's built-in stream encoder</div>
                      <div>• Map Mix & Mingle overlay controls</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Traktor Pro</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>• Set up external mixing mode</div>
                      <div>• Route through audio interface</div>
                      <div>• Configure broadcast settings</div>
                      <div>• Use Traktor's effects in stream</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Bottom CTA */}
        <Card className="mt-8">
          <CardContent className="text-center py-8">
            <h3 className="text-xl font-bold mb-4">Ready to Start Streaming?</h3>
            <p className="text-gray-600 mb-6">
              Follow this guide step-by-step and you'll be live streaming amazing DJ sets in no time!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Play className="w-4 h-4 mr-2" />
                Start DJ Setup
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download Guide PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
