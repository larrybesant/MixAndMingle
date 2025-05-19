import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logging"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Authenticate the user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get request body
    const body = await request.json()
    const { userId, title, content, type, relatedId, relatedType } = body

    // Validate input
    if (!userId || !title || !content || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if the user has permission to send notifications to this user
    // For now, only allow sending to self or if the user is an admin
    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()
    const isAdmin = profile?.is_admin === true

    if (userId !== user.id && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Create the notification
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        title,
        content,
        type,
        related_id: relatedId,
        related_type: relatedType,
        is_read: false,
      })
      .select()

    if (error) {
      logger.error({
        message: "Error creating notification",
        userId: user.id,
        action: "insert",
        resource: "notifications",
        error,
      })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    logger.info({
      message: "Notification created",
      userId: user.id,
      action: "insert",
      resource: "notifications",
      resourceId: data[0].id,
    })

    return NextResponse.json({ success: true, notification: data[0] })
  } catch (error: any) {
    logger.error({
      message: "Error in notifications API",
      action: "post",
      resource: "notifications",
      error: error.message,
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Authenticate the user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const unreadOnly = searchParams.get("unread") === "true"

    // Build query
    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1)

    if (unreadOnly) {
      query = query.eq("is_read", false)
    }

    // Execute query
    const { data, error } = await query

    if (error) {
      logger.error({
        message: "Error fetching notifications",
        userId: user.id,
        action: "select",
        resource: "notifications",
        error,
      })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ notifications: data })
  } catch (error: any) {
    logger.error({
      message: "Error in notifications API",
      action: "get",
      resource: "notifications",
      error: error.message,
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Authenticate the user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get request body
    const body = await request.json()
    const { id, isRead } = body

    if (!id) {
      return NextResponse.json({ error: "Missing notification ID" }, { status: 400 })
    }

    // Check if the notification belongs to the user
    const { data: notification, error: fetchError } = await supabase
      .from("notifications")
      .select("user_id")
      .eq("id", id)
      .single()

    if (fetchError) {
      logger.error({
        message: "Error fetching notification",
        userId: user.id,
        action: "select",
        resource: "notifications",
        resourceId: id,
        error: fetchError,
      })
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!notification || notification.user_id !== user.id) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    // Update the notification
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: isRead !== false })
      .eq("id", id)

    if (error) {
      logger.error({
        message: "Error updating notification",
        userId: user.id,
        action: "update",
        resource: "notifications",
        resourceId: id,
        error,
      })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    logger.info({
      message: "Notification updated",
      userId: user.id,
      action: "update",
      resource: "notifications",
      resourceId: id,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    logger.error({
      message: "Error in notifications API",
      action: "patch",
      resource: "notifications",
      error: error.message,
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
