'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import useDJAudio from '@/lib/audio/use-dj-audio';
import { getSupportedDJControllers, getAudioLatencyTips } from '@/lib/audio/dj-audio-system';
import { 
  Headphones, 
  Mic, 
  Settings, 
  Play, 
  Square, 
  Radio,
  AlertCircle,
  CheckCircle,
  Volume2,
  Sliders
} from 'lucide-react';

export function DJSetupPanel() {
  const {
    isInitialized,
    isLoading,
    audioDevices,
    midiDevices,
    settings,
    error,
    isRecording,
    isStreaming,
    initialize,
    refreshDevices,
    setupAudioInput,
    updateSettings,
    startRecording,
    stopRecording,
    startStreaming,
    stopStreaming
  } = useDJAudio();

  const [selectedInputDevice, setSelectedInputDevice] = useState<string>('');
  const [selectedOutputDevice, setSelectedOutputDevice] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleInitialize = async () => {
    await initialize();
  };

  const handleSetupAudio = async () => {
    if (selectedInputDevice) {
      await setupAudioInput(selectedInputDevice);
    }
  };

  const handleEQChange = (type: 'bass' | 'mid' | 'treble', value: number[]) => {
    updateSettings({
      eqSettings: {
        ...settings.eqSettings,
        [type]: (value[0] - 50) / 50 // Convert 0-100 to -1 to 1
      }
    });
  };

  const handleCrossfaderChange = (value: number[]) => {
    updateSettings({
      crossfaderPosition: value[0] / 100 // Convert 0-100 to 0-1
    });
  };

  const inputDevices = audioDevices.filter(device => device.kind === 'audioinput');
  const outputDevices = audioDevices.filter(device => device.kind === 'audiooutput');
  const connectedMIDI = midiDevices.filter(device => device.state === 'connected');

  if (!isInitialized && !isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Headphones className="w-6 h-6" />
            <span>DJ Audio Setup</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-8">
            <Headphones className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Initialize DJ Audio System
            </h3>
            <p className="text-gray-600 mb-6">
              Connect your DJ controller and audio interface, then click to detect your hardware.
            </p>
            <Button onClick={handleInitialize} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Detecting Hardware...
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4 mr-2" />
                  Initialize Audio System
                </>
              )}
            </Button>
          </div>

          {/* Supported Controllers Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">✅ Supported DJ Controllers</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {getSupportedDJControllers().slice(0, 6).map((controller) => (
                <Badge key={controller} variant="outline" className="bg-blue-100 text-blue-800 text-xs">
                  {controller}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-blue-700 mt-2">
              And many more MIDI-compatible controllers!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Error Display */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Device Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Hardware Status</span>
            </span>
            <Button variant="outline" size="sm" onClick={refreshDevices}>
              Refresh Devices
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Audio Input Devices */}
            <div>
              <h4 className="font-medium mb-2 flex items-center">
                <Mic className="w-4 h-4 mr-2" />
                Audio Inputs ({inputDevices.length})
              </h4>
              <div className="space-y-2">
                {inputDevices.map((device) => (
                  <div
                    key={device.deviceId}
                    className={`p-2 border rounded text-sm cursor-pointer transition-colors ${
                      selectedInputDevice === device.deviceId
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedInputDevice(device.deviceId)}
                  >
                    {device.label}
                  </div>
                ))}
                {inputDevices.length === 0 && (
                  <p className="text-gray-500 text-sm">No audio inputs found</p>
                )}
              </div>
            </div>

            {/* Audio Output Devices */}
            <div>
              <h4 className="font-medium mb-2 flex items-center">
                <Volume2 className="w-4 h-4 mr-2" />
                Audio Outputs ({outputDevices.length})
              </h4>
              <div className="space-y-2">
                {outputDevices.map((device) => (
                  <div
                    key={device.deviceId}
                    className={`p-2 border rounded text-sm cursor-pointer transition-colors ${
                      selectedOutputDevice === device.deviceId
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedOutputDevice(device.deviceId)}
                  >
                    {device.label}
                  </div>
                ))}
                {outputDevices.length === 0 && (
                  <p className="text-gray-500 text-sm">No audio outputs found</p>
                )}
              </div>
            </div>

            {/* MIDI Controllers */}
            <div>
              <h4 className="font-medium mb-2 flex items-center">
                <Sliders className="w-4 h-4 mr-2" />
                MIDI Controllers ({connectedMIDI.length})
              </h4>
              <div className="space-y-2">
                {connectedMIDI.map((device) => (
                  <div key={device.id} className="p-2 border border-green-200 bg-green-50 rounded text-sm">
                    <div className="font-medium">{device.name}</div>
                    <div className="text-xs text-green-700">{device.manufacturer}</div>
                  </div>
                ))}
                {connectedMIDI.length === 0 && (
                  <p className="text-gray-500 text-sm">No MIDI controllers connected</p>
                )}
              </div>
            </div>
          </div>

          {selectedInputDevice && (
            <div className="mt-4 pt-4 border-t">
              <Button onClick={handleSetupAudio} className="bg-green-600 hover:bg-green-700">
                <Mic className="w-4 h-4 mr-2" />
                Setup Audio Input
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audio Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mixer Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sliders className="w-5 h-5" />
              <span>Mixer Controls</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Crossfader */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Crossfader
              </label>
              <Slider
                value={[settings.crossfaderPosition * 100]}
                onValueChange={handleCrossfaderChange}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>A</span>
                <span>Center</span>
                <span>B</span>
              </div>
            </div>

            {/* EQ Controls */}
            <div className="space-y-4">
              <h4 className="font-medium">3-Band EQ</h4>
              
              {/* Treble */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Treble ({(settings.eqSettings.treble * 12).toFixed(1)}dB)
                </label>
                <Slider
                  value={[(settings.eqSettings.treble + 1) * 50]}
                  onValueChange={(value) => handleEQChange('treble', value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Mid */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Mid ({(settings.eqSettings.mid * 12).toFixed(1)}dB)
                </label>
                <Slider
                  value={[(settings.eqSettings.mid + 1) * 50]}
                  onValueChange={(value) => handleEQChange('mid', value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Bass */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Bass ({(settings.eqSettings.bass * 12).toFixed(1)}dB)
                </label>
                <Slider
                  value={[(settings.eqSettings.bass + 1) * 50]}
                  onValueChange={(value) => handleEQChange('bass', value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recording & Streaming */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Radio className="w-5 h-5" />
              <span>Recording & Streaming</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Recording Controls */}
            <div>
              <h4 className="font-medium mb-3">Recording</h4>
              <div className="flex space-x-2">
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  variant={isRecording ? "destructive" : "default"}
                  className="flex-1"
                >
                  {isRecording ? (
                    <>
                      <Square className="w-4 h-4 mr-2" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Recording
                    </>
                  )}
                </Button>
              </div>
              {isRecording && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                  🔴 Recording in progress...
                </div>
              )}
            </div>

            {/* Streaming Controls */}
            <div>
              <h4 className="font-medium mb-3">Live Streaming</h4>
              <div className="flex space-x-2">
                <Button
                  onClick={isStreaming ? stopStreaming : startStreaming}
                  variant={isStreaming ? "destructive" : "default"}
                  className="flex-1"
                >
                  {isStreaming ? (
                    <>
                      <Square className="w-4 h-4 mr-2" />
                      Stop Stream
                    </>
                  ) : (
                    <>
                      <Radio className="w-4 h-4 mr-2" />
                      Go Live
                    </>
                  )}
                </Button>
              </div>
              {isStreaming && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                  🔴 LIVE - Broadcasting to audience
                </div>
              )}
            </div>

            {/* Settings */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Settings</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  Advanced
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Low Latency Mode</label>
                  <Switch
                    checked={settings.enableLowLatency}
                    onCheckedChange={(checked) => updateSettings({ enableLowLatency: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Monitor Output</label>
                  <Switch
                    checked={settings.enableMonitoring}
                    onCheckedChange={(checked) => updateSettings({ enableMonitoring: checked })}
                  />
                </div>
              </div>

              {showAdvanced && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Sample Rate: {settings.sampleRate}Hz
                    </label>
                    <select
                      value={settings.sampleRate}
                      onChange={(e) => updateSettings({ sampleRate: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value={44100}>44.1 kHz (Standard)</option>
                      <option value={48000}>48 kHz (Professional)</option>
                      <option value={96000}>96 kHz (High Quality)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Buffer Size: {settings.bufferSize} samples
                    </label>
                    <select
                      value={settings.bufferSize}
                      onChange={(e) => updateSettings({ bufferSize: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value={128}>128 (Ultra Low Latency)</option>
                      <option value={256}>256 (Low Latency)</option>
                      <option value={512}>512 (Balanced)</option>
                      <option value={1024}>1024 (Stable)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tips & Troubleshooting */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Performance Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">For Best Performance:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {getAudioLatencyTips().slice(0, 4).map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Troubleshooting:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {getAudioLatencyTips().slice(4).map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DJSetupPanel;
