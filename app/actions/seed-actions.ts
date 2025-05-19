"use server"

import { seedNotifications as _seedNotifications } from "@/app/actions/seed-notifications"
import { seedDatabase as _seedDatabase } from "@/app/actions/seed-database"
import { seedHybridData as _seedHybridData } from "@/app/actions/seed-hybrid-data"

export const seedNotifications = _seedNotifications
export const seedDatabase = _seedDatabase
export const seedHybridData = _seedHybridData
