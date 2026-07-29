"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "../../services/authService";

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await registerUser(formData);

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Bir hata oluştu.");
        setLoading(false);
        return;
      }

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

        <h1 className="text-3xl font-bold mb-6 text-center">
          Register
        </h1>

        {error && (
          <p className="bg-red-100 text-red-600 p-3 rounded-lg mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          />

          <input
            type="text"
            name="surname"
            placeholder="Surname"
            value={formData.surname}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
          >
            {loading ? "Registering..." : "Register"}
          </button>

        </form>

        <div className="text-center mt-6">

          <p className="text-gray-600">
            Already have an account?
          </p>

          <a
            href="/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Login
          </a>

        </div>

      </div>
    </main>
  );
}