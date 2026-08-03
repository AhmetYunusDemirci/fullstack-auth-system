"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import API_URL from "../lib/api";

export default function Navbar() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const loadUser = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
    setMobileOpen(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/90 backdrop-blur-xl">

      <div className="mx-auto max-w-7xl px-6">

        <div className="flex h-20 items-center justify-between">

          {/* LOGO */}

          <Link
            href="/"
            className="group flex items-center gap-3"
          >

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white shadow-lg shadow-blue-600/20 transition group-hover:scale-105">
              M
            </div>

            <div className="hidden sm:block">

              <div className="text-xl font-extrabold tracking-tight text-gray-900">
                MyStore
              </div>

              <div className="text-[11px] font-medium text-gray-400">
                ONLINE MARKETPLACE
              </div>

            </div>

          </Link>

          {/* DESKTOP NAV */}

          <nav className="hidden items-center gap-1 lg:flex">

            <Link
              href="/"
              className="nav-link"
            >
              Home
            </Link>

            {user?.role === "seller" && (

              <Link
                href="/seller/products"
                className="nav-link"
              >
                My Products
              </Link>

            )}

            {user && (

              <Link
                href="/profile"
                className="nav-link"
              >
                Profile
              </Link>

            )}

            {user && (

              <Link
                href="/cart"
                className="nav-link flex items-center gap-2"
              >

                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="9" cy="20" r="1" />
                  <circle cx="19" cy="20" r="1" />
                  <path d="M3 4h2l2.4 11.4a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 8H6" />
                </svg>

                Cart

              </Link>

            )}

            {user?.role === "admin" && (

              <Link
                href="/admin"
                className="ml-2 flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
              >

                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z" />
                  <path d="M9 12h6" />
                  <path d="M12 9v6" />
                </svg>

                Admin Panel

              </Link>

            )}

          </nav>

          {/* RIGHT SIDE */}

          <div className="hidden items-center gap-3 lg:flex">

            {!user && !loading && (

              <>
                <Link
                  href="/login"
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                >
                  Create Account
                </Link>
              </>

            )}

            {user && (

              <>

                <div className="hidden xl:block text-right">

                  <p className="text-xs text-gray-400">
                    Signed in as
                  </p>

                  <p className="max-w-[130px] truncate text-sm font-semibold text-gray-800">
                    {user.name}
                  </p>

                </div>

                <button
                  onClick={handleLogout}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  Logout
                </button>

              </>

            )}

          </div>

          {/* MOBILE BUTTON */}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-700 lg:hidden"
          >

            {mobileOpen ? (

              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 6l12 12" />
                <path d="M18 6 6 18" />
              </svg>

            ) : (

              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
              </svg>

            )}

          </button>

        </div>

        {/* MOBILE MENU */}

        {mobileOpen && (

          <div className="border-t border-gray-100 py-4 lg:hidden">

            <nav className="flex flex-col gap-1">

              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
              >
                Home
              </Link>

              {user?.role === "seller" && (

                <Link
                  href="/seller/products"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
                >
                  My Products
                </Link>

              )}

              {user && (

                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
                >
                  Profile
                </Link>

              )}

              {user && (

                <Link
                  href="/cart"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
                >
                  My Cart
                </Link>

              )}

              {user?.role === "admin" && (

                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="mt-1 rounded-xl bg-gray-900 px-4 py-3 font-semibold text-white"
                >
                  Admin Panel
                </Link>

              )}

              {!user && !loading && (

                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="mt-2 rounded-xl px-4 py-3 font-semibold text-gray-700 hover:bg-gray-100"
                  >
                    Login
                  </Link>

                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl bg-blue-600 px-4 py-3 text-center font-semibold text-white"
                  >
                    Create Account
                  </Link>
                </>

              )}

              {user && (

                <button
                  onClick={handleLogout}
                  className="mt-2 rounded-xl bg-red-50 px-4 py-3 text-left font-semibold text-red-600"
                >
                  Logout
                </button>

              )}

            </nav>

          </div>

        )}

      </div>

    </header>
  );
}