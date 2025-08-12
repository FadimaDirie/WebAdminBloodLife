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
    // First try to get user from localStorage
    const userStr = localStorage.getItem("user");
    let userId = null;
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        userId = user._id;
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
      }
    }

    // Try TodayTransfusions API first if we have a userId
    if (userId) {
      console.log("Trying TodayTransfusions API with userId:", userId);
      
      fetch(`https://bloods-service-api.onrender.com/api/orders/TodayTransfusions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId })
      })
        .then((res) => {
          console.log("TodayTransfusions API response status:", res.status);
          return res.json();
        })
        .then((data) => {
          console.log("TodayTransfusions API response data:", data);
          
          const items = Array.isArray(data.orders) ? data.orders : [];
          if (items.length > 0) {
            console.log("Found orders from TodayTransfusions API:", items.length);
                      const mapped: TodayDonation[] = items.map((o: any) => {
            console.log('Mapping order:', o);
            return {
              id: o._id,
              donorId: o.donorId || null,
              requesterId: o.requesterId || null,
              hospitalName: o.hospitalName || '-',
              status: o.status || '-',
              createdAt: o.createdAt,
              bloodType: o.bloodType || undefined,
              unit: o.unit,
              patientName: o.patientName,
            };
          });
            setDonations(mapped);
            setLoading(false);
            return;
          }
          
          // If no orders found, get all confirmed orders from all users
          console.log("No orders found in TodayTransfusions, getting all confirmed orders...");
          return fetchAllConfirmedOrders();
        })
        .catch((error) => {
          console.log("TodayTransfusions API failed, getting all confirmed orders...");
          return fetchAllConfirmedOrders();
        });
    } else {
      // No userId, get all confirmed orders from all users
      console.log("No userId, getting all confirmed orders...");
      fetchAllConfirmedOrders();
    }

    // Function to fetch all confirmed orders from all users
    function fetchAllConfirmedOrders() {
      fetch("https://bloods-service-api.onrender.com/api/orders/recent")
        .then((res) => {
          console.log("All orders API response status:", res.status);
          return res.json();
        })
        .then((data) => {
          console.log("All orders API response data:", data);
          
          const allItems = Array.isArray(data.orders) ? data.orders : [];
          console.log("Total orders from all users:", allItems.length);
          
          // Filter only confirmed orders from all users
          const confirmedItems = allItems.filter((o: any) => o.status === 'confirmed');
          console.log("Confirmed orders from all users:", confirmedItems.length);
          
          const mapped: TodayDonation[] = confirmedItems.map((o: any) => {
            console.log('Mapping confirmed order:', o);
            return {
              id: o._id,
              donorId: o.donorId || null,
              requesterId: o.requesterId || null,
              hospitalName: o.hospitalName || '-',
              status: o.status || '-',
              createdAt: o.createdAt,
              bloodType: o.bloodType || undefined,
              unit: o.unit,
              patientName: o.patientName,
            };
          });
          
          console.log("Final mapped donations from all users:", mapped);
          setDonations(mapped);
        })
        .catch((error) => {
          console.error("Error fetching all confirmed orders:", error);
          setDonations([]);
        })
        .finally(() => setLoading(false));
    }
  }, []);

  async function handleApprove(id: string, requesterId: string) {
    try {
      console.log('Approving order:', { orderId: id, userId: requesterId, rewardPoints: 50 });
      
      const res = await fetch(`https://bloods-service-api.onrender.com/api/orders/approveOrderAndRewardDonor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: id,
          userId: requesterId,
          rewardPoints: 50
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to approve order: ${res.status} ${res.statusText}`);
      }

      const result = await res.json();
      console.log('API Response:', result);

      setDonations((prev) =>
        prev.map((d) =>
          d.id === id ? { ...d, status: 'approved' } : d
        )
      );

      alert(`Order approved! Donor rewarded ${result.rewardPoints || 50} points.`);
    } catch (error) {
      console.error('Error approving order:', error);
      alert('Failed to approve order. Please try again.');
    }
  }

  // Helper function to check if date is today
  function isToday(dateString: string) {
    const date = new Date(dateString);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

// Filter only today's confirmed donations
const todayConfirmedDonations = donations.filter(
  (d) => d.status === "confirmed" && isToday(d.createdAt)
);

console.log('All donations:', donations);
console.log('Today confirmed donations:', todayConfirmedDonations);

return (
  <div className="flex h-screen overflow-hidden bg-red-50">
    <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    <div className="flex-col flex-1 overflow-hidden">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex-1 overflow-y-auto p-8 w-full max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-red-700">
            Today's Confirmed Donations: {todayConfirmedDonations.length}
          </h2>
        </div>
        <TodayDonationsTable
          donations={todayConfirmedDonations}
          onApprove={(id, requesterId) => handleApprove(id, requesterId)}
          loading={loading}
        />
      </div>
    </div>
  </div>
);
}