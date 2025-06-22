import { z } from "zod";

export const UserRoomSchema = z.object({
  id: z.string().or(z.number()).transform(String),
  name: z.string(),
  genre: z.string(),
  is_live: z.boolean(),
  viewer_count: z.number(),
  description: z.string(),
  host_id: z.string(),
  tags: z.array(z.string()),
  created_at: z.string(),
});

export const UserRoomListSchema = z.array(UserRoomSchema);
