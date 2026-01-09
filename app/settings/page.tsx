"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"

import {
  User,
  LogOut,
  Upload,
  Plus,
  FileText,
  Trash2,
  Lock,
  ArrowLeft,
} from "lucide-react"

export default function SettingsPage() {
  const { toast } = useToast()

  /* ---------------- USER STATE ---------------- */
  const [user, setUser] = useState({
    name: "Admin User",
    email: "admin@example.com",
    role: "Administrator",
  })

  /* ---------------- PROFILE IMAGE ---------------- */
//   const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

//   const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (!file) return

//     if (!file.type.startsWith("image/")) {
//       toast({ title: "Please select an image file", variant: "destructive" })
//       return
//     }

//     const previewUrl = URL.createObjectURL(file)
//     setAvatarPreview(previewUrl)
//     toast({ title: "Profile image updated" })
//   }

  /* ---------------- PDF UPLOADS ---------------- */
  const [pdfs, setPdfs] = useState<File[]>([])

  const onPdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const validPdfs = Array.from(files).filter(
      (file) => file.type === "application/pdf"
    )

    if (validPdfs.length === 0) {
      toast({ title: "Only PDF files are allowed", variant: "destructive" })
      return
    }

    setPdfs((prev) => [...prev, ...validPdfs])
    toast({ title: "PDF(s) added" })
  }

  const removePdf = (index: number) => {
    setPdfs((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-white">
      <Toaster />

      {/* ================= HEADER ================= */}
      <header className="w-full border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="w-full px-6 py-3 flex items-center justify-between">
          {/* LEFT */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => (window.location.href = "/")}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Home
            </Button>
          </div>

          {/* CENTER */}
          <div className="flex-1 text-center">
            <div className="text-lg font-semibold">Profile Settings</div>
            <div className="text-xs text-gray-500">Admin Dashboard</div>
          </div>

          {/* RIGHT */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                <User />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-3 py-2 text-sm">
                <div className="font-medium">{user.name}</div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => (window.location.href = "/login")}
              >
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* ================= CONTENT ================= */}
      <main className="max-w-4xl mx-auto p-6 space-y-6">

        {/* PERSONAL INFO */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Personal Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input
                value={user.name}
                onChange={(e) =>
                  setUser({ ...user, name: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input value={user.email} disabled />
            </div>

            <div>
              <Label>Role</Label>
              <Input value={user.role} disabled />
            </div>
          </div>
        </Card>

        {/* PROFILE IMAGE */}
        {/* <Card className="p-6">
          <h3 className="font-semibold mb-4">Profile Image</h3>

          <div className="flex items-center gap-6">
            <Avatar className="h-16 w-16">
              <AvatarImage src={avatarPreview ?? undefined} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>

            <label>
              <Input
                type="file"
                accept="image/*"
                onChange={onAvatarChange}
                className="hidden"
              />
              <Button variant="outline" type="button">
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
            </label>
          </div>
        </Card> */}

        {/* PDF UPLOADS */}
        <Card className="p-6">
          <h3 className="font-semibold mb-1">Resume / CV PDFs</h3>
          <p className="text-sm text-gray-500 mb-4">
            Upload one or more PDF files
          </p>

          <div className="space-y-3">
            {pdfs.map((pdf, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between border rounded-md p-3 text-sm"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-500" />
                  {pdf.name}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePdf(idx)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            <label>
              <Input
                type="file"
                accept="application/pdf"
                multiple
                onChange={onPdfChange}
                className="hidden"
              />
              <Button variant="outline" className="w-full" type="button">
                <Plus className="w-4 h-4 mr-2" />
                Add PDF
              </Button>
            </label>
          </div>
        </Card>

        {/* ACCOUNT ACTIONS */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Account Actions</h3>

          <div className="flex flex-col gap-3">
            <Button variant="outline">
              <Lock className="w-4 h-4 mr-2" />
              Change Password
            </Button>

            <Button
              variant="destructive"
              onClick={() => (window.location.href = "/login")}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </Card>
      </main>
    </div>
  )
}
