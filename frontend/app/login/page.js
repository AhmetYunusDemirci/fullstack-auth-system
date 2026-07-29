"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "../../services/authService";

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
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
      const response = await loginUser(formData);

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed.");
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
          Login
        </h1>

        {error && (
          <p className="bg-red-100 text-red-600 p-3 rounded-lg mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

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
            className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          <div className="text-center mt-5">

<p>

Don't have an account?

</p>

<a
href="/register"
className="text-blue-600"
>

Register

</a>

</div>

        </form>

        <div className="text-center mt-6">

          <a
            href="/forgot-password"
            className="text-red-600 hover:underline"
          >
            Forgot Password?
          </a>

        </div>

        <div className="text-center mt-5">

          <p className="text-gray-600">
            Don't have an account?
          </p>

          <a
            href="/register"
            className="text-blue-600 font-semibold hover:underline"
          >
            Register
          </a>

        </div>

      </div>

    </main>
  );
}