'use client'
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BusinessProfileComponent, type BusinessProfile } from "@/components/application/booking/business-profile";
import { Loader2 } from "lucide-react";

export default function BusinessBookingPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const businessId = params.slug;
  
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch business data
  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/businesses/${businessId}`);
        
        if (!response.ok) {
          throw new Error("Business not found");
        }
        
        const businessData = await response.json();
        setBusiness(businessData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load business");
      } finally {
        setLoading(false);
      }
    };

    if (businessId) {
      fetchBusiness();
    }
  }, [businessId]);

  const handleServiceSelect = (serviceId: string) => {
    // Redirect to the booking page with the selected service
    router.push(`/book/${businessId}?service=${serviceId}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading business information...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Business Not Found
          </h1>
          <p className="text-gray-600 mb-4">
            {error || "The business you're looking for doesn't exist."}
          </p>
          <Button asChild>
            <a href="/">Back to Home</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <BusinessProfileComponent
            business={business}
            onServiceSelect={handleServiceSelect}
          />
          
          <div className="mt-8 text-center">
            <Button 
              size="lg"
              onClick={() => router.push(`/book/${businessId}`)}
            >
              Book an Appointment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}