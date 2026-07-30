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
        setError(data.message || "Login failed.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);

      setSuccess("Login successful.");

      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error) {
      setError("Server Error");
    }

    setLoading(false);
  };

  return (
    <main className="container-center bg-gray-100">
      <div className="card w-[420px]">

        <h1 className="text-3xl font-bold text-center mb-2">Login</h1>
        <p className="form-note text-center mb-6">Access your account securely</p>

        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />

          <Input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />

          <Button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>

        </form>

        <div className="text-center mt-6">
          <Link href="/forgot-password" className="text-red-600 hover:underline">
            Forgot Password?
          </Link>
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-600">Don't have an account?</p>
          <Link href="/register" className="text-blue-600 font-semibold hover:underline">
            Register
          </Link>
        </div>

      </div>
    </main>
  );
}