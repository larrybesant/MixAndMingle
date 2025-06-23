'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

// Types
interface Report {
  id: string
  report_type: string
  severity: string
  description: string
  status: string
  created_at: string
  is_anonymous: boolean
  reporter?: { id: string; profiles: { username: string } }
  reported_user?: { id: string; profiles: { username: string } }
}

interface ModerationAction {
  id: string
  target_user_id: string
  action_type: 'block' | 'mute'
  created_at: string
  target_user: {
    id: string
    profiles: {
      username: string
      full_name: string
      avatar_url: string
    }
  }
}

interface TrustScore {
  score: number
  reports_received: number
  reports_upheld: number
  strikes: number
  last_violation?: string
}

interface SafetyState {
  reports: Report[]
  moderationActions: ModerationAction[]
  trustScore: TrustScore | null
  blockedUsers: Set<string>
  mutedUsers: Set<string>
  isLoading: boolean
  error: string | null
}

type SafetyAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_REPORTS'; payload: Report[] }
  | { type: 'ADD_REPORT'; payload: Report }
  | { type: 'SET_MODERATION_ACTIONS'; payload: ModerationAction[] }
  | { type: 'ADD_MODERATION_ACTION'; payload: ModerationAction }
  | { type: 'REMOVE_MODERATION_ACTION'; payload: { target_user_id: string; action_type: string } }
  | { type: 'SET_TRUST_SCORE'; payload: TrustScore }
  | { type: 'UPDATE_BLOCKED_USERS'; payload: string[] }
  | { type: 'UPDATE_MUTED_USERS'; payload: string[] }

const initialState: SafetyState = {
  reports: [],
  moderationActions: [],
  trustScore: null,
  blockedUsers: new Set(),
  mutedUsers: new Set(),
  isLoading: false,
  error: null
}

function safetyReducer(state: SafetyState, action: SafetyAction): SafetyState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    
    case 'SET_REPORTS':
      return { ...state, reports: action.payload }
    
    case 'ADD_REPORT':
      return { ...state, reports: [action.payload, ...state.reports] }
    
    case 'SET_MODERATION_ACTIONS':
      const blocked = new Set(
        action.payload.filter(a => a.action_type === 'block').map(a => a.target_user_id)
      )
      const muted = new Set(
        action.payload.filter(a => a.action_type === 'mute').map(a => a.target_user_id)
      )
      return { 
        ...state, 
        moderationActions: action.payload,
        blockedUsers: blocked,
        mutedUsers: muted
      }
    
    case 'ADD_MODERATION_ACTION':
      const newBlockedUsers = new Set(state.blockedUsers)
      const newMutedUsers = new Set(state.mutedUsers)
      
      if (action.payload.action_type === 'block') {
        newBlockedUsers.add(action.payload.target_user_id)
      } else if (action.payload.action_type === 'mute') {
        newMutedUsers.add(action.payload.target_user_id)
      }
      
      return {
        ...state,
        moderationActions: [action.payload, ...state.moderationActions],
        blockedUsers: newBlockedUsers,
        mutedUsers: newMutedUsers
      }
    
    case 'REMOVE_MODERATION_ACTION':
      const filteredActions = state.moderationActions.filter(
        a => !(a.target_user_id === action.payload.target_user_id && 
               a.action_type === action.payload.action_type)
      )
      
      const updatedBlockedUsers = new Set(state.blockedUsers)
      const updatedMutedUsers = new Set(state.mutedUsers)
      
      if (action.payload.action_type === 'block') {
        updatedBlockedUsers.delete(action.payload.target_user_id)
      } else if (action.payload.action_type === 'mute') {
        updatedMutedUsers.delete(action.payload.target_user_id)
      }
      
      return {
        ...state,
        moderationActions: filteredActions,
        blockedUsers: updatedBlockedUsers,
        mutedUsers: updatedMutedUsers
      }
    
    case 'SET_TRUST_SCORE':
      return { ...state, trustScore: action.payload }
    
    case 'UPDATE_BLOCKED_USERS':
      return { ...state, blockedUsers: new Set(action.payload) }
    
    case 'UPDATE_MUTED_USERS':
      return { ...state, mutedUsers: new Set(action.payload) }
    
    default:
      return state
  }
}

