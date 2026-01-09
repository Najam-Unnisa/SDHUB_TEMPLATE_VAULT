"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Copy, Edit2, Trash2, Plus, Check, User, Search, AlertCircle, ChevronDown, Share2, Star, Link2, Trash, ChevronLeft, ChevronRight, Eye, Settings, LogOut, Mail, MessageCircle, Linkedin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

import {
  getAllDomains,
  getTemplatesByDomain,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "@/lib/actions/templates"

// Domain creation is performed via an API route from the client.
import type { Domain, TemplateWithDomain } from "@/lib/types"

interface Template {
  id: string
  name: string
  content: string
  domainName: string
  reference_links?: Array<{ url: string; title: string }> | null
  is_favorite?: boolean
  created_at?: string
  updated_at?: string
}

export default function TemplateVault() {
  const [domains, setDomains] = useState<Domain[]>([])
  const [flatDomains, setFlatDomains] = useState<Domain[]>([])
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({})
  const [selectedDomain, setSelectedDomain] = useState<string>("")
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)

  const [mode, setMode] = useState<"browse" | "create" | "edit">("browse")
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null)

  const [isCopied, setIsCopied] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "favorites" | "recent">("all")
  const [isTemplateListCollapsed, setIsTemplateListCollapsed] = useState(false)

  const [isLoadingDomains, setIsLoadingDomains] = useState(false)
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    content: "",
    domain: "",
    reference_links: [] as Array<{ url: string; title: string }>,
    is_favorite: false,
  })

  // 🔹 Add Domain state
  const [isDomainModalOpen, setIsDomainModalOpen] = useState(false)
  const [domainModalMode, setDomainModalMode] = useState<"add" | "edit">("add")
  const [editDomainId, setEditDomainId] = useState<string | null>(null)
  const [newDomainName, setNewDomainName] = useState("")
  const [newDomainDescription, setNewDomainDescription] = useState("")
  const [newDomainParentId, setNewDomainParentId] = useState<string | null>(null)
  const [domainToDeleteId, setDomainToDeleteId] = useState<string | null>(null)
  const [isDeleteDomainOpen, setIsDeleteDomainOpen] = useState(false)

  // Reference links state
  const [newReferenceLink, setNewReferenceLink] = useState({ url: "", title: "" })

  // Share modal state
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [shareTemplate, setShareTemplate] = useState<Template | null>(null)

  const { toast } = useToast()
  const [userName, setUserName] = useState<string>("Admin User")

  useEffect(() => {
    loadDomains()
  }, [])

  useEffect(() => {
    if (selectedDomain) {
      loadTemplates(selectedDomain)
    }
  }, [selectedDomain])

  const loadDomains = async () => {
    setIsLoadingDomains(true)
    setError(null)

    const { data, error } = await getAllDomains()

    if (error) {
      setError("Failed to load domains.")
      toast({ title: "Error", description: error.message, variant: "destructive" })
      setDomains([])
    } else if (data && data.length > 0) {
      setDomains(data)
      // flatten for selects and default selection
      const flat: Domain[] = []
      const walk = (items: Domain[]) => {
        for (const it of items) {
          flat.push(it)
          if ((it as any).sub_categories && (it as any).sub_categories.length) {
            walk((it as any).sub_categories)
          }
        }
      }
      walk(data)
      setFlatDomains(flat)
      setSelectedDomain(flat[0].name)
    } else {
      setDomains([])
    }

    setIsLoadingDomains(false)
  }

  const loadTemplates = async (domainName: string) => {
    setIsLoadingTemplates(true)
    setError(null)

    const { data, error } = await getTemplatesByDomain(domainName)

    if (error) {
      setError("Failed to load templates.")
      toast({ title: "Error", description: error.message, variant: "destructive" })
      setTemplates([])
    } else if (data) {
      setTemplates(
        data.map((t: TemplateWithDomain) => ({
          id: t.id,
          name: t.name,
          content: t.content,
          domainName: t.domain.name,
          reference_links: t.reference_links,
          is_favorite: t.is_favorite,
          created_at: t.created_at,
          updated_at: t.updated_at,
        })),
      )
    } else {
      setTemplates([])
    }

    setIsLoadingTemplates(false)
  }

  const performSearch = (query: string, template: Template): boolean => {
    if (!query.trim()) return true

    const searchTerm = query.toLowerCase().trim()
    
    // Search across template name, content, and domain name
    return (
      template.name.toLowerCase().includes(searchTerm) ||
      template.content.toLowerCase().includes(searchTerm) ||
      template.domainName.toLowerCase().includes(searchTerm)
    )
  }

  const formatTimestamp = (dateString?: string): string => {
    if (!dateString) return "No date"
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    })
  }

  const filteredTemplates = templates
    .filter((t) => {
      // Apply filter based on filterType
      if (filterType === "favorites") {
        return t.is_favorite === true
      } else if (filterType === "recent") {
        // Show recent templates (assume created_at is available)
        return true
      }
      return true
    })
    .filter((t) => performSearch(searchQuery, t))
    .sort((a, b) => {
      if (filterType === "recent") {
        // Sort by creation date (newest first) - you may need to add created_at to Template interface
        return 0 // Currently no created_at in Template interface, so no sorting
      }
      return 0
    })

  const handleAddTemplate = () => {
    setMode("create")
    setFormData({ 
      name: "", 
      content: "", 
      domain: selectedDomain,
      reference_links: [],
      is_favorite: false,
    })
  }

  const handleViewTemplate = (template: Template) => {
    setSelectedTemplate(template)
    setMode("browse")
  }

  const handleEditTemplate = (template: Template) => {
    setSelectedTemplate(template)
    setMode("edit")
    setFormData({
      name: template.name,
      content: template.content,
      domain: template.domainName,
      reference_links: template.reference_links || [],
      is_favorite: template.is_favorite || false,
    })
  }

  const handleDeleteTemplate = (id: string) => {
    setTemplateToDelete(id)
    setShowDeleteAlert(true)
  }

  const confirmDelete = async () => {
    if (!templateToDelete) return
    setIsSaving(true)

    const { error } = await deleteTemplate(templateToDelete)

    if (!error) {
      toast({ title: "Template deleted" })
      setSelectedTemplate(null)
      await loadTemplates(selectedDomain)
    }

    setShowDeleteAlert(false)
    setTemplateToDelete(null)
    setIsSaving(false)
  }

  const confirmDeleteDomain = async () => {
    if (!domainToDeleteId) return
    setIsSaving(true)

    try {
      const res = await fetch("/api/domains", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: domainToDeleteId }),
      })

      if (!res.ok) throw new Error("Failed to delete category")

      await loadDomains()
      toast({ title: "Category deleted" })
    } catch (err: any) {
      toast({ title: "Error", description: err?.message ?? String(err), variant: "destructive" })
    }

    setIsDeleteDomainOpen(false)
    setDomainToDeleteId(null)
    setIsSaving(false)
  }

  const toggleFavorite = async () => {
    if (!selectedTemplate) return

    try {
      const res = await fetch("/api/templates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedTemplate.id,
          is_favorite: !(selectedTemplate.is_favorite || false),
        }),
      })

      if (!res.ok) throw new Error("Failed to update favorite status")

      const updated = await res.json()
      setSelectedTemplate(updated)
      await loadTemplates(selectedDomain)
      toast({ title: updated.is_favorite ? "Added to favorites" : "Removed from favorites" })
    } catch (err: any) {
      toast({ title: "Error", description: err?.message ?? String(err), variant: "destructive" })
    }
  }

  const addReferenceLink = () => {
    if (!newReferenceLink.url || !newReferenceLink.title) {
      toast({ title: "Please enter URL and title", variant: "destructive" })
      return
    }
    setFormData({
      ...formData,
      reference_links: [...formData.reference_links, newReferenceLink],
    })
    setNewReferenceLink({ url: "", title: "" })
  }

  const removeReferenceLink = (index: number) => {
    setFormData({
      ...formData,
      reference_links: formData.reference_links.filter((_, i) => i !== index),
    })
  }

  const handleSaveTemplate = async () => {
    if (!formData.name || !formData.content) return
    setIsSaving(true)

    if (mode === "create") {
      await createTemplate({
        name: formData.name,
        content: formData.content,
        domainName: formData.domain,
        reference_links: formData.reference_links.length > 0 ? formData.reference_links : null,
        is_favorite: formData.is_favorite,
      })
    } else if (mode === "edit" && selectedTemplate) {
      await updateTemplate(selectedTemplate.id, {
        name: formData.name,
        content: formData.content,
        reference_links: formData.reference_links.length > 0 ? formData.reference_links : null,
        is_favorite: formData.is_favorite,
      })
    }

    await loadTemplates(selectedDomain)
    setMode("browse")
    setIsSaving(false)
  }

  const handleDomainChange = (domain: string) => {
    setSelectedDomain(domain)
    setSelectedTemplate(null)
    setMode("browse")
    setSearchQuery("")
    setFilterType("all")
  }

  return (
    <div className="min-h-screen bg-white">
      <Toaster />

      {/* TOP HEADER */}
      <header className="w-full border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="w-full px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a className="flex items-center gap-3" href="#">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                <rect width="24" height="24" rx="6" fill="#10B981" />
                <text x="12" y="15" textAnchor="middle" fontSize="10" fontWeight="700" fill="white">S</text>
              </svg>
              <div>
                <div className="text-sm font-semibold">SD HUB</div>
                <div className="text-xs text-gray-500">Skills Development Hub</div>
              </div>
            </a>
          </div>

          <div className="flex-1 text-center">
            <div className="text-lg font-semibold">Template Vault</div>
            <div className="text-xs text-gray-500">Admin Dashboard</div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleAddTemplate} className="bg-green-600 hover:bg-green-700 text-white rounded-md px-4 py-2">
              <Plus className="mr-2" /> Add Template
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                  <User />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-3 py-2 text-sm">
                  <div className="font-medium">{userName}</div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/settings" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" /> Settings
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => (window.location.href = '/login')}>
                  <LogOut className="w-4 h-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex h-screen overflow-hidden">
        {/* LEFT SIDEBAR */}
        <aside className="w-56 bg-gray-50 border-r border-gray-200 sticky top-[64px] h-[calc(100vh-64px)] overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-gray-600 uppercase">Categories</h2>

              <Dialog open={isDomainModalOpen} onOpenChange={setIsDomainModalOpen}>
                <DialogTrigger asChild>
                  <button
                    className="text-xs font-semibold text-green-600 hover:underline"
                    onClick={() => {
                      setDomainModalMode("add")
                      setEditDomainId(null)
                      setNewDomainName("")
                      setNewDomainDescription("")
                      setNewDomainParentId(null)
                    }}
                  >
                    + Add
                  </button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{domainModalMode === "add" ? "Add Category" : "Edit Category"}</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div>
                      <Label>Category Name</Label>
                      <Input
                        value={newDomainName}
                        onChange={(e) => setNewDomainName(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={newDomainDescription}
                        onChange={(e) => setNewDomainDescription(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Parent Category (optional)</Label>
                      <Select
                        value={newDomainParentId ?? "__none"}
                        onValueChange={(val) => setNewDomainParentId(val === "__none" ? null : val)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="None" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none">None</SelectItem>
                          {flatDomains.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={async () => {
                        if (!newDomainName.trim()) return

                        try {
                          if (domainModalMode === "add") {
                            const res = await fetch("/api/domains", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                name: newDomainName,
                                description: newDomainDescription,
                                parent_id: newDomainParentId,
                              }),
                            })

                            if (!res.ok) throw new Error("Failed to create domain")

                            const data = await res.json()

                            if (data) {
                              await loadDomains()
                              setSelectedDomain(data.name)
                              setIsDomainModalOpen(false)
                              setNewDomainName("")
                              setNewDomainDescription("")
                              setNewDomainParentId(null)
                            }
                          } else if (domainModalMode === "edit" && editDomainId) {
                            const res = await fetch("/api/domains", {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                id: editDomainId,
                                name: newDomainName,
                                description: newDomainDescription,
                                parent_id: newDomainParentId,
                              }),
                            })

                            if (!res.ok) throw new Error("Failed to update domain")

                            const data = await res.json()

                            if (data) {
                              await loadDomains()
                              setSelectedDomain(data.name)
                              setIsDomainModalOpen(false)
                              setNewDomainName("")
                              setNewDomainDescription("")
                              setNewDomainParentId(null)
                              setEditDomainId(null)
                              setDomainModalMode("add")
                            }
                          }
                        } catch (err: any) {
                          toast({ title: "Error", description: err?.message ?? String(err), variant: "destructive" })
                        }
                      }}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Save Category
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <nav className="space-y-1">
              {domains.map((domain) => {
                const isExpanded = !!expandedParents[domain.id]

                return (
                  <div key={domain.id}>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => {
                          handleDomainChange(domain.name)
                          setExpandedParents((prev) => ({ ...prev, [domain.id]: !prev[domain.id] }))
                        }}
                        className={`flex-1 text-left px-3 py-2 rounded-md text-sm flex items-center justify-between ${
                          selectedDomain === domain.name
                            ? "bg-gray-200 border-l-4 border-green-600"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <span className="flex-1 text-left">{domain.name}</span>
                        {domain.sub_categories && domain.sub_categories.length > 0 && (
                          <ChevronDown className={`size-4 transition-transform ${isExpanded ? "-rotate-180" : "rotate-0"}`} />
                        )}
                      </button>

                      <div className="px-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1 rounded hover:bg-gray-100">⋮</button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => {
                                // open edit modal
                                setDomainModalMode("edit")
                                setEditDomainId(domain.id)
                                setNewDomainName(domain.name)
                                setNewDomainDescription(domain.description ?? "")
                                setNewDomainParentId(domain.parent_id ?? null)
                                setIsDomainModalOpen(true)
                              }}
                            >
                              Edit Category
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setDomainToDeleteId(domain.id)
                                setIsDeleteDomainOpen(true)
                              }}
                            >
                              Delete Category
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {isExpanded && domain.sub_categories && domain.sub_categories.length > 0 && (
                      <div className="ml-4 mt-1 space-y-1">
                        {domain.sub_categories.map((sub) => (
                          <div key={sub.id} className="flex items-center justify-between">
                            <button
                              onClick={() => handleDomainChange(sub.name)}
                              className={`w-full text-left px-3 py-1 rounded-md text-sm text-gray-700 hover:bg-gray-100 ${
                                selectedDomain === sub.name ? "bg-gray-100 font-medium" : ""
                              }`}
                            >
                              {sub.name}
                            </button>

                            <div className="px-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="p-1 rounded hover:bg-gray-100">⋮</button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      // edit sub-category
                                      setDomainModalMode("edit")
                                      setEditDomainId(sub.id)
                                      setNewDomainName(sub.name)
                                      setNewDomainDescription(sub.description ?? "")
                                      setNewDomainParentId(sub.parent_id ?? null)
                                      setIsDomainModalOpen(true)
                                    }}
                                  >
                                    Edit Category
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setDomainToDeleteId(sub.id)
                                      setIsDeleteDomainOpen(true)
                                    }}
                                  >
                                    Delete Category
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* MIDDLE + RIGHT PANELS */}
        <main className={`${isTemplateListCollapsed ? "w-48" : "flex-1"} p-6 overflow-auto transition-all duration-300 flex flex-col`}>
          {!isTemplateListCollapsed && (
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{selectedDomain || "Academic"}</h2>
                <div className="text-xs text-gray-500">{templates.length} template(s)</div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <div className="flex items-center border rounded-md px-2 py-1 flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 mr-2" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates..."
                  className="outline-none text-sm w-full"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    {filterType === "favorites" && <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />}
                    {filterType === "recent" && <Search className="w-4 h-4" />}
                    {filterType === "favorites" ? "Favorites" : filterType === "recent" ? "Recent" : "All Templates"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilterType("all")}>
                    <span>All Templates</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType("favorites")}>
                    <Star className="w-4 h-4 mr-2 fill-yellow-400 text-yellow-400" />
                    <span>Favorite Templates</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType("recent")}>
                    <Search className="w-4 h-4 mr-2" />
                    <span>Recently Used Templates</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="sm"
                // onClick={() => setIsTemplateListCollapsed(!isTemplateListCollapsed)}
                // title={isTemplateListCollapsed ? "Expand template list" : "Collapse template list"}
              >
                {isTemplateListCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          )}

          {isTemplateListCollapsed && (
            <div className="flex justify-center mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsTemplateListCollapsed(!isTemplateListCollapsed)}
                title="Expand template list"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          <div className={`${isTemplateListCollapsed ? "flex flex-col gap-2" : "grid grid-cols-1 gap-3"}`}>
            {isTemplateListCollapsed ? (
              filteredTemplates.length === 0 ? (
                <div className="text-xs text-gray-500 text-center">No templates</div>
              ) : (
                filteredTemplates.map((t) => (
                  <Button
                    key={t.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewTemplate(t)}
                    className="p-1 h-auto overflow-hidden whitespace-normal break-words"
                    title={t.name}
                  >
                    <div className="text-xs">{t.name}</div>
                  </Button>
                ))
              )
            ) : (
              <>
                {filteredTemplates.length === 0 ? (
                  <Card className="p-6 text-center text-sm text-gray-500">No templates found.</Card>
                ) : (
                  filteredTemplates.map((t) => (
                <Card
                  key={t.id}
                  onClick={() => handleViewTemplate(t)}
                  className="p-4 flex items-start justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.domainName}</div>
                    <div className="mt-2 text-sm text-gray-700 truncate">{t.content}</div>
                    <div className="mt-3 text-xs text-gray-400">{formatTimestamp(t.updated_at)}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigator.clipboard.writeText(t.content)
                        setIsCopied(true)
                        setTimeout(() => setIsCopied(false), 1500)
                        toast({ title: "Copied" })
                      }}
                      title="Copy content"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                       onClick={() => setIsTemplateListCollapsed(!isTemplateListCollapsed)}
                title="Expand template list"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShareTemplate(t)
                        setShareModalOpen(true)
                      }}
                      title="Share template"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (selectedTemplate?.id === t.id) {
                          toggleFavorite()
                        } else {
                          setSelectedTemplate(t)
                          // Delay to allow state update
                          setTimeout(() => {
                            fetch("/api/templates", {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                id: t.id,
                                is_favorite: !(t.is_favorite || false),
                              }),
                            })
                              .then(() => loadTemplates(selectedDomain))
                              .catch(() => {})
                          }, 0)
                        }
                      }}
                      title={t.is_favorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Star className={`h-4 w-4 ${t.is_favorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
                    </Button>
                  </div>
                </Card>
              ))
            )}
              </>
            )}
          </div>
        </main>

        {/* RIGHT SIDEBAR: Viewer / Editor */}
        <aside className={`${isTemplateListCollapsed ? "flex-1" : "w-96"} bg-gray-50 border-l border-gray-200 p-6 flex flex-col transition-all duration-300`}>
          {mode === "browse" && selectedTemplate ? (
            <div className="flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-4 pb-4 border-b">
                <div className="flex-1">
                  <h3 className="font-semibold">{selectedTemplate.name}</h3>
                  <div className="text-xs text-gray-500">{selectedTemplate.domainName}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedTemplate({
                        ...selectedTemplate,
                        is_favorite: !(selectedTemplate.is_favorite || false),
                      })
                      fetch("/api/templates", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          id: selectedTemplate.id,
                          is_favorite: !(selectedTemplate.is_favorite || false),
                        }),
                      })
                        .then(() => loadTemplates(selectedDomain))
                        .catch(() => {})
                    }}
                    title={selectedTemplate.is_favorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Star className={`h-4 w-4 ${selectedTemplate.is_favorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditTemplate(selectedTemplate)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTemplate(selectedTemplate.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-auto">
                <div className="mb-4">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800">{selectedTemplate.content}</pre>
                </div>
                {selectedTemplate.reference_links && selectedTemplate.reference_links.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Reference Links</h4>
                    <div className="space-y-2">
                      {(selectedTemplate.reference_links as any[]).map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <Link2 className="h-3 w-3" />
                          {link.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-auto pt-4 text-right text-xs text-gray-400">
                  Updated: {formatTimestamp(selectedTemplate.updated_at)}
                </div>
              </div>
            </div>
          ) : mode === "create" || mode === "edit" ? (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4 pb-4 border-b">
                <h3 className="font-semibold">{mode === "create" ? "New Template" : "Edit Template"}</h3>
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={handleSaveTemplate} 
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-1" /> Save
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setMode("browse")
                      setSelectedTemplate(null)
                      setFormData({ name: "", content: "", domain: "", reference_links: [], is_favorite: false })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-auto space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Domain</Label>
                  <Select
                    value={formData.domain}
                    onValueChange={(val) => setFormData({ ...formData, domain: val })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select domain" />
                    </SelectTrigger>
                    <SelectContent>
                      {flatDomains.map((d) => (
                        <SelectItem key={d.id} value={d.name}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 flex flex-col">
                  <Label>Content</Label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="flex-1 resize-none"
                  />
                </div>

                <div>
                  <Label>Reference Links</Label>
                  <div className="space-y-2 mb-3">
                    {formData.reference_links.map((link, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border text-sm">
                        <div className="flex-1">
                          <div className="font-medium">{link.title}</div>
                          <div className="text-xs text-gray-500 truncate">{link.url}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeReferenceLink(idx)}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="Link title"
                      value={newReferenceLink.title}
                      onChange={(e) => setNewReferenceLink({ ...newReferenceLink, title: e.target.value })}
                      className="text-sm"
                    />
                    <Input
                      placeholder="https://example.com"
                      value={newReferenceLink.url}
                      onChange={(e) => setNewReferenceLink({ ...newReferenceLink, url: e.target.value })}
                      className="text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addReferenceLink}
                      className="w-full"
                    >
                      <Link2 className="h-3 w-3 mr-1" /> Add Link
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_favorite"
                    checked={formData.is_favorite}
                    onChange={(e) => setFormData({ ...formData, is_favorite: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="is_favorite" className="cursor-pointer">
                    <Star className="h-4 w-4 inline mr-1" /> Mark as favorite
                  </Label>
                </div>

                {mode === "edit" && selectedTemplate && (
                  <div className="text-right text-xs text-gray-400">
                    Updated: {formatTimestamp(selectedTemplate.updated_at)}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">Select a template to view or click "Add Template".</div>
          )}
        </aside>
      </div>

      {/* DELETE CONFIRMATION */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* DELETE CATEGORY CONFIRMATION */}
      <AlertDialog open={isDeleteDomainOpen} onOpenChange={setIsDeleteDomainOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteDomain} className="bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* SHARE TEMPLATE MODAL */}
      <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Share Template</DialogTitle>
          </DialogHeader>
          {shareTemplate && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-900">{shareTemplate.name}</p>
                <p className="text-xs text-gray-500 mt-1">{shareTemplate.domainName}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  onClick={() => {
                    const shareMessage = `Template: ${shareTemplate.name}\n\n${shareTemplate.content}`
                    const whatsappUrl = `https://wa.me/916303765724?text=${encodeURIComponent(shareMessage)}`
                    window.open(whatsappUrl, "_blank")
                    toast({ title: "Opening WhatsApp..." })
                  }}
                >
                  <MessageCircle className="h-6 w-6 text-green-500" />
                  <span className="text-xs">WhatsApp</span>
                </Button>

                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  onClick={() => {
                    const shareMessage = `Template: ${shareTemplate.name}\n\n${shareTemplate.content}`
                    const mailtoUrl = `mailto:najamunnisa00@gmail.com?subject=${encodeURIComponent(shareTemplate.name)}&body=${encodeURIComponent(shareMessage)}`
                    window.open(mailtoUrl, "_blank")
                    toast({ title: "Opening email client..." })
                  }}
                >
                  <Mail className="h-6 w-6 text-blue-500" />
                  <span className="text-xs">Email</span>
                </Button>

                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  onClick={() => {
                    const shareMessage = `Template: ${shareTemplate.name}\n\n${shareTemplate.content}`
                    navigator.clipboard.writeText(shareMessage)
                    window.open("https://www.linkedin.com/messaging/", "_blank")
                    toast({ title: "Content copied! Opening LinkedIn messages..." })
                  }}
                >
                  <Linkedin className="h-6 w-6 text-blue-700" />
                  <span className="text-xs">LinkedIn</span>
                </Button>

                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  onClick={() => {
                    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/share/${shareTemplate.id}`
                    navigator.clipboard.writeText(url)
                    toast({ title: "Link copied to clipboard!" })
                    setShareModalOpen(false)
                  }}
                >
                  <Copy className="h-6 w-6 text-purple-500" />
                  <span className="text-xs">Copy Link</span>
                </Button>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 break-all">{typeof window !== "undefined" ? `${window.location.origin}/share/${shareTemplate.id}` : ""}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
