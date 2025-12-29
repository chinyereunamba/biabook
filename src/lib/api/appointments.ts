import { useBusiness } from "@/hooks/use-business";

// lib/api/appointments.ts
export const fetchAppointments = async ({
  recent,
  week,
}: {
  recent?: number;
  week?: boolean;
}) => {
  const businessId = useBusiness().data?.id;
  console.log(useBusiness().data?.id);
  const params = new URLSearchParams();

  if (recent) params.append("recent", recent.toString());
  if (week) params.append("week", "true");

  const res = await fetch(
    `/api/businesses/${businessId}/appointments?${params.toString()}`,
  );
  if (!res.ok) {
    throw new Error("Failed to fetch appointments");
  }

  return res.json();
};
