"use client"

import { useState } from "react"
import { FileUploader } from "@/components/file-uploader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth/auth-context"

export default function StorageTestPage() {
  const { user } = useAuth()
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ url: string; path: string }>>([])

  const handleUploadComplete = (url: string, path: string) => {
    setUploadedFiles((prev) => [...prev, { url, path }])
  }

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Firebase Storage Test</h1>

        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">Firebase Storage Configuration</h2>
          <p className="text-blue-700 mb-4">Make sure you have the following environment variables set up:</p>
          <ul className="list-disc pl-5 text-blue-700 space-y-1">
            <li>
              <code>NEXT_PUBLIC_FIREBASE_API_KEY</code> - Your Firebase API key
            </li>
            <li>
              <code>NEXT_PUBLIC_FIREBASE_PROJECT_ID</code> - Your Firebase project ID
            </li>
            <li>
              <code>FIREBASE_CLIENT_EMAIL</code> - Your Firebase client email
            </li>
            <li>
              <code>FIREBASE_PRIVATE_KEY</code> - Your Firebase private key
            </li>
          </ul>
        </div>

        <Tabs defaultValue="upload">
          <TabsList className="grid grid-cols-2 mb-8">
            <TabsTrigger value="upload">Upload Files</TabsTrigger>
            <TabsTrigger value="gallery">Uploaded Files</TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload Files to Firebase Storage</CardTitle>
                <CardDescription>
                  Upload files to your Firebase Storage bucket: mixandmingle-1c898.firebasestorage.app
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUploader
                  userId={user?.uid || "anonymous"}
                  onUploadComplete={handleUploadComplete}
                  allowedTypes={["image/jpeg", "image/png", "image/gif", "application/pdf"]}
                  maxSizeMB={5}
                  folder="test-uploads"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gallery">
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Files</CardTitle>
                <CardDescription>Files uploaded during this session</CardDescription>
              </CardHeader>
              <CardContent>
                {uploadedFiles.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No files uploaded yet</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="border rounded-md p-4">
                        {file.url.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                          <img
                            src={file.url || "/placeholder.svg"}
                            alt={`Uploaded file ${index + 1}`}
                            className="w-full h-40 object-cover rounded-md mb-2"
                          />
                        ) : (
                          <div className="w-full h-40 bg-gray-100 flex items-center justify-center rounded-md mb-2">
                            <p className="text-muted-foreground">Non-image file</p>
                          </div>
                        )}
                        <p className="text-sm font-medium truncate">{file.path.split("/").pop()}</p>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline break-all"
                        >
                          {file.url}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
