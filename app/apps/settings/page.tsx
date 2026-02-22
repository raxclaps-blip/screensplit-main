"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { User, Bell, Palette, Download, Shield, Loader2, Check } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSession, signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

type SettingsResponse = {
  user?: {
    createdAt?: string
  }
  authProviders?: string[]
}

function formatProviderName(provider: string) {
  if (provider === "credentials") return "Email and Password"
  if (provider === "google") return "Google"
  if (provider === "github") return "GitHub"
  if (!provider) return "Unknown"
  return provider.charAt(0).toUpperCase() + provider.slice(1)
}

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const { theme, resolvedTheme, setTheme } = useTheme()
  
  // User profile state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [memberSince, setMemberSince] = useState<string>("")
  const [authProviders, setAuthProviders] = useState<string[]>([])
  
  // Preferences state
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [productUpdates, setProductUpdates] = useState(false)
  const [autoSave, setAutoSave] = useState(true)
  const [highQuality, setHighQuality] = useState(false)
  const [defaultFormat, setDefaultFormat] = useState("png")
  
  // Password change state
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)
  
  // Delete account state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Load user data
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "")
      setEmail(session.user.email || "")
    }
  }, [session])

  useEffect(() => {
    let isMounted = true

    async function loadAccountMetadata() {
      try {
        const response = await fetch("/api/user/settings", {
          method: "GET",
          cache: "no-store",
        })

        if (!response.ok) {
          return
        }

        const data = (await response.json()) as SettingsResponse
        if (!isMounted) return

        setMemberSince(data.user?.createdAt || "")
        setAuthProviders(Array.isArray(data.authProviders) ? data.authProviders : [])
      } catch {
        // Keep profile page functional even when metadata fetch fails.
      }
    }

    if (session?.user?.id) {
      loadAccountMetadata()
    }

    return () => {
      isMounted = false
    }
  }, [session?.user?.id])

  const authProviderLabel =
    authProviders.length > 0
      ? authProviders.map(formatProviderName).join(", ")
      : "Unknown"
  const isOAuthManagedProfile =
    authProviders.includes("google") || authProviders.includes("github")
  const memberSinceLabel = memberSince
    ? new Date(memberSince).toLocaleDateString()
    : session?.user?.createdAt
      ? new Date(session.user.createdAt).toLocaleDateString()
      : ""
  const selectedTheme = theme === "system" ? (resolvedTheme ?? "light") : (theme ?? "light")

  // Load preferences from localStorage
  useEffect(() => {
    const savedPrefs = localStorage.getItem("userPreferences")
    if (savedPrefs) {
      const prefs = JSON.parse(savedPrefs)
      setEmailNotifications(prefs.emailNotifications ?? true)
      setProductUpdates(prefs.productUpdates ?? false)
      setAutoSave(prefs.autoSave ?? true)
      setHighQuality(prefs.highQuality ?? false)
      setDefaultFormat(prefs.defaultFormat ?? "png")
    }
  }, [])

  // Save preferences to localStorage
  const savePreferences = () => {
    const prefs = {
      emailNotifications,
      productUpdates,
      autoSave,
      highQuality,
      defaultFormat,
    }
    localStorage.setItem("userPreferences", JSON.stringify(prefs))
  }

  useEffect(() => {
    savePreferences()
  }, [emailNotifications, productUpdates, autoSave, highQuality, defaultFormat])

  const handleSaveProfile = async () => {
    if (isOAuthManagedProfile) {
      toast.error("Profile details are managed by your OAuth provider.")
      return
    }

    setLoading(true)
    setProfileSaved(false)
    
    try {
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile")
      }

      // Update session
      await update({ name, email })
      
      setProfileSaved(true)
      toast.success("Profile updated successfully")
      
      setTimeout(() => setProfileSaved(false), 3000)
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }

    setPasswordLoading(true)

    try {
      const response = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to change password")
      }

      toast.success("Password changed successfully")
      setShowPasswordDialog(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      toast.error(error.message || "Failed to change password")
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      toast.error('Please type "DELETE" to confirm')
      return
    }

    setDeleteLoading(true)

    try {
      const response = await fetch("/api/user/settings", {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete account")
      }

      toast.success("Account deleted successfully")
      
      // Sign out and redirect
      await signOut({ callbackUrl: "/" })
    } catch (error: any) {
      toast.error(error.message || "Failed to delete account")
      setDeleteLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application preferences</p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Profile</h2>
              <p className="text-sm text-muted-foreground">Update your personal information</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe" 
                className="mt-2" 
                disabled={isOAuthManagedProfile}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com" 
                className="mt-2" 
                disabled={isOAuthManagedProfile}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleSaveProfile} disabled={loading || isOAuthManagedProfile}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : profileSaved ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Saved
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
            <div className="rounded-lg border bg-muted/20 p-3 text-sm">
              {isOAuthManagedProfile && (
                <p className="mb-1 text-muted-foreground">
                  Profile editing is disabled for Google/GitHub authenticated accounts.
                </p>
              )}
              <p className="text-muted-foreground">
                Auth provider: <span className="font-medium text-foreground">{authProviderLabel}</span>
              </p>
              {memberSinceLabel && (
                <p className="mt-1 text-muted-foreground">
                  Joined: <span className="font-medium text-foreground">{memberSinceLabel}</span>
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Notifications</h2>
              <p className="text-sm text-muted-foreground">Configure how you receive updates</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Product Updates</p>
                <p className="text-sm text-muted-foreground">Get notified about new features</p>
              </div>
              <Switch checked={productUpdates} onCheckedChange={setProductUpdates} />
            </div>
          </div>
        </Card>

        {/* Appearance */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Appearance</h2>
              <p className="text-sm text-muted-foreground">Customize the look and feel</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Theme</Label>
              <Select value={selectedTheme} onValueChange={setTheme}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                Default follows your system until you pick Light or Dark.
              </p>
            </div>
          </div>
        </Card>

        {/* Export Settings */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Export Preferences</h2>
              <p className="text-sm text-muted-foreground">Default settings for image exports</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Default Format</Label>
              <Select value={defaultFormat} onValueChange={setDefaultFormat}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jpeg">JPEG</SelectItem>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="webp">WebP</SelectItem>
                  <SelectItem value="avif">AVIF</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                Default format for image exports
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-save Projects</p>
                <p className="text-sm text-muted-foreground">Automatically save your work</p>
              </div>
              <Switch checked={autoSave} onCheckedChange={setAutoSave} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">High Quality Export</p>
                <p className="text-sm text-muted-foreground">Export at maximum quality (larger files)</p>
              </div>
              <Switch checked={highQuality} onCheckedChange={setHighQuality} />
            </div>
          </div>
        </Card>

        {/* Privacy & Security */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Privacy & Security</h2>
              <p className="text-sm text-muted-foreground">Manage your data and security settings</p>
            </div>
          </div>
          <div className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full justify-start bg-transparent"
              onClick={() => setShowPasswordDialog(true)}
            >
              Change Password
            </Button>
            <Separator />
            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:text-destructive bg-transparent"
              onClick={() => setShowDeleteDialog(true)}
            >
              Delete Account
            </Button>
            <p className="text-xs text-muted-foreground">
              Deleting your account will permanently remove all your data and cannot be undone.
            </p>
          </div>
        </Card>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one. Password must be at least 8 characters.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPasswordDialog(false)}
              disabled={passwordLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleChangePassword} disabled={passwordLoading}>
              {passwordLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <p className="text-sm font-medium text-destructive">
                Warning: This will delete:
              </p>
              <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside">
                <li>Your profile and account data</li>
                <li>All your projects and images</li>
                <li>All your settings and preferences</li>
              </ul>
            </div>
            <div>
              <Label htmlFor="deleteConfirmation">
                Type <span className="font-mono font-bold">DELETE</span> to confirm
              </Label>
              <Input
                id="deleteConfirmation"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="DELETE"
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false)
                setDeleteConfirmation("")
              }}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteLoading || deleteConfirmation !== "DELETE"}
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Account"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
