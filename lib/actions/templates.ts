"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getTemplatesByDomain(domainName: string) {
  const supabase = await createClient()

  const { data: domain, error: domainError } = await supabase
    .from("domains")
    .select("id")
    .eq("name", domainName)
    .single()

  if (domainError || !domain) {
    return { data: null, error: domainError }
  }

  const { data, error } = await supabase
    .from("templates")
    .select(
      `
      *,
      domain:domains(id, name, description)
    `,
    )
    .eq("domain_id", domain.id)
    .order("created_at", { ascending: false })

  return { data, error }
}

export async function getAllDomains() {
  const supabase = await createClient()

  const { data, error } = await supabase.from("domains").select("*").order("name", { ascending: true })

  if (error || !data) return { data, error }

  // Build a nested tree of domains -> sub_categories by parent_id
  const map = new Map<string, any>()
  data.forEach((d: any) => {
    map.set(d.id, { ...d, sub_categories: [] })
  })

  const roots: any[] = []

  map.forEach((node) => {
    if (node.parent_id) {
      const parent = map.get(node.parent_id)
      if (parent) parent.sub_categories.push(node)
      else roots.push(node)
    } else {
      roots.push(node)
    }
  })

  return { data: roots, error: null }
}

export async function createTemplate(formData: { name: string; content: string; domainName: string; reference_links?: any[]; is_favorite?: boolean }) {
  const supabase = await createClient()

  const { data: domain, error: domainError } = await supabase
    .from("domains")
    .select("id")
    .eq("name", formData.domainName)
    .single()

  if (domainError || !domain) {
    return { data: null, error: domainError }
  }

  const { data, error } = await supabase
    .from("templates")
    .insert({
      name: formData.name,
      content: formData.content,
      domain_id: domain.id,
      reference_links: formData.reference_links || null,
      // Only include is_favorite when provided; fallback handled on error
      ...(formData.is_favorite !== undefined ? { is_favorite: formData.is_favorite } : {}),
    })
    .select(
      `
      *,
      domain:domains(id, name, description)
    `,
    )
    .single()

  // If the insert failed due to missing column (e.g., is_favorite not present in DB),
  // retry without the `is_favorite` field.
  if (error && error.message && error.message.includes("is_favorite")) {
    const { data: retryData, error: retryError } = await supabase
      .from("templates")
      .insert({
        name: formData.name,
        content: formData.content,
        domain_id: domain.id,
        reference_links: formData.reference_links || null,
      })
      .select(`
        *,
        domain:domains(id, name, description)
      `)
      .single()

    if (!retryError) revalidatePath("/")
    return { data: retryData, error: retryError }
  }

  if (!error) {
    revalidatePath("/")
  }

  return { data, error }
}

export async function updateTemplate(templateId: string, formData: { name: string; content: string; reference_links?: any[]; is_favorite?: boolean }) {
  const supabase = await createClient()

  // Build payload and attempt update. If DB lacks `is_favorite`, retry without it.
  const payload: any = {
    name: formData.name,
    content: formData.content,
    reference_links: formData.reference_links || null,
    updated_at: new Date().toISOString(),
  }

  if (formData.is_favorite !== undefined) payload.is_favorite = formData.is_favorite

  let { data, error } = await supabase
    .from("templates")
    .update(payload)
    .eq("id", templateId)
    .select(`
      *,
      domain:domains(id, name, description)
    `)
    .single()

  if (error && error.message && error.message.includes("is_favorite")) {
    // retry without is_favorite
    delete payload.is_favorite
    const retry = await supabase
      .from("templates")
      .update(payload)
      .eq("id", templateId)
      .select(`
        *,
        domain:domains(id, name, description)
      `)
      .single()

    data = retry.data
    error = retry.error
  }

  if (!error) revalidatePath("/")
  return { data, error }
}

export async function deleteTemplate(templateId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("templates").delete().eq("id", templateId)

  if (!error) {
    revalidatePath("/")
  }

  return { error }
}
