import { fetchAppointments } from "@/lib/api/appointments";
import { useQuery } from "@tanstack/react-query";
import { useBusiness } from "./use-business";

export const useAppointments = ({
  recent,
  week,
}: {
  recent?: number;
  week?: boolean;
} = {}) => {
  const businessQuery = useBusiness();
  const businessId = businessQuery.data?.business?.id;
  console.log(businessId)

  return useQuery({
    queryKey: ["appointments", { recent, week, businessId }],
    queryFn: () => fetchAppointments({ recent, week, businessId: businessId! }),
    enabled: !!businessId, // safely disables fetch until ID exists
    staleTime: 1000 * 60 * 5,
  });
};
