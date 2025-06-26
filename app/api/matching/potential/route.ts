```ts file="app/api/matching/matches/route.ts"
[v0-no-op-code-block-prefix]import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import type { Database } from '@/lib/database.types'

export const dynamic = 'force-dynamic'

export async function GET(): Promise<NextResponse> {
  const supabase = createRouteHandlerClient<Database>({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Replace any problematic count queries with proper error handling
  const { data: matches, error } = await supabase
    .from('matches')
    .select(`
    *,\
profile1: profiles!
matches_profile1_id_fkey(*),\
profile2: profiles!
matches_profile2_id_fkey(*)
  `)
    .or(\`profile1_id.eq.${user.id},profile2_id.eq.${user.id}\`)
    .eq('matched', true)

  if (error) {
    console.error('Matches error:', error)
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 })
  }

  return NextResponse.json(matches)
}
