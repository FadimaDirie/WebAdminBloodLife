import { useEffect, useState, useMemo } from "react";
import { useLocation } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Header from "@/components/layout/header";
import { Ban, Eye, EyeOff, Edit, Save, X, Search } from "lucide-react";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // Add success message state
  const [search, setSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loadingCity, setLoadingCity] = useState(true);
  const [cityData, setCityData] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
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

  // Handle edit user
  const handleEditUser = (user: User) => {
    console.log("=== EDITING USER ===");
    console.log("Original user data:", user);
    
    setEditingUser(user._id);
    
    const initialFormData = {
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
      age: user.age ? user.age.toString() : "",
      bloodType: user.bloodType || "",
      city: user.city || "",
      weight: (user as any).weight ? (user as any).weight.toString() : "",
      gender: (user as any).gender || "",
      role: user.isAdmin ? "admin" : user.isDonor ? "donor" : user.isRequester ? "requester" : "user"
    };
    
    setEditForm(initialFormData);
    
    console.log("Edit form initialized with:", initialFormData);
    
    // Show current data to user
    alert(`Editing user: ${user.fullName}\n\nCurrent data:\n- Name: ${user.fullName}\n- Email: ${user.email}\n- Phone: ${user.phone}\n- Age: ${user.age || 'N/A'}\n- Blood Type: ${user.bloodType}\n- City: ${user.city}\n- Weight: ${(user as any).weight || 'N/A'}\n- Gender: ${(user as any).gender || 'N/A'}\n- Role: ${user.isAdmin ? 'Admin' : user.isDonor ? 'Donor' : user.isRequester ? 'Requester' : 'User'}`);
  };

  // Handle update user
  const handleUpdateUser = async (userId: string) => {
    alert("Update function called! User ID: " + userId);
    console.log("=== UPDATE USER START ===");
    console.log("User ID:", userId);
    console.log("Is Admin:", isAdmin);
    console.log("Current edit form:", editForm);
    
    if (!isAdmin) {
      setError("Only admins can update users");
      setTimeout(() => setError(""), 3000);
      return;
    }

    // Validate required fields
    if (!editForm.fullName || !editForm.email || !editForm.phone || !editForm.age || !editForm.bloodType || !editForm.city) {
      console.log("Validation failed - missing fields:", {
        fullName: !!editForm.fullName,
        email: !!editForm.email,
        phone: !!editForm.phone,
        age: !!editForm.age,
        bloodType: !!editForm.bloodType,
        city: !!editForm.city
      });
      setError("Please fill in all required fields");
      setTimeout(() => setError(""), 3000);
      return;
    }

    // Validate age and weight
    const age = Number(editForm.age);
    const weight = Number(editForm.weight);
    
    if (isNaN(age) || age < 1 || age > 120) {
      setError("Age must be between 1 and 120");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (editForm.weight && (isNaN(weight) || weight < 1 || weight > 300)) {
      setError("Weight must be between 1 and 300 kg");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      // Create update data - only include fields that have values
      const updateData: any = {
        fullName: editForm.fullName,
        email: editForm.email,
        phone: editForm.phone,
        age: age,
        bloodType: editForm.bloodType,
        city: editForm.city
      };

      // Only add optional fields if they have values
      if (editForm.weight) {
        updateData.weight = weight;
      }
      if (editForm.gender) {
        updateData.gender = editForm.gender;
      }
      if (editForm.role) {
        updateData.role = editForm.role;
      }

      console.log("Updating user with data:", updateData);
      console.log("API URL:", `https://bloods-service-api.onrender.com/api/user/${userId}/update`);

      // Convert data to FormData as the API expects form-data
      const formData = new FormData();
      formData.append('fullName', updateData.fullName);
      formData.append('email', updateData.email);
      formData.append('phone', updateData.phone);
      formData.append('age', updateData.age.toString());
      formData.append('bloodType', updateData.bloodType);
      formData.append('city', updateData.city);
      
      if (updateData.weight) {
        formData.append('weight', updateData.weight.toString());
      }
      if (updateData.gender) {
        formData.append('gender', updateData.gender);
      }
      if (updateData.role) {
        formData.append('role', updateData.role);
      }

      console.log("FormData entries:");
      formData.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });
      
      // Show user what data is being sent
      const dataToShow = {
        fullName: updateData.fullName,
        email: updateData.email,
        phone: updateData.phone,
        age: updateData.age,
        bloodType: updateData.bloodType,
        city: updateData.city,
        weight: updateData.weight || 'Not provided',
        gender: updateData.gender || 'Not provided',
        role: updateData.role || 'Not provided'
      };
      
      alert(`Updating user with data:\n\n${Object.entries(dataToShow).map(([key, value]) => `- ${key}: ${value}`).join('\n')}`);

      const res = await fetch(`https://bloods-service-api.onrender.com/api/user/${userId}/update`, {
        method: "PUT",
        headers: {
          "Accept": "application/json",
        },
        body: formData,
      });
      
      console.log("Response status:", res.status);
      console.log("Response headers:", res.headers);
      
      const data = await res.json();
      console.log("Update response:", data);
      
      if (!res.ok) {
        console.error("API Error:", data);
        throw new Error(data.msg || data.message || `HTTP ${res.status}: Failed to update user`);
      }
      
      // Update the user in state with the complete user data from API
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, ...data.user } : u));
      setEditingUser(null);
      
      // Show what was updated
      const updatedUser = data.user;
      const roleText = updatedUser.isAdmin ? 'Admin' : updatedUser.isDonor ? 'Donor' : updatedUser.isRequester ? 'Requester' : 'User';
      
      alert(`✅ User updated successfully!\n\nUpdated data:\n- Name: ${updatedUser.fullName}\n- Email: ${updatedUser.email}\n- Phone: ${updatedUser.phone}\n- Age: ${updatedUser.age}\n- Blood Type: ${updatedUser.bloodType}\n- City: ${updatedUser.city}\n- Weight: ${updatedUser.weight || 'N/A'}\n- Gender: ${updatedUser.gender || 'N/A'}\n- Role: ${roleText}\n- Health Status: ${updatedUser.healthStatus || 'N/A'}\n- Availability: ${updatedUser.availability || 'N/A'}\n- Units: ${updatedUser.units || 'N/A'}`);
      
      setSuccess(`User ${updatedUser.fullName} updated successfully!`);
      
      console.log("=== UPDATE USER SUCCESS ===");
      console.log("Updated user data:", updatedUser);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err: any) {
      console.error("=== UPDATE USER ERROR ===");
      console.error("Update error:", err);
      console.error("Error message:", err.message);
      setError(err.message || "Failed to update user");
      setTimeout(() => setError(""), 3000);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({
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

  // Test update function
  const testUpdate = async (userId: string) => {
    try {
      alert("Testing update for user: " + userId);
      
      const testData = new FormData();
      testData.append('fullName', 'Test Update');
      testData.append('email', 'test@test.com');
      testData.append('phone', '123456789');
      testData.append('age', '25');
      testData.append('bloodType', 'A+');
      testData.append('city', 'Test City');
      
      console.log("Testing API call...");
      
      const res = await fetch(`https://bloods-service-api.onrender.com/api/user/${userId}/update`, {
        method: "PUT",
        body: testData,
      });
      
      console.log("Test response status:", res.status);
      const data = await res.json();
      console.log("Test response data:", data);
      
      if (res.ok) {
        alert("✅ Test update successful! Check console for details.");
      } else {
        alert("❌ Test update failed: " + data.msg);
      }
    } catch (err) {
      console.error("Test update error:", err);
      alert("❌ Test update error: " + err.message);
    }
  };

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
                  <th className="px-6 py-4 text-left text-base font-bold text-red-700 uppercase tracking-wider rounded-tl-2xl">Name</th>
                  <th className="px-6 py-4 text-left text-base font-bold text-red-700 uppercase tracking-wider">City</th>
                  <th className="px-6 py-4 text-left text-base font-bold text-red-700 uppercase tracking-wider">Blood Type</th>
                  <th className="px-6 py-4 text-left text-base font-bold text-red-700 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-4 text-left text-base font-bold text-red-700 uppercase tracking-wider">Age</th>
                  <th className="px-6 py-4 text-left text-base font-bold text-red-700 uppercase tracking-wider">Weight</th>
                  <th className="px-6 py-4 text-left text-base font-bold text-red-700 uppercase tracking-wider">Role</th> {/* Role column */}
                  <th className="px-6 py-4 text-left text-base font-bold text-red-700 uppercase tracking-wider rounded-tr-2xl">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-red-300">
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-400">
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
                          {editingUser === user._id ? (
                            <input
                              type="text"
                              value={editForm.fullName}
                              onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                              className="border rounded px-2 py-1 text-sm w-full"
                              placeholder="Full Name"
                            />
                          ) : (
                            <div className="font-medium">{user.fullName}</div>
                          )}
                          {editingUser === user._id ? (
                            <input
                              type="email"
                              value={editForm.email}
                              onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                              className="border rounded px-2 py-1 text-sm w-full text-gray-600"
                              placeholder="Email"
                            />
                          ) : (
                            <div className="text-sm text-gray-500">{user.email}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingUser === user._id ? (
                          <input
                            type="text"
                            value={editForm.city}
                            onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                            className="border rounded px-2 py-1 text-sm w-full"
                          />
                        ) : (
                          user.city
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingUser === user._id ? (
                          <select
                            value={editForm.bloodType}
                            onChange={(e) => setEditForm({...editForm, bloodType: e.target.value})}
                            className="border rounded px-2 py-1 text-sm w-full"
                          >
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                          </select>
                        ) : (
                          user.bloodType
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingUser === user._id ? (
                          <input
                            type="text"
                            value={editForm.phone}
                            onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                            className="border rounded px-2 py-1 text-sm w-full"
                          />
                        ) : (
                          user.phone
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingUser === user._id ? (
                          <input
                            type="number"
                            min="1"
                            max="120"
                            value={editForm.age}
                            onChange={(e) => {
                              console.log("Age input changed:", e.target.value);
                              setEditForm({...editForm, age: e.target.value});
                            }}
                            className="border rounded px-2 py-1 text-sm w-full"
                            placeholder="Age"
                          />
                        ) : (
                          user.age
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingUser === user._id ? (
                          <input
                            type="number"
                            min="1"
                            max="300"
                            value={editForm.weight}
                            onChange={(e) => {
                              console.log("Weight input changed:", e.target.value);
                              setEditForm({...editForm, weight: e.target.value});
                            }}
                            className="border rounded px-2 py-1 text-sm w-full"
                            placeholder="Weight (kg)"
                          />
                        ) : (
                          (user as any).weight || "N/A"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingUser === user._id ? (
                          <select
                            className="border rounded px-2 py-1 text-sm w-full bg-white hover:bg-gray-50 transition-colors"
                            value={editForm.role || (user.isAdmin ? "admin" : user.isDonor ? "donor" : user.isRequester ? "requester" : "user")}
                            onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                          >
                            <option value="admin" className="text-purple-600 font-medium">Admin</option>
                            <option value="donor" className="text-red-600 font-medium">Donor</option>
                            <option value="requester" className="text-blue-600 font-medium">Requester</option>
                            <option value="user" className="text-gray-600">User</option>
                          </select>
                        ) : (
                        <select
                            className={`border rounded px-2 py-1 text-sm transition-colors ${isAdmin ? 'bg-white hover:bg-gray-50' : 'bg-gray-100 cursor-not-allowed'}`}
                          value={user.isAdmin ? "admin" : user.isDonor ? "donor" : user.isRequester ? "requester" : "user"}
                          onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                            disabled={!isAdmin}
                          >
                            <option value="admin" className="text-purple-600 font-medium">Admin</option>
                            <option value="donor" className="text-red-600 font-medium">Donor</option>
                            <option value="requester" className="text-blue-600 font-medium">Requester</option>
                            <option value="user" className="text-gray-600">User</option>
                        </select>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {editingUser === user._id ? (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-50 text-green-500 px-2 py-1 rounded-full border border-green-100 hover:bg-green-100 transition font-semibold flex items-center justify-center"
                                onClick={() => {
                                  console.log("=== UPDATE BUTTON CLICKED ===");
                                  console.log("Update button clicked for user:", user._id);
                                  console.log("Current edit form:", editForm);
                                  console.log("Is admin:", isAdmin);
                                  handleUpdateUser(user._id);
                                }}
                              >
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                className="bg-orange-50 text-orange-500 px-2 py-1 rounded-full border border-orange-100 hover:bg-orange-100 transition font-semibold flex items-center justify-center"
                                onClick={() => testUpdate(user._id)}
                                title="Test Update"
                              >
                                Test
                              </Button>
                              <Button
                                size="sm"
                                className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full border border-gray-200 hover:bg-gray-200 transition font-semibold flex items-center justify-center"
                                onClick={handleCancelEdit}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                className="bg-purple-100 text-purple-600 px-2 py-1 rounded-full border border-purple-200 hover:bg-purple-200 transition font-semibold flex items-center justify-center"
                                onClick={() => {
                                  const roleText = user.isAdmin ? 'Admin' : user.isDonor ? 'Donor' : user.isRequester ? 'Requester' : 'User';
                                  alert(`User Data:\n\n- Name: ${user.fullName}\n- Email: ${user.email}\n- Phone: ${user.phone}\n- Age: ${user.age || 'N/A'}\n- Blood Type: ${user.bloodType}\n- City: ${user.city}\n- Weight: ${user.weight || 'N/A'}\n- Gender: ${user.gender || 'N/A'}\n- Role: ${roleText}\n- Health Status: ${user.healthStatus || 'N/A'}\n- Availability: ${user.availability || 'N/A'}\n- Units: ${user.units || 'N/A'}\n- Suspended: ${user.isSuspended ? 'Yes' : 'No'}\n- Created: ${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}\n- Last Updated: ${user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}`);
                                }}
                                title="View User Data"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {isAdmin && (
                                <Button
                                  size="sm"
                                  className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full border border-blue-200 hover:bg-blue-200 transition font-semibold flex items-center justify-center"
                                  onClick={() => handleEditUser(user)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              )}
                            </>
                          )}
                          {isAdmin && (
                            user.isSuspended ? (
                          <Button
                            size="sm"
                                className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full border border-gray-300 hover:bg-gray-300 transition font-semibold flex items-center justify-center"
                            onClick={() => handleUnsuspend(user._id)}
                          >
                            <EyeOff className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                                className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full border border-blue-200 hover:bg-blue-200 transition font-semibold flex items-center justify-center"
                            onClick={() => handleSuspend(user._id)}
                          >
                            <Eye className="w-4 h-4 text-blue-600" />
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
        </div>
      </div>
    </div>
  );
} 