import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
// @ts-ignore
import { useNavigate } from "react-router-dom";



export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("https://bloods-service-api.onrender.com/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password })
      });
      const data = await res.json();
      if (!res.ok || !data.user) {
        setError(data.msg || "Login failed. Please check your credentials.");
        setLoading(false);
        return;
      }
      // Only allow admin user to login
      if (!data.user.isAdmin) {
        setError("Only admin can login.");
        setLoading(false);
        return;
      }
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      setLoading(false);
      navigate("/dashboard");
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };



  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-8 rounded-lg shadow-lg border bg-white text-center">
          <img src={user.profilePic} alt="Profile" className="w-20 h-20 rounded-full mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">{user.fullName}</h2>
          <p className="mb-1">{user.email}</p>
          <p className="mb-1">{user.city}</p>
          <p className="mb-1">Blood Type: {user.bloodType}</p>
          <Button className="mt-4 w-full" onClick={() => setUser(null)}>Logout</Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/f13.jpg')" }}
    >
      <div className="w-full max-w-md p-8 rounded-2xl shadow-lg border bg-white">
        {/* Logo Placeholder */}
        <div className="flex flex-col items-center mb-8">
          <span className="flex items-center gap-2 text-3xl font-extrabold text-red-600 select-none">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 4C16 4 7 15.5 7 21C7 25.4183 10.5817 29 15 29C19.4183 29 23 25.4183 23 21C23 15.5 16 4 16 4Z" fill="#ef4444"/>
            </svg>
            BlOOD LIFE
          </span>
        </div>
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            placeholder="Phone"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
          />
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
        
      </div>
      
    </div>
  );
} 