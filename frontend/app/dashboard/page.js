"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API_URL from "../../lib/api";

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_URL}/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      const data = await response.json();

      setUser(data.user);
    };

    getUser();
  }, [router]);

  if (!user) {
    return <h2 className="text-center mt-10">Loading...</h2>;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-8 rounded-xl shadow-lg w-[450px] text-center">

        <h1 className="text-3xl font-bold mb-4">
          Welcome {user.name}
        </h1>

        <p>{user.email}</p>
        <button
  onClick={() => {
    localStorage.removeItem("token");
    router.push("/login");
  }}
  className="mt-6 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
>
  Logout
</button>

      </div>

    </main>
  );
}