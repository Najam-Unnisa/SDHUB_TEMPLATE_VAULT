"use server"

import { createClient } from "@/lib/supabase/server"

export async function createDomain(input: {
  name: string
  description?: string
  parent_id?: string | null
}) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("domains")
    .insert({
      name: input.name,
      description: input.description ?? null,
      parent_id: input.parent_id ?? null,
    })
    .select("*")
    .single()

  return { data, error }
}
