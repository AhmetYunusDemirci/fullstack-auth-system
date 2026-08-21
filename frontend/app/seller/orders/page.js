"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import API_URL from "../../../lib/api";
import Navbar from "../../../components/Navbar";

export default function SellerOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
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
      setStats(data.stats);
      setChartData(data.chartData || []);
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
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success("Order status updated successfully.");
        // SAYFA YENİLENMESİNİ ENGELLE: Sadece state içindeki ilgili siparişi güncelle
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
        // İstatistikleri güncel tutmak için arkaplanda sessizce verileri tekrar çek
        fetch(`${API_URL}/orders/seller-orders`, { headers: { Authorization: `Bearer ${token}` }})
          .then(r => r.json())
          .then(d => { setStats(d.stats); setChartData(d.chartData); });
          
      } else {
        toast.error(data.message || "Failed to update status.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server connection error.");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8fc]">
        <Navbar />
        <div className="p-10 text-center text-gray-500 animate-pulse">Loading dashboard...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc]">
      <Navbar />
      
      <div className="mx-auto max-w-7xl px-6 py-10">
        
        {/* HEADER */}
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-700">
            Seller Center
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Order Management</h1>
          <p className="mt-2 text-gray-500">Track your sales, manage pending shipments, and view your revenue.</p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600">{error}</div>
        ) : (
          <>
            {/* DASHBOARD STATS */}
            {stats && (
              <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
                  <p className="text-sm font-bold uppercase text-emerald-600">Net Revenue</p>
                  <p className="mt-2 text-3xl font-extrabold text-emerald-900">${stats.totalRevenue.toFixed(2)}</p>
                  <p className="mt-1 text-xs text-emerald-700">From delivered orders</p>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
                  <p className="text-sm font-bold uppercase text-amber-600">Action Required</p>
                  <p className="mt-2 text-3xl font-extrabold text-amber-900">{stats.pendingOrdersCount}</p>
                  <p className="mt-1 text-xs text-amber-700">Pending/Processing</p>
                </div>
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
                  <p className="text-sm font-bold uppercase text-blue-600">Successful Sales</p>
                  <p className="mt-2 text-3xl font-extrabold text-blue-900">{stats.deliveredOrdersCount}</p>
                  <p className="mt-1 text-xs text-blue-700">Delivered orders</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-bold uppercase text-gray-500">Total Orders</p>
                  <p className="mt-2 text-3xl font-extrabold text-gray-900">{stats.totalOrders}</p>
                  <p className="mt-1 text-xs text-gray-400">All time</p>
                </div>
              </div>
            )}

            {/* REVENUE CHART */}
            <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Trend</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `$${value}`} />
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value) => [`$${value}`, "Revenue"]} />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ORDERS TABLE */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50/50 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Order Details</th>
                      <th className="px-6 py-4 font-semibold">Customer</th>
                      <th className="px-6 py-4 font-semibold">Purchased Items</th>
                      <th className="px-6 py-4 font-semibold">Shipping Address</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {orders.length === 0 ? (
                      <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">You don't have any orders yet.</td></tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order._id} className="transition hover:bg-gray-50/50">
                          <td className="px-6 py-4">
                            <p className="font-mono text-xs font-bold text-gray-900">#{order._id.slice(-6).toUpperCase()}</p>
                            <p className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {order.user?.name} {order.user?.surname}
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-600">
                            <ul className="space-y-1">
                              {order.orderItems?.map((item, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="font-bold text-blue-600">{item.quantity}x</span>
                                  <span className="truncate max-w-[150px] font-medium" title={item.name}>{item.name}</span>
                                </li>
                              ))}
                            </ul>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-500 max-w-[150px] truncate">
                            {order.shippingAddress?.city}, {order.shippingAddress?.country}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              order.status === "Delivered" ? "bg-emerald-100 text-emerald-700" : 
                              order.status === "Cancelled" ? "bg-red-100 text-red-700" : 
                              order.status === "Pending" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <select 
                              value={order.status} 
                              onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-semibold outline-none cursor-pointer focus:border-blue-500 transition hover:bg-gray-100"
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
          </>
        )}
      </div>
    </main>
  );
}