import { useEffect, useState, useMemo } from "react";
import { useLocation } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Header from "@/components/layout/header";
import { Eye, EyeOff, Edit, X, Search } from "lucide-react";

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
  // Additional fields from API response
  gender?: string;
  weight?: number;
  latitude?: number;
  longitude?: number;
  username?: string;
  password?: string;
  healthStatus?: string;
  healthChecklist?: boolean;
  availability?: string;
  fcmToken?: string;
  createdAt?: string;
  updatedAt?: string;
  units?: number;
  profilePicUrl?: string;
};

export default function UserManagement() {
  const [open, setOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [, setLocation] = useLocation();
  
  // Check if current user is admin
  const isAdmin = currentUser?.isAdmin || false;
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
  const [updateForm, setUpdateForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    age: "",
    bloodType: "",
    city: "",
    weight: "",
    gender: "",
    role: ""
  });
  const [selectedUserForUpdate, setSelectedUserForUpdate] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // Add success message state
  const [search, setSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loadingCity, setLoadingCity] = useState(true);
  const [cityData, setCityData] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get current user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUser(user);
      console.log("Current user loaded:", user);
      console.log("Is admin:", user.isAdmin);
    } else {
      console.log("No user data found in localStorage");
    }
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

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
    const searchLower = debouncedSearch.toLowerCase().trim();
    
    // If no search term, return all users
    if (searchLower === "") {
      return users;
    }
    
    return users.filter((u) => {
      // Check if any field contains the search term
      const searchableFields = [
        u.fullName || "",
        u.email || "",
        u.city || "",
        u.bloodType || "",
        u.phone || "",
        u.age?.toString() || ""
      ];
      
      return searchableFields.some(field => 
        field.toLowerCase().includes(searchLower)
      );
    });
  }, [users, debouncedSearch]);

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
    setSuccess(""); // Clear previous success message
    try {
      // Set default role to requester if not selected
      const userData = {
        ...form,
        age: Number(form.age),
        role: form.role || "requester" // Default to requester if not selected
      };
      
      const res = await fetch("https://bloods-service-api.onrender.com/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
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
          isAdmin: data.user?.isAdmin,
          isDonor: data.user?.isDonor,
          isRequester: data.user?.isRequester,
        },
      ]);
      setOpen(false);
      setForm({ fullName: "", email: "", password: "", city: "", bloodType: "", phone: "", age: "", role: "", gender: "" });
      setSuccess("User added successfully!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle update user role
  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (!isAdmin) {
      setError("Only admins can update user roles");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      const res = await fetch(`https://bloods-service-api.onrender.com/api/admin/update-role/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to update role");
      
      // Update the user in state
      setUsers(prev => prev.map(u => {
        if (u._id === userId) {
          return {
            ...u,
            isAdmin: newRole === "admin",
            isDonor: newRole === "donor", 
            isRequester: newRole === "requester"
          };
        }
        return u;
      }));
      
      // Show success message
      setSuccess(`User role updated to ${newRole} successfully!`);
      setTimeout(() => setSuccess(""), 3000); // Clear after 3 seconds
    } catch (err: any) {
      setError(err.message || "Failed to update role");
      setTimeout(() => setError(""), 3000); // Clear after 3 seconds
    }
  };

  // Handle suspend user
  const handleSuspend = async (userId: string) => {
    if (!isAdmin) {
      setError("Only admins can suspend users");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      const res = await fetch(`https://bloods-service-api.onrender.com/api/admin/suspend/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to suspend user");
      // Update the user in state with the returned user object
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, ...data.user } : u));
      setSuccess("User suspended successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to suspend user");
      setTimeout(() => setError(""), 3000);
    }
  };

  // Handle unsuspend user
  const handleUnsuspend = async (userId: string) => {
    if (!isAdmin) {
      setError("Only admins can unsuspend users");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      const res = await fetch(`https://bloods-service-api.onrender.com/api/admin/unsuspend/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to unsuspend user");
      // Update the user in state with the returned user object
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, ...data.user } : u));
      setSuccess("User unsuspended successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to unsuspend user");
      setTimeout(() => setError(""), 3000);
    }
  };

  // New functions for update modal
  const handleOpenUpdateModal = (user: User) => {
    setSelectedUserForUpdate(user);
    setUpdateForm({
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
      age: user.age?.toString() || "",
      bloodType: user.bloodType || "",
      city: user.city || "",
      weight: (user as any).weight?.toString() || "",
      gender: user.gender || "",
      role: user.isAdmin ? "admin" : user.isDonor ? "donor" : user.isRequester ? "requester" : "user"
    });
    setUpdateModalOpen(true);
  };

  const handleUpdateModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForUpdate) return;

    if (!isAdmin) {
      setError("Only admins can update users");
      return;
    }

    // Validation
    if (!updateForm.fullName || !updateForm.email || !updateForm.phone || !updateForm.age || !updateForm.bloodType || !updateForm.city) {
      setError("Please fill all required fields");
      return;
    }

    const age = parseInt(updateForm.age);
    const weight = updateForm.weight ? parseInt(updateForm.weight) : undefined;

    if (age < 1 || age > 120) {
      setError("Age must be between 1 and 120");
      return;
    }

    if (weight && (weight < 1 || weight > 300)) {
      setError("Weight must be between 1 and 300 kg");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append('fullName', updateForm.fullName);
      formData.append('email', updateForm.email);
      formData.append('phone', updateForm.phone);
      formData.append('age', updateForm.age);
      formData.append('bloodType', updateForm.bloodType);
      formData.append('city', updateForm.city);
      if (updateForm.weight) {
        formData.append('weight', updateForm.weight);
      }
      if (updateForm.gender) {
        formData.append('gender', updateForm.gender);
      }
      if (updateForm.role) {
        formData.append('role', updateForm.role);
      }

      console.log("=== UPDATE MODAL SUBMIT ===");
      console.log("User ID:", selectedUserForUpdate._id);
      console.log("Form data:", updateForm);

      const response = await fetch(`https://bloods-service-api.onrender.com/api/user/${selectedUserForUpdate._id}/update`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
        },
        body: formData
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (response.ok) {
        const result = await response.json();
        console.log("Update successful:", result);
        setSuccess("User updated successfully!");
        
        // Update the users list
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === selectedUserForUpdate._id 
              ? { 
                  ...user, 
                  fullName: updateForm.fullName,
                  email: updateForm.email,
                  phone: updateForm.phone,
                  age: parseInt(updateForm.age),
                  bloodType: updateForm.bloodType,
                  city: updateForm.city,
                  weight: updateForm.weight ? parseInt(updateForm.weight) : undefined,
                  ...(updateForm.gender && { gender: updateForm.gender }),
                  ...(updateForm.role && { 
                    isAdmin: updateForm.role === "admin",
                    isDonor: updateForm.role === "donor",
                    isRequester: updateForm.role === "requester"
                  })
                } as User
              : user
          )
        );
        
        setUpdateModalOpen(false);
        setSelectedUserForUpdate(null);
        setUpdateForm({
          fullName: "",
          email: "",
          phone: "",
          age: "",
          bloodType: "",
          city: "",
          weight: "",
          gender: "",
          role: ""
        });
      } else {
        const errorData = await response.json();
        console.error("Update failed:", errorData);
        setError(errorData.message || "Failed to update user");
      }
    } catch (err: any) {
      console.error("Update error:", err);
      setError("Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUpdateForm(prev => ({ ...prev, [name]: value }));
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

  const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const BLOOD_COLORS = ["#a259f7", "#f759e4", "#10B981", "#F59E0B", "#EF4444", "#6366F1", "#3B82F6"];

  // Test update function - no longer needed
  // const testUpdate = async (userId: string) => {
  //   // This function is no longer needed
  // };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex-1 overflow-y-auto p-8 w-full max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">User Management</h1>
            {isAdmin && (
            <Button onClick={() => setOpen(true)} className="bg-primary text-white">Add User</Button>
            )}
          </div>
          
          {/* Success/Error Messages */}
          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          {!isAdmin && (
            <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
              You are viewing in read-only mode. Only admins can perform actions.
            </div>
          )}
          <div className="flex items-center mb-4 gap-4">
            <div className="relative w-full max-w-md">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
                placeholder="Search by name, email, city, blood type, phone..."
                className="pl-10 pr-10 py-2 w-full border rounded-lg shadow-sm border-red-200 focus:border-red-500 focus:ring-red-500 focus:ring-2 transition-all duration-200"
              value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setSearch("");
                    setCurrentPage(1);
                  }
                }}
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-red-500 transition-colors"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {debouncedSearch && (
              <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {searchLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    Searching...
                  </span>
                ) : (
                  `${filteredUsers.length} result${filteredUsers.length !== 1 ? 's' : ''} found`
                )}
              </div>
            )}
          </div>
          <div className="overflow-x-auto rounded-2xl shadow-lg bg-white">
            <table className="w-full min-w-[900px] divide-y divide-red-200 text-base">
              <thead className="bg-red-200">
                <tr>
                  <th className="px-6 py-4 text-left text-base font-bold text-red-700  rounded-tl-2xl">Name</th>
                  <th className="px-6 py-4 text-left text-base font-bold text-red-700 ">City</th>
                  <th className="px-6 py-4 text-left text-base font-bold text-red-700 ">BloodType</th>
                  <th className="px-6 py-4 text-left text-base font-bold text-red-700 ">Phone</th>
                  <th className="px-6 py-4 text-left text-base font-bold text-red-700 ">Age</th>
                  <th className="px-6 py-4 text-left text-base font-bold text-red-700 ">Role</th> {/* Role column */}
                  <th className="px-6 py-4 text-left text-base font-bold text-red-700  rounded-tr-2xl">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-red-300">
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400">
                      {debouncedSearch ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="text-lg font-medium">No users found</div>
                          <div className="text-sm">Try searching with different keywords</div>
                          <button
                            onClick={() => setSearch("")}
                            className="text-red-600 hover:text-red-700 underline"
                          >
                            Clear search
                          </button>
                        </div>
                      ) : (
                        "No users found."
                      )}
                    </td>
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
                        <div className="flex flex-col gap-1">
                          <div className="font-medium">{user.fullName}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.city}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.bloodType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.age}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          className={`border rounded px-2 py-1 text-sm transition-colors ${isAdmin ? 'bg-white hover:bg-gray-50' : 'bg-gray-100 cursor-not-allowed'}`}
                          value={user.isAdmin ? "admin" : user.isDonor ? "donor" : user.isRequester ? "requester" : "user"}
                          onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                          disabled={!isAdmin}
                        >
                          <option value="admin" className="text-purple-600 font-medium">Admin</option>
                          <option value="donor" className="text-red-600 font-medium">Donor</option>
                          <option value="requester" className="text-blue-600 font-medium">Requester</option>
                         
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {isAdmin && (
                            <Button
                              size="sm"
                              className="bg-green-100 text-green-600 px-2 py-1 rounded-full border border-green-200 hover:bg-green-200 transition font-semibold flex items-center justify-center"
                              onClick={() => handleOpenUpdateModal(user)}
                              title="Update User"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {isAdmin && (
                            user.isSuspended ? (
                              <Button
                                size="sm"
                                className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full border border-gray-200 hover:bg-gray-200 transition font-semibold flex items-center justify-center"
                                onClick={() => handleUnsuspend(user._id)}
                                title="Unsuspend User"
                              >
                                <EyeOff className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full border border-blue-200 hover:bg-blue-200 transition font-semibold flex items-center justify-center"
                                onClick={() => handleSuspend(user._id)}
                                title="Suspend User"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            )
                          )}
                        </div>
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
                <input className="w-full border rounded px-3 py-2" name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
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
                {success && <div className="text-green-600 text-sm">{success}</div>}
                <Button type="submit" className="w-full" disabled={loading}>{loading ? "Adding..." : "Add User"}</Button>
              </form>
            </DialogContent>
          </Dialog>
          {/* Update User Modal */}
          <Dialog open={updateModalOpen} onOpenChange={setUpdateModalOpen}>
            <DialogContent>
              <DialogTitle>Update User</DialogTitle>
              <form className="space-y-4 mt-4" onSubmit={handleUpdateModalSubmit}>
                <input className="w-full border rounded px-3 py-2" name="fullName" placeholder="Full Name" value={updateForm.fullName} onChange={handleUpdateFormChange} required />
                <input className="w-full border rounded px-3 py-2" name="email" type="email" placeholder="Email" value={updateForm.email} onChange={handleUpdateFormChange} required />
                <input className="w-full border rounded px-3 py-2" name="phone" placeholder="Phone" value={updateForm.phone} onChange={handleUpdateFormChange} required />
                <input className="w-full border rounded px-3 py-2" name="age" type="number" placeholder="Age" value={updateForm.age} onChange={handleUpdateFormChange} required />
                <select
                  className="w-full border rounded px-3 py-2"
                  name="bloodType"
                  value={updateForm.bloodType}
                  onChange={handleUpdateFormChange}
                  required
                >
                  <option value="">Select Blood Type</option>
                  {BLOOD_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <select
                  className="w-full border rounded px-3 py-2"
                  name="role"
                  value={updateForm.role}
                  onChange={handleUpdateFormChange}
                >
                  <option value="">Select Role (Optional)</option>
                  <option value="admin">Admin</option>
                  <option value="donor">Donor</option>
                  <option value="requester">Requester</option>
                </select>
                <select
                  className="w-full border rounded px-3 py-2"
                  name="gender"
                  value={updateForm.gender}
                  onChange={handleUpdateFormChange}
                >
                  <option value="">Select Gender (Optional)</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <select
                  className="w-full border rounded px-3 py-2"
                  name="city"
                  value={updateForm.city}
                  onChange={handleUpdateFormChange}
                  required
                >
                  <option value="">Select City</option>
                  {cityData.map((city: any) => (
                    <option key={city.city} value={city.city}>{city.city}</option>
                  ))}
                </select>
                <input className="w-full border rounded px-3 py-2" name="weight" type="number" placeholder="Weight (kg) - Optional" value={updateForm.weight} onChange={handleUpdateFormChange} />
                {error && <div className="text-red-500 text-sm">{error}</div>}
                {success && <div className="text-green-600 text-sm">{success}</div>}
                <Button type="submit" className="w-full" disabled={loading}>{loading ? "Updating..." : "Update User"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
} 