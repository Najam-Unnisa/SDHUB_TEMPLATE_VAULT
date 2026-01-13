"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Toaster } from "@/components/ui/toaster"
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const supabase = createClient()

  const [mode, setMode] = useState<"login" | "register">("login")
  const [loading, setLoading] = useState(false)
  const [errorText, setErrorText] = useState<string | null>(null)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async () => {
    setErrorText(null)

    if (!email || !password) {
      setErrorText("Email and password are required")
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setErrorText(error.message || "Login failed. Please try again.")
      return
    }

    window.location.href = "/"
  }

  const handleRegister = async () => {
    setErrorText(null)

    if (!email || !password) {
      setErrorText("Email and password are required")
      return
    }

    if (password.length < 6) {
      setErrorText("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setErrorText(error.message || "Signup failed. Please try again.")
      return
    }

    setMode("login")
    setErrorText("Account created successfully. Please log in.")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Toaster />

      <Card className="w-full max-w-md p-8 space-y-6 shadow-sm">
        <div className="flex justify-center mb-0">
            <div className="w-14 h-14 rounded-lg bg-green-600 flex items-center justify-center text-white font-bold">
              SD
            </div>
          </div>
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold">SD HUB</h1>
          <p className="text-sm text-gray-500">Skills Development Hub</p>
        </div>

        {/* Error */}
        {errorText && (
          <div className="rounded-md border border-red-200 bg-red-50 text-red-700 px-4 py-2 text-sm">
            {errorText}
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          {/* Email */}
          <div className="space-y-1">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="Enter Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password with eye toggle */}
          <div className="space-y-1">
            <Label>Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Actions */}
          {mode === "login" ? (
            <>
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>

              <button
                className="w-full text-sm text-green-600 hover:underline"
                onClick={() => setMode("register")}
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={handleRegister}
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>

              <button
                className="w-full text-sm text-green-600 hover:underline"
                onClick={() => setMode("login")}
              >
                Back to login
              </button>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
