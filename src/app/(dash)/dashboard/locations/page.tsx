"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LoadingOverlay } from "@/components/ui/loading-states";
import { Plus, MapPin, Edit, Trash2, Navigation } from "lucide-react";
import { toast } from "sonner";
import { MultiLocationForm } from "@/components/application/location/multi-location-form";
import type { BusinessLocationModel } from "@/types/location";

export default function LocationsPage() {
  const [locations, setLocations] = useState<BusinessLocationModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] =
    useState<BusinessLocationModel | null>(null);
  const [deletingLocationId, setDeletingLocationId] = useState<string | null>(
    null,
  );

  // Load business and locations
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current user's business
        const businessResponse = await fetch("/api/me/business");
        if (!businessResponse.ok) {
          throw new Error("Failed to fetch business");
        }

        const businessData = await businessResponse.json();
        if (!businessData.business) {
          toast.error("No business found. Please complete onboarding first.");
          return;
        }

        setBusinessId(businessData.business.id);

        // Load locations for this business
        const locationsResponse = await fetch(
          `/api/businesses/${businessData.business.id}/locations`,
        );
        if (locationsResponse.ok) {
          const locationsData = await locationsResponse.json();
          setLocations(locationsData.locations || []);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
        toast.error("Failed to load locations");
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  const handleAddLocation = () => {
    setEditingLocation(null);
    setIsDialogOpen(true);
  };

  const handleEditLocation = (location: BusinessLocationModel) => {
    setEditingLocation(location);
    setIsDialogOpen(true);
  };

  const handleLocationSaved = (location: BusinessLocationModel) => {
    if (editingLocation) {
      // Update existing location
      setLocations((prev) =>
        prev.map((loc) => (loc.id === location.id ? location : loc)),
      );
      toast.success("Location updated successfully");
    } else {
      // Add new location
      setLocations((prev) => [...prev, location]);
      toast.success("Location added successfully");
    }
    setIsDialogOpen(false);
    setEditingLocation(null);
  };

  const handleDeleteLocation = async (locationId: string) => {
    if (!businessId) return;

    try {
      const response = await fetch(
        `/api/businesses/${businessId}/locations/${locationId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete location");
      }

      setLocations((prev) => prev.filter((loc) => loc.id !== locationId));
      toast.success("Location deleted successfully");
    } catch (error) {
      console.error("Failed to delete location:", error);
      toast.error("Failed to delete location");
    } finally {
      setDeletingLocationId(null);
    }
  };

  if (loading) {
    return (
      <LoadingOverlay message="Loading locations..." transparent={false} />
    );
  }

  if (!businessId) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <MapPin className="mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">No Business Found</h3>
            <p className="text-sm ">
              Please complete your business onboarding first.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Business Locations</h1>
          <p className="text-muted-foreground">
            Manage your business locations and service areas
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddLocation}>
              <Plus className="mr-2 h-4 w-4" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingLocation ? "Edit Location" : "Add New Location"}
              </DialogTitle>
              <DialogDescription>
                {editingLocation
                  ? "Update your business location details"
                  : "Add a new location for your business"}
              </DialogDescription>
            </DialogHeader>
            <MultiLocationForm
              businessId={businessId}
              initialLocation={editingLocation}
              onLocationSaved={handleLocationSaved}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingLocation(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Locations Grid */}
      {locations.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-[300px] flex-col items-center justify-center p-12 text-center">
            <MapPin className="mb-4 h-16 w-16 " />
            <h3 className="mb-2 text-lg font-semibold">No Locations Yet</h3>
            <p className="mb-6 text-sm ">
              Add your first business location to enable location-based features
              and help customers find you.
            </p>
            <Button onClick={handleAddLocation}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Location
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {locations.map((location) => (
            <Card key={location.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="text-primary h-5 w-5" />
                    <CardTitle className="text-lg">
                      {location.city}, {location.state}
                    </CardTitle>
                  </div>
                  {locations.length === 1 && (
                    <Badge variant="secondary">Primary</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Address */}
                <div>
                  <div className="text-sm font-medium text-gray-700">
                    Address
                  </div>
                  <div className="text-sm ">
                    {location.address}
                    <br />
                    {location.city}, {location.state} {location.zipCode}
                    <br />
                    {location.country}
                  </div>
                </div>

                {/* Coordinates */}
                <div>
                  <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
                    <Navigation className="h-3 w-3" />
                    Coordinates
                  </div>
                  <div className="text-xs ">
                    {location.latitude.toFixed(6)},{" "}
                    {location.longitude.toFixed(6)}
                  </div>
                </div>

                {/* Service Radius */}
                <div>
                  <div className="text-sm font-medium text-gray-700">
                    Service Area
                  </div>
                  <div className="text-sm ">
                    {location.serviceRadius
                      ? `${location.serviceRadius} miles radius`
                      : "Unlimited"}
                  </div>
                </div>

                {/* Timezone */}
                <div>
                  <div className="text-sm font-medium text-gray-700">
                    Timezone
                  </div>
                  <div className="text-sm ">
                    {location.timezone}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditLocation(location)}
                  >
                    <Edit className="mr-2 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => setDeletingLocationId(location.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingLocationId}
        onOpenChange={(open) => !open && setDeletingLocationId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Location</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this location? This action cannot
              be undone. All bookings and availability settings for this
              location will be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deletingLocationId && handleDeleteLocation(deletingLocationId)
              }
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Location
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
