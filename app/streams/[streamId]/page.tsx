"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { StreamViewer } from "@/components/stream-viewer"
import { useAuth } from "@/hooks/use-auth"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Skeleton } from "@/components/ui/skeleton"

export default function StreamPage() {
  const { streamId } = useParams()
  const { user } = useAuth()
  const [streamData, setStreamData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStreamData = async () => {
      if (!streamId) return

      try {
        const streamRef = doc(db, "live_streams", streamId as string)
        const streamSnap = await getDoc(streamRef)

        if (streamSnap.exists()) {
          const data = streamSnap.data()

          // Check if the stream is live
          if (data.status !== "live") {
            setError("This stream is not currently live")
            setLoading(false)
            return
          }

          setStreamData(data)
        } else {
          setError("Stream not found")
        }
      } catch (err) {
        console.error("Error fetching stream:", err)
        setError("Failed to load stream data")
      } finally {
        setLoading(false)
      }
    }

    fetchStreamData()
  }, [streamId])

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Skeleton className="h-12 w-1/3 mb-6" />
        <Skeleton className="h-[400px] w-full mb-6" />
        <div className="flex gap-4 justify-center">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          <p>Please log in to watch this stream</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">{streamData?.title}</h1>

      {streamData && user && (
        <StreamViewer
          streamId={streamId as string}
          broadcasterId={streamData.dj_id}
          userId={user.uid}
          title={streamData.title}
        />
      )}
    </div>
  )
}
