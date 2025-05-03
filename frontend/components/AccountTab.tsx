"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { LogOut } from "lucide-react"
import { useAuth } from "@/contexts"
import { toast } from "sonner"

interface Props {
  isLoading: boolean
}

function AccountTab({ isLoading }: Props) {
  const { deleteAccount, updatePassword } = useAuth()
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [isUpdating, setIsUpdating] = useState(false)

  const handleDelete = async () => {
    await deleteAccount()
  }

  const handleUpdatePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match")
      return
    }

    if (!passwords.oldPassword || !passwords.newPassword) {
      toast.error("Please fill in all password fields")
      return
    }

    setIsUpdating(true)
    try {
      await updatePassword({
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      })
      // Reset form (though user will be redirected after password update)
      setPasswords({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      })
    } catch (error) {
      console.error("Password update error:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Security</CardTitle>
        <CardDescription>Manage your account security and privacy settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div className="space-y-2" key={i}>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))
        ) : (
          <>
            <div className="space-y-4">
              <h3 className="font-medium">Change Password</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input 
                    id="current-password" 
                    type="password"
                    value={passwords.oldPassword}
                    onChange={(e) => setPasswords(prev => ({
                      ...prev,
                      oldPassword: e.target.value
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input 
                    id="new-password" 
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords(prev => ({
                      ...prev,
                      newPassword: e.target.value
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input 
                    id="confirm-password" 
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords(prev => ({
                      ...prev,
                      confirmPassword: e.target.value
                    }))}
                  />
                </div>
                <Button 
                  onClick={handleUpdatePassword}
                  disabled={isUpdating}
                >
                  {isUpdating ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-medium text-red-500">Danger Zone</h3>
              <div className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/50">
                <div className="flex flex-col space-y-2">
                  <h4 className="font-medium text-red-800 dark:text-red-300">Delete Account</h4>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    Once you delete your account, there is no going back. This action cannot be undone.
                  </p>
                  <Button variant="outline" className="mt-2 w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 md:w-auto" onClick={handleDelete} disabled={isLoading}>
                    {isLoading ? "Deleting..." : (
                      <>
                        <LogOut className="mr-2 h-4 w-4" />
                        Delete Account
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default AccountTab
