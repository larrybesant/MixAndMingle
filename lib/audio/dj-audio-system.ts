// DJ Audio System - Hardware Detection and Integration
'use client';

export interface AudioDevice {
  deviceId: string;
  label: string;
  kind: 'audioinput' | 'audiooutput';
  groupId: string;
}

export interface MIDIDevice {
  id: string;
  name: string;
  manufacturer: string;
  type: 'input' | 'output';
  state: 'connected' | 'disconnected';
}

export interface AudioSettings {
  sampleRate: number;
  bufferSize: number;
  inputDevice: string | null;
  outputDevice: string | null;
  enableLowLatency: boolean;
  enableMonitoring: boolean;
  crossfaderPosition: number;
  eqSettings: {
    bass: number;
    mid: number;
    treble: number;
  };
}

class DJAudioSystem {
  private audioContext: AudioContext | null = null;
  private audioDevices: AudioDevice[] = [];
  private midiDevices: MIDIDevice[] = [];
  private audioStream: MediaStream | null = null;
  private isInitialized = false;
  private settings: AudioSettings;
  private onDeviceChange?: () => void;
  private onMIDIMessage?: (message: any) => void;

  constructor() {
    this.settings = {
      sampleRate: 44100,
      bufferSize: 256, // Low latency
      inputDevice: null,
      outputDevice: null,
      enableLowLatency: true,
      enableMonitoring: false,
      crossfaderPosition: 0.5,
      eqSettings: {
        bass: 0,
        mid: 0,
        treble: 0
      }
    };
  }

  // Initialize the audio system
  async initialize(): Promise<boolean> {
    try {
      console.log('🎧 Initializing DJ Audio System...');
        // Check Web Audio API support
      if (!window.AudioContext) {
        throw new Error('Web Audio API not supported');
      }

      // Initialize audio context with low latency settings
      this.audioContext = new AudioContext({
        latencyHint: 'interactive',
        sampleRate: this.settings.sampleRate
      });

      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Detect audio devices
      await this.detectAudioDevices();
      
      // Initialize MIDI
      await this.initializeMIDI();
      
      this.isInitialized = true;
      console.log('✅ DJ Audio System initialized successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to initialize DJ Audio System:', error);
      return false;
    }
  }

