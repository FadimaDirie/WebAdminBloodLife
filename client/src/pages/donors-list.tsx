import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, X } from "lucide-react";
import { useLocation as useWouterLocation } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

interface Donor {
  _id: string;
  fullName: string;
  bloodType: string;
  city: string;
  phone: string;
  age: number;
  avatar?: string;
  profilePic?: string;
  availability?: string;
  healthStatus?: string;
}

export default function DonorsList() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBloodType, setSelectedBloodType] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [location, setLocation] = useWouterLocation();

  // Parse query params for city and bloodType
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || "");
    const city = params.get("city");
    const bloodType = params.get("bloodType");
    if (city) setSelectedCity(city);
    if (bloodType) setSelectedBloodType(bloodType);
  }, [location]);

  useEffect(() => {
    fetch("https://bloods-service-api.onrender.com/api/donor/all")
      .then(res => res.json())
      .then(data => {
        console.log('Donors API response:', data);
        if (Array.isArray(data)) {
          setDonors(data);
        } else if (Array.isArray(data.donors)) {
          setDonors(data.donors);
        } else if (Array.isArray(data.data)) {
          setDonors(data.data);
        } else {
          setDonors([]);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredDonors = donors.filter(donor => {
    // Enhanced search - search across multiple fields
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch = searchTerm === "" || 
      donor.fullName?.toLowerCase().includes(searchLower) || 
      donor.city?.toLowerCase().includes(searchLower) ||
      donor.bloodType?.toLowerCase().includes(searchLower) ||
      donor.phone?.includes(searchTerm) ||
      donor.age?.toString().includes(searchTerm);
    
    const matchesBloodType = selectedBloodType === "all" || donor.bloodType === selectedBloodType;
    const matchesCity = selectedCity === "all" || donor.city === selectedCity;
    return matchesSearch && matchesBloodType && matchesCity;
  });

  const totalPages = Math.ceil(filteredDonors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDonors = filteredDonors.slice(startIndex, startIndex + itemsPerPage);

  // Download as CSV (Excel)
  const handleDownloadExcel = () => {
    const csv = [
      ["Name", "Blood Type", "City", "Phone", "Age"],
      ...filteredDonors.map(d => [d.fullName, d.bloodType, d.city, d.phone, d.age])
    ].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "donors-list.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download as PDF (simple)
  const handleDownloadPDF = () => {
    window.print(); // For simplicity, print as PDF
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
    <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    <div className="flex flex-col flex-1 overflow-hidden">
      <Header onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex-1 overflow-y-auto p-8 w-full max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Donors List</h1>
            {/* Download buttons here if needed */}
          </div>
          <div className="flex items-center mb-4 gap-4">
            <div className="relative w-full max-w-xs">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              <Input
                type="text"
                placeholder="Search by name, city, blood type, phone..."
                className="pl-10 pr-4 py-2 w-full border-red-200 focus:border-red-500 focus:ring-red-500"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
              {searchTerm && (
                <button
                  onClick={() => { setSearchTerm(""); setCurrentPage(1); }}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {searchTerm && (
              <div className="text-sm text-gray-600">
                {filteredDonors.length} result{filteredDonors.length !== 1 ? 's' : ''} found
              </div>
            )}
            <select
              value={selectedCity}
              onChange={e => { setSelectedCity(e.target.value); setCurrentPage(1); }}
              className="w-40 border rounded px-3 py-2 text-gray-700"
            >
              <option value="all">All Cities</option>
              {Array.from(new Set(donors.map(d => d.city))).map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <select
              value={selectedBloodType}
              onChange={e => { setSelectedBloodType(e.target.value); setCurrentPage(1); }}
              className="w-40 border rounded px-3 py-2 text-gray-700"
            >
              <option value="all">All Blood Types</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
            <Button onClick={handleDownloadExcel} size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-500 flex items-center gap-2">
              Download Excel
            </Button>
            <Button onClick={handleDownloadPDF} size="sm" className="bg-red-600 flex items-center gap-2">
              Download PDF
            </Button>
          </div>
          <div className="overflow-x-auto rounded-2xl shadow-lg bg-white">
            <table className="w-full min-w-[900px] divide-y divide-gray-600 text-base">
              <thead className="bg-red-200">
                <tr>
                  <th className="px-6 py-3 text-left text-base font-bold text-red-700 uppercase tracking-wider">Donor</th>
                  <th className="px-6 py-3 text-left text-base font-bold text-red-700 uppercase tracking-wider">Blood Type</th>
                  <th className="px-6 py-3 text-left text-base font-bold text-red-700 uppercase tracking-wider">City</th>
                  <th className="px-6 py-3 text-left text-base font-bold text-red-700 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-base font-bold text-red-700 uppercase tracking-wider">Availability</th>
                  <th className="px-6 py-3 text-left text-base font-bold text-red-700 uppercase tracking-wider">Health Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-red-200">
                    {loading ? (
                      <tr><td colSpan={7} className="text-center py-8 text-gray-400">Loading...</td></tr>
                    ) : paginatedDonors.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-gray-400">
                          {searchTerm || selectedBloodType !== "all" || selectedCity !== "all" 
                            ? `No donors found matching your search criteria.${searchTerm ? ` Try searching for "${searchTerm}"` : ""}`
                            : "No donors found."
                          }
                        </td>
                      </tr>
                    ) : (
                      paginatedDonors.map((donor) => {
                        // Badge color logic
                        const avail = donor.availability || "Unknown";
                        const availColor = avail === "Available" ? "bg-green-100 text-green-800" : avail === "Unavailable" ? "bg-gray-200 text-gray-700" : "bg-yellow-100 text-yellow-800";
                        const health = donor.healthStatus || "Unknown";
                        const healthColor = health === "Healthy" ? "bg-blue-100 text-blue-800" : health === "Unhealthy" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800";
                        return (
                          <tr key={donor._id} className="hover:bg-red-50 transition rounded-xl">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Avatar className="h-8 w-8">
                                  {donor.avatar || donor.profilePic ? (
                                    <AvatarImage src={donor.avatar || donor.profilePic} />
                                  ) : null}
                                  <AvatarFallback>{donor.fullName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{donor.fullName}</div>
                                  <div className="text-sm text-gray-500">ID: {donor._id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className="bg-red-300 text-red-800">{donor.bloodType}</Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <button
                                className="underline text-red-900 hover:text-red-900 font-semibold focus:outline-none"
                                onClick={() => setLocation(`/donor-stats?city=${encodeURIComponent(donor.city)}`)}
                              >
                                {donor.city}
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{donor.phone}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className={`inline-block px-2 py-1 rounded font-semibold text-xs ${availColor}`}>{avail}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className={`inline-block px-2 py-1 rounded font-semibold text-xs ${healthColor}`}>{health}</span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
          </div>
          {/* Pagination */}
          <div className="flex justify-end items-center gap-2 mt-4">
            <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Previous</Button>
            <span className="text-sm">Page {currentPage} of {totalPages}</span>
            <Button bg-red-200 size="sm" variant="outline" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(currentPage + 1)}>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
} 