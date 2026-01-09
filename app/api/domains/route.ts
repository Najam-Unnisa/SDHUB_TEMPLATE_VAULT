import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const supabase = await createClient()

    const insertPayload: any = {
      name: body.name,
      description: body.description ?? null,
    }

    if (body.parent_id) insertPayload.parent_id = body.parent_id

    const { data, error } = await supabase
      .from("domains")
      .insert(insertPayload)
      .select("*")
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: error.message || "Database error" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err: any) {
    console.error("API error:", err)
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const supabase = await createClient()

    if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

    const updatePayload: any = {
      name: body.name,
      description: body.description ?? null,
      parent_id: body.parent_id ?? null,
    }

    const { data, error } = await supabase
      .from("domains")
      .update(updatePayload)
      .eq("id", body.id)
      .select("*")
      .single()

    if (error) {
      console.error("Supabase error (update):", error)
      return NextResponse.json({ error: error.message || "Database error" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err: any) {
    console.error("API error (update):", err)
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    const supabase = await createClient()

    if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

    const { error } = await supabase.from("domains").delete().eq("id", body.id)

    if (error) {
      console.error("Supabase error (delete):", error)
      return NextResponse.json({ error: error.message || "Database error" }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("API error (delete):", err)
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 })
  }
}
