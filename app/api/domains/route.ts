import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/* ===================== POST ===================== */
export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    const { data, error } = await supabase
      .from("domains")
      .insert({
        name: body.name,
        description: body.description ?? null,
        parent_id: body.parent_id ?? null,
        user_id: user.id, // ✅ OWNER
      })
      .select("*")
      .single()

    if (error) {
      console.error(error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 })
  }
}

/* ===================== PATCH ===================== */
export async function PATCH(req: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    if (!body.id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("domains")
      .update({
        name: body.name,
        description: body.description ?? null,
        parent_id: body.parent_id ?? null,
      })
      .eq("id", body.id)
      .eq("user_id", user.id) // ✅ OWNER CHECK
      .select("*")
      .single()

    if (error) {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 })
    }

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 })
  }
}

/* ===================== DELETE ===================== */
export async function DELETE(req: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    if (!body.id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    const { error } = await supabase
      .from("domains")
      .delete()
      .eq("id", body.id)
      .eq("user_id", user.id) // ✅ OWNER CHECK

    if (error) {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 })
  }
}
