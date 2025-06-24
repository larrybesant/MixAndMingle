"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useOnboarding } from "@/contexts/onboarding-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ErrorBoundary } from "@/components/ui/error-boundary";

type ProfileSetupStep = 'basic' | 'music' | 'location' | 'complete';

interface ProfileData {
  username: string;
  bio: string;
  music_preferences: string;
  avatar_url: string;
  gender: string;
  relationship_style: string;
  location?: string;
}

export default function SetupProfilePage() {
  const [currentStep, setCurrentStep] = useState<ProfileSetupStep>('basic');
  const [profileData, setProfileData] = useState<ProfileData>({
    username: '',
    bio: '',
    music_preferences: '',
    avatar_url: '',
    gender: '',
    relationship_style: '',
    location: ''
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [error, setError] = useState("");  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);  const router = useRouter();
  const { markProfileComplete } = useOnboarding();

  // Helper to check if username is already taken (excluding current user)
  const isUsernameAvailable = async (username: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, id')
        .eq('username', username.toLowerCase())
        .single();
      
      if (error && error.code === 'PGRST116') {
        // No rows returned - username is available
        return true;
      }
      
      if (data && data.id !== user?.id) {
        // Username exists and belongs to a different user
        return false;
      }
      
      // Username is either available or belongs to current user
      return true;
    } catch (err) {
      console.error('Username check error:', err);
      return false;
    }
  };

  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/login");
        return;
      }
      setUser(data.user);
      
      // Check if profile already exists and pre-fill
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();
        
      if (existingProfile) {
        setProfileData(prev => ({
          ...prev,
          username: existingProfile.username || '',
          bio: existingProfile.bio || '',
          music_preferences: existingProfile.music_preferences || '',
          avatar_url: existingProfile.avatar_url || '',
          gender: existingProfile.gender || '',
          relationship_style: existingProfile.relationship_style || '',
          location: existingProfile.location || ''
        }));
      }
    }
    getUser();
  }, [router]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPhoto(null);
      setPhotoPreview("");
      return;
    }

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      setError("Photo must be smaller than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("Please upload a valid image file");
      return;
    }

    setPhoto(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setError(""); // Clear any previous errors
  };

  const getStepProgress = () => {
    switch (currentStep) {
      case 'basic': return 25;
      case 'music': return 50;
      case 'location': return 75;
      case 'complete': return 100;
      default: return 0;
    }
  };

  const validateStep = () => {
    switch (currentStep) {
      case 'basic':
        return !!(profileData.username.trim() && profileData.bio.trim() && profileData.gender && photo);
      case 'music':
        return !!(profileData.music_preferences.trim() && profileData.relationship_style);
      case 'location':
        return true; // Location is optional
      default:
        return false;
    }
  };
  const handleNext = async () => {
    if (!validateStep()) {
      setError("Please fill in all required fields for this step.");
      return;
    }
    setError("");
    
    // For basic step, validate username uniqueness
    if (currentStep === 'basic') {
      setError("Checking username availability...");
      const isAvailable = await isUsernameAvailable(profileData.username.trim());
      if (!isAvailable) {
        setError(`Username "${profileData.username.trim()}" is already taken. Please choose a different one.`);
        return;
      }
      setError(""); // Clear the checking message
    }
    
    switch (currentStep) {
      case 'basic':
        setCurrentStep('music');
        break;
      case 'music':
        setCurrentStep('location');
        break;
      case 'location':
        handleSubmit();
        break;
    }
  };

  const handleBack = () => {
    setError("");
    switch (currentStep) {
      case 'music':
        setCurrentStep('basic');
        break;
      case 'location':
        setCurrentStep('music');
        break;
    }
  };
  const uploadPhoto = async (): Promise<{ url: string | null; error: string | null }> => {
    if (!photo || !user) {
      return { url: null, error: "No photo or user provided" };
    }

    // Validate file size (5MB max)
    if (photo.size > 5 * 1024 * 1024) {
      return { url: null, error: "Photo must be smaller than 5MB" };
    }

    // Validate file type
    if (!photo.type.startsWith('image/')) {
      return { url: null, error: "Please upload a valid image file" };
    }

    const fileExt = photo.name.split('.').pop()?.toLowerCase();
    if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt || '')) {
      return { url: null, error: "Supported formats: JPG, PNG, GIF, WebP" };
    }

    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`; // Organize by user ID

    console.log('Uploading photo:', { fileName, filePath, size: photo.size, type: photo.type });    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, photo, {
        upsert: true, // Allow overwriting
        cacheControl: '3600'
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      
      // If bucket doesn't exist, try to create it
      if (uploadError.message.includes('The resource was not found')) {
        console.log('Avatars bucket not found, attempting to create...');
        
        try {
          // Try to setup storage via API
          const setupResponse = await fetch('/api/admin/setup-storage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (setupResponse.ok) {
            console.log('Storage bucket created, retrying upload...');
            
            // Retry the upload
            const { data: retryData, error: retryError } = await supabase.storage
              .from('avatars')
              .upload(filePath, photo, {
                upsert: true,
                cacheControl: '3600'
              });
            
            if (retryError) {
              return { url: null, error: `Upload failed after bucket creation: ${retryError.message}` };
            } else {
              const { data: urlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);
              
              console.log('Photo uploaded successfully after bucket creation:', urlData.publicUrl);
              return { url: urlData.publicUrl, error: null };
            }
          } else {
            return { url: null, error: "Storage not configured. Please contact support." };
          }
        } catch (setupError) {
          console.error('Failed to setup storage:', setupError);
          return { url: null, error: "Failed to setup storage. Please contact support." };
        }
      } else if (uploadError.message.includes('not allowed')) {
        return { url: null, error: "Upload permission denied. Please contact support." };
      } else if (uploadError.message.includes('exceeded')) {
        return { url: null, error: "File too large. Please use a smaller image." };
      } else {
        return { url: null, error: `Upload failed: ${uploadError.message}` };
      }
    }

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    console.log('Photo uploaded successfully:', urlData.publicUrl);
    return { url: urlData.publicUrl, error: null };
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      if (!user) {
        setError("No user found. Please log in again.");
        return;
      }      // Upload photo if provided
      let avatarUrl = profileData.avatar_url;
      if (photo) {
        const uploadResult = await uploadPhoto();
        if (uploadResult.error) {
          setError(uploadResult.error);
          setLoading(false);
          return;
        } else if (uploadResult.url) {
          avatarUrl = uploadResult.url;
        } else {
          setError("Failed to upload photo. Please try again.");
          setLoading(false);
          return;
        }
      }

      // Save profile to database
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          username: profileData.username.trim(),
          bio: profileData.bio.trim(),
          music_preferences: profileData.music_preferences.trim(),
          avatar_url: avatarUrl,
          gender: profileData.gender,
          relationship_style: profileData.relationship_style,
          location: profileData.location?.trim() || null,
          full_name: profileData.username.trim(), // Use username as full_name initially
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error("Profile save error:", profileError);
        setError(`Failed to save profile: ${profileError.message}`);
        return;
      }      // Success! Show completion step
      setCurrentStep('complete');
      
      // Mark profile as complete in onboarding context
      await markProfileComplete();
      
      // After 2 seconds, redirect to dashboard with onboarding tour
      setTimeout(() => {
        router.push("/dashboard?show_tour=true");
      }, 2000);

    } catch (err: any) {
      console.error("Profile creation error:", err);
      setError(`Unexpected error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  const renderBasicInfoStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-300">Username *</label>
        <Input
          placeholder="Choose a unique username"
          value={profileData.username}
          onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
          maxLength={20}
          className="w-full bg-gray-900/50 border-gray-600 text-white placeholder-gray-400"
        />
        <p className="text-xs text-gray-400 mt-1">3-20 characters, letters, numbers, and underscores only</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-gray-300">Bio *</label>
        <textarea
          placeholder="Tell everyone about yourself..."
          value={profileData.bio}
          onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
          maxLength={160}
          rows={3}
          className="w-full px-3 py-2 bg-gray-900/50 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-white placeholder-gray-400"
        />
        <p className="text-xs text-gray-400 mt-1">{profileData.bio.length}/160 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-gray-300">Gender *</label>
        <select 
          value={profileData.gender} 
          onChange={(e) => setProfileData(prev => ({ ...prev, gender: e.target.value }))}
          className="w-full px-3 py-2 bg-gray-900/50 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
        >
          <option value="" className="bg-gray-900 text-gray-400">Select your gender</option>
          <option value="male" className="bg-gray-900 text-white">Male</option>
          <option value="female" className="bg-gray-900 text-white">Female</option>
          <option value="non-binary" className="bg-gray-900 text-white">Non-binary</option>
          <option value="other" className="bg-gray-900 text-white">Other</option>
          <option value="prefer-not-to-say" className="bg-gray-900 text-white">Prefer not to say</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-gray-300">Profile Photo *</label>
        <div className="space-y-3">
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="w-full px-3 py-2 bg-gray-900/50 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
          />
          {photoPreview && (
            <div className="flex justify-center">
              <img 
                src={photoPreview} 
                alt="Photo preview" 
                className="w-24 h-24 object-cover rounded-full border-2 border-purple-500"
              />
            </div>
          )}
          <p className="text-xs text-gray-400">
            Upload a clear photo of yourself (JPG, PNG, GIF, or WebP, max 5MB)
          </p>
        </div>
      </div>
    </div>
  );
  const renderMusicStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-300">Music Preferences *</label>
        <Input
          placeholder="e.g., House, Techno, Hip-Hop, Jazz..."
          value={profileData.music_preferences}
          onChange={(e) => setProfileData(prev => ({ ...prev, music_preferences: e.target.value }))}
          maxLength={100}
          className="w-full bg-gray-900/50 border-gray-600 text-white placeholder-gray-400"
        />
        <p className="text-xs text-gray-400 mt-1">What genres do you love?</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-gray-300">What are you looking for? *</label>
        <select 
          value={profileData.relationship_style} 
          onChange={(e) => setProfileData(prev => ({ ...prev, relationship_style: e.target.value }))}
          className="w-full px-3 py-2 bg-gray-900/50 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
        >
          <option value="" className="bg-gray-900 text-gray-400">Select your interest</option>
          <option value="friendship" className="bg-gray-900 text-white">Just friends</option>
          <option value="dating" className="bg-gray-900 text-white">Dating</option>
          <option value="networking" className="bg-gray-900 text-white">Music networking</option>
          <option value="casual" className="bg-gray-900 text-white">Casual connections</option>
          <option value="serious" className="bg-gray-900 text-white">Serious relationship</option>
          <option value="open" className="bg-gray-900 text-white">Open to anything</option>
        </select>
      </div>
    </div>
  );
  const renderLocationStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-300">Location (Optional)</label>
        <Input
          placeholder="e.g., New York, NY"
          value={profileData.location}
          onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
          maxLength={50}
          className="w-full bg-gray-900/50 border-gray-600 text-white placeholder-gray-400"
        />
        <p className="text-xs text-gray-400 mt-1">Help others find local music events and connections</p>
      </div>

      <div className="bg-purple-900/30 border border-purple-500/30 p-4 rounded-lg">
        <h3 className="font-medium text-purple-300 mb-2">🎉 You're almost done!</h3>
        <p className="text-sm text-gray-300">
          Your profile is looking great! Click "Complete Setup" to join the community and discover amazing music connections.
        </p>
      </div>
    </div>
  );
  const renderCompleteStep = () => (
    <div className="text-center space-y-6">
      <div className="animate-bounce">
        🎉
      </div>
      <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Welcome to Mix & Mingle!</h2>
      <p className="text-gray-300">
        Your profile has been created successfully. Get ready to discover amazing music and connect with fellow music lovers!
      </p>
      <div className="animate-pulse">
        <Badge variant="outline" className="bg-green-900/30 border-green-500 text-green-400">
          Redirecting to your dashboard...
        </Badge>
      </div>
    </div>
  );

  const getStepTitle = () => {
    switch (currentStep) {
      case 'basic': return 'Basic Information';
      case 'music': return 'Music & Interests';
      case 'location': return 'Location & Preferences';
      case 'complete': return 'Setup Complete!';
      default: return 'Profile Setup';
    }
  };
  if (currentStep === 'complete') {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-black/80 border border-purple-500/30">
            <CardContent className="p-8">
              {renderCompleteStep()}
            </CardContent>
          </Card>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">🎵 Complete Your Profile</h1>
            <p className="text-gray-300">Let's get you set up to connect with the music community</p>
          </div>          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Step {currentStep === 'basic' ? 1 : currentStep === 'music' ? 2 : 3} of 3</span>
              <span>{getStepProgress()}% complete</span>
            </div>
            <Progress value={getStepProgress()} className="h-2 bg-gray-800" />
          </div>

          {/* Main Card */}
          <Card className="bg-black/80 border border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white">{getStepTitle()}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {currentStep === 'basic' && renderBasicInfoStep()}
              {currentStep === 'music' && renderMusicStep()}
              {currentStep === 'location' && renderLocationStep()}              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 'basic' || loading}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  Back
                </Button>
                
                <Button
                  onClick={handleNext}
                  disabled={!validateStep() || loading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Setting up...
                    </>
                  ) : currentStep === 'location' ? (
                    'Complete Setup 🎉'
                  ) : (
                    'Next →'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
}
