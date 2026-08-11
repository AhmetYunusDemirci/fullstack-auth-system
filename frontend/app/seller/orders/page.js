"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API_URL from "../../../lib/api";
import Navbar from "../../../components/Navbar";

export default function SellerOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSellerOrders = async () => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/orders/seller-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to load orders.");
        return;
      }

      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
      setError("Server Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellerOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/status/seller`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        alert("Status updated successfully.");
        loadSellerOrders();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to update status.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8fc]"><Navbar /><div className="p-10 text-center text-gray-500">Loading orders...</div></main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc]">
      <Navbar />
      
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Order Management</h1>
          <p className="mt-2 text-gray-500">View and update the status of orders containing your products.</p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600">{error}</div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50/50 text-xs uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Order ID & Date</th>
                    <th className="px-6 py-4 font-semibold">Customer</th>
                    <th className="px-6 py-4 font-semibold">Products</th>
                    <th className="px-6 py-4 font-semibold">Shipping Address</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {orders.length === 0 ? (
                    <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">You don't have any orders yet.</td></tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order._id} className="transition hover:bg-gray-50/50">
                        <td className="px-6 py-4">
                          <p className="font-mono text-xs font-semibold text-gray-900">{order._id}</p>
                          <p className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {order.user?.name} {order.user?.surname}
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-600">
                          <ul className="space-y-1">
                            {order.orderItems?.map((item, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="font-bold text-gray-900">{item.quantity}x</span>
                                <span className="truncate max-w-[150px]" title={item.name}>{item.name}</span>
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500 max-w-xs truncate">  {order.shippingAddress?.city}, {order.shippingAddress?.country}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            order.status === "Delivered" ? "bg-emerald-100 text-emerald-700" : 
                            order.status === "Cancelled" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <select 
                            value={order.status} 
                            onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none cursor-pointer focus:border-blue-500"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}