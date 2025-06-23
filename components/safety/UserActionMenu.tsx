'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useSafety } from '@/contexts/safety-context'
import { MoreHorizontal, UserX, VolumeX, Eye, MessageCircle, Flag, Shield, AlertTriangle } from 'lucide-react'
import { ReportForm } from './ReportForm'

interface UserActionMenuProps {
  userId: string
  username?: string
  reportedContentId?: string
  contentType?: string
  onAction?: (action: string) => void
}

export function UserActionMenu({ 
  userId, 
  username, 
  reportedContentId, 
  contentType, 
  onAction 
}: UserActionMenuProps) {
  const { blockUser, unblockUser, muteUser, unmuteUser, isUserBlocked, isUserMuted, state } = useSafety()
  const [confirmAction, setConfirmAction] = useState<{
    type: 'block' | 'unblock' | 'mute' | 'unmute' | null
    isOpen: boolean
  }>({ type: null, isOpen: false })

  const blocked = isUserBlocked(userId)
  const muted = isUserMuted(userId)

  const handleAction = async (actionType: 'block' | 'unblock' | 'mute' | 'unmute') => {
    try {
      switch (actionType) {
        case 'block':
          await blockUser(userId)
          onAction?.('blocked')
          break
        case 'unblock':
          await unblockUser(userId)
          onAction?.('unblocked')
          break
        case 'mute':
          await muteUser(userId)
          onAction?.('muted')
          break
        case 'unmute':
          await unmuteUser(userId)
          onAction?.('unmuted')
          break
      }
      setConfirmAction({ type: null, isOpen: false })
    } catch (error) {
      console.error(`Error ${actionType}ing user:`, error)
    }
  }

  const getActionDescription = (action: string) => {
    switch (action) {
      case 'block':
        return `You will no longer see content from ${username || 'this user'}, and they won't be able to contact you or see your activity.`
      case 'unblock':
        return `You will be able to see content from ${username || 'this user'} again, and they can contact you.`
      case 'mute':
        return `You won't see messages from ${username || 'this user'} in chats and rooms, but they can still see your content.`
      case 'unmute':
        return `You will see messages from ${username || 'this user'} in chats and rooms again.`
      default:
        return ''
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {/* View Profile */}
          <DropdownMenuItem>
            <Eye className="mr-2 h-4 w-4" />
            View Profile
          </DropdownMenuItem>
          
          {/* Send Message */}
          {!blocked && (
            <DropdownMenuItem>
              <MessageCircle className="mr-2 h-4 w-4" />
              Send Message
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* Mute/Unmute */}
          {!blocked && (
            <DropdownMenuItem
              onClick={() => setConfirmAction({ 
                type: muted ? 'unmute' : 'mute', 
                isOpen: true 
              })}
              className={muted ? "text-green-600" : "text-yellow-600"}
            >
              <VolumeX className="mr-2 h-4 w-4" />
              {muted ? 'Unmute User' : 'Mute User'}
            </DropdownMenuItem>
          )}

          {/* Block/Unblock */}
          <DropdownMenuItem
            onClick={() => setConfirmAction({ 
              type: blocked ? 'unblock' : 'block', 
              isOpen: true 
            })}
            className={blocked ? "text-green-600" : "text-red-600"}
          >
            <UserX className="mr-2 h-4 w-4" />
            {blocked ? 'Unblock User' : 'Block User'}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Report User */}
          <ReportForm
            reportedUserId={userId}
            reportedContentId={reportedContentId}
            contentType={contentType}
            onSubmitted={() => onAction?.('reported')}
          />
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confirmation Dialog */}
      <Dialog 
        open={confirmAction.isOpen} 
        onOpenChange={(open) => setConfirmAction({ type: null, isOpen: open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {confirmAction.type === 'block' && <UserX className="h-5 w-5 text-red-500" />}
              {confirmAction.type === 'unblock' && <Shield className="h-5 w-5 text-green-500" />}
              {confirmAction.type === 'mute' && <VolumeX className="h-5 w-5 text-yellow-500" />}
              {confirmAction.type === 'unmute' && <VolumeX className="h-5 w-5 text-green-500" />}
              {confirmAction.type && (
                confirmAction.type.charAt(0).toUpperCase() + confirmAction.type.slice(1)
              )} {username || 'User'}
            </DialogTitle>
            <DialogDescription>
              {confirmAction.type && getActionDescription(confirmAction.type)}
            </DialogDescription>
          </DialogHeader>

          {confirmAction.type === 'block' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-red-800 mb-1">This action will:</p>
                  <ul className="text-red-700 space-y-1">
                    <li>• Remove them from your friends/followers</li>
                    <li>• Hide all their content from your feeds</li>
                    <li>• Prevent them from contacting you</li>
                    <li>• Hide you from their search results</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmAction({ type: null, isOpen: false })}
            >
              Cancel
            </Button>
            <Button
              variant={confirmAction.type === 'block' ? 'destructive' : 'default'}
              onClick={() => confirmAction.type && handleAction(confirmAction.type)}
              disabled={state.isLoading}
            >
              {state.isLoading ? 'Processing...' : (
                confirmAction.type && (
                  confirmAction.type.charAt(0).toUpperCase() + confirmAction.type.slice(1)
                )
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Quick action buttons for urgent situations
export function QuickSafetyActions({ userId, username }: { userId: string; username?: string }) {
  const { blockUser, muteUser, isUserBlocked, isUserMuted } = useSafety()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleQuickAction = async (action: 'block' | 'mute') => {
    setIsLoading(action)
    try {
      if (action === 'block') {
        await blockUser(userId)
      } else {
        await muteUser(userId)
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error)
    } finally {
      setIsLoading(null)
    }
  }

  const blocked = isUserBlocked(userId)
  const muted = isUserMuted(userId)

  if (blocked) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <UserX className="h-4 w-4" />
        User blocked
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {!muted ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickAction('mute')}
          disabled={isLoading === 'mute'}
          className="text-yellow-600 hover:text-yellow-700"
        >
          <VolumeX className="h-4 w-4 mr-1" />
          {isLoading === 'mute' ? 'Muting...' : 'Mute'}
        </Button>
      ) : (
        <div className="flex items-center gap-1 text-sm text-yellow-600">
          <VolumeX className="h-4 w-4" />
          Muted
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleQuickAction('block')}
        disabled={isLoading === 'block'}
        className="text-red-600 hover:text-red-700"
      >
        <UserX className="h-4 w-4 mr-1" />
        {isLoading === 'block' ? 'Blocking...' : 'Block'}
      </Button>

      <ReportForm
        reportedUserId={userId}
        onSubmitted={() => console.log('Report submitted for', username)}
      />
    </div>
  )
}
