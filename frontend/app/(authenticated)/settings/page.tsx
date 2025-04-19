"use client"

// SettingsPage.js
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Lock } from "lucide-react"
import ProfileTab from "@/components/ProfileTab"
import AccountTab from "@/components/AccountTab"

function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("profile")

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences</p>
          </div>

          <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full md:w-auto">
              <TabsTrigger value="profile">
                <User className="mr-2 h-4 w-4 md:mr-0 lg:mr-2" />
                <span className="hidden md:inline-flex lg:inline-flex">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="account">
                <Lock className="mr-2 h-4 w-4 md:mr-0 lg:mr-2" />
                <span className="hidden md:inline-flex lg:inline-flex">Account</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <ProfileTab isLoading={isLoading} />
            </TabsContent>

            <TabsContent value="account">
              <AccountTab isLoading={isLoading} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

export default SettingsPage;