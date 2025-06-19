import { Card } from "../ui/card"
import { useState } from "react"

export const RoomView = () => {
  const [reported, setReported] = useState(false);
  const [blocked, setBlocked] = useState(false);

  const handleReport = () => {
    setReported(true);
    // TODO: Send report to backend or Supabase
    alert("User reported. Thank you for your feedback.");
  };

  const handleBlock = () => {
    setBlocked(true);
    // TODO: Add block logic (e.g., update user profile or block list)
    alert("User blocked. You will no longer see this user.");
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-2">Live User Room</h2>
      <div className="mb-4">[Streaming Player Placeholder]</div>
      <div>[Chat Placeholder]</div>
      <div className="mt-4 flex gap-2">
        <button
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          onClick={handleReport}
          disabled={reported}
        >
          {reported ? "Reported" : "Report User"}
        </button>
        <button
          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
          onClick={handleBlock}
          disabled={blocked}
        >
          {blocked ? "Blocked" : "Block User"}
        </button>
      </div>
    </Card>
  );
};
