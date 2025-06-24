'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  X, 
  Plus,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface ProfileFormData {
  username: string;
  full_name: string;
  bio: string;
  location: string;
  website: string;
  music_preferences: string[];
  is_dj: boolean;
}

export default function ProfileEditPage() {
  const { user, profile, updateProfile, loading } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState<ProfileFormData>({
    username: '',
    full_name: '',
    bio: '',
    location: '',
    website: '',
    music_preferences: [],
    is_dj: false,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [newGenre, setNewGenre] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
        music_preferences: profile.music_preferences || [],
        is_dj: profile.is_dj || false,
      });
      setAvatarPreview(profile.avatar_url || '');
    }
  }, [profile]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(formData.username)) {
      newErrors.username = 'Username must be 3-20 characters, letters, numbers, and underscores only';
    }

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = 'Full name must be at least 2 characters';
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be 500 characters or less';
    }

    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleInputChange = (field: keyof ProfileFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    if (isSaved) {
      setIsSaved(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({ ...prev, avatar: 'File size must be less than 5MB' }));
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, avatar: 'File must be an image' }));
        return;
      }
      
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      if (errors.avatar) {
        setErrors(prev => ({ ...prev, avatar: '' }));
      }
    }
  };

  const addMusicGenre = () => {
    if (newGenre.trim() && !formData.music_preferences.includes(newGenre.trim())) {
      setFormData(prev => ({
        ...prev,
        music_preferences: [...prev.music_preferences, newGenre.trim()]
      }));
      setNewGenre('');
    }
  };

  const removeMusicGenre = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      music_preferences: prev.music_preferences.filter(g => g !== genre)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Upload avatar if changed
      let avatar_url = avatarPreview;
      
      if (avatarFile) {
        // Here you would upload to Supabase Storage
        // For now, we'll keep the existing URL
      }

      const { error } = await updateProfile({
        username: formData.username,
        full_name: formData.full_name,
        bio: formData.bio,
        location: formData.location,
        website: formData.website,
        music_preferences: formData.music_preferences,
        is_dj: formData.is_dj,
        avatar_url,
        profile_completed: true,
      });

      if (error) {
        if (error.message.includes('username')) {
          setErrors({ username: 'Username is already taken' });
        } else {
          setErrors({ general: error.message });
        }
      } else {
        setIsSaved(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      }
    } catch (err) {
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-900/20 to-black">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (isSaved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-900/20 to-black">
        <Card className="w-full max-w-md bg-black/80 border-purple-500/30">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Profile Updated!</h2>
              <p className="text-gray-400">Your profile has been successfully updated.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black">
      {/* Header */}
      <header className="border-b border-purple-500/30 bg-black/40 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="border-purple-400 text-purple-400 hover:bg-purple-400/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Error Alert */}
          {errors.general && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Card className="bg-black/40 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">Profile Information</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={avatarPreview} alt="Profile" />
                    <AvatarFallback className="bg-purple-600 text-white text-lg">
                      {getInitials(formData.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex flex-col items-center space-y-2">
                    <Label htmlFor="avatar" className="cursor-pointer">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-purple-400 text-purple-400 hover:bg-purple-400/10"
                        asChild
                        aria-label="Change profile avatar"
                      >
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          Change Avatar
                        </span>
                      </Button>
                    </Label>
                    <input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    {errors.avatar && (
                      <p className="text-sm text-red-400">{errors.avatar}</p>
                    )}
                  </div>
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-white">Username *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className="bg-gray-900/50 border-gray-600 text-white placeholder-gray-400"
                    placeholder="Enter username"
                  />
                  {errors.username && (
                    <p className="text-sm text-red-400">{errors.username}</p>
                  )}
                </div>

                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-white">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    className="bg-gray-900/50 border-gray-600 text-white placeholder-gray-400"
                    placeholder="Enter your full name"
                  />
                  {errors.full_name && (
                    <p className="text-sm text-red-400">{errors.full_name}</p>
                  )}
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-white">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="bg-gray-900/50 border-gray-600 text-white placeholder-gray-400 min-h-[100px]"
                    placeholder="Tell us about yourself..."
                    maxLength={500}
                  />
                  <div className="flex justify-between text-sm">
                    {errors.bio && <p className="text-red-400">{errors.bio}</p>}
                    <p className="text-gray-400 ml-auto">{formData.bio.length}/500</p>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-white">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="bg-gray-900/50 border-gray-600 text-white placeholder-gray-400"
                    placeholder="City, Country"
                  />
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-white">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="bg-gray-900/50 border-gray-600 text-white placeholder-gray-400"
                    placeholder="https://yourwebsite.com"
                  />
                  {errors.website && (
                    <p className="text-sm text-red-400">{errors.website}</p>
                  )}
                </div>

                {/* Music Preferences */}
                <div className="space-y-4">
                  <Label className="text-white">Music Preferences</Label>
                  
                  <div className="flex flex-wrap gap-2">
                    {formData.music_preferences.map((genre, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="border-purple-400 text-purple-400 pl-2 pr-1 py-1"
                      >
                        {genre}
                        <button
                          type="button"
                          onClick={() => removeMusicGenre(genre)}
                          className="ml-1 hover:bg-purple-400/20 rounded-full p-0.5"
                          aria-label={`Remove genre ${genre}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Input
                      value={newGenre}
                      onChange={(e) => setNewGenre(e.target.value)}
                      className="bg-gray-900/50 border-gray-600 text-white placeholder-gray-400"
                      placeholder="Add music genre"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMusicGenre())}
                    />
                    <Button
                      type="button"
                      onClick={addMusicGenre}
                      variant="outline"
                      size="sm"
                      className="border-purple-400 text-purple-400 hover:bg-purple-400/10"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* DJ Status */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_dj"
                    checked={formData.is_dj}
                    onChange={(e) => handleInputChange('is_dj', e.target.checked)}
                    className="rounded border-gray-600 bg-gray-900 text-purple-600 focus:ring-purple-500"
                  />
                  <Label htmlFor="is_dj" className="text-white">I'm a DJ</Label>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="border-gray-600 text-gray-400 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                
                <Button
                  type="submit"
                  disabled={isLoading || !validateForm()}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Profile
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
