"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts"; // Import useAuth
import { toast } from "sonner";

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, register, isLoading } = useAuth(); // Use the hook

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (isLogin) {
      if (!email || !password) {
        toast.error("Please enter email and password.");
        return;
      }
      await login({ email, password });
    } else {
      if (!name || !email || !password) {
        toast.error("Please fill in all fields for registration.");
        return;
      }
      await register({ name, email, password });
      // Reset form after successful registration attempt (or move to login)
      setName("");
      setEmail("");
      setPassword("");
      setIsLogin(true); // Switch to login view after registration attempt
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-card-foreground">
          {isLogin ? "Login" : "Register"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
                disabled={isLoading}
              />
            </div>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Processing..." : isLogin ? "Login" : "Register"}
          </Button>
        </form>
        <p className="text-sm text-center text-muted-foreground">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <Button
            variant="link"
            className="p-0 h-auto"
            onClick={() => setIsLogin(!isLogin)}
            disabled={isLoading}
          >
            {isLogin ? "Register" : "Login"}
          </Button>
        </p>
      </div>
    </div>
  );
}