import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import DonationsTable from "@/components/dashboard/donations-table";
import Header from "@/components/layout/header";

export default function RecentDonations() {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("https://bloods-service-api.onrender.com/api/orders/recent")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.orders)) {
          setDonations(data.orders.map((order: any) => ({
            id: order._id,
            donor: order.donorId ? {
              name: order.donorId.fullName,
              id: order.donorId._id,
              avatar: order.donorId.profilePic || order.donorId.avatar,
            } : { name: "-", id: "-", avatar: undefined },
            recipient: order.requesterId ? {
              name: order.requesterId.fullName,
              id: order.requesterId._id,
              avatar: order.requesterId.profilePic || order.requesterId.avatar,
            } : { name: "-", id: "-", avatar: undefined },
            bloodType: order.bloodType,
            date: new Date(order.createdAt).toLocaleString(),
            location: order.hospitalName,
            status: order.status === 'accepted' ? 'Verified' : order.status === 'waiting' ? 'Processing' : 'Pending',
            txHash: order._id.slice(-8),
          })));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-red-50">
    <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    <div className="flex flex-col flex-1 overflow-hidden">
      <Header onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex-1 overflow-y-auto p-8 w-full max-w-5xl mx-auto">
          <DonationsTable donations={donations} />
        </div>
      </div>
    </div>
  );
} 