"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API_URL from "../../lib/api";
import Navbar from "../../components/Navbar";
import Input from "../../components/Input";
import Button from "../../components/Button";

export default function AdminPage() {
  const router = useRouter();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingUser, setEditingUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);

  const [createForm, setCreateForm] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    role: "user",
  });

  const [editForm, setEditForm] = useState({
    name: "",
    surname: "",
    email: "",
  });

  const limit = 5;

  const loadAdminData = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const decodedToken = JSON.parse(atob(token.split(".")[1]));

    if (decodedToken.role !== "admin") {
      alert("Admin access required.");
      router.push("/dashboard");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // -------------------------
      // STATISTICS
      // -------------------------
      const statsResponse = await fetch(`${API_URL}/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (statsResponse.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (statsResponse.status === 403) {
        alert("You do not have permission to access the admin panel.");
        router.push("/dashboard");
        return;
      }

      if (!statsResponse.ok) {
        throw new Error("Failed to load statistics.");
      }

      const statsData = await statsResponse.json();

      // -------------------------
      // USERS
      // -------------------------
      const usersResponse = await fetch(
        `${API_URL}/admin/users?search=${encodeURIComponent(
          search
        )}&page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (usersResponse.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (usersResponse.status === 403) {
        router.push("/dashboard");
        return;
      }

      if (!usersResponse.ok) {
        throw new Error("Failed to load users.");
      }

      const usersData = await usersResponse.json();

      setStats(statsData);
      setUsers(usersData.users || []);
      setTotalPages(usersData.totalPages || 1);
      setTotalUsers(usersData.totalUsers || 0);
    } catch (error) {
      console.error(error);
      setError("Admin data could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [page]);

  // -------------------------
  // SEARCH
  // -------------------------
  const handleSearch = (e) => {
    e.preventDefault();

    if (page !== 1) {
      setPage(1);
    } else {
      loadAdminData();
    }
  };

  // -------------------------
  // VIEW USER
  // -------------------------
  const handleViewUser = async (userId) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to load user.");
        return;
      }

      setViewingUser(data.user);
    } catch (error) {
      console.error(error);
      alert("Server Error");
    }
  };

  // -------------------------
  // DELETE USER
  // -------------------------
  const handleDelete = async (userId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) return;

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to delete user.");
        return;
      }

      alert("User deleted successfully.");
      loadAdminData();
    } catch (error) {
      console.error(error);
      alert("Server Error");
    }
  };

  // -------------------------
  // CHANGE ROLE
  // -------------------------
  const handleRoleChange = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    const confirmChange = window.confirm(`Change user role to ${newRole}?`);

    if (!confirmChange) return;

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to change role.");
        return;
      }

      alert("User role updated successfully.");
      loadAdminData();
    } catch (error) {
      console.error(error);
      alert("Server Error");
    }
  };

  // -------------------------
  // EDIT USER
  // -------------------------
  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || "",
      surname: user.surname || "",
      email: user.email || "",
    });
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  // -------------------------
  // CREATE USER
  // -------------------------
  const handleCreateChange = (e) => {
    setCreateForm({
      ...createForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createForm),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to create user.");
        return;
      }

      alert("User created successfully.");

      setCreateForm({
        name: "",
        surname: "",
        email: "",
        password: "",
        role: "user",
      });

      setShowCreateModal(false);
      await loadAdminData();
      setPage(1);
    } catch (error) {
      console.error(error);
      alert("Server Error");
    }
  };

  // -------------------------
  // UPDATE USER
  // -------------------------
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/admin/users/${editingUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to update user.");
        return;
      }

      alert("User updated successfully.");
      setEditingUser(null);
      await loadAdminData();
    } catch (error) {
      console.error(error);
      alert("Server Error");
    }
  };

  // -------------------------
  // LOADING STATE
  // -------------------------
  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8fc]">
        <Navbar />
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="skeleton mb-8 h-10 w-48 rounded" />
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-32 rounded-2xl" />
            ))}
          </div>
          <div className="skeleton h-96 rounded-2xl" />
        </div>
      </main>
    );
  }

  // -------------------------
  // ERROR STATE
  // -------------------------
  if (error) {
    return (
      <main className="min-h-screen bg-[#f7f8fc]">
        <Navbar />
        <div className="mx-auto flex max-w-7xl items-center justify-center px-6 py-20">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center shadow-sm">
            <h2 className="text-xl font-bold text-red-600">Access Error</h2>
            <p className="mt-2 text-red-700">{error}</p>
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
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Admin Panel
            </h1>
            <p className="mt-2 text-gray-500">
              Manage users, roles, and platform statistics.
            </p>
          </div>
        </div>

        {/* STATISTICS */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">Total Users</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">👥</div>
            </div>
            <h2 className="mt-4 text-4xl font-bold text-gray-900">{stats?.totalUsers || 0}</h2>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">Total Admins</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">🛡️</div>
            </div>
            <h2 className="mt-4 text-4xl font-bold text-gray-900">{stats?.totalAdmins || 0}</h2>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">Normal Users</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">👤</div>
            </div>
            <h2 className="mt-4 text-4xl font-bold text-gray-900">{stats?.totalNormalUsers || 0}</h2>
          </div>
        </div>

        {/* USERS TABLE SECTION */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          
          {/* Section Header & Actions */}
          <div className="border-b border-gray-100 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">User Management</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Total matching users: <span className="font-semibold text-gray-700">{totalUsers}</span>
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:w-64"
                  />
                  <Button type="submit" className="w-auto px-5">Search</Button>
                </form>

                <Button variant="accent" onClick={() => setShowCreateModal(true)} className="w-auto px-5">
                  + Add User
                </Button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Surname</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="transition hover:bg-gray-50/50">
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">{user.name}</td>
                      <td className="whitespace-nowrap px-6 py-4">{user.surname}</td>
                      <td className="whitespace-nowrap px-6 py-4">{user.email}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewUser(user._id)}
                            className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-200"
                          >
                            View
                          </button>
                          <button
                            onClick={() => openEditModal(user)}
                            className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleRoleChange(user._id, user.role)}
                            className="rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 transition hover:bg-purple-100"
                          >
                            Role
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-6 py-4">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm font-medium text-gray-600">
              Page <span className="font-semibold text-gray-900">{page}</span> of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages}
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Add New User</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-900"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <Input type="text" name="name" placeholder="First Name" value={createForm.name} onChange={handleCreateChange} required />
              <Input type="text" name="surname" placeholder="Last Name" value={createForm.surname} onChange={handleCreateChange} required />
              <Input type="email" name="email" placeholder="Email Address" value={createForm.email} onChange={handleCreateChange} required />
              <Input type="password" name="password" placeholder="Password" value={createForm.password} onChange={handleCreateChange} required />
              
              <div className="input-wrapper">
                <select
                  name="role"
                  value={createForm.role}
                  onChange={handleCreateChange}
                  className="input cursor-pointer appearance-none"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="mt-6 flex gap-3 pt-2">
                <Button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 !bg-gray-100 !text-gray-700 hover:!bg-gray-200">
                  Cancel
                </Button>
                <Button type="submit" variant="accent" className="flex-1">
                  Create User
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Edit User</h2>
              <button
                onClick={() => setEditingUser(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-900"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <Input type="text" name="name" placeholder="First Name" value={editForm.name} onChange={handleEditChange} required />
              <Input type="text" name="surname" placeholder="Last Name" value={editForm.surname} onChange={handleEditChange} required />
              <Input type="email" name="email" placeholder="Email Address" value={editForm.email} onChange={handleEditChange} required />
              
              <div className="mt-6 flex gap-3 pt-2">
                <Button type="button" onClick={() => setEditingUser(null)} className="flex-1 !bg-gray-100 !text-gray-700 hover:!bg-gray-200">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW USER MODAL */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
              <button
                onClick={() => setViewingUser(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-900"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Name</p>
                <p className="mt-1 font-medium text-gray-900">{viewingUser.name}</p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Surname</p>
                <p className="mt-1 font-medium text-gray-900">{viewingUser.surname}</p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Email</p>
                <p className="mt-1 font-medium text-gray-900">{viewingUser.email}</p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Role</p>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${viewingUser.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-200 text-gray-800'}`}>
                  {viewingUser.role}
                </span>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">User ID</p>
                <p className="mt-1 break-all font-mono text-sm text-gray-600">{viewingUser._id}</p>
              </div>
            </div>
            <Button onClick={() => setViewingUser(null)} className="mt-6 w-full">
              Close
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}