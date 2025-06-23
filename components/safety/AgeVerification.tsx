'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar, Shield, AlertTriangle, CheckCircle, Clock, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

interface AgeVerificationProps {
  onVerified?: (verification: any) => void
  required?: boolean
}

export function AgeVerification({ onVerified, required = false }: AgeVerificationProps) {
  const [formData, setFormData] = useState({
    birth_date: '',
    verification_method: 'self_reported',
    parent_email: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(required)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/safety/age-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to verify age')
      }

      onVerified?.(result.verification)
      if (!required) {
        setIsOpen(false)
      }
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const age = calculateAge(formData.birth_date)
  const isUnder13 = age !== null && age < 13
  const isUnder18 = age !== null && age < 18

  const AgeVerificationForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Birth Date */}
      <div className="space-y-2">
        <Label htmlFor="birth_date">Date of Birth *</Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="birth_date"
            type="date"
            value={formData.birth_date}
            onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
            className="pl-10"
            required
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
        {age !== null && (
          <div className="text-sm text-muted-foreground">
            Age: {age} years old
          </div>
        )}
      </div>

      {/* Age Warnings */}
      {isUnder13 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Age Requirement Not Met</span>
            </div>
            <p className="text-red-700 text-sm mt-2">
              You must be at least 13 years old to use this platform. This is required by law (COPPA).
            </p>
          </CardContent>
        </Card>
      )}

      {isUnder18 && !isUnder13 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-800 mb-3">
              <Users className="h-5 w-5" />
              <span className="font-medium">Parental Consent Required</span>
            </div>
            <p className="text-yellow-700 text-sm mb-3">
              As a minor, you need parental consent to use this platform.
            </p>
            <div className="space-y-2">
              <Label htmlFor="parent_email">Parent/Guardian Email *</Label>
              <Input
                id="parent_email"
                type="email"
                placeholder="parent@example.com"
                value={formData.parent_email}
                onChange={(e) => setFormData(prev => ({ ...prev, parent_email: e.target.value }))}
                required
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verification Method */}
      {!isUnder13 && (
        <div className="space-y-2">
          <Label htmlFor="verification_method">Verification Method</Label>
          <Select
            value={formData.verification_method}
            onValueChange={(value) => setFormData(prev => ({ ...prev, verification_method: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="self_reported">
                <div>
                  <div className="font-medium">Self-Reported</div>
                  <div className="text-sm text-muted-foreground">Basic age verification</div>
                </div>
              </SelectItem>
              <SelectItem value="parental_consent">
                <div>
                  <div className="font-medium">Parental Consent</div>
                  <div className="text-sm text-muted-foreground">For users under 18</div>
                </div>
              </SelectItem>
              <SelectItem value="id_verification">
                <div>
                  <div className="font-medium">ID Verification</div>
                  <div className="text-sm text-muted-foreground">Enhanced verification (coming soon)</div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Privacy Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Privacy Protection</p>
              <ul className="space-y-1 text-blue-700">
                <li>• Your birth date is encrypted and stored securely</li>
                <li>• Only your age verification status is visible to other users</li>
                <li>• Parent emails are only used for consent verification</li>
                <li>• You can update your verification method anytime</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        {!required && (
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={isLoading || isUnder13 || (isUnder18 && !formData.parent_email)}
        >
          {isLoading ? 'Verifying...' : 'Verify Age'}
        </Button>
      </div>
    </form>
  )

  if (required) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Age Verification Required
            </CardTitle>
            <CardDescription>
              We need to verify your age to comply with safety regulations and provide age-appropriate content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AgeVerificationForm />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Shield className="h-4 w-4 mr-2" />
          Verify Age
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Age Verification
          </DialogTitle>
          <DialogDescription>
            Verify your age to unlock all platform features and ensure compliance with safety regulations.
          </DialogDescription>
        </DialogHeader>
        <AgeVerificationForm />
      </DialogContent>
    </Dialog>
  )
}

// Age verification status display component
export function AgeVerificationStatus({ verification }: { verification: any }) {
  if (!verification) {
    return (
      <Badge variant="outline" className="text-yellow-600">
        <Clock className="h-3 w-3 mr-1" />
        Not Verified
      </Badge>
    )
  }

  if (verification.is_verified) {
    return (
      <Badge variant="default" className="text-green-600">
        <CheckCircle className="h-3 w-3 mr-1" />
        Age Verified
      </Badge>
    )
  }

  if (verification.requires_parental_consent) {
    return (
      <Badge variant="outline" className="text-orange-600">
        <Clock className="h-3 w-3 mr-1" />
        Pending Consent
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="text-red-600">
      <AlertTriangle className="h-3 w-3 mr-1" />
      Verification Failed
    </Badge>
  )
}
