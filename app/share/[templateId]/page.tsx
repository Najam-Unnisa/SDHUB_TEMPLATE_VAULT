import { createClient } from "@/lib/supabase/server"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import type { TemplateWithDomain } from "@/lib/types"

export default async function SharedTemplatePage({ params }: { params: { templateId: string } }) {
  const supabase = await createClient()

  const { data: template, error } = await supabase
    .from("templates")
    .select(`
      *,
      domain:domains(id, name, description)
    `)
    .eq("id", params.templateId)
    .single()

  if (error || !template) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">
          <p className="font-medium">Error</p>
          <p>{error?.message || "Template not found"}</p>
        </div>
      </div>
    )
  }

  const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/share/${params.templateId}`

  const handleShare = (platform: string) => {
    const text = `Check out this template: ${template.name}`
    const url = shareUrl

    const shareLinks: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,
      email: `mailto:?subject=${encodeURIComponent(template.name)}&body=${encodeURIComponent(`${text}\n${url}`)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      copy: "",
    }

    // client-side only actions
    if (typeof window === "undefined") return

    if (platform === "copy") {
      navigator.clipboard.writeText(url)
      alert("Link copied to clipboard!")
    } else if (shareLinks[platform]) {
      window.open(shareLinks[platform], "_blank")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{template.name}</h1>
            <p className="text-sm text-gray-500">Category: {template.domain?.name}</p>
          </div>

          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <div className="whitespace-pre-wrap text-gray-800">{template.content}</div>
          </div>

          {template.reference_links && template.reference_links.length > 0 && (
            <div className="mb-6">
              <h2 className="font-semibold mb-3">Reference Links</h2>
              <div className="space-y-2">
                {(template.reference_links as any[]).map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {link.title}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Share:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare("whatsapp")}
            >
              WhatsApp
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare("email")}
            >
              Email
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare("linkedin")}
            >
              LinkedIn
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare("copy")}
            >
              Copy Link
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
