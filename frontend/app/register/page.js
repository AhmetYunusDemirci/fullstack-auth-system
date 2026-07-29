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

      setSuccess("Registration successful.");

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

        <h1 className="text-3xl font-bold text-center mb-2">Register</h1>
        <p className="form-note text-center mb-6">Create your account</p>

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

          <Input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} />

          <Input type="text" name="surname" placeholder="Surname" value={formData.surname} onChange={handleChange} />

          <Input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />

          <Input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} />

          <Button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </Button>

        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600">Already have an account?</p>
          <Link href="/login" className="text-blue-600 font-semibold hover:underline">
            Login
          </Link>
        </div>

      </div>
    </main>
  );
}