import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import TodayDonationsTable, { TodayDonation } from "@/components/dashboard/today-donations-table";

export default function TodayDonationsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [donations, setDonations] = useState<TodayDonation[]>([]);
  const [loading, setLoading] = useState(true);

  // Load today's confirmed donations using the TodayTransfusions API endpoint
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
    try {
      // Use the approve order API endpoint
      const res = await fetch(`https://bloods-service-api.onrender.com/api/orders/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: id,
          userId: donations.find(d => d.id === id)?.requesterId?._id || "",
          rewardPoints: 50
        })
      });
      
      if (!res.ok) throw new Error('Failed to approve order');
      
      const result = await res.json();
      
      // Update local state with the approved order
      setDonations((prev) => prev.map((d) => 
        d.id === id ? { ...d, status: 'approved' } : d
      ));
      
      // Show success message with reward points
      alert(`Order approved successfully! Donor rewarded ${result.rewardPoints || 50} points.`);
      
    } catch (error) {
      console.error('Error approving order:', error);
      alert('Failed to approve order. Please try again.');
    }
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

