import { TherapistNavbar } from "@/components/layout/TherapistNavbar";
import TherapistDashboardClient from "./TherapistDashboardClient";

export default function TherapistPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-50 to-beige-100">
      <TherapistNavbar />
      <TherapistDashboardClient />
    </div>
  );
}