  // Detect available audio input/output devices
  async detectAudioDevices(): Promise<AudioDevice[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.audioDevices = devices
        .filter(device => device.kind === 'audioinput' || device.kind === 'audiooutput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `${device.kind} (${device.deviceId.substring(0, 8)}...)`,
          kind: device.kind as 'audioinput' | 'audiooutput',
          groupId: device.groupId
        }));

      console.log(`🎤 Found ${this.audioDevices.length} audio devices:`, this.audioDevices);
      return this.audioDevices;
    } catch (error) {
      console.error('❌ Error detecting audio devices:', error);
      return [];
    }
  }

  // Initialize MIDI support for DJ controllers
  async initializeMIDI(): Promise<boolean> {
    try {
      if (!navigator.requestMIDIAccess) {
        console.warn('⚠️ MIDI not supported in this browser');
        return false;
      }

      const midiAccess = await navigator.requestMIDIAccess();
      
      // Handle MIDI inputs (DJ controllers)
      for (const input of midiAccess.inputs.values()) {
        const device: MIDIDevice = {
          id: input.id!,
          name: input.name || 'Unknown MIDI Device',
          manufacturer: input.manufacturer || 'Unknown',
          type: 'input',
          state: input.state as 'connected' | 'disconnected'
        };
        
        this.midiDevices.push(device);
        
        // Listen for MIDI messages
        input.onmidimessage = (message) => {
          this.handleMIDIMessage(message, device);
        };
      }

      // Handle MIDI outputs
      for (const output of midiAccess.outputs.values()) {
        const device: MIDIDevice = {
          id: output.id!,
          name: output.name || 'Unknown MIDI Device',
          manufacturer: output.manufacturer || 'Unknown',
          type: 'output',
          state: output.state as 'connected' | 'disconnected'
        };
        
        this.midiDevices.push(device);
      }

      // Listen for device changes
      midiAccess.onstatechange = () => {
        this.detectMIDIDevices(midiAccess);
        this.onDeviceChange?.();
      };

      console.log(`🎛️ Found ${this.midiDevices.length} MIDI devices:`, this.midiDevices);
      return true;
      
    } catch (error) {
      console.error('❌ Error initializing MIDI:', error);
      return false;
    }
  }

  // Detect MIDI devices (helper)
  private detectMIDIDevices(midiAccess: MIDIAccess) {
    this.midiDevices = [];
    
    for (const input of midiAccess.inputs.values()) {
      this.midiDevices.push({
        id: input.id!,
        name: input.name || 'Unknown MIDI Device',
        manufacturer: input.manufacturer || 'Unknown',
        type: 'input',
        state: input.state as 'connected' | 'disconnected'
      });
    }
    
    for (const output of midiAccess.outputs.values()) {
      this.midiDevices.push({
        id: output.id!,
        name: output.name || 'Unknown MIDI Device',
        manufacturer: output.manufacturer || 'Unknown',
        type: 'output',
        state: output.state as 'connected' | 'disconnected'
      });
    }
  }

  // Handle MIDI messages from DJ controllers
  private handleMIDIMessage(message: any, device: MIDIDevice) {
    const [command, note, velocity] = message.data;
    
    // Parse MIDI message
    const midiMessage = {
      device: device,
      command: command,
      note: note,
      velocity: velocity,
      timestamp: message.timeStamp,
      type: this.getMIDIMessageType(command)
    };

    // Handle common DJ controller functions
    this.processDJControllerMessage(midiMessage);
    
    // Notify listeners
    this.onMIDIMessage?.(midiMessage);
  }

  // Get MIDI message type
  private getMIDIMessageType(command: number): string {
    const messageType = command & 0xF0;
    switch (messageType) {
      case 0x90: return 'noteOn';
      case 0x80: return 'noteOff';
      case 0xB0: return 'controlChange';
      case 0xE0: return 'pitchBend';
      default: return 'unknown';
    }
  }

  // Process DJ controller specific messages
  private processDJControllerMessage(message: any) {
    const { type, note, velocity } = message;

    // Common DJ controller mappings
    switch (type) {
      case 'controlChange':
        this.handleControlChange(note, velocity);
        break;
      case 'noteOn':
        this.handleButtonPress(note, velocity);
        break;
      case 'pitchBend':
        this.handlePitchBend(velocity);
        break;
    }
  }

  // Handle control change messages (knobs, faders)
  private handleControlChange(note: number, velocity: number) {
    // Common CC mappings for DJ controllers
    switch (note) {
      case 16: // Crossfader (common mapping)
        this.settings.crossfaderPosition = velocity / 127;
        break;
      case 4: // EQ Bass
        this.settings.eqSettings.bass = (velocity - 64) / 64;
        break;
      case 5: // EQ Mid
        this.settings.eqSettings.mid = (velocity - 64) / 64;
        break;
      case 6: // EQ Treble
        this.settings.eqSettings.treble = (velocity - 64) / 64;
        break;
    }
  }

  // Handle button presses
  private handleButtonPress(note: number, velocity: number) {
    if (velocity === 0) return; // Button release
    
    // Common button mappings
    switch (note) {
      case 60: // Play/Pause (common mapping)
        console.log('🎵 Play/Pause triggered');
        break;
      case 62: // Cue
        console.log('🎧 Cue triggered');
        break;
      case 64: // Sync
        console.log('🔄 Sync triggered');
        break;
    }
  }

  // Handle pitch bend
  private handlePitchBend(value: number) {
    const pitchValue = (value - 64) / 64; // Normalize to -1 to 1
    console.log('🎚️ Pitch bend:', pitchValue);
  }

  // Setup audio input stream
  async setupAudioInput(deviceId?: string): Promise<boolean> {
    try {      const constraints: MediaStreamConstraints = {
        audio: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          sampleRate: this.settings.sampleRate,
          channelCount: 2,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      };

      this.audioStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('🎤 Audio input stream established');
      return true;
      
    } catch (error) {
      console.error('❌ Error setting up audio input:', error);
      return false;
    }
  }

  // Create audio processing chain
  createAudioChain(): AudioNode | null {
    if (!this.audioContext || !this.audioStream) return null;

    try {
      // Create input node
      const inputNode = this.audioContext.createMediaStreamSource(this.audioStream);
      
      // Create EQ filters
      const bassFilter = this.audioContext.createBiquadFilter();
      bassFilter.type = 'lowshelf';
      bassFilter.frequency.value = 320;
      bassFilter.gain.value = this.settings.eqSettings.bass * 12; // ±12dB

      const midFilter = this.audioContext.createBiquadFilter();
      midFilter.type = 'peaking';
      midFilter.frequency.value = 1000;
      midFilter.Q.value = 1;
      midFilter.gain.value = this.settings.eqSettings.mid * 12;

      const trebleFilter = this.audioContext.createBiquadFilter();
      trebleFilter.type = 'highshelf';
      trebleFilter.frequency.value = 3200;
      trebleFilter.gain.value = this.settings.eqSettings.treble * 12;

      // Create gain node for crossfader
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = this.settings.crossfaderPosition;

      // Connect the chain
      inputNode
        .connect(bassFilter)
        .connect(midFilter)
        .connect(trebleFilter)
        .connect(gainNode);

      return gainNode;
      
    } catch (error) {
      console.error('❌ Error creating audio chain:', error);
      return null;
    }
  }

  // Get detected devices
  getAudioDevices(): AudioDevice[] {
    return this.audioDevices;
  }

  getMIDIDevices(): MIDIDevice[] {
    return this.midiDevices;
  }

  // Get current settings
  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  // Update settings
  updateSettings(newSettings: Partial<AudioSettings>) {
    this.settings = { ...this.settings, ...newSettings };
  }

  // Set event listeners
  setOnDeviceChange(callback: () => void) {
    this.onDeviceChange = callback;
  }

  setOnMIDIMessage(callback: (message: any) => void) {
    this.onMIDIMessage = callback;
  }

  // Check if system is ready
  isReady(): boolean {
    return this.isInitialized && this.audioContext !== null;
  }

  // Cleanup
  dispose() {
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
    }
    
    if (this.audioContext) {
      this.audioContext.close();
    }
    
    this.isInitialized = false;
  }
}

// Create singleton instance
export const djAudioSystem = new DJAudioSystem();

// Export helper functions
export function getSupportedDJControllers(): string[] {
  return [
    'Pioneer DDJ-SB3',
    'Pioneer DDJ-400',
    'Pioneer DDJ-FLX4',
    'Native Instruments Traktor Kontrol S2',
    'Native Instruments Traktor Kontrol S4',
    'Behringer DDM4000',
    'Hercules DJControl Inpulse 300',
    'Numark Party Mix',
    'Roland DJ-202',
    'Denon MC4000'
  ];
}

export function getAudioLatencyTips(): string[] {
  return [
    'Use Chrome or Edge for best Web Audio API performance',
    'Close unnecessary browser tabs and applications',
    'Use wired USB connections for DJ controllers',
    'Set buffer size to 256 samples or lower',
    'Enable hardware acceleration in browser settings',
    'Use ASIO drivers on Windows for professional audio interfaces',
    'Disable Windows audio enhancements',
    'Connect DJ controller before starting the application'
  ];
}
