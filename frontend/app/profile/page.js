"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import API_URL from "../../lib/api";
import Navbar from "../../components/Navbar";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [becomingSeller, setBecomingSeller] = useState(false);

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

  const handleBecomeSeller = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const confirmed = window.confirm(
      "Do you want to become a seller?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setBecomingSeller(true);

      const response = await fetch(
        `${API_URL}/users/become-seller`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Could not become seller.");
        return;
      }

      alert("You are now a seller.");

      localStorage.removeItem("token");

      router.push("/login");
    } catch (error) {
      console.error(error);
      alert("Server Error");
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

            <div className="p-6 sm:p-7 border-b border-slate-100">

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Account Information
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Your personal account details
                </p>
              </div>

            </div>

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
                    onClick={handleBecomeSeller}
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

    </main>
  );
}