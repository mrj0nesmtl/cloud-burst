"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

interface CookieSettings {
  necessary: boolean
  functional: boolean
  performance: boolean
}

export function CookieConsent() {
  const [open, setOpen] = useState(false)
  const [settings, setSettings] = useState<CookieSettings>({
    necessary: true,
    functional: true,
    performance: true,
  })
  const { toast } = useToast()

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent")
    if (!consent) {
      setOpen(true)
    }
  }, [])

  const savePreferences = () => {
    localStorage.setItem("cookie-consent", JSON.stringify(settings))
    setOpen(false)
    toast({
      title: "Preferences saved",
      description: "Your cookie preferences have been updated.",
    })
  }

  if (!open) return null

  return (
    <Card className="fixed bottom-4 right-4 p-6 w-[400px] space-y-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Cookie Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your cookie settings here.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label className="text-sm font-medium">Strictly Necessary</label>
            <p className="text-xs text-muted-foreground">
              These cookies are essential to use the website.
            </p>
          </div>
          <Switch checked={settings.necessary} disabled />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label className="text-sm font-medium">Functional Cookies</label>
            <p className="text-xs text-muted-foreground">
              Enable personalized functionality.
            </p>
          </div>
          <Switch
            checked={settings.functional}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, functional: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label className="text-sm font-medium">Performance Cookies</label>
            <p className="text-xs text-muted-foreground">
              Help improve our website performance.
            </p>
          </div>
          <Switch
            checked={settings.performance}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, performance: checked })
            }
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => setOpen(false)}>
          Decline All
        </Button>
        <Button onClick={savePreferences}>Save preferences</Button>
      </div>
    </Card>
  )
} 