import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { target_user_id, action_type } = await request.json()

    // Get current user from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate required fields
    if (!target_user_id || !action_type) {
      return NextResponse.json({ 
        error: 'Missing required fields: target_user_id, action_type' 
      }, { status: 400 })
    }

    // Validate action type
    if (!['block', 'mute'].includes(action_type)) {
      return NextResponse.json({ error: 'Invalid action type' }, { status: 400 })
    }

    // Check if user is trying to block/mute themselves
    if (target_user_id === user.id) {
      return NextResponse.json({ error: 'Cannot block/mute yourself' }, { status: 400 })
    }

    // Check if action already exists
    const { data: existingAction } = await supabase
      .from('user_moderation')
      .select('id')
      .eq('user_id', user.id)
      .eq('target_user_id', target_user_id)
      .eq('action_type', action_type)
      .single()

    if (existingAction) {
      return NextResponse.json({ 
        error: `User is already ${action_type}ed` 
      }, { status: 409 })
    }

    // Create the moderation action
    const { data: moderationAction, error: moderationError } = await supabase
      .from('user_moderation')
      .insert({
        user_id: user.id,
        target_user_id,
        action_type
      })
      .select()
      .single()

    if (moderationError) {
      console.error('Error creating moderation action:', moderationError)
      return NextResponse.json({ error: 'Failed to create moderation action' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      action: moderationAction,
      message: `User has been ${action_type}ed successfully`
    })

  } catch (error) {
    console.error('Error in user moderation:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { searchParams } = new URL(request.url)
    const target_user_id = searchParams.get('target_user_id')
    const action_type = searchParams.get('action_type')

    // Get current user from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate required fields
    if (!target_user_id || !action_type) {
      return NextResponse.json({ 
        error: 'Missing required fields: target_user_id, action_type' 
      }, { status: 400 })
    }

    // Remove the moderation action
    const { error: deleteError } = await supabase
      .from('user_moderation')
      .delete()
      .eq('user_id', user.id)
      .eq('target_user_id', target_user_id)
      .eq('action_type', action_type)

    if (deleteError) {
      console.error('Error removing moderation action:', deleteError)
      return NextResponse.json({ error: 'Failed to remove moderation action' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: `User has been un${action_type}ed successfully`
    })

  } catch (error) {
    console.error('Error in removing user moderation:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get current user from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's moderation actions
    const { data: moderationActions, error: moderationError } = await supabase
      .from('user_moderation')
      .select(`
        id,
        target_user_id,
        action_type,
        created_at,
        target_user:target_user_id(
          id,
          profiles(username, full_name, avatar_url)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (moderationError) {
      console.error('Error fetching moderation actions:', moderationError)
      return NextResponse.json({ error: 'Failed to fetch moderation actions' }, { status: 500 })
    }

    return NextResponse.json({ moderation_actions: moderationActions })

  } catch (error) {
    console.error('Error in fetching user moderation:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
