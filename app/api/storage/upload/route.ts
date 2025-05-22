import { NextResponse } from "next/server"
import { initializeFirebaseAdmin } from "@/lib/firebase/firebase-admin"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    // Get form data with file
    const formData = await request.formData()
    const file = formData.get("file") as File
    const userId = formData.get("userId") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Initialize Firebase Admin
    const { storage } = initializeFirebaseAdmin()
    const bucket = storage.bucket()

    // Generate a unique filename
    const fileExtension = file.name.split(".").pop()
    const fileName = `${userId}/${uuidv4()}.${fileExtension}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Firebase Storage
    const fileRef = bucket.file(fileName)
    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    })

    // Get public URL
    const [url] = await fileRef.getSignedUrl({
      action: "read",
      expires: "03-01-2500", // Far future expiration
    })

    return NextResponse.json({
      success: true,
      url,
      path: fileName,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
