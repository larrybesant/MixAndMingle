import { NextResponse } from "next/server"
import { validateConfig } from "@/lib/config-validator"

export async function GET() {
  const isValid = validateConfig()

  if (!isValid) {
    return NextResponse.json({ status: "error", message: "Missing required environment variables" }, { status: 500 })
  }

  return NextResponse.json({ status: "ok", message: "Configuration is valid" })
}
