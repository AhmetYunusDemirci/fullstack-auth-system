"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API_URL from "../../lib/api";
import Navbar from "../../components/Navbar";
import Input from "../../components/Input";
import Button from "../../components/Button";
import toast from "react-hot-toast"; 
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export default function AdminPage() {
  const router = useRouter();

  // TABS STATE
  const [activeTab, setActiveTab] = useState("dashboard");

  const [stats, setStats] = useState(null);
  
  // DATA STATES
  const [users, setUsers] = useState([]);
  const [adminProducts, setAdminProducts] = useState([]);
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminMessages, setAdminMessages] = useState([]);

  // PAGINATION & SEARCH (Users için)
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const limit = 5;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // MODAL STATES
  const [editingUser, setEditingUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  
  const [viewingMessage, setViewingMessage] = useState(null); // Mesaj okuma state'i
  // KUPON STATES
  const [coupons, setCoupons] = useState([]);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState({ code: "", discountPercentage: "", expiryDays: 30 });
  const [editingProduct, setEditingProduct] = useState(null);
  const [editProductForm, setEditProductForm] = useState({ name: "", price: 0, stock: 0, category: "" });

  const [createForm, setCreateForm] = useState({ name: "", surname: "", email: "", password: "", role: "user" });
  const [editForm, setEditForm] = useState({ name: "", surname: "", email: "" });

  const loadAdminData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    if (decodedToken.role !== "admin") {
      toast.error("Admin access required.");
      return router.push("/dashboard");
    }

    try {
      setLoading(true);
      setError("");

      // 1. STATS
      const statsRes = await fetch(`${API_URL}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } });
      if (statsRes.status === 401 || statsRes.status === 403) return router.push("/");
      if (statsRes.ok) setStats(await statsRes.json());

      // 2. USERS
      const usersRes = await fetch(`${API_URL}/admin/users?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (usersRes.ok) {
        const uData = await usersRes.json();
        setUsers(uData.users || []);
        setTotalPages(uData.totalPages || 1);
        setTotalUsers(uData.totalUsers || 0);
      }

      // 3. E-COMMERCE DATA (Products, Orders, Messages)
      const [prodRes, ordRes, msgRes] = await Promise.all([
        fetch(`${API_URL}/admin/products`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/admin/orders`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/admin/messages`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (prodRes.ok) { const pData = await prodRes.json(); setAdminProducts(pData.products || []); }
      if (ordRes.ok) { const oData = await ordRes.json(); setAdminOrders(oData.orders || []); }
      if (msgRes.ok) { const mData = await msgRes.json(); setAdminMessages(mData.messages || []); }

    } catch (error) {
      console.error(error);
      setError("Admin data could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
    loadCoupons();
  }, [page]);
  

  const handleSearch = (e) => {
    e.preventDefault();
    if (page !== 1) setPage(1);
    else loadAdminData();
  };

  // --- USER ACTIONS ---
  const handleViewUser = async (userId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setViewingUser(data.user);
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { toast.success("User deleted successfully."); loadAdminData(); }
    } catch (error) { console.error(error); }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      loadAdminData(); // İptal edilirse Select kutusunu eski haline getir
      return;
    }
    
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}/role`, {
        method: "PATCH", 
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: newRole }),
      });
      
      if (res.ok) { 
        toast.success(`User role updated to ${newRole}.`); 
        loadAdminData(); 
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to update role.");
        loadAdminData();
      }
    } catch (error) { 
      console.error(error); 
      toast.error("Server connection error.");
    }
  };

  const openEditModal = (user) => { setEditingUser(user); setEditForm({ name: user.name, surname: user.surname, email: user.email }); };
  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });
  const handleCreateChange = (e) => setCreateForm({ ...createForm, [e.target.name]: e.target.value });

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(createForm),
      });
      
      const data = await res.json(); // Backend'den gelen cevabı kesinlikle oku

      if (res.ok) {
        toast.success("User created successfully."); 
        setShowCreateModal(false);
        setCreateForm({ name: "", surname: "", email: "", password: "", role: "user" });
        setPage(1); 
        loadAdminData();
      } else { 
        toast.error(data.message || "Failed to create user."); // Backend hatasını ekrana bas
      }
    } catch (error) { 
      console.error(error); 
      toast.error("Server connection error.");
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/admin/users/${editingUser._id}`, {
        method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(editForm),
      });

      const data = await res.json(); // Backend'den gelen cevabı oku

      if (res.ok) { 
        toast.success("User updated successfully."); 
        setEditingUser(null); 
        loadAdminData(); 
      } else {
        toast.error(data.message || "Failed to update user."); // Backend hatasını ekrana bas
      }
    } catch (error) { 
      console.error(error); 
      toast.error("Server connection error.");
    }
  };

  // --- E-COMMERCE ACTIONS (NEW) ---
  const openEditProductModal = (product) => {
    setEditingProduct(product);
    setEditProductForm({
      name: product.name || "",
      price: product.price || 0,
      stock: product.stock || 0,
      category: product.category || "",
    });
  };

  const handleEditProductChange = (e) => {
    setEditProductForm({ ...editProductForm, [e.target.name]: e.target.value });
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/admin/products/${editingProduct._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editProductForm),
      });
      if (res.ok) {
        toast.success("Product updated successfully.");
        setEditingProduct(null);
        loadAdminData();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to update product.");
      }
    } catch (error) { console.error(error); }
  };
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/admin/products/${productId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { toast.success("Product deleted."); loadAdminData(); }
    } catch (error) { console.error(error); }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/admin/orders/${orderId}/status`, {
        method: "PATCH", 
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, 
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success("Order status updated.");
        // TÜM SAYFAYI YENİLEMEK YERİNE SADECE İLGİLİ SİPARİŞİ STATE İÇİNDE GÜNCELLE
        setAdminOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
      } else {
        toast.error("Failed to update order status.");
      }
    } catch (error) { 
      console.error(error); 
      toast.error("Server connection error.");
    }
  };

  const handleUpdateMessageStatus = async (messageId, newStatus) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/admin/messages/${messageId}/status`, {
        method: "PATCH", 
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, 
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success("Message status updated.");
        // TÜM SAYFAYI YENİLEMEK YERİNE SADECE İLGİLİ MESAJI STATE İÇİNDE GÜNCELLE
        setAdminMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === messageId ? { ...msg, status: newStatus } : msg
          )
        );
      } else {
        toast.error("Failed to update message status.");
      }
    } catch (error) { 
      console.error(error);
      toast.error("Server connection error.");
    }
  };

  const loadCoupons = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/coupons`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setCoupons(data.coupons || []);
    } catch (err) { console.error(err); }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/coupons/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(couponForm)
      });
      if (res.ok) {
        toast.success("Coupon created successfully!");
        setShowCouponModal(false);
        setCouponForm({ code: "", discountPercentage: "", expiryDays: 30 });
        loadCoupons(); // Listeyi yenile
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to create coupon.");
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteCoupon = async (id) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/coupons/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) loadCoupons(); // Listeyi yenile
    } catch (err) { console.error(err); }
  };

  // --- RENDERING ---
  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8fc]">
        <Navbar />
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="skeleton mb-8 h-10 w-48 rounded" />
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
          </div>
          <div className="skeleton h-96 rounded-2xl" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#f7f8fc]">
        <Navbar />
        <div className="mx-auto flex max-w-7xl items-center justify-center px-6 py-20">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center shadow-sm">
            <h2 className="text-xl font-bold text-red-600">Access Error</h2><p className="mt-2 text-red-700">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc]">
      <Navbar />
      
      <div className="mx-auto max-w-7xl px-6 py-10">
        
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Admin Panel</h1>
          <p className="mt-2 text-gray-500">Manage users, products, orders, and support tickets.</p>
        </div>

        {/* TABS MENU */}
<div className="mb-8 flex overflow-x-auto border-b border-gray-200 gap-4 pb-4">
  {["dashboard", "users", "products", "orders", "tickets", "coupons"].map((tab) => (
    <button
      key={tab}
      onClick={() => setActiveTab(tab)}
      className={`px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-all whitespace-nowrap border-2 rounded-lg ${
        activeTab === tab 
          ? "border-blue-600 bg-blue-50 text-blue-600 shadow-sm" 
          : "border-gray-200 bg-white text-gray-500 hover:border-gray-400 hover:bg-gray-50 hover:text-gray-800"
      }`}
    >
      {tab}
    </button>
  ))}
</div>

        {/* TAB 1: DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            
            {/* STAT KARTLARI */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"><p className="text-sm font-semibold uppercase text-gray-500">Total Users</p><h2 className="mt-4 text-4xl font-bold text-gray-900">{stats?.totalUsers || 0}</h2></div>
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"><p className="text-sm font-semibold uppercase text-gray-500">Total Admins</p><h2 className="mt-4 text-4xl font-bold text-gray-900">{stats?.totalAdmins || 0}</h2></div>
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"><p className="text-sm font-semibold uppercase text-gray-500">Normal Users</p><h2 className="mt-4 text-4xl font-bold text-gray-900">{stats?.totalNormalUsers || 0}</h2></div>
              
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6 shadow-sm"><p className="text-sm font-semibold uppercase text-blue-600">Total Products</p><h2 className="mt-4 text-4xl font-bold text-blue-900">{stats?.totalProducts || 0}</h2></div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm"><p className="text-sm font-semibold uppercase text-emerald-600">Total Orders</p><h2 className="mt-4 text-4xl font-bold text-emerald-900">{stats?.totalOrders || 0}</h2></div>
              <div className="rounded-2xl border border-orange-100 bg-orange-50 p-6 shadow-sm"><p className="text-sm font-semibold uppercase text-orange-600">Open Tickets</p><h2 className="mt-4 text-4xl font-bold text-orange-900">{stats?.totalOpenTickets || 0}</h2></div>
            </div>

            {/* GRAFİKLER */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              
              {/* GELİR GRAFİĞİ (LINE CHART) */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Trend (Last 6 Months)</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats?.monthlyRevenue || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `$${value}`} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value) => [`$${value}`, "Revenue"]}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} dot={{r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* SİPARİŞ DURUMLARI GRAFİĞİ (PIE CHART) */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Order Status Distribution</h3>
                <div className="h-72 w-full">
                  {stats?.orderStatusDistribution && stats.orderStatusDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.orderStatusDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {stats.orderStatusDistribution.map((entry, index) => {
                            // Durumlara göre renk belirleme
                            const colors = {
                              'Delivered': '#10b981', // Emerald
                              'Processing': '#3b82f6', // Blue
                              'Pending': '#f59e0b', // Amber
                              'Shipped': '#8b5cf6', // Violet
                              'Cancelled': '#ef4444' // Red
                            };
                            return <Cell key={`cell-${index}`} fill={colors[entry.name] || '#94a3b8'} />;
                          })}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#64748b' }}/>
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-gray-500">
                      No order data available to display.
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: USERS */}
        {activeTab === "users" && (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div><h2 className="text-xl font-bold text-gray-900">User Management</h2><p className="mt-1 text-sm text-gray-500">Total matching users: <span className="font-semibold text-gray-700">{totalUsers}</span></p></div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <Input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full sm:w-64" />
                  <Button type="submit" className="w-auto px-5">Search</Button>
                </form>
                <Button variant="accent" onClick={() => setShowCreateModal(true)} className="w-auto px-5">+ Add User</Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50/50 text-xs uppercase tracking-wider text-gray-500">
                  <tr><th className="px-6 py-4 font-semibold">Name</th><th className="px-6 py-4 font-semibold">Email</th><th className="px-6 py-4 font-semibold">Role</th><th className="px-6 py-4 font-semibold text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {users.length === 0 ? (<tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500">No users found.</td></tr>) : (
                    users.map((user) => (
                      <tr key={user._id} className="transition hover:bg-gray-50/50">
                        <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">{user.name} {user.surname}</td>
                        <td className="whitespace-nowrap px-6 py-4">{user.email}</td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"}`}>{user.role}</span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleViewUser(user._id)} className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold transition hover:bg-gray-200">View</button>
                            <button onClick={() => openEditModal(user)} className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100">Edit</button>
                            <select
  value={user.role}
  onChange={(e) => handleRoleChange(user._id, e.target.value)}
  className="rounded-lg bg-purple-50 border border-purple-100 text-purple-700 px-2 py-1 text-xs font-semibold outline-none cursor-pointer hover:bg-purple-100 transition"
