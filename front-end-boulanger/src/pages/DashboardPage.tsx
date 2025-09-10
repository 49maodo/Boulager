import { useAppSelector } from "@/hooks/redux";
import { AdminDashboard } from "@/components/Dashboard/AdminDashboard";
import { ClientDashboard } from "@/components/Dashboard/ClientDashboard";

export default function DashboardPage() {
  const { user } = useAppSelector((state) => state.auth);

  return user?.role === "client" ? <ClientDashboard /> : <AdminDashboard />;
}
