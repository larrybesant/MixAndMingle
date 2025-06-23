import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const {
      reported_user_id,
      reported_content_id,
      content_type,
      report_type,
      severity = 'medium',
      description,
      evidence_urls = [],
      is_anonymous = false
    } = await request.json()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate required fields
    if (!reported_user_id || !report_type || !description) {
      return NextResponse.json({ 
        error: 'Missing required fields: reported_user_id, report_type, description' 
      }, { status: 400 })
    }

    // Validate report type
    const validReportTypes = [
      'harassment', 'hate_speech', 'bullying', 'threats', 
      'inappropriate_content', 'spam', 'fake_profile', 
      'underage', 'copyright', 'other'
    ]
    if (!validReportTypes.includes(report_type)) {
      return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }

    // Check if user is trying to report themselves
    if (reported_user_id === user.id) {
      return NextResponse.json({ error: 'Cannot report yourself' }, { status: 400 })
    }

    // Check if user has already reported this user for the same content
    const { data: existingReport } = await supabase
      .from('community_reports')
      .select('id')
      .eq('reporter_id', user.id)
      .eq('reported_user_id', reported_user_id)
      .eq('reported_content_id', reported_content_id)
      .eq('status', 'pending')
      .single()

    if (existingReport) {
      return NextResponse.json({ 
        error: 'You have already reported this user for this content' 
      }, { status: 409 })
    }

    // Create the report
    const { data: report, error: reportError } = await supabase
      .from('community_reports')
      .insert({
        reporter_id: is_anonymous ? null : user.id,
        reported_user_id,
        reported_content_id,
        content_type,
        report_type,
        severity,
        description,
        evidence_urls,
        is_anonymous,
        status: 'pending'
      })
      .select()
      .single()

    if (reportError) {
      console.error('Error creating report:', reportError)
      return NextResponse.json({ error: 'Failed to create report' }, { status: 500 })
    }

    // Update user trust score for the reported user
    await supabase.rpc('increment_reports_received', { 
      target_user_id: reported_user_id 
    })

    // Log safety incident for pattern detection
    await supabase
      .from('safety_incidents')
      .insert({
        user_id: reported_user_id,
        incident_type: report_type,
        description: `Reported by user: ${description}`,
        automatic_detection: false
      })

    // Send notification to moderation team (in production)
    // await notifyModerationTeam(report)

    return NextResponse.json({ 
      success: true, 
      report_id: report.id,
      message: 'Report submitted successfully. Our moderation team will review it within 24 hours.'
    })

  } catch (error) {
    console.error('Error in report submission:', error)
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
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's reports (both made and received)
    const { data: reports, error: reportsError } = await supabase
      .from('community_reports')
      .select(`
        id,
        report_type,
        severity,
        description,
        status,
        created_at,
        is_anonymous,
        reporter:reporter_id(id, profiles(username)),
        reported_user:reported_user_id(id, profiles(username))
      `)
      .or(`reporter_id.eq.${user.id},reported_user_id.eq.${user.id}`)
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (reportsError) {
      console.error('Error fetching reports:', reportsError)
      return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
    }

    return NextResponse.json({ reports })

  } catch (error) {
    console.error('Error in reports fetch:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
