"use client"

import { useState } from "react"

const GoLivePage = () => {
  const [roomUrl, setRoomUrl] = useState("")
  const [roomName, setRoomName] = useState("")
  const [error, setError] = useState("")

  // Add this function to handle room creation
  const createDailyRoom = async (roomName: string) => {
    try {
      const response = await fetch("/api/daily/create-room", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: roomName,
          privacy: "public",
        }),
      })

      const data = await response.json()

      if (data.success) {
        return data.room.url
      } else {
        throw new Error(data.error || "Failed to create room")
      }
    } catch (error) {
      console.error("Error creating room:", error)
      throw error
    }
  }

  const handleCreateRoom = async () => {
    try {
      const url = await createDailyRoom(roomName)
      setRoomUrl(url)
      setError("")
    } catch (err: any) {
      setError(err.message || "Failed to create room")
      setRoomUrl("")
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Go Live!</h1>

      <div className="mb-4">
        <label htmlFor="roomName" className="block text-gray-700 text-sm font-bold mb-2">
          Room Name:
        </label>
        <input
          type="text"
          id="roomName"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Enter room name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
      </div>

      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        onClick={handleCreateRoom}
      >
        Create Room
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {roomUrl && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Room Created!</h2>
          <p>
            Join the room at:{" "}
            <a href={roomUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500">
              {roomUrl}
            </a>
          </p>
        </div>
      )}
    </div>
  )
}

export default GoLivePage
