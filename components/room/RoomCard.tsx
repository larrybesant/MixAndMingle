import Link from "next/link";
import type { UserRoom } from "@/types/database";

interface RoomCardProps {
  room: UserRoom;
}

export function RoomCard({ room }: RoomCardProps) {
  return (
    <div className="bg-gray-800 rounded-2xl p-6 shadow-lg flex flex-col items-center w-full max-w-xs mx-auto">
      <div className="font-bold text-lg mb-2">{room.name}</div>
      <div className="text-gray-400 text-sm mb-2">Genre: {room.genre}</div>
      <div className="text-green-400 text-xs mb-2">
        {room.viewer_count} viewers
      </div>
      <Link href={`/room/${room.id}`} className="text-blue-400 hover:underline">
        Join Room
      </Link>
    </div>
  );
}

// TODO: Consider lazy loading this component if the room list grows large.
