'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useSafety } from '@/contexts/safety-context'
import { AlertTriangle, Flag, Shield, Eye, EyeOff } from 'lucide-react'

interface ReportFormProps {
  reportedUserId: string
  reportedContentId?: string
  contentType?: string
  onSubmitted?: () => void
}

export function ReportForm({ reportedUserId, reportedContentId, contentType, onSubmitted }: ReportFormProps) {
  const { submitReport, state } = useSafety()
  const [formData, setFormData] = useState({
    report_type: '',
    severity: 'medium',
    description: '',
    evidence_urls: [] as string[],
    is_anonymous: false
  })
  const [evidenceUrl, setEvidenceUrl] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const reportTypes = [
    { value: 'harassment', label: 'Harassment or Bullying', description: 'Targeted abuse, intimidation, or threats' },
    { value: 'hate_speech', label: 'Hate Speech', description: 'Content promoting hatred based on identity' },
    { value: 'threats', label: 'Threats or Violence', description: 'Threats of harm or violent content' },
    { value: 'inappropriate_content', label: 'Inappropriate Content', description: 'Sexual, graphic, or disturbing content' },
    { value: 'spam', label: 'Spam or Scam', description: 'Unwanted promotional content or fraudulent activity' },
    { value: 'fake_profile', label: 'Fake Profile', description: 'Impersonation or false identity' },
    { value: 'underage', label: 'Underage User', description: 'User appears to be under 13 years old' },
    { value: 'copyright', label: 'Copyright Violation', description: 'Unauthorized use of copyrighted material' },
    { value: 'other', label: 'Other', description: 'Other safety or community guideline violations' }
  ]

  const severityLevels = [
    { value: 'low', label: 'Low', description: 'Minor issue, educational response needed' },
    { value: 'medium', label: 'Medium', description: 'Moderate violation, warning or temporary action' },
    { value: 'high', label: 'High', description: 'Serious violation, immediate action required' },
    { value: 'critical', label: 'Critical', description: 'Severe violation, emergency response needed' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.report_type || !formData.description.trim()) {
      return
    }

    try {
      await submitReport({
        reported_user_id: reportedUserId,
        reported_content_id: reportedContentId,
        content_type: contentType,
        ...formData,
        evidence_urls: formData.evidence_urls.filter(url => url.trim() !== '')
      })

      // Reset form
      setFormData({
        report_type: '',
        severity: 'medium',
        description: '',
        evidence_urls: [],
        is_anonymous: false
      })
      setEvidenceUrl('')
      setIsOpen(false)
      onSubmitted?.()
    } catch (error) {
      console.error('Error submitting report:', error)
    }
  }

  const addEvidenceUrl = () => {
    if (evidenceUrl.trim() && !formData.evidence_urls.includes(evidenceUrl.trim())) {
      setFormData(prev => ({
        ...prev,
        evidence_urls: [...prev.evidence_urls, evidenceUrl.trim()]
      }))
      setEvidenceUrl('')
    }
  }

  const removeEvidenceUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      evidence_urls: prev.evidence_urls.filter((_, i) => i !== index)
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
          <Flag className="h-4 w-4 mr-2" />
          Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-500" />
            Report Safety Issue
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Report Type */}
          <div className="space-y-3">
            <Label htmlFor="report_type">Type of Issue *</Label>
            <Select value={formData.report_type} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, report_type: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select the type of issue" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-sm text-muted-foreground">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Severity */}
          <div className="space-y-3">
            <Label htmlFor="severity">Severity Level</Label>
            <Select value={formData.severity} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, severity: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {severityLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        level.value === 'critical' ? 'destructive' :
                        level.value === 'high' ? 'destructive' :
                        level.value === 'medium' ? 'default' : 'secondary'
                      }>
                        {level.label}
                      </Badge>
                      <span className="text-sm">{level.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Please provide details about what happened, when it occurred, and any context that would help our moderation team understand the situation..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="min-h-[100px]"
              required
            />
          </div>

          {/* Evidence URLs */}
          <div className="space-y-3">
            <Label>Evidence (Screenshots, Links, etc.)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com/screenshot.png"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEvidenceUrl())}
              />
              <Button type="button" onClick={addEvidenceUrl} variant="outline">
                Add
              </Button>
            </div>
            {formData.evidence_urls.length > 0 && (
              <div className="space-y-2">
                {formData.evidence_urls.map((url, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                    <span className="text-sm truncate">{url}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEvidenceUrl(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Anonymous Reporting */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={formData.is_anonymous}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, is_anonymous: checked as boolean }))
              }
            />
            <Label htmlFor="anonymous" className="flex items-center gap-2">
              {formData.is_anonymous ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              Submit anonymously
            </Label>
          </div>

          <Separator />

          {/* Safety Notice */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                Important Safety Information
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• Reports are reviewed by our moderation team within 24 hours</p>
              <p>• False reports may result in account restrictions</p>
              <p>• For immediate safety concerns, contact emergency services</p>
              <p>• You can block or mute users immediately for your protection</p>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.report_type || !formData.description.trim() || state.isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {state.isLoading ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>

          {state.error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
              {state.error}
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
