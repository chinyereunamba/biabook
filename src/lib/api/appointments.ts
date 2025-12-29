// lib/api/appointments.ts
export const fetchAppointments = async ({
  recent,
  week,
  businessId,
}: {
  recent?: number;
  week?: boolean;
  businessId: string;
}) => {
  const params = new URLSearchParams();
  if (!businessId) throw new Error("No business ID provided");

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
