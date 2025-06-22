import { z } from "zod";

export const MessageUserSchema = z.object({
  username: z.string().nullable(),
  avatar_url: z.string().nullable(),
});

export const ConversationSchema = z.object({
  id: z.string().or(z.number()).transform(String),
  sender: MessageUserSchema,
  receiver: MessageUserSchema,
  message: z.string(),
  created_at: z.string(),
});

export const ConversationListSchema = z.array(ConversationSchema);

export const FriendProfileSchema = z.object({
  username: z.string().nullable(),
  avatar_url: z.string().nullable(),
});

export const FriendSchema = z.object({
  id: z.string().or(z.number()).transform(String),
  profiles: FriendProfileSchema,
});

export const FriendListSchema = z.array(FriendSchema);

export const FriendRequestSchema = FriendSchema;
export const FriendRequestListSchema = z.array(FriendRequestSchema);

export const NotificationSchema = z.object({
  id: z.string().or(z.number()).transform(String),
  type: z.string(),
  message: z.string(),
  created_at: z.string(),
  read: z.boolean(),
});

export const NotificationListSchema = z.array(NotificationSchema);

export const UserListSchema = z.array(
  z.object({
    id: z.string(),
    username: z.string(),
  })
);

export const ProfileSchema = z.object({
  id: z.string(),
  full_name: z.string().nullable(),
  username: z.string().nullable(),
  avatar_url: z.string().nullable(),
  bio: z.string().nullable(),
  music_preferences: z.array(z.string()).nullable(),
  created_at: z.string(),
  is_creator: z.boolean().optional(),
  gender: z.string().optional(),
});

export type UserList = z.infer<typeof UserListSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
