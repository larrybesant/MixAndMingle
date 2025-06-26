import { config } from "./config"

// Room configuration types
export interface RoomLimits {
  maxNameLength: number
  maxDescriptionLength: number
  maxTagsPerRoom: number
  maxTagLength: number
  viewerLimits: number[]
}

export interface RoomDefaults {
  category: string
  genre: string
  maxViewers: number
  isPrivate: boolean
}

// Room configuration constants
export const roomLimits: RoomLimits = {
  maxNameLength: config.rooms.maxNameLength,
  maxDescriptionLength: config.rooms.maxDescriptionLength,
  maxTagsPerRoom: config.rooms.maxTagsPerRoom,
  maxTagLength: config.rooms.maxTagLength,
  viewerLimits: [50, 100, 250, 500, 1000],
}

export const roomDefaults: RoomDefaults = {
  category: config.rooms.defaultCategory,
  genre: config.rooms.defaultGenre,
  maxViewers: config.rooms.defaultMaxViewers,
  isPrivate: false,
}

// Validation functions
export function validateRoomName(name: string): boolean {
  return name.trim().length > 0 && name.length <= roomLimits.maxNameLength
}

export function validateRoomDescription(description: string): boolean {
  return description.length <= roomLimits.maxDescriptionLength
}

export function validateRoomTag(tag: string): boolean {
  return tag.trim().length > 0 && tag.length <= roomLimits.maxTagLength
}

export function validateRoomTags(tags: string[]): boolean {
  return tags.length <= roomLimits.maxTagsPerRoom && tags.every((tag) => validateRoomTag(tag))
}
