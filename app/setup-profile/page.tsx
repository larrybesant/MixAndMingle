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
  const [error, setError] = useState("");  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const { markProfileComplete } = useOnboarding();

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

  const handleNext = () => {
    if (!validateStep()) {
      setError("Please fill in all required fields for this step.");
      return;
    }
    setError("");
    
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

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photo || !user) return null;

    const fileExt = photo.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, photo);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      if (!user) {
        setError("No user found. Please log in again.");
        return;
      }

      // Upload photo if provided
      let avatarUrl = profileData.avatar_url;
      if (photo) {
        const uploadedUrl = await uploadPhoto();
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
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
        <label className="block text-sm font-medium mb-2">Username *</label>
        <Input
          placeholder="Choose a unique username"
          value={profileData.username}
          onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
          maxLength={20}
          className="w-full"
        />
        <p className="text-xs text-gray-500 mt-1">3-20 characters, letters, numbers, and underscores only</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Bio *</label>
        <textarea
          placeholder="Tell everyone about yourself..."
          value={profileData.bio}
          onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
          maxLength={160}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">{profileData.bio.length}/160 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Gender *</label>
        <select 
          value={profileData.gender} 
          onChange={(e) => setProfileData(prev => ({ ...prev, gender: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select your gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="non-binary">Non-binary</option>
          <option value="other">Other</option>
          <option value="prefer-not-to-say">Prefer not to say</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Profile Photo *</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files?.[0] || null)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">Upload a clear photo of yourself</p>
      </div>
    </div>
  );

  const renderMusicStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Music Preferences *</label>
        <Input
          placeholder="e.g., House, Techno, Hip-Hop, Jazz..."
          value={profileData.music_preferences}
          onChange={(e) => setProfileData(prev => ({ ...prev, music_preferences: e.target.value }))}
          maxLength={100}
          className="w-full"
        />
        <p className="text-xs text-gray-500 mt-1">What genres do you love?</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">What are you looking for? *</label>
        <select 
          value={profileData.relationship_style} 
          onChange={(e) => setProfileData(prev => ({ ...prev, relationship_style: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select your interest</option>
          <option value="friendship">Just friends</option>
          <option value="dating">Dating</option>
          <option value="networking">Music networking</option>
          <option value="casual">Casual connections</option>
          <option value="serious">Serious relationship</option>
          <option value="open">Open to anything</option>
        </select>
      </div>
    </div>
  );

  const renderLocationStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Location (Optional)</label>
        <Input
          placeholder="e.g., New York, NY"
          value={profileData.location}
          onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
          maxLength={50}
          className="w-full"
        />
        <p className="text-xs text-gray-500 mt-1">Help others find local music events and connections</p>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">🎉 You're almost done!</h3>
        <p className="text-sm text-blue-700">
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
      <h2 className="text-2xl font-bold text-green-600">Welcome to Mix & Mingle!</h2>
      <p className="text-gray-600">
        Your profile has been created successfully. Get ready to discover amazing music and connect with fellow music lovers!
      </p>
      <div className="animate-pulse">
        <Badge variant="outline" className="bg-green-50 text-green-700">
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
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
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
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🎵 Complete Your Profile</h1>
            <p className="text-gray-600">Let's get you set up to connect with the music community</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Step {currentStep === 'basic' ? 1 : currentStep === 'music' ? 2 : 3} of 3</span>
              <span>{getStepProgress()}% complete</span>
            </div>
            <Progress value={getStepProgress()} className="h-2" />
          </div>

          {/* Main Card */}
          <Card>
            <CardHeader>
              <CardTitle>{getStepTitle()}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {currentStep === 'basic' && renderBasicInfoStep()}
              {currentStep === 'music' && renderMusicStep()}
              {currentStep === 'location' && renderLocationStep()}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 'basic' || loading}
                >
                  Back
                </Button>
                
                <Button
                  onClick={handleNext}
                  disabled={!validateStep() || loading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
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
