'use client';

import { useState, useEffect, useCallback } from 'react';
import { djAudioSystem, AudioDevice, MIDIDevice, AudioSettings } from './dj-audio-system';

export interface DJAudioState {
  isInitialized: boolean;
  isLoading: boolean;
  audioDevices: AudioDevice[];
  midiDevices: MIDIDevice[];
  settings: AudioSettings;
  error: string | null;
  isRecording: boolean;
  isStreaming: boolean;
}

export function useDJAudio() {
  const [state, setState] = useState<DJAudioState>({
    isInitialized: false,
    isLoading: false,
    audioDevices: [],
    midiDevices: [],
    settings: djAudioSystem.getSettings(),
    error: null,
    isRecording: false,
    isStreaming: false
  });

  // Initialize the DJ audio system
  const initialize = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const success = await djAudioSystem.initialize();
      
      if (success) {
        setState(prev => ({
          ...prev,
          isInitialized: true,
          isLoading: false,
          audioDevices: djAudioSystem.getAudioDevices(),
          midiDevices: djAudioSystem.getMIDIDevices(),
          settings: djAudioSystem.getSettings()
        }));
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to initialize DJ audio system'
        }));
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Unknown error occurred'
      }));
    }
  }, []);

  // Refresh device list
  const refreshDevices = useCallback(async () => {
    if (!state.isInitialized) return;
    
    try {
      const audioDevices = await djAudioSystem.detectAudioDevices();
      setState(prev => ({
        ...prev,
        audioDevices,
        midiDevices: djAudioSystem.getMIDIDevices()
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to refresh devices'
      }));
    }
  }, [state.isInitialized]);

  // Setup audio input
  const setupAudioInput = useCallback(async (deviceId?: string) => {
    if (!state.isInitialized) return false;
    
    try {
      const success = await djAudioSystem.setupAudioInput(deviceId);
      if (success) {
        setState(prev => ({
          ...prev,
          settings: djAudioSystem.getSettings()
        }));
      }
      return success;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to setup audio input'
      }));
      return false;
    }
  }, [state.isInitialized]);

  // Update audio settings
  const updateSettings = useCallback((newSettings: Partial<AudioSettings>) => {
    djAudioSystem.updateSettings(newSettings);
    setState(prev => ({
      ...prev,
      settings: djAudioSystem.getSettings()
    }));
  }, []);

  // Start recording
  const startRecording = useCallback(() => {
    if (!state.isInitialized) return;
    
    setState(prev => ({ ...prev, isRecording: true }));
    // Recording logic would go here
  }, [state.isInitialized]);

  // Stop recording
  const stopRecording = useCallback(() => {
    setState(prev => ({ ...prev, isRecording: false }));
    // Stop recording logic would go here
  }, []);

  // Start streaming
  const startStreaming = useCallback(() => {
    if (!state.isInitialized) return;
    
    setState(prev => ({ ...prev, isStreaming: true }));
    // Streaming logic would go here
  }, [state.isInitialized]);

  // Stop streaming
  const stopStreaming = useCallback(() => {
    setState(prev => ({ ...prev, isStreaming: false }));
    // Stop streaming logic would go here
  }, []);

  // Set up event listeners
  useEffect(() => {
    if (!state.isInitialized) return;

    const handleDeviceChange = () => {
      refreshDevices();
    };

    const handleMIDIMessage = (message: any) => {
      // Handle MIDI messages for real-time updates
      console.log('MIDI message received:', message);
      
      // Update settings if needed based on controller input
      setState(prev => ({
        ...prev,
        settings: djAudioSystem.getSettings()
      }));
    };

    djAudioSystem.setOnDeviceChange(handleDeviceChange);
    djAudioSystem.setOnMIDIMessage(handleMIDIMessage);

    return () => {
      // Cleanup would go here if needed
    };
  }, [state.isInitialized, refreshDevices]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.isInitialized) {
        djAudioSystem.dispose();
      }
    };
  }, []);

  return {
    ...state,
    initialize,
    refreshDevices,
    setupAudioInput,
    updateSettings,
    startRecording,
    stopRecording,
    startStreaming,
    stopStreaming
  };
}

export default useDJAudio;
