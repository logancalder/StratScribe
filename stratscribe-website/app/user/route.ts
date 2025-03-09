import { supabase } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic';
export async function GET() {
  const { data, error } = await supabase
    .from("userData")
    .select("*")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
} 