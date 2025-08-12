import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import TodayDonationsTable, { TodayDonation } from "@/components/dashboard/today-donations-table";

export default function TodayDonationsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [donations, setDonations] = useState<TodayDonation[]>([]);
  const [loading, setLoading] = useState(true);

  // Load today's confirmed donations using the new API endpoint
  useEffect(() => {
    fetch(`https://bloods-service-api.onrender.com/api/orders/TodayTransfusions`)
      .then((res) => res.json())
      .then((data) => {
        const items = Array.isArray(data.orders) ? data.orders : [];
        const mapped: TodayDonation[] = items.map((o: any) => ({
          id: o._id,
          donorId: o.donorId || null,
          requesterId: o.requesterId || null,
          hospitalName: o.hospitalName || '-',
          status: o.status || '-',
          createdAt: o.createdAt,
          bloodType: o.bloodType || undefined,
          unit: o.unit,
          patientName: o.patientName,
        }));
        setDonations(mapped);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleApprove(id: string) {
    // Update order status to confirmed using the new API endpoint
    const res = await fetch(`https://bloods-service-api.onrender.com/api/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'confirmed' })
    });
    if (!res.ok) throw new Error('Failed');
    setDonations((prev) => prev.map((d) => (d.id === id ? { ...d, status: 'confirmed' } : d)));
  }

  return (
    <div className="flex h-screen overflow-hidden bg-red-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex-1 overflow-y-auto p-8 w-full max-w-6xl mx-auto">
          <TodayDonationsTable donations={donations} onApprove={handleApprove} loading={loading} />
        </div>
      </div>
    </div>
  );
}

