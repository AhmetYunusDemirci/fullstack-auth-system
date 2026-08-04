"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser } from "../../services/authService";
import Input from "../../components/Input";
import Button from "../../components/Button";

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("expired")) {
      setError("Your session has expired. Please login again.");
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await loginUser(formData);
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed. Please check your credentials.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);

      setSuccess("Login successful. Redirecting...");

      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (error) {
      setError("Server Error. Please try again later.");
    }

    setLoading(false);
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center p-4 overflow-hidden">
      
      {/* BACKGROUND IMAGE & BLUR EFFECT */}
      {/* Kendi görselini kullanmak istersen url() içindeki linki değiştirebilirsin */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1674027392887-751d6396b710?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}
      />
      
      {/* OVERLAY (Görseli hafif karartıp blurlayan katman) */}
      <div className="absolute inset-0 z-0 bg-blue-900/20 backdrop-blur-[8px]" />

      {/* LOGIN CARD (Glassmorphism Effect) */}
      <div className="relative z-10 w-full max-w-[440px] rounded-3xl border border-white/40 bg-white/95 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
        
        {/* BRANDING */}
        <div className="mb-8 text-center">
          <Link href="/">
            <h1 className="text-4xl font-bold tracking-tight text-blue-600 transition hover:text-blue-700">
              MyStore
            </h1>
          </Link>
          <p className="mt-3 text-sm font-medium text-gray-500">
            Welcome back! Please enter your details.
          </p>
        </div>

        {/* ALERTS */}
        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/90 p-4">
            <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-200 text-xs font-bold text-emerald-700">
              ✓
            </div>
            <p className="text-sm font-medium text-emerald-800">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/90 p-4">
            <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-200 text-xs font-bold text-red-700">
              !
            </div>
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900">
              Email Address
            </label>
            <Input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className="bg-white/80" /* Inputları da hafif şeffaf hale getirildi */
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-900">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-blue-600 transition hover:text-blue-700 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="bg-white/80"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={loading} className="w-full shadow-lg shadow-blue-600/20">
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </div>
          
        </form>

        {/* REGISTER LINK */}
        <div className="mt-8 border-t border-gray-100 pt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-bold text-blue-600 transition hover:text-blue-700 hover:underline"
          >
            Create one now
          </Link>
        </div>

      </div>
    </main>
  );
}