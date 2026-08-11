"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import API_URL from "../../lib/api";
import Navbar from "../../components/Navbar";
import Button from "../../components/Button";

export default function MyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMyOrders = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to load your orders.");
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
    loadMyOrders();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8fc]">
        <Navbar />
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="skeleton mb-8 h-10 w-48 rounded" />
          <div className="space-y-6">
            {[1, 2].map(i => <div key={i} className="skeleton h-48 w-full rounded-3xl" />)}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc]">
      <Navbar />

      <section className="mx-auto max-w-5xl px-5 py-10 sm:px-6 lg:px-8">
        
        {/* BREADCRUMB & HEADER */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
            <Link href="/" className="hover:text-blue-600 transition">Home</Link>
            <span>/</span>
            <Link href="/profile" className="hover:text-blue-600 transition">Profile</Link>
            <span>/</span>
            <span className="text-slate-600 font-medium">My Orders</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl">
            Order History
          </h1>
          <p className="mt-2 text-gray-500">
            Check the status of recent orders, manage returns, and discover similar products.
          </p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600 font-medium">{error}</div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-gray-200 bg-white px-6 py-20 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-4xl">📦</div>
            <h2 className="mt-7 text-2xl font-bold tracking-tight text-gray-900">No orders yet</h2>
            <p className="mx-auto mt-3 max-w-md text-gray-500">When you place an order, it will appear here so you can track its status.</p>
            <Link href="/"><Button className="mt-8">Start Shopping</Button></Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <div key={order._id} className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
                
                {/* ORDER HEADER */}
                <div className="border-b border-gray-100 bg-gray-50/50 p-6 sm:flex sm:items-center sm:justify-between sm:p-8">
                  <div className="flex gap-10">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Order Placed</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Amount</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">${order.totalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between sm:mt-0 sm:block">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                      order.status === "Delivered" ? "bg-emerald-100 text-emerald-700" : 
                      order.status === "Cancelled" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* ORDER ITEMS */}
                <div className="divide-y divide-gray-100 p-6 sm:p-8">
                  {order.orderItems.map((item, index) => (
                    <div key={index} className="flex py-6 first:pt-0 last:pb-0">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-gray-100 border border-gray-100 sm:h-32 sm:w-32">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-medium text-gray-400">No Image</div>
                        )}
                      </div>
                      <div className="ml-4 flex flex-1 flex-col sm:ml-6">
                        <div>
                          <div className="flex justify-between">
                            <h4 className="text-base font-bold text-gray-900 line-clamp-2">{item.name}</h4>
                            <p className="ml-4 text-sm font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                        </div>
                        <div className="mt-4 flex flex-1 items-end justify-between">
                          <p className="flex items-center text-sm text-gray-500">
                            <span className="font-medium text-gray-900 mr-2">Qty:</span> {item.quantity}
                          </p>
                          <Link href={`/products/${item.product}`}>
                            <span className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline">View Product</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ORDER FOOTER / SHIPPING */}
                <div className="border-t border-gray-100 bg-gray-50/30 p-6 sm:p-8">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">📍</span>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Shipping Address</p>
                      <p className="mt-1 text-sm text-gray-500">
                        {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </section>
    </main>
  );
}