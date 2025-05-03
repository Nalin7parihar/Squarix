"use client"

import { useState } from "react"
import { Save, Sun, Moon } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useTheme } from "next-themes"
interface Props {
  isLoading: boolean
}

function ProfileTab({ isLoading }: Props) {
  const [darkMode, setDarkMode] = useState(false)

  const [profile, setProfile] = useState({
    name: "Jamie Doe",
    email: "jamie.doe@example.com"
  })

  const handleSaveProfile = () => {
    toast("Profile updated", {
      description: "Your profile information has been saved.",
      duration: 3000
    })
  }
   const {setTheme} = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your personal information and contact details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <>
            {[...Array(3)].map((_, i) => (
              <div className="space-y-2" key={i}>
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Theme</Label>
                  <p className="text-sm text-muted-foreground">Toggle between light and dark mode</p>
                </div>
                <div className="flex items-center space-x-2">
                  
                  <Moon className="h-4 w-4" />
                  <Switch checked={darkMode} onCheckedChange={() =>{
                    setDarkMode(!darkMode)
                    setTheme(darkMode ? "dark" : "light")
                  }} />
                  <Sun className="h-4 w-4" />
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveProfile} className="ml-auto bg-gradient-to-r from-primary to-primary/80">
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  )
}

export default ProfileTab
