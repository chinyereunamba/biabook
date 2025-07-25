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

  const handleUpdateService = async (
    serviceId: string,
    data: ServiceFormData,
  ) => {
    await updateService(serviceId, data);
  };

  const handleDeleteService = async (serviceId: string) => {
    await deleteService(serviceId, false); // Soft delete by default
  };

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-destructive text-lg font-semibold">
            Error Loading Services
          </h2>
          <p className="text-muted-foreground mt-2">{error}</p>
          <button
            onClick={() => fetchServices()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 rounded-md px-4 py-2"
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
