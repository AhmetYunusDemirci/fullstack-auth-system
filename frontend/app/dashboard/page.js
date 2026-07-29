"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import API_URL from "../../lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
  localStorage.removeItem("token");

  router.push("/login?expired=true");

  return;
}

        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.log(error);
      }
    };

    getUser();
  }, [router]);

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <h2 className="text-2xl font-semibold">Loading...</h2>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white w-[450px] rounded-2xl shadow-xl p-8">

        <div className="flex justify-center mb-5">
          <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-4xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center">
          Welcome
        </h1>

        <h2 className="text-xl text-center text-blue-600 mt-2">
          {user.name} {user.surname}
        </h2>

        <div className="mt-8 border rounded-xl p-5 bg-gray-50">

          <p className="mb-4">
            <span className="font-bold">Name:</span> {user.name}
          </p>

          <p className="mb-4">
            <span className="font-bold">Surname:</span> {user.surname}
          </p>

          <p>
            <span className="font-bold">Email:</span> {user.email}
          </p>

        </div>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            router.push("/login");
          }}
          className="mt-8 w-full bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition"
        >
          Logout
        </button>

      </div>
    </main>
  );
}