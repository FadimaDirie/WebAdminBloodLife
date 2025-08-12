import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface TodayDonation {
  id: string;
  donorId: {
    fullName: string;
    avatar?: string;
    _id?: string;
  } | null;
  requesterId: {
    fullName: string;
    avatar?: string;
    _id?: string;
  } | null;
  hospitalName?: string;
  location?: string;
  status: string;
  createdAt: string;
  bloodType?: string;
  unit?: number;
  patientName?: string;
}

interface TodayDonationsTableProps {
  donations: TodayDonation[];
  onApprove: (id: string, requesterId: string) => Promise<void> | void;
  loading: boolean;
}

export default function TodayDonationsTable({
  donations,
  onApprove,
  loading,
}: TodayDonationsTableProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredDonations = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return donations.filter((d) => {
      const donorName = d.donorId?.fullName?.toLowerCase() || "";
      const recipientName = d.requesterId?.fullName?.toLowerCase() || "";
      const locationStr = (d.hospitalName || d.location || "").toLowerCase();
      return donorName.includes(term) || recipientName.includes(term) || locationStr.includes(term);
    });
  }, [donations, searchTerm]);

  const totalPages = Math.ceil(filteredDonations.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filteredDonations.slice(startIndex, startIndex + itemsPerPage);

  function formatDate(dateStr: string) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const getStatusColor = (status: string) => {
    const s = (status || "").toLowerCase();
    if (["accepted", "confirmed", "verified", "approved"].includes(s)) return "bg-green-100 text-green-800";
    if (["waiting", "pending", "processing"].includes(s)) return "bg-yellow-100 text-yellow-800";
    if (["rejected", "cancelled"].includes(s)) return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between ">
          <CardTitle>Today's Blood Donations</CardTitle>
          <div className="relative">
            <Search className="w-5 h-5 text-red-400 absolute left-3 top-2.5" />
            <Input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-red-400">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">Donor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">Blood</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">Unit (ml)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-red-400">
              {donations.map((d) => {
                const isApproved = ["accepted", "confirmed", "verified", "approved"].includes((d.status || "").toLowerCase());
                return (
                  <tr key={d.id} className="hover:bg-red-100">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={d.donorId?.avatar} />
                          <AvatarFallback>{d.donorId?.fullName?.[0] || "D"}</AvatarFallback>
                        </Avatar>
                        {d.donorId?.fullName || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{d.bloodType || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{d.unit || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{d.patientName || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{d.hospitalName || d.location || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><Badge className={getStatusColor(d.status)}>{d.status || '-'}</Badge></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(d.createdAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Button
                        size="sm"
                        disabled={loading}
                        onClick={async () => {
                          try {
                            console.log('Button clicked for donation:', d.id, 'requesterId:', d.requesterId?._id);
                            if (!d.requesterId?._id) {
                              alert('Error: Requester ID not found');
                              return;
                            }
                            
                            // Show loading state
                            const button = event.target as HTMLButtonElement;
                            const originalText = button.innerHTML;
                            button.innerHTML = '<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Loading...';
                            button.disabled = true;
                            
                            // Call the API to approve the order
                            const res = await fetch(`https://bloods-service-api.onrender.com/api/orders/approveOrderAndRewardDonor`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                orderId: d.id,
                                userId: d.requesterId._id,
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

                            // Show success message with response details
                            alert(`✅ Order approved successfully!\n\nDonor: ${result.order?.donorId?.fullName || 'Unknown'}\nPatient: ${result.order?.patientName || 'Unknown'}\nHospital: ${result.order?.hospitalName || 'Unknown'}\nReward Points: ${result.rewardPoints || 50}\nStatus: ${result.order?.status || 'approved'}`);

                            // Call the parent onApprove function to update the UI
                            await onApprove(d.id, d.requesterId._id);
                            
                          } catch (error) {
                            console.error('Error in button click:', error);
                            alert('❌ Error approving donation. Please try again.');
                          } finally {
                            // Restore button state
                            const button = event.target as HTMLButtonElement;
                            button.innerHTML = originalText;
                            button.disabled = false;
                          }
                        }}
                        className="bg-red-500 text-white hover:bg-red-600 hover:scale-105 shadow-lg rounded-full px-3 transition-all duration-200"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredDonations.length)} of {filteredDonations.length}
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>Previous</Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(page)} className="w-8 h-8 p-0">{page}</Button>
              ))}
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Next</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

