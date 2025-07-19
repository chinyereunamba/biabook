"use client";

import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ServiceForm, ServiceList } from "./index";
import type { ServiceFormData } from "./service-form";
import type { Service } from "@/server/repositories/service-repository";

export interface ServiceManagementProps {
  services: Service[];
  businessId: string;
  onCreateService: (data: ServiceFormData) => Promise<void>;
  onUpdateService: (serviceId: string, data: ServiceFormData) => Promise<void>;
  onDeleteService: (serviceId: string) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

export function ServiceManagement({
  services,
  businessId,
  onCreateService,
  onUpdateService,
  onDeleteService,
  isLoading = false,
  className,
}: ServiceManagementProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingService, setEditingService] = React.useState<Service | null>(null);
  const [formLoading, setFormLoading] = React.useState(false);

  const handleCreate = () => {
    setEditingService(null);
    setDialogOpen(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setDialogOpen(true);
  };

  const handleFormSubmit = async (data: ServiceFormData) => {
    setFormLoading(true);
    try {
      if (editingService) {
        await onUpdateService(editingService.id, data);
      } else {
        await onCreateService(data);
      }
      setDialogOpen(false);
      setEditingService(null);
    } catch (error) {
      console.error("Failed to save service:", error);
      throw error; // Re-throw to let the form handle the error
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormCancel = () => {
    setDialogOpen(false);
    setEditingService(null);
  };

  const handleDelete = async (serviceId: string) => {
    await onDeleteService(serviceId);
  };

  return (
    <>
      <ServiceList
        services={services}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
        isLoading={isLoading}
        className={className}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <ServiceForm
            service={editingService || undefined}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isLoading={formLoading}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ServiceManagement;