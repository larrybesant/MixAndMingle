'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { useSafety } from '@/contexts/safety-context'
import { 
  Shield, 
  AlertTriangle, 
  Users, 
  Heart, 
  MessageSquare, 
  Eye, 
  Lock, 
  Phone, 
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  HelpCircle,
  Flag,
  UserX,
  VolumeX
} from 'lucide-react'

export default function SafetyCenterPage() {
  const { state, loadReports, loadModerationActions } = useSafety()
  const [selectedTab, setSelectedTab] = useState('guidelines')

  React.useEffect(() => {
    loadReports()
    loadModerationActions()
  }, [])

  const getTrustScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    if (score >= 50) return 'text-orange-600'
    return 'text-red-600'
  }

  const getTrustScoreLevel = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 70) return 'Good'
    if (score >= 50) return 'Fair'
    return 'Needs Improvement'
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Safety Center</h1>
          <p className="text-muted-foreground">Your safety tools and community guidelines</p>
        </div>
      </div>

      {/* Trust Score Overview */}
      {state.trustScore && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Your Community Standing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className={`text-2xl font-bold ${getTrustScoreColor(state.trustScore.score)}`}>
                  {state.trustScore.score}/100
                </div>
                <div className="text-sm text-muted-foreground">
                  {getTrustScoreLevel(state.trustScore.score)}
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div>{state.trustScore.reports_received} reports received</div>
                <div>{state.trustScore.strikes} strikes</div>
              </div>
            </div>
            <Progress value={state.trustScore.score} className="h-2" />
          </CardContent>
        </Card>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
          <TabsTrigger value="reports">My Reports</TabsTrigger>
          <TabsTrigger value="blocking">Blocked Users</TabsTrigger>
          <TabsTrigger value="safety-tips">Safety Tips</TabsTrigger>
          <TabsTrigger value="emergency">Emergency</TabsTrigger>
        </TabsList>

        <TabsContent value="guidelines" className="mt-6">
          <CommunityGuidelines />
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <ReportHistory reports={state.reports} />
        </TabsContent>

        <TabsContent value="blocking" className="mt-6">
          <BlockedUsersList moderationActions={state.moderationActions} />
        </TabsContent>

        <TabsContent value="safety-tips" className="mt-6">
          <SafetyTips />
        </TabsContent>

        <TabsContent value="emergency" className="mt-6">
          <EmergencyResources />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function CommunityGuidelines() {
  const guidelines = [
    {
      icon: <Heart className="h-6 w-6 text-red-500" />,
      title: "Respect and Kindness",
      description: "Treat all users with respect, kindness, and empathy. No harassment, bullying, or hate speech.",
      rules: [
        "Be respectful in all interactions",
        "No personal attacks or insults",
        "Respect different opinions and backgrounds",
        "Use inclusive language"
      ]
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-blue-500" />,
      title: "Appropriate Content",
      description: "Keep content appropriate for all ages and backgrounds. No explicit, violent, or disturbing material.",
      rules: [
        "No nudity or sexual content",
        "No graphic violence or gore",
        "No hate symbols or extremist content",
        "Keep music and streams family-friendly"
      ]
    },
    {
      icon: <Users className="h-6 w-6 text-green-500" />,
      title: "Authentic Connections",
      description: "Be yourself and respect others' authentic selves. No impersonation or fake profiles.",
      rules: [
        "Use real photos and information",
        "Don't impersonate others",
        "Be honest about your age",
        "Respect privacy and boundaries"
      ]
    },
    {
      icon: <Lock className="h-6 w-6 text-purple-500" />,
      title: "Privacy and Safety",
      description: "Protect your privacy and respect others'. Never share personal information publicly.",
      rules: [
        "Don't share personal contact information",
        "Respect others' privacy",
        "Report suspicious behavior",
        "Use strong passwords and security settings"
      ]
    },
    {
      icon: <FileText className="h-6 w-6 text-orange-500" />,
      title: "Intellectual Property",
      description: "Respect copyrights and intellectual property. Only share content you own or have permission to use.",
      rules: [
        "Don't play copyrighted music without rights",
        "Credit original creators",
        "Don't share pirated content",
        "Respect DJ and artist rights"
      ]
    }
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Community Guidelines</CardTitle>
          <CardDescription>
            These guidelines help create a safe, welcoming environment for everyone in our community.
          </CardDescription>
        </CardHeader>
      </Card>

      {guidelines.map((guideline, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {guideline.icon}
              {guideline.title}
            </CardTitle>
            <CardDescription>{guideline.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {guideline.rules.map((rule, ruleIndex) => (
                <li key={ruleIndex} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{rule}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}

      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800">Consequences of Violations</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-red-700 space-y-2">
          <p><strong>First violation:</strong> Warning and educational resources</p>
          <p><strong>Repeated violations:</strong> Temporary mute or suspension</p>
          <p><strong>Serious violations:</strong> Account suspension or permanent ban</p>
          <p><strong>Illegal content:</strong> Immediate ban and report to authorities</p>
        </CardContent>
      </Card>
    </div>
  )
}

function ReportHistory({ reports }: { reports: any[] }) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'reviewing':
        return <Eye className="h-4 w-4 text-blue-500" />
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'dismissed':
        return <XCircle className="h-4 w-4 text-gray-500" />
      case 'escalated':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <HelpCircle className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Your Reports</CardTitle>
          <CardDescription>
            Track the status of safety reports you've submitted
          </CardDescription>
        </CardHeader>
      </Card>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Flag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-muted-foreground">You haven't submitted any reports yet</p>
          </CardContent>
        </Card>
      ) : (
        reports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg capitalize">
                  {report.report_type.replace('_', ' ')} Report
                </CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusIcon(report.status)}
                  <Badge variant={
                    report.status === 'resolved' ? 'default' :
                    report.status === 'dismissed' ? 'secondary' :
                    report.status === 'escalated' ? 'destructive' : 'outline'
                  }>
                    {report.status}
                  </Badge>
                </div>
              </div>
              <CardDescription>
                Submitted on {new Date(report.created_at).toLocaleDateString()}
                {report.is_anonymous && " • Anonymous"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{report.description}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Severity: {report.severity}</span>
                <span>ID: {report.id.slice(0, 8)}</span>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

function BlockedUsersList({ moderationActions }: { moderationActions: any[] }) {
  const blockedUsers = moderationActions.filter(action => action.action_type === 'block')
  const mutedUsers = moderationActions.filter(action => action.action_type === 'mute')

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Blocked & Muted Users</CardTitle>
          <CardDescription>
            Manage users you've blocked or muted for your safety
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserX className="h-5 w-5 text-red-500" />
              Blocked Users ({blockedUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {blockedUsers.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No blocked users</p>
            ) : (
              <div className="space-y-3">
                {blockedUsers.map((action) => (
                  <div key={action.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{action.target_user?.profiles?.username || 'Unknown User'}</p>
                      <p className="text-sm text-muted-foreground">
                        Blocked {new Date(action.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Unblock
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <VolumeX className="h-5 w-5 text-yellow-500" />
              Muted Users ({mutedUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mutedUsers.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No muted users</p>
            ) : (
              <div className="space-y-3">
                {mutedUsers.map((action) => (
                  <div key={action.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{action.target_user?.profiles?.username || 'Unknown User'}</p>
                      <p className="text-sm text-muted-foreground">
                        Muted {new Date(action.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Unmute
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SafetyTips() {
  const tips = [
    {
      icon: <Lock className="h-6 w-6 text-blue-500" />,
      title: "Protect Your Privacy",
      tips: [
        "Never share personal information like your full name, address, or phone number",
        "Use strong, unique passwords for your account",
        "Be cautious about sharing photos that reveal your location",
        "Review your privacy settings regularly"
      ]
    },
    {
      icon: <Eye className="h-6 w-6 text-green-500" />,
      title: "Recognize Red Flags",
      tips: [
        "Users who ask for personal information immediately",
        "Requests to move conversations off the platform",
        "Aggressive or pushy behavior",
        "Inconsistent stories or fake-looking profiles"
      ]
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-purple-500" />,
      title: "Safe Communication",
      tips: [
        "Keep conversations on the platform initially",
        "Trust your instincts if something feels wrong",
        "Don't feel pressured to respond to uncomfortable messages",
        "Use video chat to verify someone's identity"
      ]
    },
    {
      icon: <Users className="h-6 w-6 text-orange-500" />,
      title: "Meeting in Person",
      tips: [
        "Always meet in public places for first meetings",
        "Tell a friend or family member your plans",
        "Plan your own transportation",
        "Consider bringing a friend to group events"
      ]
    }
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Safety Tips</CardTitle>
          <CardDescription>
            Best practices to stay safe while using our platform
          </CardDescription>
        </CardHeader>
      </Card>

      {tips.map((category, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {category.icon}
              {category.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {category.tips.map((tip, tipIndex) => (
                <li key={tipIndex} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function EmergencyResources() {
  return (
    <div className="space-y-6">
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Emergency Contacts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold text-red-800">Crisis Hotlines</h4>
              <div className="space-y-2 text-sm">
                <p>National Suicide Prevention Lifeline: <strong>988</strong></p>
                <p>Crisis Text Line: Text HOME to <strong>741741</strong></p>
                <p>National Domestic Violence Hotline: <strong>1-800-799-7233</strong></p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-red-800">Emergency Services</h4>
              <div className="space-y-2 text-sm">
                <p>Emergency Services: <strong>911</strong></p>
                <p>Poison Control: <strong>1-800-222-1222</strong></p>
                <p>RAINN Sexual Assault Hotline: <strong>1-800-656-4673</strong></p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>If You're in Immediate Danger</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 mb-2">If you're in immediate physical danger:</p>
                <ul className="text-yellow-700 space-y-1">
                  <li>• Call 911 or your local emergency services immediately</li>
                  <li>• Move to a safe location if possible</li>
                  <li>• Don't worry about our platform - your safety comes first</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Steps to Take:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Ensure your immediate safety</li>
              <li>Contact emergency services if needed</li>
              <li>Block and report the user on our platform</li>
              <li>Document any threats or harassment</li>
              <li>Consider contacting law enforcement</li>
              <li>Reach out to trusted friends or family</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Our Safety Team</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            For urgent safety concerns that require immediate attention from our team:
          </p>
          <div className="space-y-2 text-sm">
            <p>Email: <strong>safety@mixandmingle.com</strong></p>
            <p>Response time: Within 2 hours for critical safety issues</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
