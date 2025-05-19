"use server"

import { seedNotifications as _seedNotifications } from "@/app/actions/seed-notifications"
import { seedDatabase as _seedDatabase } from "@/app/actions/seed-database"

export const seedNotifications = _seedNotifications
export const seedDatabase = _seedDatabase
