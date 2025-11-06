import { requireAdmin } from "@/server/auth/helpers";
import AdminDashboardClient from "@/components/admin/admin-dashboard-client";

export default async function AdminDashboard() {
  // Server-side admin check - will redirect if not admin
  await requireAdmin();

  return <AdminDashboardClient />;
}
