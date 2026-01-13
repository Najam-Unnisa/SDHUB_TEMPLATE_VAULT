import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/* =========================================================
   PATCH → Update template (favorite, links, etc.)
   ========================================================= */
export async function PATCH(req: Request) {
  try {
    const supabase = await createClient()
    const body = await req.json()

    if (!body.id) {
      return NextResponse.json(
        { error: "Missing template id" },
        { status: 400 }
      )
    }

    // 🔐 Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const updatePayload: any = {}

    if (body.hasOwnProperty("is_favorite")) {
      updatePayload.is_favorite = body.is_favorite
    }

    if (body.reference_links !== undefined) {
      updatePayload.reference_links = body.reference_links
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("templates")
      .update(updatePayload)
      .eq("id", body.id)
      .eq("created_by", user.id) // ✅ OWNER CHECK (IMPORTANT)
      .select(
        `
        *,
        domain:domains(id, name, description)
      `
      )
      .single()

    if (error) {
      console.error("Supabase PATCH error:", error)
      return NextResponse.json(
        { error: error.message || "Database error" },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (err: any) {
    console.error("API PATCH error:", err)
    return NextResponse.json(
      { error: err?.message ?? String(err) },
      { status: 500 }
    )
  }
}

/* =========================================================
   GET → Get single template by id (owner only)
   ========================================================= */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const templateId = searchParams.get("id")

    if (!templateId) {
      return NextResponse.json(
        { error: "Missing template id" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // 🔐 Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("templates")
      .select(
        `
        *,
        domain:domains(id, name, description)
      `
      )
      .eq("id", templateId)
      .eq("created_by", user.id) // ✅ OWNER CHECK
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (err: any) {
    console.error("API GET error:", err)
    return NextResponse.json(
      { error: err?.message ?? String(err) },
      { status: 500 }
    )
  }
}
