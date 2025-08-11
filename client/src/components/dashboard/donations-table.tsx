import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, MoreHorizontal, Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Update the Donation interface to match the API
interface Donation {
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
}

interface DonationsTableProps {
  donations: Donation[];
}

export default function DonationsTable({ donations }: DonationsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBloodType, setSelectedBloodType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredDonations = donations.filter(donation => {
    const matchesSearch = donation.donorId?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donation.requesterId?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donation.hospitalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donation.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBloodType = selectedBloodType === "all" || donation.status === selectedBloodType; // Assuming status is the blood type for now
    return matchesSearch && matchesBloodType;
  });

  const totalPages = Math.ceil(filteredDonations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDonations = filteredDonations.slice(startIndex, startIndex + itemsPerPage);

  // Dynamic status color mapping based on API status values
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'verified':
      case 'accepted':
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'processing':
      case 'waiting':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
      case 'used':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBloodTypeColor = (bloodType: string) => {
    const bloodColors: Record<string, string> = {
      'A+': 'bg-red-100 text-red-800',
      'A-': 'bg-pink-100 text-pink-800',
      'B+': 'bg-yellow-100 text-yellow-800',
      'B-': 'bg-orange-100 text-orange-800',
      'AB+': 'bg-purple-100 text-purple-800',
      'AB-': 'bg-indigo-100 text-indigo-800',
      'O+': 'bg-green-100 text-green-800',
      'O-': 'bg-gray-100 text-gray-800',
    };
    return bloodColors[bloodType] || 'bg-red-100 text-red-800';
  };

  // Helper for date formatting
  function formatDate(dateStr: string) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  }

  // Export functionality for filtered donations
  const exportDonations = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `donations_export_${timestamp}.csv`;
    
    // Create CSV content with new column order
    let csvContent = 'Donor,Location,Recipient,Status,Date\n';
    
    filteredDonations.forEach(donation => {
      const donor = donation.donorId?.fullName || '-';
      const location = donation.hospitalName || donation.location || '-';
      const recipient = donation.requesterId?.fullName || '-';
      const status = donation.status || '-';
      const date = formatDate(donation.createdAt);
      
      // Escape commas and quotes in CSV
      const escapeCSV = (str: string) => {
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };
      
      csvContent += [donor, location, recipient, status, date].map(escapeCSV).join(',') + '\n';
    });
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between ">
          <CardTitle>Recent Donations</CardTitle>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-5 h-5 text-red-400 absolute left-3 top-2.5" />
              <Input
                type="text"
                placeholder="Search donations..."
                className="pl-10 pr-4 py-2 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedBloodType} onValueChange={setSelectedBloodType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Blood Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Blood Types</SelectItem>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A-">A-</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B-">B-</SelectItem>
                <SelectItem value="AB+">AB+</SelectItem>
                <SelectItem value="AB-">AB-</SelectItem>
                <SelectItem value="O+">O+</SelectItem>
                <SelectItem value="O-">O-</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={exportDonations}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              Export All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-red-400">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">
                  Donor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">
                  Recipient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-red-400">
              {paginatedDonations.map((donation) => (
                <tr key={donation.id} className="hover:bg-red-100">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {donation.donorId?.fullName || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {donation.hospitalName || donation.location || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {donation.requesterId?.fullName || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getStatusColor(donation.status)}>
                      {donation.status || '-'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(donation.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredDonations.length)} of {filteredDonations.length} donations
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
