
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile, UpdateProfileData, updateUserProfile, UserProfile } from "@/lib/user";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Camera, Loader2, Mail } from "lucide-react";
import Image from "next/image";
import React from "react";
import { toast } from "sonner";
import { Avatar } from "./ui/avatar";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

export const ProfileDialog = ({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
}) => {
  const { login } = useAuth();
  const [profileData, setProfileData] = React.useState({
    name: user?.name || '',
    bio: user?.bio || '',
    profileImageUrl: user?.profileImageUrl || '',
  });
  const [fullProfile, setFullProfile] = React.useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);


  React.useEffect(() => {
    if (open && user) {
      fetchUserProfile();
    }
  }, [open, user]);

  const fetchUserProfile = async () => {
    setIsFetchingProfile(true);
    try {
      const profile = await getUserProfile();
      setFullProfile(profile);
      setProfileData({
        name: profile.name,
        bio: profile.bio || '',
        profileImageUrl: profile.profileImageUrl || '',
      });
    } catch (error) {
      toast.error('Failed to fetch profile data');
      console.error('Error fetching profile:', error);
    } finally {
      setIsFetchingProfile(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const updateData: UpdateProfileData = {};


      if (profileData.name !== user?.name) {
        updateData.name = profileData.name;
      }
      if (profileData.bio !== user?.bio) {
        updateData.bio = profileData.bio;
      }
      if (profileData.profileImageUrl !== user?.profileImageUrl) {
        updateData.profileImageUrl = profileData.profileImageUrl;
      }


      if (Object.keys(updateData).length > 0) {
        const updatedProfile = await updateUserProfile(updateData);


        const token = localStorage.getItem('auth_token');
        if (token) {
          login(token, {
            ...user,
            name: updatedProfile.name,
            bio: updatedProfile.bio,
            profileImageUrl: updatedProfile.profileImageUrl,
          });
        }

        toast.success('Profile updated successfully!');
      } else {
        toast.info('No changes to save');
      }

      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;


    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }


    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsLoading(true);
    try {


      const reader = new FileReader();
      reader.onload = () => {
        setProfileData(prev => ({ ...prev, profileImageUrl: reader.result as string }));
        toast.success('Image selected! Click Save Changes to update your profile.');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Failed to process image');
      console.error('Error uploading image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Profile Settings</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            View and edit your profile information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {isFetchingProfile ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading profile...</span>
            </div>
          ) : (
            <>
              {/* Profile Picture Section */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Image
                        src={profileData.profileImageUrl || "/images/avatar1.jpg"}
                        alt={profileData.name || "User Avatar"}
                        width={80}
                        height={80}
                        className="rounded-full w-full h-full object-cover"
                      />
                    </AvatarFallback>
                    {profileData.profileImageUrl && (
                      <AvatarImage src={profileData.profileImageUrl} alt={profileData.name} />
                    )}
                  </Avatar>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    <Camera className="h-3 w-3" />
                  </button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  Change Photo
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Profile Stats */}
              {fullProfile && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{fullProfile._count.events}</div>
                    <div className="text-sm text-muted-foreground">Events Created</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{fullProfile._count.event_participants}</div>
                    <div className="text-sm text-muted-foreground">Events Joined</div>
                  </div>
                </div>
              )}

              {/* Profile Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    placeholder="Enter your full name"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      placeholder="Email address"
                      className="pl-10"
                      disabled
                      readOnly
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    className="resize-none"
                    disabled={isLoading}
                  />
                </div>

                {fullProfile && (
                  <div className="space-y-2">
                    <Label>Member Since</Label>
                    <div className="text-sm text-muted-foreground">
                      {new Date(fullProfile.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSaveProfile}
              className="flex-1"
              disabled={isLoading || isFetchingProfile}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
