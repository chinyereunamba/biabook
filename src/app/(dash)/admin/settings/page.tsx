"use client";

import { useState } from "react";
import {
  Save,
  RefreshCw,
  Bell,
  Shield,
  Database,
  Mail,
  MessageSquare,
  Globe,
  CreditCard,
  Users,
  Settings as SettingsIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    // Platform Settings
    platformName: "BiaBook",
    platformDescription: "The easiest way to book appointments",
    supportEmail: "support@biabook.com",
    maxBusinessesPerUser: 5,

    // Notification Settings
    emailNotifications: true,
    whatsappNotifications: true,
    smsNotifications: false,
    pushNotifications: true,

    // Security Settings
    requireEmailVerification: true,
    enableTwoFactor: false,
    sessionTimeout: 24,
    maxLoginAttempts: 5,

    // Business Settings
    autoApproveBusinesses: false,
    requireBusinessVerification: true,
    defaultBookingWindow: 30,
    maxAdvanceBooking: 90,

    // Payment Settings
    platformFeePercentage: 5,
    minimumPayout: 50,
    payoutSchedule: "weekly",

    // WhatsApp Settings
    whatsappApiUrl: "https://graph.facebook.com/v18.0",
    whatsappPhoneNumberId: "",
    whatsappAccessToken: "",

    // Email Settings
    emailProvider: "smtp",
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    smtpUsername: "",
    smtpPassword: "",
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Settings saved:", settings);
      // Show success message
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="bg-background min-h-screen w-full">
      {/* Header */}
      <div className="border-border bg-card/50 sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="flex w-full items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-foreground text-2xl font-bold">
              Platform Settings
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Configure platform-wide settings and preferences
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        {/* Platform Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="mr-2 h-5 w-5" />
              Platform Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="platformName">Platform Name</Label>
                <Input
                  id="platformName"
                  value={settings.platformName}
                  onChange={(e) =>
                    handleInputChange("platformName", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) =>
                    handleInputChange("supportEmail", e.target.value)
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="platformDescription">Platform Description</Label>
              <Textarea
                id="platformDescription"
                value={settings.platformDescription}
                onChange={(e) =>
                  handleInputChange("platformDescription", e.target.value)
                }
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxBusinesses">Max Businesses Per User</Label>
              <Input
                id="maxBusinesses"
                type="number"
                value={settings.maxBusinessesPerUser}
                onChange={(e) =>
                  handleInputChange(
                    "maxBusinessesPerUser",
                    parseInt(e.target.value),
                  )
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-muted-foreground text-sm">
                    Send notifications via email
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) =>
                    handleInputChange("emailNotifications", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>WhatsApp Notifications</Label>
                  <p className="text-muted-foreground text-sm">
                    Send notifications via WhatsApp
                  </p>
                </div>
                <Switch
                  checked={settings.whatsappNotifications}
                  onCheckedChange={(checked) =>
                    handleInputChange("whatsappNotifications", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-muted-foreground text-sm">
                    Send notifications via SMS
                  </p>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) =>
                    handleInputChange("smsNotifications", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-muted-foreground text-sm">
                    Send browser push notifications
                  </p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) =>
                    handleInputChange("pushNotifications", checked)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Email Verification</Label>
                  <p className="text-muted-foreground text-sm">
                    Users must verify their email
                  </p>
                </div>
                <Switch
                  checked={settings.requireEmailVerification}
                  onCheckedChange={(checked) =>
                    handleInputChange("requireEmailVerification", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Two-Factor Auth</Label>
                  <p className="text-muted-foreground text-sm">
                    Require 2FA for admin accounts
                  </p>
                </div>
                <Switch
                  checked={settings.enableTwoFactor}
                  onCheckedChange={(checked) =>
                    handleInputChange("enableTwoFactor", checked)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) =>
                    handleInputChange(
                      "sessionTimeout",
                      parseInt(e.target.value),
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={(e) =>
                    handleInputChange(
                      "maxLoginAttempts",
                      parseInt(e.target.value),
                    )
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Business Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-approve Businesses</Label>
                  <p className="text-muted-foreground text-sm">
                    Automatically approve new businesses
                  </p>
                </div>
                <Switch
                  checked={settings.autoApproveBusinesses}
                  onCheckedChange={(checked) =>
                    handleInputChange("autoApproveBusinesses", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Business Verification</Label>
                  <p className="text-muted-foreground text-sm">
                    Require document verification
                  </p>
                </div>
                <Switch
                  checked={settings.requireBusinessVerification}
                  onCheckedChange={(checked) =>
                    handleInputChange("requireBusinessVerification", checked)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultBookingWindow">
                  Default Booking Window (days)
                </Label>
                <Input
                  id="defaultBookingWindow"
                  type="number"
                  value={settings.defaultBookingWindow}
                  onChange={(e) =>
                    handleInputChange(
                      "defaultBookingWindow",
                      parseInt(e.target.value),
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxAdvanceBooking">
                  Max Advance Booking (days)
                </Label>
                <Input
                  id="maxAdvanceBooking"
                  type="number"
                  value={settings.maxAdvanceBooking}
                  onChange={(e) =>
                    handleInputChange(
                      "maxAdvanceBooking",
                      parseInt(e.target.value),
                    )
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              Payment Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="platformFee">Platform Fee (%)</Label>
                <Input
                  id="platformFee"
                  type="number"
                  step="0.1"
                  value={settings.platformFeePercentage}
                  onChange={(e) =>
                    handleInputChange(
                      "platformFeePercentage",
                      parseFloat(e.target.value),
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minimumPayout">Minimum Payout ($)</Label>
                <Input
                  id="minimumPayout"
                  type="number"
                  value={settings.minimumPayout}
                  onChange={(e) =>
                    handleInputChange("minimumPayout", parseInt(e.target.value))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payoutSchedule">Payout Schedule</Label>
                <select
                  id="payoutSchedule"
                  value={settings.payoutSchedule}
                  onChange={(e) =>
                    handleInputChange("payoutSchedule", e.target.value)
                  }
                  className="bg-input border-border text-foreground w-full rounded-lg border px-3 py-2 text-sm"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" />
              WhatsApp Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label htmlFor="whatsappApiUrl">WhatsApp API URL</Label>
                <Input
                  id="whatsappApiUrl"
                  value={settings.whatsappApiUrl}
                  onChange={(e) =>
                    handleInputChange("whatsappApiUrl", e.target.value)
                  }
                />
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="whatsappPhoneId">Phone Number ID</Label>
                  <Input
                    id="whatsappPhoneId"
                    value={settings.whatsappPhoneNumberId}
                    onChange={(e) =>
                      handleInputChange("whatsappPhoneNumberId", e.target.value)
                    }
                    placeholder="Enter WhatsApp Phone Number ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsappToken">Access Token</Label>
                  <Input
                    id="whatsappToken"
                    type="password"
                    value={settings.whatsappAccessToken}
                    onChange={(e) =>
                      handleInputChange("whatsappAccessToken", e.target.value)
                    }
                    placeholder="Enter WhatsApp Access Token"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="mr-2 h-5 w-5" />
              Email Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <Input
                  id="smtpHost"
                  value={settings.smtpHost}
                  onChange={(e) =>
                    handleInputChange("smtpHost", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input
                  id="smtpPort"
                  type="number"
                  value={settings.smtpPort}
                  onChange={(e) =>
                    handleInputChange("smtpPort", parseInt(e.target.value))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpUsername">SMTP Username</Label>
                <Input
                  id="smtpUsername"
                  value={settings.smtpUsername}
                  onChange={(e) =>
                    handleInputChange("smtpUsername", e.target.value)
                  }
                  placeholder="Enter SMTP username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPassword">SMTP Password</Label>
                <Input
                  id="smtpPassword"
                  type="password"
                  value={settings.smtpPassword}
                  onChange={(e) =>
                    handleInputChange("smtpPassword", e.target.value)
                  }
                  placeholder="Enter SMTP password"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