interface SafetyContextType {
  state: SafetyState
  submitReport: (reportData: {
    reported_user_id: string
    reported_content_id?: string
    content_type?: string
    report_type: string
    severity?: string
    description: string
    evidence_urls?: string[]
    is_anonymous?: boolean
  }) => Promise<void>
  blockUser: (userId: string) => Promise<void>
  unblockUser: (userId: string) => Promise<void>
  muteUser: (userId: string) => Promise<void>
  unmuteUser: (userId: string) => Promise<void>
  isUserBlocked: (userId: string) => boolean
  isUserMuted: (userId: string) => boolean
  loadReports: () => Promise<void>
  loadModerationActions: () => Promise<void>
  loadTrustScore: () => Promise<void>
}

const SafetyContext = createContext<SafetyContextType | undefined>(undefined)

export function SafetyProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(safetyReducer, initialState)

  // Load user's safety data on mount
  useEffect(() => {
    loadModerationActions()
    loadTrustScore()
  }, [])

  const submitReport = async (reportData: any) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const response = await fetch('/api/safety/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(reportData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit report')
      }

      const result = await response.json()
      
      // Optionally reload reports to show the new one
      // await loadReports()
      
      dispatch({ type: 'SET_LOADING', payload: false })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message })
    }
  }

  const blockUser = async (userId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const response = await fetch('/api/safety/moderation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          target_user_id: userId,
          action_type: 'block'
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to block user')
      }

      const result = await response.json()
      dispatch({ type: 'ADD_MODERATION_ACTION', payload: result.action })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message })
    }
  }

  const unblockUser = async (userId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const response = await fetch(`/api/safety/moderation?target_user_id=${userId}&action_type=block`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to unblock user')
      }

      dispatch({ 
        type: 'REMOVE_MODERATION_ACTION', 
        payload: { target_user_id: userId, action_type: 'block' }
      })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message })
    }
  }

  const muteUser = async (userId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const response = await fetch('/api/safety/moderation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          target_user_id: userId,
          action_type: 'mute'
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to mute user')
      }

      const result = await response.json()
      dispatch({ type: 'ADD_MODERATION_ACTION', payload: result.action })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message })
    }
  }

  const unmuteUser = async (userId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const response = await fetch(`/api/safety/moderation?target_user_id=${userId}&action_type=mute`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to unmute user')
      }

      dispatch({ 
        type: 'REMOVE_MODERATION_ACTION', 
        payload: { target_user_id: userId, action_type: 'mute' }
      })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message })
    }
  }

  const isUserBlocked = (userId: string) => state.blockedUsers.has(userId)
  const isUserMuted = (userId: string) => state.mutedUsers.has(userId)

  const loadReports = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch('/api/safety/reports', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        dispatch({ type: 'SET_REPORTS', payload: result.reports })
      }
    } catch (error) {
      console.error('Error loading reports:', error)
    }
  }

  const loadModerationActions = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch('/api/safety/moderation', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        dispatch({ type: 'SET_MODERATION_ACTIONS', payload: result.moderation_actions })
      }
    } catch (error) {
      console.error('Error loading moderation actions:', error)
    }
  }

  const loadTrustScore = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: trustScore } = await supabase
        .from('user_trust_scores')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (trustScore) {
        dispatch({ type: 'SET_TRUST_SCORE', payload: trustScore })
      }
    } catch (error) {
      console.error('Error loading trust score:', error)
    }
  }

  const value: SafetyContextType = {
    state,
    submitReport,
    blockUser,
    unblockUser,
    muteUser,
    unmuteUser,
    isUserBlocked,
    isUserMuted,
    loadReports,
    loadModerationActions,
    loadTrustScore
  }

  return (
    <SafetyContext.Provider value={value}>
      {children}
    </SafetyContext.Provider>
  )
}

export function useSafety() {
  const context = useContext(SafetyContext)
  if (context === undefined) {
    throw new Error('useSafety must be used within a SafetyProvider')
  }
  return context
}