>
  <option value="user">User</option>
  <option value="seller">Seller</option>
  <option value="admin">Admin</option>
</select>
                            <button onClick={() => handleDelete(user._id)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-6 py-4">
              <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="rounded-xl bg-white px-4 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset ring-gray-300 disabled:opacity-40">Previous</button>
              <span className="text-sm font-medium text-gray-600">Page <span className="font-semibold text-gray-900">{page}</span> of {totalPages}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages} className="rounded-xl bg-white px-4 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset ring-gray-300 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}

        {/* TAB 3: PRODUCTS */}
        {activeTab === "products" && (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-6"><h2 className="text-xl font-bold text-gray-900">Product Management</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50/50 text-xs uppercase tracking-wider text-gray-500">
                  <tr><th className="px-6 py-4 font-semibold">Product Name</th><th className="px-6 py-4 font-semibold">Seller</th><th className="px-6 py-4 font-semibold">Price</th><th className="px-6 py-4 font-semibold">Stock</th><th className="px-6 py-4 font-semibold text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {adminProducts.length === 0 ? (<tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500">No products found.</td></tr>) : (
                    adminProducts.map((product) => (
                      <tr key={product._id} className="transition hover:bg-gray-50/50">
                        <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">{product.name}</td>
                        <td className="whitespace-nowrap px-6 py-4">{product.seller?.name || "Unknown"}</td>
                        <td className="whitespace-nowrap px-6 py-4 font-semibold">${product.price}</td>
                        <td className="whitespace-nowrap px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${product.stock > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</span></td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openEditProductModal(product)} className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100">Edit</button>
                            <button onClick={() => handleDeleteProduct(product._id)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: ORDERS */}
        {activeTab === "orders" && (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-6"><h2 className="text-xl font-bold text-gray-900">Order Management</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50/50 text-xs uppercase tracking-wider text-gray-500">
                  <tr><th className="px-6 py-4 font-semibold">Order ID</th><th className="px-6 py-4 font-semibold">Customer</th><th className="px-6 py-4 font-semibold">Total</th><th className="px-6 py-4 font-semibold">Status</th><th className="px-6 py-4 font-semibold text-right">Update Status</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {adminOrders.length === 0 ? (<tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500">No orders found.</td></tr>) : (
                    adminOrders.map((order) => (
                      <tr key={order._id} className="transition hover:bg-gray-50/50">
                        <td className="whitespace-nowrap px-6 py-4 font-mono text-xs">{order._id}</td>
                        <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">{order.user?.name || "Deleted User"}</td>
                        <td className="whitespace-nowrap px-6 py-4 font-semibold">${order.totalPrice}</td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${order.status === "Delivered" ? "bg-emerald-100 text-emerald-700" : order.status === "Cancelled" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>{order.status}</span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <select 
                            value={order.status} 
                            onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-sm outline-none cursor-pointer"
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

        {/* TAB 5: TICKETS (MESSAGES) */}
        {activeTab === "tickets" && (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-6"><h2 className="text-xl font-bold text-gray-900">Support Tickets</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50/50 text-xs uppercase tracking-wider text-gray-500">
                  <tr><th className="px-6 py-4 font-semibold">Customer</th><th className="px-6 py-4 font-semibold">Subject</th><th className="px-6 py-4 font-semibold">Date</th><th className="px-6 py-4 font-semibold">Status</th><th className="px-6 py-4 font-semibold text-right">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {adminMessages.length === 0 ? (<tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500">No support tickets found.</td></tr>) : (
                    adminMessages.map((msg) => (
                      <tr key={msg._id} className="transition hover:bg-gray-50/50">
                        <td className="whitespace-nowrap px-6 py-4">
                          <p className="font-medium text-gray-900">{msg.name}</p>
                          <p className="text-xs text-gray-500">{msg.email}</p>
                        </td>
                        <td className="px-6 py-4">{msg.subject}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-xs">{new Date(msg.createdAt).toLocaleDateString()}</td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${msg.status === "Resolved" ? "bg-emerald-100 text-emerald-700" : msg.status === "Open" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-700"}`}>{msg.status}</span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <select 
                              value={msg.status} 
                              onChange={(e) => handleUpdateMessageStatus(msg._id, e.target.value)}
                              className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-sm outline-none cursor-pointer"
                            >
                              <option value="Open">Open</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Resolved">Resolved</option>
                              <option value="Closed">Closed</option>
                            </select>
                            <button
                              onClick={() => setViewingMessage(msg)}
                              className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                            >
                              Read
                            </button>
                          </div>
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
      {/* TAB 6: COUPONS */}
        {activeTab === "coupons" && (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 p-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Discount Coupons</h3>
                <p className="text-sm text-gray-500">Manage promotional codes and discounts.</p>
              </div>
              <Button 
                onClick={() => setShowCouponModal(true)} 
                className="!w-auto !py-2.5 px-5 text-sm shadow-sm flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 border-emerald-600"
              >
                <span className="text-base font-medium">+</span> Create Coupon
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50/50 text-xs uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Code</th>
                    <th className="px-6 py-4 font-semibold">Discount</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Expiry Date</th>
                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {coupons.length === 0 ? (
                    <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No coupons found.</td></tr>
                  ) : (
                    coupons.map((coupon) => {
                      const isExpired = new Date(coupon.expiryDate) < new Date();
                      return (
                        <tr key={coupon._id} className="transition hover:bg-gray-50/50">
                          <td className="px-6 py-4 font-bold text-gray-900 tracking-wider">
                            <span className="bg-gray-100 px-3 py-1 rounded-lg border border-gray-200">{coupon.code}</span>
                          </td>
                          <td className="px-6 py-4 font-bold text-emerald-600">% {coupon.discountPercentage}</td>
                          <td className="px-6 py-4">
                            {isExpired ? (
                              <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-semibold">Expired</span>
                            ) : coupon.isActive ? (
                              <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold">Active</span>
                            ) : (
                              <span className="bg-gray-200 text-gray-700 px-2.5 py-1 rounded-full text-xs font-semibold">Inactive</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-500">{new Date(coupon.expiryDate).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => handleDeleteCoupon(coupon._id)} className="text-red-500 hover:text-red-700 font-medium text-sm bg-red-50 px-3 py-1.5 rounded-lg transition hover:bg-red-100">
                              Delete
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* CREATE, EDIT VE VIEW MODALLARI AYNEN KORUNDU */}
      
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between"><h2 className="text-2xl font-bold text-gray-900">Add New User</h2><button onClick={() => setShowCreateModal(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200">✕</button></div>
           <form onSubmit={handleCreateUser} className="space-y-4">
              <Input type="text" name="name" placeholder="First Name" value={createForm.name} onChange={handleCreateChange} required maxLength={50} />
              <Input type="text" name="surname" placeholder="Last Name" value={createForm.surname} onChange={handleCreateChange} required maxLength={50} />
              <Input type="email" name="email" placeholder="Email Address" value={createForm.email} onChange={handleCreateChange} required maxLength={100} />
              <Input type="password" name="password" placeholder="Password (Min 6 chars)" value={createForm.password} onChange={handleCreateChange} required minLength={6} maxLength={30} />
              
              <div className="input-wrapper">
                <select name="role" value={createForm.role} onChange={handleCreateChange} className="input cursor-pointer appearance-none">
                  <option value="user">User</option>
                  <option value="seller">Seller</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="mt-6 flex gap-3 pt-2">
                <Button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 !bg-gray-100 !text-gray-700 hover:!bg-gray-200">Cancel</Button>
                <Button type="submit" variant="accent" className="flex-1">Create User</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between"><h2 className="text-2xl font-bold text-gray-900">Edit User</h2><button onClick={() => setEditingUser(null)} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200">✕</button></div>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <Input type="text" name="name" placeholder="First Name" value={editForm.name} onChange={handleEditChange} required maxLength={35} />
              <Input type="text" name="surname" placeholder="Last Name" value={editForm.surname} onChange={handleEditChange} required maxLength={25} />
              <Input type="email" name="email" placeholder="Email Address" value={editForm.email} onChange={handleEditChange} required maxLength={70} />
              
              <div className="mt-6 flex gap-3 pt-2">
                <Button type="button" onClick={() => setEditingUser(null)} className="flex-1 !bg-gray-100 !text-gray-700 hover:!bg-gray-200">Cancel</Button>
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between"><h2 className="text-2xl font-bold text-gray-900">User Details</h2><button onClick={() => setViewingUser(null)} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200">✕</button></div>
            <div className="space-y-3">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4"><p className="text-xs font-semibold uppercase text-gray-500">Name</p><p className="mt-1 font-medium text-gray-900">{viewingUser.name}</p></div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4"><p className="text-xs font-semibold uppercase text-gray-500">Surname</p><p className="mt-1 font-medium text-gray-900">{viewingUser.surname}</p></div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4"><p className="text-xs font-semibold uppercase text-gray-500">Email</p><p className="mt-1 font-medium text-gray-900">{viewingUser.email}</p></div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 flex items-center justify-between"><p className="text-xs font-semibold uppercase text-gray-500">Role</p><span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${viewingUser.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-200 text-gray-800'}`}>{viewingUser.role}</span></div>
            </div>
            <Button onClick={() => setViewingUser(null)} className="mt-6 w-full">Close</Button>
          </div>
        </div>
      )}
      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
              <button onClick={() => setEditingProduct(null)} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200">✕</button>
            </div>
            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Product Name</label>
                <Input type="text" name="name" value={editProductForm.name} onChange={handleEditProductChange} required className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Category</label>
                <Input type="text" name="category" value={editProductForm.category} onChange={handleEditProductChange} required className="mt-1" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Price ($)</label>
                  <Input type="number" name="price" value={editProductForm.price} onChange={handleEditProductChange} required min="0" step="0.01" className="mt-1" />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Stock</label>
                  <Input type="number" name="stock" value={editProductForm.stock} onChange={handleEditProductChange} required min="0" className="mt-1" />
                </div>
              </div>
              
              <div className="mt-6 flex gap-3 pt-2">
                <Button type="button" onClick={() => setEditingProduct(null)} className="flex-1 !bg-gray-100 !text-gray-700 hover:!bg-gray-200">Cancel</Button>
                <Button type="submit" className="flex-1">Save Product</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* VIEW TICKET MESSAGE MODAL */}
      {viewingMessage && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl">
            
            <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Ticket Details</h2>
                <p className="text-sm text-gray-500 mt-1">Message from {viewingMessage.name}</p>
              </div>
              <button
                onClick={() => setViewingMessage(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-900"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Contact Info</p>
                  <p className="mt-1 font-medium text-gray-900">{viewingMessage.name}</p>
                  <a href={`mailto:${viewingMessage.email}`} className="text-sm text-blue-600 hover:underline">{viewingMessage.email}</a>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status & Date</p>
                  <p className="mt-1 font-medium text-gray-900">{new Date(viewingMessage.createdAt).toLocaleString()}</p>
                  <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    viewingMessage.status === "Resolved" ? "bg-emerald-100 text-emerald-700" : 
                    viewingMessage.status === "Open" ? "bg-orange-100 text-orange-700" : "bg-gray-200 text-gray-700"
                  }`}>
                    {viewingMessage.status}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-2">Subject: {viewingMessage.subject}</p>
                <div className="w-full text-gray-700 text-sm leading-relaxed whitespace-pre-wrap break-words bg-gray-50 p-4 rounded-xl border border-gray-100 max-h-64 overflow-y-auto overflow-x-hidden">
                  {viewingMessage.message}
                </div>
              </div>
            </div>

            <div className="mt-6 flex">
              <Button onClick={() => setViewingMessage(null)} className="w-full">
                Close
              </Button>
            </div>

          </div>
        </div>
      )}
     {/* CREATE COUPON MODAL */}
      {showCouponModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Create Coupon</h2>
                <p className="text-sm text-gray-500 mt-1">Generate a new promotional code.</p>
              </div>
              <button onClick={() => setShowCouponModal(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-900">✕</button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Coupon Code</label>
                <input 
                  type="text" 
                  required 
                  value={couponForm.code} 
                  onChange={(e) => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})}
                  className="w-full mt-1 bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition text-gray-900 font-bold tracking-wider" 
                  placeholder="e.g. SUMMER24" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Discount (%)</label>
                  <input 
                    type="number" 
                    min="1" max="99" required 
                    value={couponForm.discountPercentage} 
                    onChange={(e) => setCouponForm({...couponForm, discountPercentage: e.target.value})}
                    className="w-full mt-1 bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition text-gray-900" 
                    placeholder="20" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Valid For (Days)</label>
                  <input 
                    type="number" 
                    min="1" required 
                    value={couponForm.expiryDays} 
                    onChange={(e) => setCouponForm({...couponForm, expiryDays: e.target.value})}
                    className="w-full mt-1 bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition text-gray-900" 
                    placeholder="30" 
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3 pt-2">
                <Button type="button" onClick={() => setShowCouponModal(false)} className="flex-1 !bg-gray-100 !text-gray-700 hover:!bg-gray-200">Cancel</Button>
                <Button type="submit" variant="accent" className="flex-1 bg-emerald-600 hover:bg-emerald-700 border-emerald-600">Create</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}