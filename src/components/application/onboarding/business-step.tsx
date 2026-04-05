import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Phone, Globe } from "lucide-react";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";

export function BusinessStep({
  businessData,
  setBusinessData,
  categories,
  addressState,
  handleAddressChange,
  handleAddressSelect,
  setCity,
  setState,
  setZipCode,
  validationErrors,
}: any) {
  return (
    <Card className="border-gray-200 shadow-lg">
      <CardHeader>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
          <Building className="h-6 w-6 text-purple-600" />
        </div>
        <CardTitle className="text-2xl">Tell us about your business</CardTitle>
        <CardDescription>
          This information will be displayed on your booking page
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name *</Label>
            <Input
              id="businessName"
              placeholder="e.g. Bella Hair Salon"
              className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              value={businessData.name}
              onChange={(e) =>
                setBusinessData({ ...businessData, name: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <select
              id="category"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500 bg-white"
              value={businessData.category}
              onChange={(e) =>
                setBusinessData({
                  ...businessData,
                  category: e.target.value,
                })
              }
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat: any) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            placeholder="Brief description of your business and services"
            className="min-h-[100px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-purple-500"
            value={businessData.description}
            onChange={(e) =>
              setBusinessData({
                ...businessData,
                description: e.target.value,
              })
            }
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                className="border-gray-300 pl-10 focus:border-purple-500 focus:ring-purple-500"
                value={businessData.phone}
                onChange={(e) =>
                  setBusinessData({
                    ...businessData,
                    phone: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website (Optional)</Label>
            <div className="relative">
              <Globe className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                id="website"
                type="url"
                placeholder="https://yourwebsite.com"
                className="border-gray-300 pl-10 focus:border-purple-500 focus:ring-purple-500"
                value={businessData.website}
                onChange={(e) =>
                  setBusinessData({
                    ...businessData,
                    website: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Business Address</Label>
          <AddressAutocomplete
            id="address"
            value={addressState.address}
            onChange={handleAddressChange}
            onAddressSelect={handleAddressSelect}
            placeholder="Start typing your business address..."
            className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
            countryRestriction="us"
            types={["establishment", "geocode"]}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Start typing to see address suggestions. We'll automatically fill in
            city, state, and ZIP code.
          </p>
          {validationErrors.length > 0 && (
            <div className="text-sm text-red-600 mt-2 space-y-1">
              {validationErrors.map((error: string, index: number) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          )}
        </div>

        {/* Show parsed address components if available */}
        {(addressState.city || addressState.state || addressState.zipCode) && (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                value={addressState.city}
                onChange={(e) => setCity(e.target.value)}
                className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                placeholder="City"
              />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Input
                value={addressState.state}
                onChange={(e) => setState(e.target.value)}
                className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                placeholder="State"
              />
            </div>
            <div className="space-y-2">
              <Label>ZIP Code</Label>
              <Input
                value={addressState.zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                placeholder="ZIP Code"
              />
            </div>
          </div>
        )}

        {/* Show coordinates if available */}
        {addressState.coordinates && (
          <div className="rounded-lg bg-green-50 p-3">
            <p className="text-sm text-green-700">
              ✓ Location coordinates detected:{" "}
              {addressState.coordinates.latitude.toFixed(6)},{" "}
              {addressState.coordinates.longitude.toFixed(6)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
