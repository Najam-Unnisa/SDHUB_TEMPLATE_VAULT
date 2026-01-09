"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Lock, User } from "lucide-react"

const DEMO_USER = {
  email: "demo@sdhub.com",
  password: "demo123",
}

export default function LoginPage() {
  const { toast } = useToast()

  const [form, setForm] = useState({
    email: "",
    password: "",
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

    // ✅ DEMO AUTH CHECK
    if (
      form.email === DEMO_USER.email &&
      form.password === DEMO_USER.password
    ) {
      toast({ title: "Login successful" })
      window.location.href = "/"
    } else {
      toast({
        title: "Invalid credentials",
        description: "Use the demo account to login",
        variant: "destructive",
      })
    }
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
          <div>
            <Label>Email</Label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                type="email"
                className="pl-9"
                placeholder="demo@sdhub.com"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <Label>Password</Label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                type="password"
                className="pl-9"
                placeholder="demo123"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
            </div>
          </div>

          <Button
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={handleLogin}
          >
            Login
          </Button>

          {/* DEMO HINT */}
          <div className="text-xs text-gray-500 text-center mt-2">
            Demo login: <br />
            <span className="font-medium">demo@sdhub.com</span> /{" "}
            <span className="font-medium">demo123</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
