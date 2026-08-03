"use client";

import { useState } from "react";
import Link from "next/link";
import API_URL from "../../lib/api";
import Input from "../../components/Input";
import Button from "../../components/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    if (!email) {
      setError("Please enter your email address.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to send reset link.");
        setLoading(false);
        return;
      }

      setMessage(data.message || "Reset link sent to your email.");
    } catch (error) {
      setError("Server Error. Please try again later.");
    }

    setLoading(false);
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center p-4 overflow-hidden">
      
      {/* BACKGROUND IMAGE & BLUR EFFECT (Auth serisiyle aynı) */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://plus.unsplash.com/premium_photo-1677852356131-cb6b3eeb1115?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}
      />
      
      {/* OVERLAY */}
      <div className="absolute inset-0 z-0 bg-blue-900/20 backdrop-blur-[8px]" />

      {/* CARD (Glassmorphism Effect) */}
      <div className="relative z-10 w-full max-w-[440px] rounded-3xl border border-white/40 bg-white/95 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
        
        {/* BRANDING & HEADER */}
        <div className="mb-8 text-center">
          <Link href="/">
            <h1 className="text-4xl font-bold tracking-tight text-blue-600 transition hover:text-blue-700">
              MyStore
            </h1>
          </Link>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-sm font-medium text-gray-500">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {/* SUCCESS ALERT */}
        {message && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/90 p-4">
            <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-200 text-xs font-bold text-emerald-700">
              ✓
            </div>
            <p className="text-sm font-medium text-emerald-800">{message}</p>
          </div>
        )}

        {/* ERROR ALERT */}
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
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/80"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={loading} className="w-full shadow-lg shadow-blue-600/20">
              {loading ? "Sending Link..." : "Send Reset Link"}
            </Button>
          </div>
          
        </form>

        {/* BACK TO LOGIN LINK */}
        <div className="mt-8 border-t border-gray-100 pt-6 text-center text-sm text-gray-600">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-bold text-blue-600 transition hover:text-blue-700 hover:underline"
          >
            Back to sign in
          </Link>
        </div>

      </div>
    </main>
  );
}