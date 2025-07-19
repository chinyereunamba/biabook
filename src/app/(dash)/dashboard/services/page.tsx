"use client";

import * as React from "react";
import { ServiceManagement } from "@/components/application/services";
import { useServices } from "@/lib/api/services";
import type { ServiceFormData } from "@/components/application/services/service-form";

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

  const handleUpdateService = async (serviceId: string, data: ServiceFormData) => {
    await updateService(serviceId, data);
  };

  const handleDeleteService = async (serviceId: string) => {
    await deleteService(serviceId, false); // Soft delete by default
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-destructive">Error Loading Services</h2>
          <p className="text-muted-foreground mt-2">{error}</p>
          <button
            onClick={() => fetchServices()}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <ServiceManagement
        services={services}
        businessId="" // This will be handled by the API based on the authenticated user
        onCreateService={handleCreateService}
        onUpdateService={handleUpdateService}
        onDeleteService={handleDeleteService}
        isLoading={loading}
      />
    </div>
  );
}