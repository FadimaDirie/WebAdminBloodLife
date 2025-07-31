import { useEffect, useState, useMemo } from "react";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Header from "@/components/layout/header";
import { Ban, Eye, EyeOff } from "lucide-react";

type User = {
  _id: string;
  fullName: string;
  email: string;
  city: string;
  bloodType: string;
  phone: string;
  age: number;
  profilePic?: string;
  isSuspended?: boolean; // Added for suspension status
  isAdmin?: boolean; // Added for admin status
  isDonor?: boolean; // Added for donor status
  isRequester?: boolean; // Added for requester status
};

export default function UserManagement() {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    city: "",
    bloodType: "",
    phone: "",
    age: "",
    role: "", // add role field
    gender: "", // add gender field
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [loadingCity, setLoadingCity] = useState(true);
  const [cityData, setCityData] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch all users from API
  useEffect(() => {
    fetch("https://bloods-service-api.onrender.com/api/user/all")
      .then(res => res.json())
      .then(data => setUsers(data.users || []));
  }, []);

  // Fetch city/blood type stats for chart
  useEffect(() => {
    fetch("https://bloods-service-api.onrender.com/api/donor/stats-by-city-and-blood")
      .then(res => res.json())
      .then(data => setCityData(Array.isArray(data) ? data : []))
      .finally(() => setLoadingCity(false));
  }, []);

  // Filter users by search
  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  // Filtered and paginated users
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle add user
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("https://bloods-service-api.onrender.com/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, age: Number(form.age) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Registration failed");
      // Refresh users
      setUsers(prev => [
        ...prev,
        {
          _id: data.user?._id || Date.now().toString(),
          fullName: data.user?.fullName,
          email: data.user?.email,
          city: data.user?.city,
          bloodType: data.user?.bloodType,
          phone: data.user?.phone,
          age: data.user?.age,
          profilePic: data.user?.profilePic,
          isAdmin: data.user?.isAdmin, // add
          isDonor: data.user?.isDonor, // add
          isRequester: data.user?.isRequester, // add
        },
      ]);
      setOpen(false);
      setForm({ fullName: "", email: "", password: "", city: "", bloodType: "", phone: "", age: "", role: "", gender: "" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle suspend user
  const handleSuspend = async (userId: string) => {
    try {
      const res = await fetch(`https://bloods-service-api.onrender.com/api/admin/suspend/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to suspend user");
      // Update the user in state with the returned user object
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, ...data.user } : u));
    } catch (err: any) {
      alert(err.message || "Failed to suspend user");
    }
  };

  // Handle unsuspend user
  const handleUnsuspend = async (userId: string) => {
    try {
      const res = await fetch(`https://bloods-service-api.onrender.com/api/admin/unsuspend/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to unsuspend user");
      // Update the user in state with the returned user object
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, ...data.user } : u));
    } catch (err: any) {
      alert(err.message || "Failed to unsuspend user");
    }
  };

  // Helper for profile image
  const getProfilePicUrl = (profilePic?: string, name?: string) => {
    if (!profilePic) {
      // fallback initials avatar
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}`;
    }
    if (profilePic.startsWith("http")) return profilePic;
    return `https://bloods-service-api.onrender.com/uploads/${profilePic}`;
  };

  const BLOOD_TYPES = ["A+", "O+", "AB+", "O-", "A-", "B-", "AB-"];
  const BLOOD_COLORS = ["#a259f7", "#f759e4", "#10B981", "#F59E0B", "#EF4444", "#6366F1", "#3B82F6"];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex-1 overflow-y-auto p-8 w-full max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">User Management</h1>
            <Button onClick={() => setOpen(true)} className="bg-primary text-white">Add User</Button>
          </div>
          <div className="flex items-center mb-4">
            <input
              type="text"
              placeholder="Search users..."
              className="border rounded px-3 py-2 w-full max-w-xs shadow-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="overflow-x-auto rounded-2xl shadow-lg bg-white">
            <table className="w-full min-w-[900px] divide-y divide-red-200 text-base">
              <thead className="bg-red-200">
                <tr>
                  <th className="px-6 py-4 text-left text-base font-bold text-red-700 uppercase tracking-wider rounded-tl-2xl">Name</th>
                  <th className="px-6 py-4 text-left text-base font-bold text-red-700 uppercase tracking-wider">City</th>
                  <th className="px-6 py-4 text-left text-base font-bold text-red-700 uppercase tracking-wider">Blood Type</th>
                  <th className="px-6 py-4 text-left text-base font-bold text-red-700 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-4 text-left text-base font-bold text-red-700 uppercase tracking-wider">Age</th>
                  <th className="px-6 py-4 text-left text-base font-bold text-red-700 uppercase tracking-wider">Role</th> {/* Role column */}
                  <th className="px-6 py-4 text-left text-base font-bold text-red-700 uppercase tracking-wider rounded-tr-2xl">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-red-300">
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400">No users found.</td> {/* colSpan updated */}
                  </tr>
                ) : (
                  paginatedUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-red-50 transition rounded-xl">
                      <td className="px-6 py-4 whitespace-nowrap font-medium flex items-center gap-3">
                        <img
                          src={getProfilePicUrl(user.profilePic, user.fullName)}
                          alt={user.fullName}
                          className="w-9 h-9 rounded-full object-cover border"
                        />
                        {user.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.city}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.bloodType}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.age}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{/* Role cell */}
                        {user.isAdmin ? "Admin" : user.isDonor ? "Donor" : user.isRequester ? "Requester" : "User"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.isSuspended ? (
                          <Button
                            size="sm"
                            className="bg-blue-100 text-blue-600 px-4 py-1 rounded-full border border-gray-300 hover:bg-gray-300 transition font-semibold flex items-center justify-center"
                            onClick={() => handleUnsuspend(user._id)}
                          >
                            <EyeOff className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="bg-blue-100 text-blue-600 px-4 py-1 rounded-full border border-blue-200 hover:bg-blue-200 transition font-semibold flex items-center justify-center"
                            onClick={() => handleSuspend(user._id)}
                          >
                            <Eye className="w-4 h-4 text-blue-600" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex justify-end items-center gap-2 mt-4">
            <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Previous</Button>
            <span className="text-sm">Page {currentPage} of {Math.ceil(filteredUsers.length / itemsPerPage)}</span>
            <Button size="sm" variant="outline" disabled={currentPage === Math.ceil(filteredUsers.length / itemsPerPage) || filteredUsers.length === 0} onClick={() => setCurrentPage(currentPage + 1)}>Next</Button>
          </div>
          {/* Add User Modal */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogTitle>Add User</DialogTitle>
              <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
                <input className="w-full border rounded px-3 py-2" name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} required />
                <input className="w-full border rounded px-3 py-2" name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} required />
                <input className="w-full border rounded px-3 py-2" name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />

                {/* City Dropdown */}
                <select
                  className="w-full border rounded px-3 py-2"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select City</option>
                  {cityData.map((city: any) => (
                    <option key={city.city} value={city.city}>{city.city}</option>
                  ))}
                </select>

                {/* Blood Type Dropdown */}
                <select
                  className="w-full border rounded px-3 py-2"
                  name="bloodType"
                  value={form.bloodType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Blood Type</option>
                  {BLOOD_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>

                {/* Role Dropdown */}
                <select
                  className="w-full border rounded px-3 py-2"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="donor">Donor</option>
                  <option value="requester">Requester</option>
                </select>

                {/* Gender Dropdown */}
                <select
                  className="w-full border rounded px-3 py-2"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>

                <input className="w-full border rounded px-3 py-2" name="age" type="number" placeholder="Age" value={form.age} onChange={handleChange} required />
                {error && <div className="text-red-500 text-sm">{error}</div>}
                {/* {success && <div className="text-green-600 text-sm">{success}</div>} */}
                <Button type="submit" className="w-full" disabled={loading}>{loading ? "Adding..." : "Add User"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
} 