"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "../../services/authService";
import Input from "../../components/Input";
import Button from "../../components/Button";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

    if (
      !formData.name ||
      !formData.surname ||
      !formData.email ||
      !formData.password
    ) {
      setError("Please fill in all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await registerUser(formData);
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);

      setSuccess("Registration successful. Redirecting...");

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
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://plus.unsplash.com/premium_photo-1684785617105-2ebfbd278671?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}
      />
      
      {/* OVERLAY */}
      <div className="absolute inset-0 z-0 bg-blue-900/20 backdrop-blur-[8px]" />

      {/* REGISTER CARD (Glassmorphism Effect) */}
      <div className="relative z-10 w-full max-w-[480px] rounded-3xl border border-white/40 bg-white/95 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
        
        {/* BRANDING */}
        <div className="mb-8 text-center">
          <Link href="/">
            <h1 className="text-4xl font-bold tracking-tight text-blue-600 transition hover:text-blue-700">
              MyStore
            </h1>
          </Link>
          <p className="mt-3 text-sm font-medium text-gray-500">
            Create an account to start shopping.
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
          
          {/* NAME & SURNAME (Grid Layout) */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                First Name
              </label>
              <Input 
                type="text" 
                name="name" 
                placeholder="John" 
                value={formData.name} 
                onChange={handleChange} 
                className="bg-white/80" 
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Last Name
              </label>
              <Input 
                type="text" 
                name="surname" 
                placeholder="Doe" 
                value={formData.surname} 
                onChange={handleChange} 
                className="bg-white/80" 
              />
            </div>
          </div>

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
              className="bg-white/80"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900">
              Password
            </label>
            <Input 
              type="password" 
              name="password" 
              placeholder="Min. 6 characters" 
              value={formData.password} 
              onChange={handleChange} 
              className="bg-white/80"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={loading} className="w-full shadow-lg shadow-blue-600/20">
              {loading ? "Creating Account..." : "Register"}
            </Button>
          </div>
          
        </form>

        {/* LOGIN LINK */}
        <div className="mt-8 border-t border-gray-100 pt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-blue-600 transition hover:text-blue-700 hover:underline"
          >
            Sign in
          </Link>
        </div>

      </div>
    </main>
  );
}