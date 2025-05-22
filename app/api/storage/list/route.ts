import { NextResponse } from "next/server"
import { initializeFirebaseAdmin } from "@/lib/firebase/firebase-admin"

export async function GET(request: Request) {
  try {
    // Get directory from query params
    const { searchParams } = new URL(request.url)
    const directory = searchParams.get("directory") || ""

    // Initialize Firebase Admin
    const { storage } = initializeFirebaseAdmin()
    const bucket = storage.bucket()

    // List files in directory
    const [files] = await bucket.getFiles({
      prefix: directory,
      delimiter: "/",
    })

    // Format response
    const fileList = await Promise.all(
      files.map(async (file) => {
        const [url] = await file.getSignedUrl({
          action: "read",
          expires: "03-01-2500", // Far future expiration
        })

        return {
          name: file.name,
          url,
          size: file.metadata.size,
          contentType: file.metadata.contentType,
          updated: file.metadata.updated,
        }
      }),
    )

    return NextResponse.json({
      success: true,
      files: fileList,
    })
  } catch (error) {
    console.error("Error listing files:", error)
    return NextResponse.json({ error: "Failed to list files" }, { status: 500 })
  }
}
