"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BusinessLocationForm,
  LocationStatus,
} from "@/components/application/location";
import type { BusinessLocationModel } from "@/types/location";

interface Business {
  id: string;
  name: string;
  slug: string;
  description?: string;
  location?: string;
  phone?: string;
  email?: string;
  categoryId: string;
  ownerId: string;
}

export default function SettingsPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [businessLocation, setBusinessLocation] =
    useState<BusinessLocationModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        // Get user's business
        const businessResponse = await fetch("/api/me/business");
        const businessData = await businessResponse.json();

        if (businessData.business) {
          setBusiness(businessData.business);

          // Get business location if business exists
          const locationResponse = await fetch(
            `/api/businesses/${businessData.business.id}/location`,
          );
          const locationData = await locationResponse.json();

          if (locationData.success && locationData.data) {
            setBusinessLocation(locationData.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch business data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinessData();
  }, []);

  const handleLocationUpdate = (location: BusinessLocationModel) => {
    setBusinessLocation(location);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="profile">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="location">Location</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <Card className="border-none shadow-none">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              This is how others will see you on the site.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Your Name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your@email.com" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save Changes</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="password">
        <Card className="border-none shadow-none">
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Change your password here. After saving, you&apos;ll be logged
              out.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save Password</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="notifications">
        <Card className="border-none shadow-none">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Manage your notification settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-muted-foreground text-sm">
                  Receive notifications via email for new bookings and
                  reminders.
                </p>
              </div>
              <Switch id="email-notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="sms-notifications">SMS Notifications</Label>
                <p className="text-muted-foreground text-sm">
                  Receive notifications via SMS for new bookings and reminders.
                </p>
              </div>
              <Switch id="sms-notifications" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save Changes</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="location">
        {business ? (
          <div className="space-y-6">
            <LocationStatus location={businessLocation} isLoading={isLoading} />
            <BusinessLocationForm
              businessId={business.id}
              initialLocation={businessLocation}
              onLocationUpdate={handleLocationUpdate}
            />
          </div>
        ) : (
          <Card className="border-none shadow-none">
            <CardHeader>
              <CardTitle>Location Settings</CardTitle>
              <CardDescription>
                You need to complete business onboarding before setting up your
                location.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Please complete your business setup first to access location
                features.
              </p>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}
