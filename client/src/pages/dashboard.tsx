import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LabelList,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell as PieCell
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { User, Users, HeartHandshake, ActivitySquare } from "lucide-react";
import CountUp from 'react-countup';

const BLOOD_TYPES = ["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"];
const BLOOD_COLORS = [
  "#6366F1", "#F59E42", "#10B981", "#EF4444",
  "#3B82F6", "#F43F5E", "#A21CAF", "#FBBF24"
];
const STATUS_COLORS = ["#10B981", "#EF4444", "#6366F1", "#F59E42"];

// Define types for chart and map data
interface PieDataType {
  name: string;
  value: number;
}
interface DonorType {
  latitude: number;
  longitude: number;
  fullName: string;
  bloodType: string;
}

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalDonors, setTotalDonors] = useState(0);
  const [totalDonations, setTotalDonations] = useState(0);
  const [totalBlockchainTx, setTotalBlockchainTx] = useState(0);
  const [pieData, setPieData] = useState<PieDataType[]>([]);
  const [loadingPie, setLoadingPie] = useState(true);
  const [mapDonors, setMapDonors] = useState<DonorType[]>([]);
  const [loadingMap, setLoadingMap] = useState(true);
  const [requestStatusData, setRequestStatusData] = useState([
    { name: "Accepted", value: 0 },
    { name: "Rejected", value: 0 },
    { name: "Confirmed", value: 0 },
    { name: "Waiting", value: 0 }
  ]);
  const [donationsByMonth, setDonationsByMonth] = useState<{ month: string; count: number }[]>([]);

  useEffect(() => {
    fetch("https://bloods-service-api.onrender.com/api/user/all")
      .then(res => res.json())
      .then(data => setTotalUsers(Array.isArray(data.users) ? data.users.length : 0));
  }, []);

  useEffect(() => {
    fetch("https://bloods-service-api.onrender.com/api/donor/all")
      .then(res => res.json())
      .then(data => setTotalDonors(Array.isArray(data.data) ? data.data.length : 0));
  }, []);

  useEffect(() => {
    fetch("https://bloods-service-api.onrender.com/api/orders/recent")
      .then(res => res.json())
      .then(data => {
        const orders = Array.isArray(data.orders) ? data.orders : [];
        setTotalDonations(orders.length);
        // Aggregate donations by month
        const monthMap: Record<string, number> = {};
        orders.forEach((order: any) => {
          const date = new Date(order.createdAt);
          const month = date.toLocaleString("default", { month: "short", year: "numeric" });
          monthMap[month] = (monthMap[month] || 0) + 1;
        });
        const sorted = Object.entries(monthMap)
          .map(([month, count]) => ({ month, count }))
          .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
        setDonationsByMonth(sorted);
      });
  }, []);

  useEffect(() => {
    fetch("https://bloods-service-api.onrender.com/api/donor/summary-by-status")
      .then(res => res.json())
      .then(data => {
        setRequestStatusData([
          { name: "Accepted", value: data.data?.accepted?.count || 0 },
          { name: "Rejected", value: data.data?.rejected?.count || 0 },
          { name: "Confirmed", value: data.data?.confirmed?.count || 0 },
          { name: "Waiting", value: data.data?.waiting?.count || 0 }
        ]);
      });
  }, []);

  useEffect(() => {
    fetch("https://bloods-service-api.onrender.com/api/login-count")
      .then(res => res.json())
      .then(data => setTotalBlockchainTx(data.totalLoginTransactions || 0));
  }, []);

  useEffect(() => {
    setLoadingPie(true);
    fetch("https://bloods-service-api.onrender.com/api/donor/byBloodtype")
      .then(res => res.json())
      .then(data => {
        const result = Array.isArray(data.data) ? data.data : [];
        const chartData = BLOOD_TYPES.map(type => {
          const found = result.find((r: any) => r.bloodType === type);
          return { name: type, value: found ? found.totalDonors : 0 };
        });
        setPieData(chartData);
        setLoadingPie(false);
      })
      .catch(() => setLoadingPie(false));
  }, []);

  useEffect(() => {
    setLoadingMap(true);
    fetch("https://bloods-service-api.onrender.com/api/donor/donersbyLocation")
      .then(res => res.json())
      .then(data => setMapDonors(data.data || []))
      .finally(() => setLoadingMap(false));
  }, []);

  // Add debug logs before rendering charts
  console.log('requestStatusData:', requestStatusData);
  console.log('donationsByMonth:', donationsByMonth);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6 space-y-8">

          {/* Top Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Total Users */}
            <Card className="p-6 shadow-2xl bg-gradient-to-br from-red-500 to-red-50 border-0 transition-transform transition-opacity duration-700 hover:scale-105 animate-fadeIn">
              <div className="flex items-center gap-4 mb-2">
                <Users className="w-8 h-8 text-red-500 bg-white rounded-full p-1 shadow" />
                <div className="text-sm text-red-600 font-semibold">Total Users</div>
              </div>
              <div className="text-4xl font-bold text-gray-800">
                <CountUp end={totalUsers} duration={1.5} />
              </div>
            </Card>
            {/* Total Donors */}
            <Card className="p-6 shadow-2xl bg-gradient-to-br from-pink-500 to-pink-50 border-0 transition-transform transition-opacity duration-700 hover:scale-105 animate-fadeIn">
              <div className="flex items-center gap-4 mb-2">
                <HeartHandshake className="w-8 h-8 text-pink-500 bg-white rounded-full p-1 shadow" />
                <div className="text-sm text-pink-600 font-semibold">Total Donors</div>
              </div>
              <div className="text-4xl font-bold text-gray-800">
                <CountUp end={totalDonors} duration={1.5} />
              </div>
            </Card>
            {/* Total Donations */}
            <Card className="p-6 shadow-2xl bg-gradient-to-br from-blue-500 to-blue-50 border-0 transition-transform transition-opacity duration-700 hover:scale-105 animate-fadeIn">
              <div className="flex items-center gap-4 mb-2">
                <User className="w-8 h-8 text-blue-800 bg-white rounded-full p-1 shadow" />
                <div className="text-sm text-blue-600 font-semibold">Total Donations</div>
              </div>
              <div className="text-4xl font-bold text-gray-800">
                <CountUp end={totalDonations} duration={1.5} />
              </div>
            </Card>
            {/* Total Blockchain Transactions */}
            <Card className="p-6 shadow-2xl bg-gradient-to-br from-green-500 to-green-50 border-0 transition-transform transition-opacity duration-700 hover:scale-105 animate-fadeIn">
              <div className="flex items-center gap-4 mb-2">
                <ActivitySquare className="w-8 h-8 text-green-500 bg-white rounded-full p-1 shadow" />
                <div className="text-sm text-green-600 font-semibold">Blockchain Transaction</div>
              </div>
              <div className="text-4xl font-bold text-gray-800">
                <CountUp end={totalBlockchainTx} duration={1.5} />
              </div>
            </Card>
          </div>

          {/* Charts Row: Blood Type Distribution & Donor Location Map */}
          <div className="flex flex-col md:flex-row gap-6">
          {/* Blood Type Distribution */}
            <Card className="flex-1 shadow-md bg-gray-100">
            <CardHeader>
              <CardTitle>Blood Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-80"> {/* Isticmaal h-80 ama h-72 labadaba */}
                {loadingPie ? (
                  <div className="flex items-center justify-center h-full text-gray-400">Loading...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pieData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value">
                        {pieData.map((entry, idx) => (
                          <Cell key={entry.name} fill={BLOOD_COLORS[idx % BLOOD_COLORS.length]} />
                        ))}
                        <LabelList dataKey="value" position="top" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Donor Location Map */}
            <Card className="flex-1 shadow-md bg-gray-100">
            <CardHeader>
              <CardTitle>Donor Location Map</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-80 w-full"> {/* Isku mid h-80 sida chart-ka */}
                {loadingMap ? (
                  <div className="flex items-center justify-center h-full text-gray-400">Loading map...</div>
                ) : (
                    <MapContainer 
                      center={[2.0469, 45.3182] as [number, number]} 
                      zoom={5} 
                      style={{ height: "100%", width: "100%" }}
                      scrollWheelZoom={false}
                    >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      {mapDonors.map((donor: DonorType, idx: number) => (
                      <CircleMarker
                        key={idx}
                        center={[donor.latitude, donor.longitude] as [number, number]}
                        radius={8}
                        pathOptions={{
                          fillOpacity: 0.9,
                          color: "#DC2626",
                          fillColor: "#DC2626",
                          weight: 2
                        }}
                      >
                        <Popup>
                          <div className="p-2">
                            <div className="font-bold text-red-600 mb-1">{donor.fullName}</div>
                            <div className="text-sm text-gray-600">
                              <span className="font-semibold">Blood Type:</span> {donor.bloodType}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Location: {donor.latitude.toFixed(4)}, {donor.longitude.toFixed(4)}
                            </div>
                          </div>
                        </Popup>
                      </CircleMarker>
                    ))}
                  </MapContainer>
                )}
              </div>
            </CardContent>
          </Card>
          </div>

          {/* Status and Monthly Donations Charts Row */}
          <div className="flex flex-col md:flex-row gap-6 mt-8">
            {/* Blood Request Status Pie Chart */}
            <div className="flex-1 bg-white rounded-xl shadow p-4 flex flex-col items-center justify-center">
              <h2 className="text-lg font-semibold mb-2">Blood Request Status</h2>
              <div className="h-64 min-h-[300px] min-w-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={requestStatusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      isAnimationActive={true}
                    >
                      {requestStatusData.map((entry, idx) => (
                        <PieCell key={entry.name} fill={STATUS_COLORS[idx % STATUS_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Donations Per Month Line Chart */}
            <div className="flex-1 bg-white rounded-xl shadow p-4">
              <h2 className="text-lg font-semibold mb-2">Donations Per Month</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  {donationsByMonth && donationsByMonth.length > 0 ? (
                    <LineChart data={donationsByMonth}>
                      <XAxis dataKey="month" angle={-30} textAnchor="end" height={60} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="count" stroke="#EF4444" strokeWidth={3} dot={{ r: 5 }} />
                    </LineChart>
                  ) : (
                    <div className="text-gray-400 text-center">No data to display</div>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
