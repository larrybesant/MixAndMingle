import { getRooms } from "@/app/actions/room-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateRoomForm } from "@/components/create-room-form"

export default async function RoomsPage() {
  // This is a server component, so we can directly use the server action
  const rooms = await getRooms()

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">DJ Rooms</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Create New Room</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateRoomForm />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <Card key={room.id}>
            <CardHeader>
              <CardTitle>{room.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                <strong>Category:</strong> {room.category}
              </p>
              <p>
                <strong>DJ:</strong> {room.djName}
              </p>
              <p>
                <strong>Viewers:</strong> {room.viewers}
              </p>
              <a href={`/rooms/${room.id}`} className="text-blue-500 hover:underline mt-4 inline-block">
                View Details
              </a>
            </CardContent>
          </Card>
        ))}

        {rooms.length === 0 && (
          <p className="col-span-full text-center text-gray-500">
            No rooms available. Create a new room to get started.
          </p>
        )}
      </div>
    </div>
  )
}
