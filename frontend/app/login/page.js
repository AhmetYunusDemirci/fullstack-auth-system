"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import API_URL from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();

  // State Tanımlamaları
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Input Değişikliklerini Takip Eden Fonksiyon
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Form Gönderme Fonksiyonu
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Giriş yapılamadı.");
        setLoading(false);
        return;
      }

      // Token'ı yerel depolamaya kaydet ve yönlendir
      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch (error) {
      setError("Server Error");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-[420px]">
        <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>

        {/* Hata Mesajı Alanı */}
        {error && (
          <p className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm font-medium">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          />

          {/* Password Input */}
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          />

          {/* Submit Butonu */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}
