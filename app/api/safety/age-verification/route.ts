import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { birth_date, verification_method = 'self_reported', parent_email } = await request.json()

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

    // Validate birth date
    if (!birth_date) {
      return NextResponse.json({ error: 'Birth date is required' }, { status: 400 })
    }

    const birthDate = new Date(birth_date)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    const dayDiff = today.getDate() - birthDate.getDate()

    // Adjust age if birthday hasn't occurred this year
    const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age

    // Check if user is under 13 (COPPA compliance)
    if (actualAge < 13) {
      return NextResponse.json({ 
        error: 'Users must be at least 13 years old to use this platform',
        requires_parental_consent: true
      }, { status: 400 })
    }

    // Check if user is under 18 (requires parental consent in some cases)
    const requiresParentalConsent = actualAge < 18
    const isVerified = verification_method !== 'self_reported' || actualAge >= 18

    // Check if age verification already exists
    const { data: existingVerification } = await supabase
      .from('age_verification')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existingVerification) {
      // Update existing verification
      const { data: verification, error: updateError } = await supabase
        .from('age_verification')
        .update({
          birth_date: birthDate.toISOString().split('T')[0],
          verification_method,
          is_verified: isVerified,
          requires_parental_consent: requiresParentalConsent,
          parent_email: requiresParentalConsent ? parent_email : null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating age verification:', updateError)
        return NextResponse.json({ error: 'Failed to update age verification' }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        verification,
        age: actualAge,
        requires_parental_consent: requiresParentalConsent,
        message: isVerified ? 'Age verification updated successfully' : 'Age verification pending parental consent'
      })
    } else {
      // Create new verification
      const { data: verification, error: insertError } = await supabase
        .from('age_verification')
        .insert({
          user_id: user.id,
          birth_date: birthDate.toISOString().split('T')[0],
          verification_method,
          is_verified: isVerified,
          requires_parental_consent: requiresParentalConsent,
          parent_email: requiresParentalConsent ? parent_email : null
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating age verification:', insertError)
        return NextResponse.json({ error: 'Failed to create age verification' }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        verification,
        age: actualAge,
        requires_parental_consent: requiresParentalConsent,
        message: isVerified ? 'Age verification completed successfully' : 'Age verification pending parental consent'
      })
    }

  } catch (error) {
    console.error('Error in age verification:', error)
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

    // Get user's age verification
    const { data: verification, error: verificationError } = await supabase
      .from('age_verification')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (verificationError && verificationError.code !== 'PGRST116') {
      console.error('Error fetching age verification:', verificationError)
      return NextResponse.json({ error: 'Failed to fetch age verification' }, { status: 500 })
    }

    return NextResponse.json({ verification })

  } catch (error) {
    console.error('Error in fetching age verification:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
