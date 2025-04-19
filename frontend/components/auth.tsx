"use client"

import { useState } from "react"
import { Eye, EyeOff, LogIn, Mail, Lock, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import Link from "next/link"

export function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoginMode, setIsLoginMode] = useState(true)
  
  // Form fields
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      
      if (isLoginMode) {
        // Login logic
        toast.success("Login successful", {
          description: "Welcome back!",
          duration: 3000
        })
        // Redirect after successful login
        // window.location.href = "/dashboard"
      } else {
        // Registration logic
        toast.success("Registration successful", {
          description: "Your account has been created",
          duration: 3000
        })
        // Redirect or switch to login mode
        setIsLoginMode(true)
      }
    }, 1500)
  }

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode)
    // Reset form fields when switching modes
    setPassword("")
    setConfirmPassword("")
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-6">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center">
              <LogIn className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {isLoginMode ? "Sign In" : "Create Account"}
          </CardTitle>
          <CardDescription className="text-center">
            {isLoginMode 
              ? "Enter your credentials to access your account" 
              : "Fill in your details to create a new account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginMode && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="fullName" 
                    type="text" 
                    placeholder="John Doe"
                    className="pl-10"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLoginMode}
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {isLoginMode && (
                  <a href="#" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </a>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            
            {!isLoginMode && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="confirmPassword" 
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required={!isLoginMode}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  {isLoginMode ? "Signing In..." : "Creating Account..."}
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  {isLoginMode ? "Sign In" : "Create Account"}
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t"></span>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-2 text-muted-foreground">OR</span>
            </div>
          </div>
          <div className="text-center text-sm">
            {isLoginMode ? (
              <>
                Don't have an account?{" "}
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary"
                  onClick={toggleMode}
                >
                  Create an account
                </Button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary"
                  onClick={toggleMode}
                >
                  Sign in
                </Button>
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}