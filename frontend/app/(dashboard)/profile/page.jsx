"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { DashboardHeader } from "@/components/dashboard-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { User, Lock, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, logout, updatePassword, deleteAccount } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    bio: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Profile Updated", {
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      toast.error("Error", {
        description: "Failed to update profile information.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Password Mismatch", {
        description: "New password and confirm password do not match.",
      });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password Too Short", {
        description: "Password must be at least 6 characters long.",
      });
      setLoading(false);
      return;
    }

    try {
      const result = await updatePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      if (result.success) {
        toast.success("Password Updated", {
          description: "Your password has been updated successfully.",
        });

        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error("Error", {
          description: result.error || "Failed to update password.",
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to update password.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      try {
        setLoading(true);

        const result = await deleteAccount();

        if (result.success) {
          toast.success("Account Deleted", {
            description: "Your account has been deleted successfully.",
          });
          // The deleteAccount function already handles logout by setting user to null
        } else {
          toast.error("Error", {
            description: result.error || "Failed to delete account.",
          });
        }
      } catch (error) {
        toast.error("Error", {
          description: "Failed to delete account.",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.avatar || "/placeholder.svg"} />
              <AvatarFallback className="text-2xl">
                {user?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("") || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">{user?.name}</h1>
              <p className="text-muted-foreground">{user?.email}</p>
              <Badge variant="secondary" className="mt-2">
                Active Member
              </Badge>
            </div>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information and profile details.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="flex items-center gap-4 mb-6">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {user?.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Change Avatar
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              name: e.target.value,
                            })
                          }
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              email: e.target.value,
                            })
                          }
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            phone: e.target.value,
                          })
                        }
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <textarea
                        id="bio"
                        className="w-full min-h-[100px] px-3 py-2 border border-input bg-background rounded-md text-sm"
                        value={profileData.bio}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            bio: e.target.value,
                          })
                        }
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <Button type="submit" disabled={loading}>
                      {loading ? "Updating..." : "Update Profile"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                        placeholder="Enter your current password"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        placeholder="Enter your new password"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                        placeholder="Confirm your new password"
                        required
                      />
                    </div>

                    <Button type="submit" disabled={loading}>
                      {loading ? "Updating..." : "Update Password"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive">
                    Danger Zone
                  </CardTitle>
                  <CardDescription>
                    Irreversible and destructive actions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Delete Account</p>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all associated data
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
