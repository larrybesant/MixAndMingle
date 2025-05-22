import { NextResponse } from "next/server"
import admin from "@/lib/firebase-admin"

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")
    const path = formData.get("path") || "uploads"
    const fileName = formData.get("fileName") || file.name

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert the file to a buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload to Firebase Storage
    const storage = admin.storage()
    const bucket = storage.bucket()
    const fileRef = bucket.file(`${path}/${fileName}`)

    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    })

    // Get the public URL
    const [url] = await fileRef.getSignedUrl({
      action: "read",
      expires: "01-01-2100", // Far future expiration
    })

    return NextResponse.json({
      success: true,
      fileName,
      path: `${path}/${fileName}`,
      url,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
