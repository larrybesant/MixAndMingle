import { type NextRequest, NextResponse } from "next/server"
import { cachedFetch } from "@/lib/redis/api-cache"

// Define the drink type
interface Drink {
  id: string
  name: string
  description: string
  ingredients: string[]
  image: string
  price: number
}

// Mock data source (in a real app, this would be a database)
const DRINKS_API = "https://api.example.com/drinks"

export async function GET(request: NextRequest) {
  try {
    // Use cached fetch with a 1-hour TTL
    const drinks = await cachedFetch<Drink[]>(DRINKS_API, {}, { ttl: 3600 })

    return NextResponse.json(drinks)
  } catch (error) {
    console.error("Error fetching drinks:", error)
    return NextResponse.json({ error: "Failed to fetch drinks" }, { status: 500 })
  }
}
