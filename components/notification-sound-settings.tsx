"use client"

import { useState, useEffect } from "react"
import { Volume2, VolumeX, CloudIcon as CloudSync, CloudOff } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { audioService } from "@/lib/audio-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { QuietHoursSettings } from "@/components/quiet-hours-settings"

export function NotificationSoundSettings() {
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [selectedSound, setSelectedSound] = useState<string>("message")
  const [typeSettings, setTypeSettings] = useState<Record<string, boolean>>({})
  const [activeTab, setActiveTab] = useState("general")
  const [isSynced, setIsSynced] = useState(false)
  const [isInQuietHours, setIsInQuietHours] = useState(false)
  const { user } = useAuth()

  // Initialize state from audio service
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioService.initialize()
      setMuted(audioService.isMuted())
      setVolume(audioService.getVolume())
      setTypeSettings(audioService.getTypeSettings())
      setIsInQuietHours(audioService.isInQuietHoursNow())

      // Initialize with user when available
      if (user) {
        audioService.initializeWithUser(user.uid).then(() => {
          // Update state with synced settings
          setMuted(audioService.isMuted())
          setVolume(audioService.getVolume())
          setTypeSettings(audioService.getTypeSettings())
          setIsInQuietHours(audioService.isInQuietHoursNow())
          setIsSynced(true)
        })
      }

      // Check quiet hours status every minute
      const interval = setInterval(() => {
        setIsInQuietHours(audioService.isInQuietHoursNow())
      }, 60000)

      return () => clearInterval(interval)
    }
  }, [user])

  // Handle mute toggle
  const handleMuteToggle = (checked: boolean) => {
    setMuted(!checked)
    audioService.setMuted(!checked)
  }

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    audioService.setVolume(newVolume)
  }

  // Play test sound
  const playTestSound = () => {
    audioService.playSound(selectedSound)
  }

  // Handle type toggle
  const handleTypeToggle = (type: string, enabled: boolean) => {
    audioService.setTypeEnabled(type, enabled)
    setTypeSettings(audioService.getTypeSettings())
  }

  // Get human-readable names for notification types
  const typeNames = audioService.getTypeNames()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Notification Sounds</CardTitle>
              <CardDescription>Customize how notification sounds work in Mix & Mingle</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {isInQuietHours && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="gap-1 border-amber-500 text-amber-500">
                        <VolumeX className="h-3 w-3" />
                        <span>Quiet Hours</span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>Quiet hours are active. Notification sounds are currently muted.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant={isSynced ? "outline" : "secondary"} className="gap-1">
                      {isSynced ? (
                        <>
                          <CloudSync className="h-3 w-3" />
                          <span>Synced</span>
                        </>
                      ) : (
                        <>
                          <CloudOff className="h-3 w-3" />
                          <span>Local Only</span>
                        </>
                      )}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isSynced
                      ? "Your sound settings are synced across all your devices"
                      : "Your sound settings are only saved on this device"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">General Settings</TabsTrigger>
              <TabsTrigger value="types">Notification Types</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6 mt-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notification-sounds">Notification Sounds</Label>
                  <p className="text-sm text-muted-foreground">Enable or disable all notification sounds</p>
                </div>
                <Switch id="notification-sounds" checked={!muted} onCheckedChange={handleMuteToggle} />
              </div>

              <div className="space-y-4">
                <Label htmlFor="volume-slider">Volume</Label>
                <div className="flex items-center gap-2">
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                  <Slider
                    id="volume-slider"
                    disabled={muted}
                    value={[volume]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                    className="flex-1"
                  />
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="test-sound">Test Sound</Label>
                <div className="flex items-center gap-2">
                  <Select value={selectedSound} onValueChange={setSelectedSound} disabled={muted || isInQuietHours}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select sound" />
                    </SelectTrigger>
                    <SelectContent>
                      {audioService.notificationTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {typeNames[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={playTestSound} disabled={muted || isInQuietHours}>
                    Play
                  </Button>
                </div>
                {isInQuietHours && (
                  <p className="text-xs text-amber-500">Test sounds are disabled during quiet hours.</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="types" className="mt-4">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Choose which notification types play sounds. These settings only apply when sounds are enabled.
                </p>

                {audioService.notificationTypes.map((type) => (
                  <div key={type} className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <Label htmlFor={`sound-${type}`}>{typeNames[type]}</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`sound-${type}`}
                        checked={typeSettings[type] ?? true}
                        onCheckedChange={(checked) => handleTypeToggle(type, checked)}
                        disabled={muted}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => audioService.playSound(type)}
                        disabled={muted || isInQuietHours || !(typeSettings[type] ?? true)}
                        className="h-8 w-8"
                      >
                        <Volume2 className="h-4 w-4" />
                        <span className="sr-only">Test {typeNames[type]} sound</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-xs text-muted-foreground">
            {isSynced
              ? "Settings are automatically synced across all your devices"
              : "Settings are saved locally on this device only"}
          </p>
        </CardFooter>
      </Card>

      <QuietHoursSettings />
    </div>
  )
}
