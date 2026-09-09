import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import api from "@/lib/axios";
import { AppLayout } from "@/pages/Layout/app-layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  CircleUserRoundIcon,
  MailIcon,
  ShieldIcon,
  KeyRoundIcon,
  CheckCircle2Icon,
  UserCheckIcon,
  Loader2Icon,
} from "lucide-react";

export default function AccountPage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const getInitials = (nameStr: string) => {
    if (!nameStr) return "TP";
    return nameStr
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const res = await api.patch("/users/me", { name, email });
      const updatedUser = res.data;
      updateUser({
        name: updatedUser.name || name,
        email: updatedUser.email || email,
      });
      toast.success("Profile details updated successfully!");
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to update profile details",
      );
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match", {
        description: "Re-enter the new password and confirm it.",
      });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await api.post("/users/me/password", { currentPassword, newPassword });
      toast.success("Password updated successfully!");
      setPasswordSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSaved(false), 3000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <AppLayout title="Account & Profile">
      <div className="flex flex-col gap-6 mx-auto w-full pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Account & Profile
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your personal identity, login credentials, and security settings.
            </p>
          </div>
        </div>

        {/* User Identity Banner Card */}
        <Card className="shadow-xs border bg-card/60 backdrop-blur-xs">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <Avatar className="size-16 rounded-xl border-2 border-primary/20">
                <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-bold text-xl">
                  {getInitials(user?.name || "")}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1.5 text-center sm:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl font-bold text-foreground">
                    {user?.name || "Team Member"}
                  </h2>
                  <Badge variant="secondary" className="font-semibold text-xs gap-1">
                    <ShieldIcon className="size-3 text-primary" />
                    {user?.role === "MANAGER" ? "Manager Portal" : "Team Member"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5">
                  <MailIcon className="size-3.5" />
                  {user?.email || "user@teampulse.com"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile & Security Forms Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information Form */}
          <Card className="shadow-xs border">
            <CardHeader className="border-b bg-muted/15 pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CircleUserRoundIcon className="size-4 text-primary" />
                Personal Details
              </CardTitle>
              <CardDescription>
                Update your display name and registered email address.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-10 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 text-sm"
                    required
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  {profileSaved ? (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2Icon className="size-3.5" /> Profile updated!
                    </span>
                  ) : (
                    <span />
                  )}
                  <Button type="submit" size="sm" disabled={isUpdatingProfile} className="gap-2 font-medium cursor-pointer">
                    {isUpdatingProfile ? (
                      <Loader2Icon className="size-4 animate-spin" />
                    ) : (
                      <UserCheckIcon className="size-4" />
                    )}
                    Save Details
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Change Password Form */}
          <Card className="shadow-xs border">
            <CardHeader className="border-b bg-muted/15 pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <KeyRoundIcon className="size-4 text-amber-500" />
                Security & Password
              </CardTitle>
              <CardDescription>
                Ensure your account is using a strong password.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Current Password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="h-10 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    New Password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-10 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-10 text-sm"
                    required
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  {passwordSaved ? (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2Icon className="size-3.5" /> Password updated!
                    </span>
                  ) : (
                    <span />
                  )}
                  <Button type="submit" size="sm" variant="outline" disabled={isUpdatingPassword} className="gap-2 font-medium cursor-pointer">
                    {isUpdatingPassword ? (
                      <Loader2Icon className="size-4 animate-spin" />
                    ) : (
                      <KeyRoundIcon className="size-4 text-amber-500" />
                    )}
                    Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
