import * as React from "react";
import type { ServiceFormData } from "@/components/application/services/service-form";
import type { Service } from "@/server/repositories/service-repository";

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface ServicesResponse {
  services: Service[];
}

export interface ServiceResponse {
  service: Service;
}

/**
 * API client for service management
 */
export class ServicesApi {
  private static async request<T>(
    url: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      const data = (await response.json()) as { error?: string } & T;

      if (!response.ok) {
        return { error: data.error ?? "An error occurred" };
      }

      return { data: data as T };
    } catch (error) {
      console.error("API request failed:", error);
      return { error: "Network error" };
    }
  }

  /**
   * Get all services for the current business
   */
  static async getServices(
    includeInactive = false,
  ): Promise<ApiResponse<ServicesResponse>> {
    const params = new URLSearchParams();
    if (includeInactive) {
      params.set("includeInactive", "true");
    }

    const url = `/api/dashboard/services${params.toString() ? `?${params.toString()}` : ""}`;
    return this.request<ServicesResponse>(url);
  }

  /**
   * Get a specific service by ID
   */
  static async getService(id: string): Promise<ApiResponse<ServiceResponse>> {
    return this.request<ServiceResponse>(`/api/dashboard/services/${id}`);
  }

  /**
   * Create a new service
   */
  static async createService(
    data: ServiceFormData,
  ): Promise<ApiResponse<ServiceResponse>> {
    return this.request<ServiceResponse>("/api/dashboard/services", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Update an existing service
   */
  static async updateService(
    id: string,
    data: Partial<ServiceFormData>,
  ): Promise<ApiResponse<ServiceResponse>> {
    return this.request<ServiceResponse>(`/api/dashboard/services/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a service (soft delete by default)
   */
  static async deleteService(
    id: string,
    hardDelete = false,
  ): Promise<ApiResponse<{ message: string; deleted: boolean }>> {
    const params = new URLSearchParams();
    if (hardDelete) {
      params.set("hard", "true");
    }

    const url = `/api/dashboard/services/${id}${params.toString() ? `?${params.toString()}` : ""}`;
    return this.request<{ message: string; deleted: boolean }>(url, {
      method: "DELETE",
    });
  }
}

/**
 * React hooks for service management
 */
export function useServices() {
  const [services, setServices] = React.useState<Service[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchServices = React.useCallback(async (includeInactive = false) => {
    setLoading(true);
    setError(null);

    const result = await ServicesApi.getServices(includeInactive);

    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setServices(result.data.services);
    }

    setLoading(false);
  }, []);

  const createService = React.useCallback(async (data: ServiceFormData) => {
    const result = await ServicesApi.createService(data);

    if (result.error) {
      throw new Error(result.error);
    }

    if (result.data) {
      setServices((prev) => [result.data!.service, ...prev]);
    }
  }, []);

  const updateService = React.useCallback(
    async (id: string, data: Partial<ServiceFormData>) => {
      const result = await ServicesApi.updateService(id, data);

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.data) {
        setServices((prev) =>
          prev.map((service) =>
            service.id === id ? result.data!.service : service,
          ),
        );
      }
    },
    [],
  );

  const deleteService = React.useCallback(
    async (id: string, hardDelete = false) => {
      const result = await ServicesApi.deleteService(id, hardDelete);

      if (result.error) {
        throw new Error(result.error);
      }

      if (hardDelete) {
        setServices((prev) => prev.filter((service) => service.id !== id));
      } else {
        // For soft delete, update the service to inactive
        setServices((prev) =>
          prev.map((service) =>
            service.id === id ? { ...service, isActive: false } : service,
          ),
        );
      }
    },
    [],
  );

  return {
    services,
    loading,
    error,
    fetchServices,
    createService,
    updateService,
    deleteService,
  };
}
