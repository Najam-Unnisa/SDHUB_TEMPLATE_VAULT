"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

/* ===================== GET DOMAINS ===================== */
export async function getAllDomains() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { data: [], error: null }

  const { data, error } = await supabase
    .from("domains")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true })

  if (error || !data) return { data: [], error }

  const map = new Map<string, any>()
  data.forEach((d: any) => map.set(d.id, { ...d, sub_categories: [] }))

  const roots: any[] = []
  map.forEach((node) => {
    if (node.parent_id) {
      const parent = map.get(node.parent_id)
      parent?.sub_categories.push(node)
    } else {
      roots.push(node)
    }
  })

  return { data: roots, error: null }
}

/* ===================== GET TEMPLATES ===================== */
export async function getTemplatesByDomain(domainName: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { data: [], error: null }

  const { data: domain } = await supabase
    .from("domains")
    .select("id")
    .eq("name", domainName)
    .eq("user_id", user.id)
    .single()

  if (!domain) return { data: [], error: null }

  const { data, error } = await supabase
    .from("templates")
    .select(
      `
      *,
      domain:domains(id, name, description)
    `
    )
    .eq("domain_id", domain.id)
    .eq("created_by", user.id)
    .order("created_at", { ascending: false })

  return { data, error }
}

/* ===================== CREATE TEMPLATE ===================== */
export async function createTemplate(formData: {
  name: string
  content: string
  domainName: string
  reference_links?: any[]
  is_favorite?: boolean
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { data: domain } = await supabase
    .from("domains")
    .select("id")
    .eq("name", formData.domainName)
    .eq("user_id", user.id)
    .single()

  if (!domain) throw new Error("Domain not found")

  const { data, error } = await supabase
    .from("templates")
    .insert({
      name: formData.name,
      content: formData.content,
      domain_id: domain.id,
      reference_links: formData.reference_links ?? null,
      is_favorite: formData.is_favorite ?? false,
      created_by: user.id, // 🔐 REQUIRED
    })
    .select(
      `
      *,
      domain:domains(id, name, description)
    `
    )
    .single()

  if (error) {
    console.error("CREATE TEMPLATE ERROR:", error)
    throw error
  }

  revalidatePath("/")
  return { data, error: null }
}

/* ===================== UPDATE TEMPLATE ===================== */
export async function updateTemplate(
  templateId: string,
  formData: {
    name: string
    content: string
    reference_links?: any[]
    is_favorite?: boolean
  }
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const payload: any = {
    name: formData.name,
    content: formData.content,
    reference_links: formData.reference_links ?? null,
    is_favorite: formData.is_favorite,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from("templates")
    .update(payload)
    .eq("id", templateId)
    .eq("created_by", user.id)
    .select(
      `
      *,
      domain:domains(id, name, description)
    `
    )
    .single()

  if (error) throw error

  revalidatePath("/")
  return { data, error: null }
}

/* ===================== DELETE TEMPLATE ===================== */
export async function deleteTemplate(templateId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("templates")
    .delete()
    .eq("id", templateId)
    .eq("created_by", user.id)

  if (error) throw error

  revalidatePath("/")
  return { error: null }
}
