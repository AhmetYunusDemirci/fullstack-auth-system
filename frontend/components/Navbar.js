"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import API_URL from "../lib/api";

export default function Navbar() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/users/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        setUser(null);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        setUser(null);
        setLoading(false);
        return;
      }

      const data = await response.json();

      setUser(data.user);
    } catch (error) {
      console.error(error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");

    setUser(null);

    router.push("/");
  };

  return (
    <header className="bg-white shadow-sm">

      <div className="max-w-7xl mx-auto px-6 py-5">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          {/* LOGO */}

          <div>

            <Link href="/">
              <h1 className="text-3xl font-bold text-blue-600">
                MyStore
              </h1>
            </Link>

            <p className="text-gray-500 mt-1">
              Simple and secure online marketplace
            </p>

          </div>

          {/* NAVIGATION */}

          <nav className="flex flex-wrap gap-3 items-center">

            {/* HOME */}

            <Link
              href="/"
              className="bg-gray-800 text-white px-5 py-2 rounded-lg hover:bg-gray-900"
            >
              Home
            </Link>

            {/* PRODUCTS */}

            <Link
              href="/"
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
            >
              Products
            </Link>

            {/* SELLER PRODUCTS */}

            {user?.role === "seller" && (

              <Link
                href="/seller/products"
                className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
              >
                My Products
              </Link>

            )}

            {/* PROFILE */}

            {user && (

              <Link
                href="/profile"
                className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700"
              >
                Profile
              </Link>

            )}

            {/* CART */}

            {user && (

              <Link
                href="/cart"
                className="bg-orange-500 text-white px-5 py-2 rounded-lg hover:bg-orange-600"
              >
                My Cart
              </Link>

            )}

            {/* ORDERS - şimdilik sayfa yok */}

            {user && (

              <Link
                href="/orders"
                className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700"
              >
                My Orders
              </Link>

            )}

            {/* LOGIN */}

            {!user && !loading && (

              <Link
                href="/login"
                className="bg-gray-800 text-white px-5 py-2 rounded-lg hover:bg-gray-900"
              >
                Login
              </Link>

            )}

            {/* REGISTER */}

            {!user && !loading && (

              <Link
                href="/register"
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
              >
                Register
              </Link>

            )}

            {/* LOGOUT */}

            {user && (

              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700"
              >
                Logout
              </button>

            )}

          </nav>

        </div>

      </div>

    </header>
  );
}