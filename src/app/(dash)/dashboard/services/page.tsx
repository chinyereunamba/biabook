"use client";

import * as React from "react";
import { LazyServiceManagement } from "@/components/application/services/lazy";
import { useServices } from "@/lib/api/services";
import type { ServiceFormData } from "@/components/application/services/service-form";
import { RetryFeedback } from "@/components/ui/feedback-states";
import { SiteHeader } from "@/components/site-header";

export default function ServicesPage() {
  const {
    services,
    loading,
    error,
    fetchServices,
    createService,
    updateService,
    deleteService,
  } = useServices();

  // Fetch services on component mount
  React.useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleCreateService = async (data: ServiceFormData) => {
    await createService(data);
  };

  const handleUpdateService = async (
    serviceId: string,
    data: ServiceFormData,
  ) => {
    await updateService(serviceId, data);
  };

  const handleDeleteService = async (serviceId: string) => {
    await deleteService(serviceId, false); // Soft delete by default
  };

  return (
    <div className="bg-background w-full rounded-xl">
      <SiteHeader header="Services" />
      <div className="px-6 py-8">
        {error ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="max-w-md">
              <RetryFeedback
                message={error}
                onRetry={() => fetchServices()}
                retrying={loading}
              />
            </div>
          </div>
        ) : (
          <LazyServiceManagement
            services={services}
            businessId="" // This will be handled by the API based on the authenticated user
            onCreateService={handleCreateService}
            onUpdateService={handleUpdateService}
            onDeleteService={handleDeleteService}
            isLoading={loading}
          />
        )}
      </div>
    </div>
  );
}
