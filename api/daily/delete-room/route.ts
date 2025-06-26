import { type NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
  try {
    const { roomName } = await request.json();

    const response = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete Daily room");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting Daily room:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete room" },
      { status: 500 },
    );
  }
}
