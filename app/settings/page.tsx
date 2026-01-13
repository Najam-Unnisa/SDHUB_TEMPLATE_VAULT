"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

import {
  ArrowLeft,
  FileText,
  Plus,
  Trash2,
  Loader2,
  Lock,
  LogOut,
} from "lucide-react"

type Pdf = {
  id: string
  file_name: string
  file_url: string
  created_at: string
}

export default function SettingsPage() {
  const supabase = createClient()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [authUser, setAuthUser] = useState<any>(null)

  const [loadingUser, setLoadingUser] = useState(true)
  const [savingUser, setSavingUser] = useState(false)
  const [uploadingPdf, setUploadingPdf] = useState(false)

  const [user, setUser] = useState({
    name: "",
    email: "",
    role: "",
  })

  const [pdfs, setPdfs] = useState<Pdf[]>([])

  /* ---------------- AUTH CHECK ---------------- */
  useEffect(() => {
    getAuthUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getAuthUser = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      window.location.href = "/login"
      return
    }

    setAuthUser(user)
    loadUser(user.id)
    loadPdfs(user.id)
  }

  /* ---------------- LOAD USER ---------------- */
  const loadUser = async (userId: string) => {
    setLoadingUser(true)

    const { data, error } = await supabase
      .from("users")
      .select("name, email, role")
      .eq("id", userId)
      .single()

    if (error) {
      toast({ title: error.message, variant: "destructive" })
    } else if (data) {
      setUser(data)
    }

    setLoadingUser(false)
  }

  /* ---------------- LOAD PDFS ---------------- */
  const loadPdfs = async (userId: string) => {
    const { data } = await supabase
      .from("user_documents")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (data) setPdfs(data)
  }

  /* ---------------- SAVE USER ---------------- */
  const saveUser = async () => {
    if (!authUser) return

    setSavingUser(true)

    const { error } = await supabase
      .from("users")
      .update({
        name: user.name,
        email: user.email,
      })
      .eq("id", authUser.id)

    setSavingUser(false)

    if (error) {
      toast({ title: "Failed to save changes", variant: "destructive" })
    } else {
      toast({ title: "Profile updated" })
    }
  }

  /* ---------------- PDF UPLOAD ---------------- */
  const onPdfChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!authUser) return

    const files = e.target.files
    if (!files) return

    setUploadingPdf(true)

    for (const file of Array.from(files)) {
      if (file.type !== "application/pdf") continue

      const path = `${authUser.id}/${Date.now()}-${file.name}`

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(path, file)

      if (uploadError) {
        toast({ title: uploadError.message, variant: "destructive" })
        continue
      }

      const { data } = supabase.storage
        .from("documents")
        .getPublicUrl(path)

      await supabase.from("user_documents").insert({
        user_id: authUser.id,
        file_name: file.name,
        file_url: data.publicUrl,
      })
    }

    setUploadingPdf(false)
    toast({ title: "PDF uploaded" })
    loadPdfs(authUser.id)

    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  /* ---------------- PDF DELETE ---------------- */
  const removePdf = async (pdf: Pdf) => {
    const path = pdf.file_url.split("/documents/")[1]

    await supabase.storage.from("documents").remove([path])
    await supabase.from("user_documents").delete().eq("id", pdf.id)

    toast({ title: "PDF deleted" })
    loadPdfs(authUser.id)
  }

  /* ---------------- LOGOUT ---------------- */
  const logout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <div className="min-h-screen bg-white">
      <Toaster />

      {/* HEADER */}
      <header className="w-full border-b bg-white sticky top-0 z-50">
        <div className="px-6 py-3 flex items-center justify-between">
          <Button variant="ghost" onClick={() => (window.location.href = "/")}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Home
          </Button>

          <div className="text-center">
            <div className="text-lg font-semibold">Profile Settings</div>
            <div className="text-xs text-gray-500">Admin Dashboard</div>
          </div>

          <Button variant="ghost" onClick={logout}>
            <LogOut className="w-4 h-4 mr-1" />
            Logout
          </Button>
        </div>
      </header>

      {/* CONTENT */}
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {/* PERSONAL INFO */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Personal Information</h3>

          {loadingUser ? (
            <div className="text-sm text-gray-500">Loading profile…</div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-4">
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
                  <Input
                    value={user.email}
                    onChange={(e) =>
                      setUser({ ...user, email: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Role</Label>
                  <Input value={user.role} disabled />
                </div>
              </div>

              <Button
                className="mt-4 w-full"
                onClick={saveUser}
                disabled={savingUser}
              >
                {savingUser && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Save Changes
              </Button>
            </>
          )}
        </Card>

        {/* PDF UPLOADS */}
        <Card className="p-6">
          <h3 className="font-semibold mb-1">Resume / CV PDFs</h3>
          <p className="text-sm text-gray-500 mb-4">
            Upload and manage your documents
          </p>

          {pdfs.length === 0 && (
            <div className="text-sm text-gray-500">
              No documents uploaded yet.
            </div>
          )}

          <div className="space-y-3">
            {pdfs.map((pdf) => (
              <div
                key={pdf.id}
                className="flex justify-between items-center border rounded p-3"
              >
                <a
                  href={pdf.file_url}
                  target="_blank"
                  className="flex items-center gap-2 text-sm hover:underline"
                >
                  <FileText className="w-4 h-4 text-red-500" />
                  {pdf.file_name}
                </a>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePdf(pdf)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              multiple
              onChange={onPdfChange}
              className="hidden"
            />

            <Button
              variant="outline"
              className="w-full"
              disabled={uploadingPdf}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Uploading…
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add PDF
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* ACCOUNT ACTIONS */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Account Actions</h3>
          <Button variant="outline">
            <Lock className="w-4 h-4 mr-2" />
            Change Password
          </Button>
        </Card>
      </main>
    </div>
  )
}
