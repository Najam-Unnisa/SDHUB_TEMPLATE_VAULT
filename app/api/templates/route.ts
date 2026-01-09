import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const supabase = await createClient()

    if (!body.id) return NextResponse.json({ error: "Missing template id" }, { status: 400 })

    const updatePayload: any = {}

    if (body.hasOwnProperty("is_favorite")) {
      updatePayload.is_favorite = body.is_favorite
    }

    if (body.reference_links !== undefined) {
      updatePayload.reference_links = body.reference_links
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("templates")
      .update(updatePayload)
      .eq("id", body.id)
      .select(
        `
        *,
        domain:domains(id, name, description)
      `,
      )
      .single()

    if (error) {
      console.error("Supabase error:", error)
      // If the error is due to missing is_favorite column, retry without it
      if (error.message && error.message.includes("is_favorite") && updatePayload.hasOwnProperty("is_favorite")) {
        delete updatePayload.is_favorite
        const { data: retryData, error: retryError } = await supabase
          .from("templates")
          .update(updatePayload)
          .eq("id", body.id)
          .select(`
            *,
            domain:domains(id, name, description)
          `)
          .single()

        if (retryError) {
          console.error("Supabase retry error:", retryError)
          return NextResponse.json({ error: retryError.message || "Database error" }, { status: 500 })
        }

        return NextResponse.json(retryData)
      }

      return NextResponse.json({ error: error.message || "Database error" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err: any) {
    console.error("API error:", err)
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const templateId = searchParams.get("id")

    if (!templateId) {
      return NextResponse.json({ error: "Missing template id" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("templates")
      .select(
        `
        *,
        domain:domains(id, name, description)
      `,
      )
      .eq("id", templateId)
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: error.message || "Not found" }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (err: any) {
    console.error("API error:", err)
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 })
  }
}
