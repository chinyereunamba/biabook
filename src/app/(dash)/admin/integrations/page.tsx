"use client";

import { useState } from "react";
import {
  Save,
  RefreshCw,
  MessageSquare,
  Mail,
  Key,
  Eye,
  EyeOff,
  TestTube,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: "connected" | "disconnected" | "error";
  lastTested?: string;
  config: Record<string, any>;
}

export default function AdminIntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "whatsapp",
      name: "WhatsApp Business API",
      description: "Send booking notifications via WhatsApp",
      icon: <MessageSquare className="h-6 w-6" />,
      status: "connected",
      lastTested: "2024-11-01T10:30:00Z",
      config: {
        apiUrl: "https://graph.facebook.com/v18.0",
        phoneNumberId: "726629333595963",
        accessToken:
          "EAAIjyG0FipkBP4rGucyZA0JSZA1Pm3uoITGVt0iAfD0WsFLoLAuNGtjFvfJNjVzJVqSaJVZBxZATPkETrlPZC7ZAdzNHyFIQCaczaPAYYadoSvdjqkbK0SW2l0htrFoZByT3LKxLUuzSFvagUCSSuQZCI3cWfdkZADOnBS9EOCBIdLXhA96KEPZC5EiB8pUcs5ZA39TJFs6V0x8cKNtcZCSTZAiIbSCpSXbZBrkl1ldcuj",
        businessAccountId: "2247211829061652",
        enabled: true,
      },
    },
    {
      id: "email",
      name: "Email Service (SMTP)",
      description: "Send email notifications and confirmations",
      icon: <Mail className="h-6 w-6" />,
      status: "connected",
      lastTested: "2024-11-01T09:15:00Z",
      config: {
        host: "smtp.gmail.com",
        port: 587,
        username: "chinyereunamba15@gmail.com",
        password: "togdvdwxolwqvqac",
        fromEmail: "chinyereunamba15@gmail.com",
        enabled: true,
      },
    },
    {
      id: "payment",
      name: "Payment Gateway",
      description: "Process payments and handle transactions",
      icon: <Key className="h-6 w-6" />,
      status: "disconnected",
      config: {
        provider: "stripe",
        publicKey: "",
        secretKey: "",
        webhookSecret: "",
        enabled: false,
      },
    },
  ]);

  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const toggleSecretVisibility = (integrationId: string, field: string) => {
    const key = `${integrationId}-${field}`;
    setShowSecrets((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const testIntegration = async (integrationId: string) => {
    setTesting((prev) => ({ ...prev, [integrationId]: true }));

    try {
      // Simulate API test
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setIntegrations((prev) =>
        prev.map((integration) =>
          integration.id === integrationId
            ? {
                ...integration,
                status: "connected",
                lastTested: new Date().toISOString(),
              }
            : integration,
        ),
      );
    } catch (error) {
      setIntegrations((prev) =>
        prev.map((integration) =>
          integration.id === integrationId
            ? { ...integration, status: "error" }
            : integration,
        ),
      );
    } finally {
      setTesting((prev) => ({ ...prev, [integrationId]: false }));
    }
  };

  const updateIntegrationConfig = (
    integrationId: string,
    field: string,
    value: any,
  ) => {
    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === integrationId
          ? {
              ...integration,
              config: { ...integration.config, [field]: value },
            }
          : integration,
      ),
    );
  };

  const saveIntegrations = async () => {
    setSaving(true);
    try {
      // Simulate API save
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Integrations saved:", integrations);
    } catch (error) {
      console.error("Failed to save integrations:", error);
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return (
          <Badge className="bg-green-500/20 text-green-700 hover:bg-green-500/30">
            <CheckCircle className="mr-1 h-3 w-3" />
            Connected
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-red-500/20 text-red-700 hover:bg-red-500/30">
            <XCircle className="mr-1 h-3 w-3" />
            Error
          </Badge>
        );
      default:
        return (
          <Badge className="bg-orange-500/20 text-orange-700 hover:bg-orange-500/30">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Disconnected
          </Badge>
        );
    }
  };

  const formatLastTested = (timestamp?: string) => {
    if (!timestamp) return "Never tested";
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="bg-background min-h-screen w-full">
      {/* Header */}
      <div className="border-border bg-card/50 sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="flex w-full items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-foreground text-2xl font-bold">
              API Integrations
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage API keys, tokens, and third-party integrations
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Status
            </Button>
            <Button size="sm" onClick={saveIntegrations} disabled={saving}>
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
        {integrations.map((integration) => (
          <Card key={integration.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 rounded-lg p-2">
                    {integration.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {integration.name}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {integration.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(integration.status)}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testIntegration(integration.id)}
                    disabled={testing[integration.id]}
                  >
                    {testing[integration.id] ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <TestTube className="mr-2 h-4 w-4" />
                    )}
                    Test Connection
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enable/Disable Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Integration</Label>
                  <p className="text-muted-foreground text-sm">
                    Turn this integration on or off
                  </p>
                </div>
                <Switch
                  checked={integration.config.enabled}
                  onCheckedChange={(checked) =>
                    updateIntegrationConfig(integration.id, "enabled", checked)
                  }
                />
              </div>

              {/* Configuration Fields */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {Object.entries(integration.config).map(([key, value]) => {
                  if (key === "enabled") return null;

                  const isSecret =
                    key.toLowerCase().includes("token") ||
                    key.toLowerCase().includes("secret") ||
                    key.toLowerCase().includes("password") ||
                    key.toLowerCase().includes("key");

                  const secretKey = `${integration.id}-${key}`;
                  const showSecret = showSecrets[secretKey];

                  return (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={`${integration.id}-${key}`}>
                        {key.charAt(0).toUpperCase() +
                          key.slice(1).replace(/([A-Z])/g, " $1")}
                      </Label>
                      <div className="relative">
                        <Input
                          id={`${integration.id}-${key}`}
                          type={isSecret && !showSecret ? "password" : "text"}
                          value={value as string}
                          onChange={(e) =>
                            updateIntegrationConfig(
                              integration.id,
                              key,
                              e.target.value,
                            )
                          }
                          placeholder={`Enter ${key}`}
                          className={isSecret ? "pr-10" : ""}
                        />
                        {isSecret && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() =>
                              toggleSecretVisibility(integration.id, key)
                            }
                          >
                            {showSecret ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Last Tested Info */}
              <div className="text-muted-foreground text-sm">
                Last tested: {formatLastTested(integration.lastTested)}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add New Integration */}
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="bg-muted mb-4 rounded-full p-4">
              <Key className="text-muted-foreground h-8 w-8" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Add New Integration</h3>
            <p className="text-muted-foreground mb-4 text-center">
              Connect additional services to enhance your platform capabilities
            </p>
            <Button variant="outline">Browse Integrations</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
