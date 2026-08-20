"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import API_URL from "../../lib/api";
import Navbar from "../../components/Navbar";
import toast from "react-hot-toast"; 


export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [becomingSeller, setBecomingSeller] = useState(false);
  const [showSellerModal, setShowSellerModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", surname: "", email: "", password: "" });

  const loadProfile = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        setError(data.message || "Profile could not be loaded.");
        return;
      }

      setUser(data.user);
      setFormData({
        name: data.user.name || "",
        surname: data.user.surname || "",
        email: data.user.email || "",
        password: "",
      });
    } catch (error) {
      console.error(error);
      setError("Server Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    // --- FRONTEND GÜVENLİK VE LİMİT KONTROLLERİ ---
    if (formData.name.trim().length > 50 || formData.surname.trim().length > 50) {
      toast.error("First name and Last name cannot exceed 50 characters.");
      return;
    }
    
    if (formData.email.trim().length > 100) {
      toast.error("Email cannot exceed 100 characters.");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (formData.password && formData.password.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    
    if (formData.password && formData.password.length > 30) {
      toast.error("New password cannot exceed 30 characters.");
      return;
    }
    // ---------------------------------------------

    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    try {
      setUpdateLoading(true);
      const response = await fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Profile could not be updated.");
        return;
      }

      setUser(data.user);
      setIsEditing(false);
      setFormData(prev => ({ ...prev, password: "" }));
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Server Error");
    } finally {
      setUpdateLoading(false);
    }
  };

   
const handleBecomeSeller = async () => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    try {
      setBecomingSeller(true);
      setShowSellerModal(false); // İşlem başlarken modalı kapat

      const response = await fetch(`${API_URL}/users/become-seller`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        toast.error(data.message || "Could not become seller.");
        return;
      }

      setUser(data.user);
      toast.success("Congratulations! You are now a seller. 🛍️");

    } catch (error) {
      console.error(error);
      toast.error("Server Error");
    } finally {
      setBecomingSeller(false);
    }
  };

  



  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Navbar />

        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto" />

            <p className="mt-5 text-slate-500 font-medium">
              Loading your profile...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Navbar />

        <div className="min-h-[70vh] flex items-center justify-center px-6">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center">

            <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center text-2xl mx-auto">
              !
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mt-5">
              Something went wrong
            </h2>

            <p className="text-slate-500 mt-2">
              {error}
            </p>

            <Link
              href="/"
              className="inline-flex mt-6 bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 transition"
            >
              Back to Home
            </Link>

          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const initials =
    `${user.name?.charAt(0) || ""}${user.surname?.charAt(0) || ""}`
      .toUpperCase();

  const roleConfig = {
    user: {
      label: "Customer",
      badge: "bg-slate-100 text-slate-700 border-slate-200",
      icon: "👤",
    },

    seller: {
      label: "Seller",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: "🛍️",
    },

    admin: {
      label: "Administrator",
      badge: "bg-violet-50 text-violet-700 border-violet-200",
      icon: "🛡️",
    },
  };

  const currentRole =
    roleConfig[user.role] || roleConfig.user;

  return (
    <main className="min-h-screen bg-slate-50">

      <Navbar />

      {/* PAGE */}

      <section className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-10">

        {/* BREADCRUMB */}

        <div className="flex items-center gap-2 text-sm text-slate-400 mb-8">
          <Link
            href="/"
            className="hover:text-blue-600 transition"
          >
            Home
          </Link>

          <span>/</span>

          <span className="text-slate-600 font-medium">
            Profile
          </span>
        </div>

        {/* PROFILE HERO */}

        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-blue-800 rounded-[2rem] shadow-xl">

          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-20 w-72 h-72 rounded-full bg-indigo-400/20 blur-3xl" />

          <div className="relative p-7 sm:p-10">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">

              <div className="flex items-center gap-5">

                {/* AVATAR */}

                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white/10 border border-white/20 backdrop-blur flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-lg">
                  {initials || "U"}
                </div>

                <div>

                  <p className="text-blue-200 text-sm font-medium">
                    Welcome back
                  </p>

                  <h1 className="text-3xl sm:text-4xl font-bold text-white mt-1">
                    {user.name} {user.surname}
                  </h1>

                  <p className="text-blue-100/80 mt-2">
                    {user.email}
                  </p>

                </div>

              </div>

              {/* ROLE */}

              <div className="self-start md:self-center">

                <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 border border-white/20 text-white backdrop-blur font-semibold">
                  <span>
                    {currentRole.icon}
                  </span>

                  {currentRole.label}
                </span>

              </div>

            </div>

          </div>
        </div>

        {/* CONTENT GRID */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-7">

          {/* ACCOUNT INFORMATION */}

          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">

            <div className="p-6 sm:p-7 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Account Information
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Your personal account details
                </p>
              </div>
              
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-xl text-sm font-semibold transition">
                  Edit Profile
                </button>
              ) : (
                <button onClick={() => { setIsEditing(false); setFormData({ ...formData, password: "" }); }} className="bg-slate-100 text-slate-600 hover:bg-slate-200 px-4 py-2 rounded-xl text-sm font-semibold transition">
                  Cancel
                </button>
              )}
            </div>

            {!isEditing ? (
              <div className="p-6 sm:p-7 grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* NAME */}

              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    👤
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                      First Name
                    </p>

                    <p className="font-semibold text-slate-900 mt-1">
                      {user.name}
                    </p>
                  </div>

                </div>

              </div>

              {/* SURNAME */}

              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    👤
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                      Last Name
                    </p>

                    <p className="font-semibold text-slate-900 mt-1">
                      {user.surname}
                    </p>
                  </div>

                </div>

              </div>

              {/* EMAIL */}

              <div className="sm:col-span-2 rounded-2xl bg-slate-50 border border-slate-100 p-5">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    ✉
                  </div>

                  <div className="min-w-0">

                    <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                      Email Address
                    </p>

                    <p className="font-semibold text-slate-900 mt-1 truncate">
                      {user.email}
                    </p>

                  </div>

                </div>

              </div>

              {/* ACCOUNT TYPE */}

              <div className="sm:col-span-2 rounded-2xl bg-slate-50 border border-slate-100 p-5">

                <div className="flex items-center justify-between gap-4">

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                      ◈
                    </div>

                    <div>

                      <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                        Account Type
                      </p>

                      <p className="font-semibold text-slate-900 mt-1">
                        {currentRole.label}
                      </p>

                    </div>

                  </div>

                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border ${currentRole.badge}`}
                  >
                    {user.role}
                  </span>

                </div>

              </div>

            </div>
          ) : (
              <form onSubmit={handleUpdateProfile} className="p-6 sm:p-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* FORM BİLGİLERİ */}
                <div>
                  <label className="text-xs uppercase tracking-wide text-slate-500 font-semibold">First Name</label>
                  <input type="text" required maxLength={35} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full mt-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:bg-white transition text-slate-900" />
                </div>
                
                <div>
                  <label className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Last Name</label>
                  <input type="text" required maxLength={35} value={formData.surname} onChange={(e) => setFormData({...formData, surname: e.target.value})} className="w-full mt-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:bg-white transition text-slate-900" />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Email Address</label>
                  <input type="email" required maxLength={70} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full mt-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:bg-white transition text-slate-900" />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs uppercase tracking-wide text-slate-500 font-semibold">New Password <span className="text-slate-400 normal-case font-normal">(Optional)</span></label>
                  <input type="password" minLength={6} maxLength={30} placeholder="Leave blank to keep current password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full mt-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:bg-white transition text-slate-900 placeholder:text-slate-400" />
                </div>

                <div className="sm:col-span-2 flex justify-end mt-2">
                  <button type="submit" disabled={updateLoading} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-70">
                    {updateLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
                
              </form>
            )}

          </div>

          {/* QUICK ACTIONS */}

          <div className="space-y-6">

            {/* SHOPPING */}

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">

              <h2 className="text-lg font-bold text-slate-900">
                Quick Actions
              </h2>

              <p className="text-sm text-slate-500 mt-1 mb-5">
                Quickly access your account areas.
              </p>

              <div className="space-y-3">

                <Link
                  href="/"
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition group"
                >
                  <div className="flex items-center gap-3">

                    <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                      🛒
                    </span>

                    <span className="font-semibold text-slate-800">
                      Continue Shopping
                    </span>

                  </div>

                  <span className="text-slate-400 group-hover:text-blue-600 transition">
                    →
                  </span>

                </Link>

                <Link
                  href="/cart"
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-orange-200 hover:bg-orange-50 transition group"
                >
                  <div className="flex items-center gap-3">

                    <span className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                      🛍️
                    </span>

                    <span className="font-semibold text-slate-800">
                      My Cart
                    </span>

                  </div>

                  <span className="text-slate-400 group-hover:text-orange-600 transition">
                    →
                  </span>

                </Link>

              </div>

            </div>

            {/* SELLER */}

            {user.role === "user" && (

              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-lg">

                <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-white/10" />

                <div className="relative">

                  <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-2xl">
                    🛍️
                  </div>

                  <h2 className="text-xl font-bold mt-5">
                    Start Selling
                  </h2>

                  <p className="text-blue-100 text-sm mt-2 leading-relaxed">
                    Turn your products into a business and
                    start selling on MyStore.
                  </p>

                  <button
                    onClick={() => setShowSellerModal(true)}
                    disabled={becomingSeller}
                    className="w-full mt-5 bg-white text-blue-700 py-3 rounded-xl font-bold hover:bg-blue-50 transition disabled:opacity-60"
                  >
                    {becomingSeller
                      ? "Processing..."
                      : "Become a Seller"}
                  </button>

                </div>

              </div>

            )}

            {/* SELLER CENTER */}

            {user.role === "seller" && (

              <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-lg">

                <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-2xl">
                  📦
                </div>

                <h2 className="text-xl font-bold mt-5">
                  Seller Center
                </h2>

                <p className="text-emerald-50 text-sm mt-2 leading-relaxed">
                  Manage your products and keep your store
                  up to date.
                </p>

                <Link
                  href="/seller/products"
                  className="block text-center mt-5 bg-white text-emerald-700 py-3 rounded-xl font-bold hover:bg-emerald-50 transition"
                >
                  Manage Products
                </Link>

              </div>

            )}

            {/* ADMIN */}

            {user.role === "admin" && (

              <div className="rounded-3xl bg-gradient-to-br from-violet-600 to-purple-700 p-6 text-white shadow-lg">

                <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-2xl">
                  🛡️
                </div>

                <h2 className="text-xl font-bold mt-5">
                  Administrator
                </h2>

                <p className="text-purple-100 text-sm mt-2 leading-relaxed">
                  Manage users and monitor the platform from
                  the administration panel.
                </p>

                <Link
                  href="/admin"
                  className="block text-center mt-5 bg-white text-purple-700 py-3 rounded-xl font-bold hover:bg-purple-50 transition"
                >
                  Open Admin Panel
                </Link>

              </div>

            )}

          </div>

        </div>

       {/* FOOTER NOTE */}
        <div className="text-center mt-10 pb-4">
          <p className="text-sm text-slate-400">
            Your account is protected by MyStore security.
          </p>
        </div>

      </section>

      {/* BECOME SELLER CONFIRMATION MODAL */}
      {showSellerModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl text-center">
            
            <div className="w-20 h-20 mx-auto bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-4xl mb-5">
              🛍️
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900">Become a Seller?</h2>
            <p className="text-slate-500 mt-3 leading-relaxed">
              Are you sure you want to upgrade your account to a seller profile? This will allow you to add products and manage a store.
            </p>

            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => setShowSellerModal(false)}
                className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleBecomeSeller}
                className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition"
              >
                Yes, Upgrade!
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}