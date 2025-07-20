import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { useLocation as useWouterLocation } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

interface Stat {
  city: string;
  bloodType: string;
  count: number;
}

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const BLOOD_COLORS: Record<string, string> = {
  "A+": "bg-red-100 text-red-800",
  "A-": "bg-pink-100 text-pink-800",
  "B+": "bg-yellow-100 text-yellow-800",
  "B-": "bg-orange-100 text-orange-800",
  "AB+": "bg-purple-100 text-purple-800",
  "AB-": "bg-indigo-100 text-indigo-800",
  "O+": "bg-green-100 text-green-800",
  "O-": "bg-gray-100 text-gray-800",
};

export default function DonorStats() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location, setLocation] = useWouterLocation();

  // Read city from URL query param on mount
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || "");
    const city = params.get("city");
    if (city) setSelectedCity(city);
  }, [location]);

  useEffect(() => {
    fetch("https://bloods-service-api.onrender.com/api/donor/stats-by-city-and-blood")
      .then(res => res.json())
      .then(data => {
        setStats(Array.isArray(data) ? data : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const uniqueCities = stats.map(s => s.city);

  const filteredStats = selectedCity === "all"
    ? stats
    : stats.filter((cityObj: any) => cityObj.city === selectedCity);

  const totalPages = Math.ceil(filteredStats.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStats = filteredStats.slice(startIndex, startIndex + itemsPerPage);

  // Download as CSV (Excel)
  const handleDownloadExcel = () => {
    const csv = [
      ["City", ...BLOOD_TYPES],
      ...filteredStats.map(cityObj => [
        cityObj.city,
        ...BLOOD_TYPES.map(type => {
          const found = (cityObj.bloodGroups || []).find((bg: any) => bg.bloodType === type);
          return found ? found.count : 0;
        })
      ])
    ].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "donor-stats.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download as PDF (simple)
  const handleDownloadPDF = () => {
    window.print(); // For simplicity, print as PDF
  };

  // Only show city select if more than one city and not filtered
  const showCitySelect = uniqueCities.length > 1 && selectedCity === "all";
  // Show city heading if filtered
  const showCityHeading = selectedCity !== "all" && filteredStats.length === 1;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex-1 overflow-y-auto p-8 w-full max-w-5xl mx-auto">
          <Card className="shadow-xl rounded-2xl">
            <CardHeader>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <CardTitle>Donor Stats by City & Blood</CardTitle>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                      <Input
                        type="text"
                        placeholder="Search city..."
                        className="pl-10 pr-4 py-2 w-64"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                      />
                    </div>
                    {showCitySelect && (
                      <select
                        value={selectedCity}
                        onChange={e => { setSelectedCity(e.target.value); setCurrentPage(1); }}
                        className="w-40 border rounded px-3 py-2 text-gray-700"
                      >
                        <option value="all">All Cities</option>
                        {uniqueCities.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    )}
                    <Button onClick={handleDownloadExcel} size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-100 flex items-center gap-2">
                      Download Excel
                    </Button>
                    <Button onClick={handleDownloadPDF} size="sm" className="bg-red-500 text-white flex items-center gap-2">
                      Download PDF
                    </Button>
                  </div>
                </div>
                {showCityHeading && (
                  <div className="mt-2 flex items-center gap-4">
                    <span className="inline-block bg-red-100 text-red-700 font-bold rounded px-4 py-1 text-lg shadow-sm border border-red-200">
                      {filteredStats[0].city}
                    </span>
                    <button
                      className="ml-2 px-3 py-1 rounded bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition text-sm font-semibold"
                      onClick={() => setSelectedCity('all')}
                    >
                      Clear Filter
                    </button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-xl bg-white">
                <table className="w-full">
                  <thead className="bg-red-400">
                    <tr>
                      {selectedCity === "all" ? (
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">City</th>
                      ) : null}
                      {BLOOD_TYPES.map(type => (
                        <th key={type} className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                          <span className={`inline-block px-2 py-1 rounded ${BLOOD_COLORS[type]}`}>{type}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-red-400">
                    {loading ? (
                      <tr><td colSpan={BLOOD_TYPES.length + 1} className="text-center py-8 text-gray-400">Loading...</td></tr>
                    ) : paginatedStats.length === 0 ? (
                      <tr><td colSpan={BLOOD_TYPES.length + 1} className="text-center py-8 text-gray-400">No stats found.</td></tr>
                    ) : (
                      paginatedStats.map((cityObj, i) => (
                        <tr key={i} className="hover:bg-red-50 transition rounded-xl">
                          {selectedCity === "all" ? (
                            <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-800">{cityObj.city}</td>
                          ) : null}
                          {BLOOD_TYPES.map(type => {
                            const found = (cityObj.bloodGroups || []).find((bg: any) => bg.bloodType === type);
                            return (
                              <td key={type} className="px-4 py-4 text-center">
                                <button
                                  className={`inline-flex items-center justify-center min-w-[2rem] font-bold rounded px-2 py-1 transition hover:scale-110 focus:outline-none ${BLOOD_COLORS[type]} ${found && found.count > 0 ? 'cursor-pointer shadow' : 'opacity-50 cursor-not-allowed'}`}
                                  disabled={!found || found.count === 0}
                                  onClick={() => found && found.count > 0 && setLocation(`/donors-list?city=${encodeURIComponent(cityObj.city)}&bloodType=${encodeURIComponent(type)}`)}
                                >
                                  {found ? found.count : 0}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredStats.length)} of {filteredStats.length} stats
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Previous</Button>
                  <span className="text-sm">{currentPage}</span>
                  <Button size="sm" variant="outline" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(currentPage + 1)}>Next</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 