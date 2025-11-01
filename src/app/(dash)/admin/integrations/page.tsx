"use client";

import { useState, useEffect } from "react";
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
  const [integrations, setIntegrations] = useState<Integration[]>([]);

  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch integrations from API
  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        const response = await fetch("/api/admin/integrations");
        if (response.ok) {
          const data = await response.json();
          // Add icons to the integrations
          const integrationsWithIcons = data.integrations.map(
            (integration: any) => ({
              ...integration,
              icon:
                integration.id === "whatsapp" ? (
                  <MessageSquare className="h-6 w-6" />
                ) : integration.id === "email" ? (
                  <Mail className="h-6 w-6" />
                ) : (
                  <Key className="h-6 w-6" />
                ),
            }),
          );
          setIntegrations(integrationsWithIcons);
        }
      } catch (error) {
        console.error("Failed to fetch integrations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIntegrations();
  }, []);

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
      const response = await fetch("/api/admin/integrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ integrations }),
      });

      if (response.ok) {
        console.log("Integrations saved successfully");
        // You could show a success toast here
      } else {
        throw new Error("Failed to save integrations");
      }
    } catch (error) {
      console.error("Failed to save integrations:", error);
      // You could show an error toast here
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

  if (loading) {
    return (
      <div className="bg-background flex min-h-screen w-full items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading integrations...</p>
        </div>
      </div>
    );
  }

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
