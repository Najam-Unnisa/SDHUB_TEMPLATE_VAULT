"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Lock, User, Eye, EyeOff } from "lucide-react"
const DEMO_USER = {
  email: "najma@gmail.com",
  password: "najma123",
}
const user1 = {
  email: "zohra@gmail.com",
  password: "zohra123",
}
const user2 = {
  email: "rasool@gmail.com",
  password: "rasool123",
}
const user3 = {
  email: "JD@gmail.com",
  password: "JD123",
}
const user4 = {
  email: "nisar@gmail.com",
  password: "nisar123",
}

export default function LoginPage() {
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login")

  const [form, setForm] = useState({
    email: "",
    password: "",
  })

  const [registerForm, setRegisterForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [forgotForm, setForgotForm] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleLogin = () => {
    if (!form.email || !form.password) {
      toast({
        title: "Missing fields",
        description: "Please enter email and password",
        variant: "destructive",
      })
      return
    }

    const validUsers = [DEMO_USER, user1, user2, user3, user4]
    
    // Check hardcoded users
    let isValid = validUsers.some(
      (user) => user.email === form.email && user.password === form.password
    )

    // Check localStorage for registered users
    if (!isValid) {
      const registeredUsers = JSON.parse(localStorage.getItem("users") || "[]")
      isValid = registeredUsers.some(
        (user: any) => user.email === form.email && user.password === form.password
      )
    }

    if (isValid) {
      toast({
        title: "Login successful",
        className: "bg-green-600 text-white border-green-600",
      })
      setTimeout(() => {
        window.location.href = "/"
      }, 500)
    } else {
      toast({
        title: "Email or password is incorrect",
        variant: "destructive",
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (mode === "login") {
        handleLogin()
      } else if (mode === "register") {
        handleRegister()
      } else if (mode === "forgot") {
        handleForgotPassword()
      }
    }
  }

  const handleRegister = () => {
    if (!registerForm.email || !registerForm.password || !registerForm.confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      toast({
        title: "Passwords don't match",
        variant: "destructive",
      })
      return
    }

    if (registerForm.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      })
      return
    }

    // Store new user in localStorage
    const newUser = {
      email: registerForm.email,
      password: registerForm.password,
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const userExists = users.some((u: any) => u.email === registerForm.email)

    if (userExists) {
      toast({
        title: "Email already registered",
        variant: "destructive",
      })
      return
    }

    users.push(newUser)
    localStorage.setItem("users", JSON.stringify(users))

    toast({
      title: "Registration successful",
      className: "bg-green-600 text-white border-green-600",
    })

    setMode("login")
    setRegisterForm({ email: "", password: "", confirmPassword: "" })
  }

  const handleForgotPassword = () => {
    if (!forgotForm.email || !forgotForm.newPassword || !forgotForm.confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    if (forgotForm.newPassword !== forgotForm.confirmPassword) {
      toast({
        title: "Passwords don't match",
        variant: "destructive",
      })
      return
    }

    // Update password in default users or localStorage
    const allUsers = [DEMO_USER, user1, user2, user3, user4]
    const userIndex = allUsers.findIndex((u) => u.email === forgotForm.email)

    if (userIndex === -1) {
      // Check localStorage
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const localUserIndex = users.findIndex((u: any) => u.email === forgotForm.email)

      if (localUserIndex === -1) {
        toast({
          title: "Email not found",
          variant: "destructive",
        })
        return
      }

      users[localUserIndex].password = forgotForm.newPassword
      localStorage.setItem("users", JSON.stringify(users))
    }

    toast({
      title: "Password updated successfully",
      className: "bg-green-600 text-white border-green-600",
    })

    setMode("login")
    setForgotForm({ email: "", newPassword: "", confirmPassword: "" })
  }

  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Toaster />

      <Card className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center text-white font-bold">
              S
            </div>
          </div>
          <h1 className="text-lg font-semibold">SD HUB</h1>
          <p className="text-sm text-gray-500">
            Skills Development Hub
          </p>
        </div>

        <div className="space-y-4">
          {mode === "login" && (
            <>
              <div>
                <Label>Email</Label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    type="email"
                    className="pl-9"
                    placeholder="Enter Your Email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    onKeyPress={handleKeyPress}
                  />
                </div>
              </div>

              <div>
                <Label>Password</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    className="pl-9 pr-10"
                    placeholder="Enter Your Password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    onKeyPress={handleKeyPress}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={handleLogin}
              >
                Login
              </Button>

              <div className="flex gap-2 text-sm">
                <button
                  onClick={() => setMode("register")}
                  className="text-blue-600 hover:underline flex-1"
                >
                  Create Account
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => setMode("forgot")}
                  className="text-blue-600 hover:underline flex-1"
                >
                  Forgot Password?
                </button>
              </div>
            </>
          )}

          {mode === "register" && (
            <>
              <div>
                <Label>Email</Label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    type="email"
                    className="pl-9"
                    placeholder="Enter Your Email"
                    value={registerForm.email}
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, email: e.target.value })
                    }
                    onKeyPress={handleKeyPress}
                  />
                </div>
              </div>

              <div>
                <Label>Password</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    className="pl-9 pr-10"
                    placeholder="Enter Password"
                    value={registerForm.password}
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, password: e.target.value })
                    }
                    onKeyPress={handleKeyPress}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <Label>Confirm Password</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    className="pl-9 pr-10"
                    placeholder="Confirm Password"
                    value={registerForm.confirmPassword}
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, confirmPassword: e.target.value })
                    }
                    onKeyPress={handleKeyPress}
                  />
                </div>
              </div>

              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={handleRegister}
              >
                Create Account
              </Button>

              <button
                onClick={() => setMode("login")}
                className="w-full text-blue-600 hover:underline text-sm"
              >
                Back to Login
              </button>
            </>
          )}

          {mode === "forgot" && (
            <>
              <div>
                <Label>Email</Label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    type="email"
                    className="pl-9"
                    placeholder="Enter Your Email"
                    value={forgotForm.email}
                    onChange={(e) =>
                      setForgotForm({ ...forgotForm, email: e.target.value })
                    }
                    onKeyPress={handleKeyPress}
                  />
                </div>
              </div>

              <div>
                <Label>New Password</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    className="pl-9 pr-10"
                    placeholder="Enter New Password"
                    value={forgotForm.newPassword}
                    onChange={(e) =>
                      setForgotForm({ ...forgotForm, newPassword: e.target.value })
                    }
                    onKeyPress={handleKeyPress}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <Label>Confirm Password</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    className="pl-9 pr-10"
                    placeholder="Confirm Password"
                    value={forgotForm.confirmPassword}
                    onChange={(e) =>
                      setForgotForm({ ...forgotForm, confirmPassword: e.target.value })
                    }
                    onKeyPress={handleKeyPress}
                  />
                </div>
              </div>

              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={handleForgotPassword}
              >
                Reset Password
              </Button>

              <button
                onClick={() => setMode("login")}
                className="w-full text-blue-600 hover:underline text-sm"
              >
                Back to Login
              </button>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
