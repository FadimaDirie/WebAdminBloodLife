import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import DonationsTable from "@/components/dashboard/donations-table";
import Header from "@/components/layout/header";
import { UserCheck, UserX, Clock, CheckCircle2 } from "lucide-react";
import CountUp from 'react-countup';

export default function RecentDonations() {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statusSummary, setStatusSummary] = useState({
    accepted: 0,
    rejected: 0,
    waiting: 0,
    confirmed: 0
  });

  useEffect(() => {
    fetch("https://bloods-service-api.onrender.com/api/donor/summary-by-status")
      .then(res => res.json())
      .then(data => {
        setStatusSummary({
          accepted: data.data?.accepted?.count || 0,
          rejected: data.data?.rejected?.count || 0,
          waiting: data.data?.waiting?.count || 0,
          confirmed: data.data?.confirmed?.count || 0
        });
      });
  }, []);

  useEffect(() => {
    fetch("https://bloods-service-api.onrender.com/api/orders/recent")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.orders)) {
          const mapped = data.orders.map((order: any) => ({
            id: order._id,
            donorId: order.donorId || null,
            requesterId: order.requesterId || null,
            hospitalName: order.hospitalName || '-',
            status: order.status || '-',
            createdAt: order.createdAt,
            bloodType: order.bloodType || undefined,
          }));
          setDonations(mapped);
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
          {/* Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="rounded-xl p-5 bg-green-300 flex flex-col items-center shadow-2xl transition-transform transition-opacity duration-700 hover:scale-105 animate-fadeIn">
              <UserCheck className="w-8 h-8 text-green-600 mb-2" />
              <div className="text-green-700 font-semibold">Accepted</div>
              <div className="text-3xl font-bold text-gray-800">
                <CountUp end={statusSummary.accepted} duration={1.5} />
              </div>
            </div>
            <div className="rounded-xl p-5 bg-red-100 flex flex-col items-center shadow-2xl transition-transform transition-opacity duration-700 hover:scale-105 animate-fadeIn">
              <UserX className="w-8 h-8 text-red-600 mb-2" />
              <div className="text-red-700 font-semibold">Rejected</div>
              <div className="text-3xl font-bold text-gray-800">
                <CountUp end={statusSummary.rejected} duration={1.5} />
              </div>
            </div>
            <div className="rounded-xl p-5 bg-yellow-100 flex flex-col items-center shadow-2xl transition-transform transition-opacity duration-700 hover:scale-105 animate-fadeIn">
              <Clock className="w-8 h-8 text-yellow-600 mb-2" />
              <div className="text-yellow-700 font-semibold">Waiting</div>
              <div className="text-3xl font-bold text-gray-800">
                <CountUp end={statusSummary.waiting} duration={1.5} />
              </div>
            </div>
            <div className="rounded-xl p-5 bg-blue-100 flex flex-col items-center shadow-2xl transition-transform transition-opacity duration-700 hover:scale-105 animate-fadeIn">
              <CheckCircle2 className="w-8 h-8 text-blue-600 mb-2" />
              <div className="text-blue-700 font-semibold">Confirmed</div>
              <div className="text-3xl font-bold text-gray-800">
                <CountUp end={statusSummary.confirmed} duration={1.5} />
              </div>
            </div>
          </div>
          {/* Donations Table */}
          <DonationsTable donations={donations} />
        </div>
      </div>
    </div>
  );
} 