"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import API_URL from "../../lib/api";

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

      /*
       * JWT içerisindeki role eski kaldığı için
       * yeni role sahip token almak amacıyla
       * kullanıcıyı tekrar login sayfasına gönderiyoruz.
       */
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
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <h2 className="text-2xl font-semibold">
          Loading profile...
        </h2>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">

          <p className="text-red-600">
            {error}
          </p>

          <Link
            href="/"
            className="inline-block mt-5 bg-blue-600 text-white px-5 py-3 rounded-lg"
          >
            Back to Home
          </Link>

        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-100">

      {/* HEADER */}

      <header className="bg-white shadow-sm">

        <div className="max-w-6xl mx-auto px-6 py-5">

          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">

            <Link
              href="/"
              className="text-3xl font-bold text-blue-600"
            >
              MyStore
            </Link>

            <div className="flex gap-3">

              <Link
                href="/"
                className="bg-gray-800 text-white px-5 py-2 rounded-lg hover:bg-gray-900"
              >
                Home
              </Link>

              <Link
                href="/dashboard"
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
              >
                Dashboard
              </Link>

            </div>

          </div>

        </div>

      </header>

      {/* PROFILE */}

      <section className="max-w-4xl mx-auto px-6 py-10">

        <div className="bg-white rounded-2xl shadow-xl p-8">

          <div className="text-center mb-8">

            <div className="w-24 h-24 mx-auto rounded-full bg-blue-600 text-white flex items-center justify-center text-4xl font-bold">

              {user.name
                ? user.name.charAt(0).toUpperCase()
                : "U"}

            </div>

            <h1 className="text-3xl font-bold mt-4">
              My Profile
            </h1>

            <p className="text-gray-500 mt-2">
              Manage your account
            </p>

          </div>

          {/* USER INFORMATION */}

          <div className="space-y-4">

            <div className="border rounded-xl p-5 bg-gray-50">

              <p className="text-sm text-gray-500">
                Name
              </p>

              <p className="text-xl font-semibold mt-1">
                {user.name}
              </p>

            </div>

            <div className="border rounded-xl p-5 bg-gray-50">

              <p className="text-sm text-gray-500">
                Surname
              </p>

              <p className="text-xl font-semibold mt-1">
                {user.surname}
              </p>

            </div>

            <div className="border rounded-xl p-5 bg-gray-50">

              <p className="text-sm text-gray-500">
                Email
              </p>

              <p className="text-xl font-semibold mt-1">
                {user.email}
              </p>

            </div>

            {/* ROLE */}

            <div className="border rounded-xl p-5 bg-gray-50">

              <p className="text-sm text-gray-500">
                Account Type
              </p>

              <div className="mt-2">

                {user.role === "seller" && (
                  <span className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold">
                    Seller
                  </span>
                )}

                {user.role === "user" && (
                  <span className="inline-block bg-gray-200 text-gray-700 px-4 py-2 rounded-full font-semibold">
                    User
                  </span>
                )}

                {user.role === "admin" && (
                  <span className="inline-block bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-semibold">
                    Admin
                  </span>
                )}

              </div>

            </div>

          </div>

          {/* SELLER AREA */}

          {user.role === "user" && (

            <div className="mt-8 border border-blue-200 bg-blue-50 rounded-xl p-6">

              <h2 className="text-2xl font-bold">
                Become a Seller
              </h2>

              <p className="text-gray-600 mt-2">
                Become a seller and start adding your own
                products to the marketplace.
              </p>

              <button
                onClick={handleBecomeSeller}
                disabled={becomingSeller}
                className="mt-5 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
              >
                {becomingSeller
                  ? "Processing..."
                  : "Become a Seller"}
              </button>

            </div>

          )}

          {/* SELLER CONTROLS */}

          {user.role === "seller" && (

            <div className="mt-8 border border-green-200 bg-green-50 rounded-xl p-6">

              <h2 className="text-2xl font-bold text-green-800">
                Seller Center
              </h2>

              <p className="text-gray-600 mt-2">
                You are now a seller. You can add and manage
                your products.
              </p>

              <Link
  href="/seller/products"
                className="block text-center mt-5 w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
              >
                My Products
              </Link>

            </div>

          )}

          {/* ADMIN */}

          {user.role === "admin" && (

            <div className="mt-8 border border-purple-200 bg-purple-50 rounded-xl p-6">

              <h2 className="text-2xl font-bold text-purple-800">
                Administrator
              </h2>

              <p className="text-gray-600 mt-2">
                You have administrator permissions.
              </p>

              <Link
                href="/admin"
                className="block text-center mt-5 w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700"
              >
                Open Admin Panel
              </Link>

            </div>

          )}

        </div>

      </section>

    </main>
  );
}