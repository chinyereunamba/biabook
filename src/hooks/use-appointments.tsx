import { fetchAppointments } from "@/lib/api/appointments";
import { useQuery } from "@tanstack/react-query";

export const useAppointments = ({
  recent,
  week,
}: {
  recent?: number;
  week?: boolean;
} = {}) => {
  return useQuery({
    queryKey: ["appointments", { recent, week }],
    queryFn: () => fetchAppointments({ recent, week }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
