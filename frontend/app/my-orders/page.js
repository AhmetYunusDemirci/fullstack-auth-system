"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import API_URL from "../../lib/api";
import Navbar from "../../components/Navbar";
import Button from "../../components/Button";

export default function MyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // MODAL İÇİN GEREKLİ YENİ STATE'LER
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [returnReason, setReturnReason] = useState("");

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

  // İade butonuna tıklanınca modal'ı açacak fonksiyon
  const openReturnModal = (orderId) => {
    setSelectedOrderId(orderId);
    setReturnReason(""); // Önceki yazılanları temizle
    setIsModalOpen(true);
  };

  // Modal içindeki Onayla butonuna basınca çalışacak API fonksiyonu
  const submitReturnRequest = async () => {
    if (!returnReason.trim()) {
      toast.error("Lütfen bir iade nedeni belirtin.");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/orders/${selectedOrderId}/return`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ reason: returnReason })
      });

      if (res.ok) {
        toast.success("İade talebiniz başarıyla alındı!");
        setIsModalOpen(false); // Başarılı olunca modalı kapat
        loadMyOrders(); // Sayfadaki siparişleri güncelle
      } else {
        const data = await res.json();
        toast.error(data.message || "İade talebi oluşturulamadı.");
      }
    } catch (error) {
      toast.error("Sunucu bağlantı hatası.");
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
            {[1, 2].map((i) => (
              <div key={i} className="skeleton h-48 w-full rounded-3xl" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc] relative">
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

                {/* ORDER FOOTER / SHIPPING VE İADE BUTONU */}
                <div className="border-t border-gray-100 bg-gray-50/30 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between">
                  
                  {/* Kargo Adresi */}
                  <div className="flex items-start gap-3 mb-4 sm:mb-0">
                    <span className="text-xl">📍</span>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Shipping Address</p>
                      <p className="mt-1 text-sm text-gray-500">
                        {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                      </p>
                    </div>
                  </div>

                  {/* İADE DURUMU VE MODAL TETİKLEYİCİ BUTON */}
                  <div className="text-right">
                    {order.status === "Delivered" && (!order.returnRequest || order.returnRequest.status === 'None') && (
                      <button 
                        onClick={() => openReturnModal(order._id)} // Yeni fonksiyona bağlandı
                        className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 shadow-sm"
                      >
                        İade Talep Et
                      </button>
                    )}

                    {order.returnRequest && order.returnRequest.status !== 'None' && (
                      <div className="inline-flex items-center gap-2 rounded-lg bg-orange-50 px-4 py-2 text-sm font-semibold border border-orange-200 text-orange-700 shadow-sm">
                        <span className="relative flex h-3 w-3">
                          {order.returnRequest.status === 'Pending' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>}
                          <span className={`relative inline-flex rounded-full h-3 w-3 ${order.returnRequest.status === 'Approved' ? 'bg-emerald-500' : 'bg-orange-500'}`}></span>
                        </span>
                        Return Status: {order.returnRequest.status}
                      </div>
                    )}
                  </div>

                </div>

              </div>
            ))}
          </div>
        )}

      </section>

      {/* ========================================= */}
      {/* ŞIK İADE MODALI (Bulanık Arka Planlı Popup) */}
      {/* ========================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm transition-all">
          
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
            
            {/* Modal Başlık */}
            <div className="bg-red-50 px-6 py-5 border-b border-red-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-red-500 shadow-sm">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                </div>
                <h3 className="text-xl font-extrabold text-red-900">İade Talebi Oluştur</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-red-400 hover:text-red-700 transition"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {/* Modal Gövde */}
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-4">
                Siparişinizi neden iade etmek istediğinizi kısaca açıklar mısınız? Bu bilgi, size daha iyi hizmet verebilmemiz için mağazaya iletilecektir.
              </p>
              
              <textarea
                rows="4"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 outline-none transition focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-400/10 resize-none"
                placeholder="Örn: Ürün beklediğimden küçük geldi, Rengi fotoğraftaki gibi değil..."
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
              ></textarea>
            </div>

            {/* Modal Butonlar */}
            <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 transition"
              >
                Vazgeç
              </button>
              <button
                onClick={submitReturnRequest}
                className="rounded-xl bg-red-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-red-600/20 transition hover:bg-red-700"
              >
                Talebi Gönder
              </button>
            </div>

          </div>
        </div>
      )}
      
    </main>
  );
}