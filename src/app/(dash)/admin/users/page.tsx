import { requireAdmin } from "@/server/auth/helpers";
import AdminUsersClient from "@/components/admin/admin-users-client";

export default async function AdminUsersPage() {
  // Server-side admin check - will redirect if not admin
  await requireAdmin();

  return <AdminUsersClient />;
}
