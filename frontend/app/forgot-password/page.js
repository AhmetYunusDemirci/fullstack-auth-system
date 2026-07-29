"use client";

import { useState } from "react";
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

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        setLoading(false);
        return;
      }

      setMessage(data.message);
    } catch (error) {
      setError("Server Error");
    }

    setLoading(false);
  };

  return (
    <main className="container-center bg-gray-100">
      <div className="card w-[420px]">
        <h1 className="text-3xl font-bold mb-2 text-center">Forgot Password</h1>
        <p className="form-note text-center mb-6">Enter your email to receive a reset link</p>

        {message && (
          <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

          <Button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      </div>
    </main>
  );
}