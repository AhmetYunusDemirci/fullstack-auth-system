"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API_URL from "../../lib/api";

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

    const decodedToken = JSON.parse(
  atob(token.split(".")[1])
);

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
  
  const handleViewUser = async (userId) => {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(
      `${API_URL}/admin/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

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

    if (!confirmDelete) {
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${API_URL}/admin/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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

    const confirmChange = window.confirm(
      `Change user role to ${newRole}?`
    );

    if (!confirmChange) {
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${API_URL}/admin/users/${userId}/role`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            role: newRole,
          }),
        }
      );

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
    const response = await fetch(
      `${API_URL}/admin/users/${editingUser._id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      }
    );

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
  // LOADING
  // -------------------------

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <h2 className="text-2xl font-semibold">
          Loading Admin Panel...
        </h2>
      </main>
    );
  }

  // -------------------------
  // ERROR
  // -------------------------

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <p className="text-red-600">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">
              Admin Panel
            </h1>

            <p className="text-gray-600 mt-2">
              User management dashboard
            </p>
          </div>

          <button
            onClick={() => router.push("/")}
            className="bg-gray-800 text-white px-5 py-3 rounded-lg hover:bg-gray-900"
          >
            Home
          </button>
        </div>

        {/* STATISTICS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">
              Total Users
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {stats?.totalUsers || 0}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">
              Total Admins
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {stats?.totalAdmins || 0}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">
              Normal Users
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {stats?.totalNormalUsers || 0}
            </h2>
          </div>

        </div>

        {/* USERS */}

        <div className="bg-white rounded-xl shadow overflow-hidden">

          <div className="p-6 border-b">

            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">

              <div>
                <h2 className="text-2xl font-bold">
                  Users
                </h2>

                <p className="text-gray-500 mt-1">
                  Total matching users: {totalUsers}
                </p>
              </div>

              {/* SEARCH + ADD USER */}

              <div className="flex flex-col md:flex-row gap-3">

                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
                >
                  + Add User
                </button>

                <form
                  onSubmit={handleSearch}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border rounded-lg px-4 py-2 w-64"
                  />

                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Search
                  </button>
                </form>

              </div>

            </div>

          </div>

          {/* TABLE */}

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50">
                <tr>

                  <th className="text-left p-4">
                    Name
                  </th>

                  <th className="text-left p-4">
                    Surname
                  </th>

                  <th className="text-left p-4">
                    Email
                  </th>

                  <th className="text-left p-4">
                    Role
                  </th>

                  <th className="text-left p-4">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody>

                {users.length === 0 ? (

                  <tr>
                    <td
                      colSpan="5"
                      className="text-center p-8 text-gray-500"
                    >
                      No users found.
                    </td>
                  </tr>

                ) : (

                  users.map((user) => (

                    <tr
                      key={user._id}
                      className="border-t hover:bg-gray-50"
                    >

                      <td className="p-4">
                        {user.name}
                      </td>

                      <td className="p-4">
                        {user.surname}
                      </td>

                      <td className="p-4">
                        {user.email}
                      </td>

                      <td className="p-4">

                        <span
                          className={
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold"
                              : "bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                          }
                        >
                          {user.role}
                        </span>

                      </td>

                      <td className="p-4">

                        <div className="flex flex-wrap gap-2">
                            
                            <button
  onClick={() => handleViewUser(user._id)}
  className="bg-gray-700 text-white px-3 py-2 rounded-lg hover:bg-gray-800"
>
  View
</button>  
                          <button
                            onClick={() => openEditModal(user)}
                            className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleRoleChange(
                                user._id,
                                user.role
                              )
                            }
                            className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700"
                          >
                            Change Role
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(user._id)
                            }
                            className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700"
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

          <div className="flex justify-between items-center p-6 border-t">

            <button
              onClick={() =>
                setPage((currentPage) => currentPage - 1)
              }
              disabled={page === 1}
              className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <span className="font-semibold">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() =>
                setPage((currentPage) => currentPage + 1)
              }
              disabled={page >= totalPages}
              className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>

          </div>

        </div>

      </div>

      {/* CREATE USER MODAL */}

      {showCreateModal && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">

            <div className="flex justify-between items-center mb-6">

              <h2 className="text-2xl font-bold">
                Add New User
              </h2>

              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-800 text-xl"
              >
                ✕
              </button>

            </div>

            <form
              onSubmit={handleCreateUser}
              className="space-y-4"
            >

              <input
                type="text"
                name="name"
                placeholder="Name"
                value={createForm.name}
                onChange={handleCreateChange}
                className="w-full border rounded-lg p-3"
                required
              />

              <input
                type="text"
                name="surname"
                placeholder="Surname"
                value={createForm.surname}
                onChange={handleCreateChange}
                className="w-full border rounded-lg p-3"
                required
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={createForm.email}
                onChange={handleCreateChange}
                className="w-full border rounded-lg p-3"
                required
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={createForm.password}
                onChange={handleCreateChange}
                className="w-full border rounded-lg p-3"
                required
              />

              <select
                name="role"
                value={createForm.role}
                onChange={handleCreateChange}
                className="w-full border rounded-lg p-3"
              >
                <option value="user">
                  User
                </option>

                <option value="admin">
                  Admin
                </option>
              </select>

              <div className="flex gap-3">

                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
                >
                  Create User
                </button>

                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-200 py-3 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* EDIT USER MODAL */}

      {editingUser && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">

            <div className="flex justify-between items-center mb-6">

              <h2 className="text-2xl font-bold">
                Edit User
              </h2>

              <button
                onClick={() => setEditingUser(null)}
                className="text-gray-500 hover:text-gray-800 text-xl"
              >
                ✕
              </button>

            </div>

            <form
              onSubmit={handleUpdateUser}
              className="space-y-4"
            >

              <input
                type="text"
                name="name"
                placeholder="Name"
                value={editForm.name}
                onChange={handleEditChange}
                className="w-full border rounded-lg p-3"
                required
              />

              <input
                type="text"
                name="surname"
                placeholder="Surname"
                value={editForm.surname}
                onChange={handleEditChange}
                className="w-full border rounded-lg p-3"
                required
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={editForm.email}
                onChange={handleEditChange}
                className="w-full border rounded-lg p-3"
                required
              />

              <div className="flex gap-3">

                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>

                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 bg-gray-200 py-3 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>

        </div>

      )}
     {/* VIEW USER MODAL */}

{viewingUser && (

  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">

    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">

      <div className="flex justify-between items-center mb-6">

        <h2 className="text-2xl font-bold">
          User Details
        </h2>

        <button
          onClick={() => setViewingUser(null)}
          className="text-gray-500 hover:text-gray-800 text-xl"
        >
          ✕
        </button>

      </div>

      <div className="space-y-4">

        <div className="border rounded-lg p-4 bg-gray-50">
          <p className="text-sm text-gray-500">
            Name
          </p>

          <p className="font-semibold text-lg">
            {viewingUser.name}
          </p>
        </div>

        <div className="border rounded-lg p-4 bg-gray-50">
          <p className="text-sm text-gray-500">
            Surname
          </p>

          <p className="font-semibold text-lg">
            {viewingUser.surname}
          </p>
        </div>

        <div className="border rounded-lg p-4 bg-gray-50">
          <p className="text-sm text-gray-500">
            Email
          </p>

          <p className="font-semibold text-lg">
            {viewingUser.email}
          </p>
        </div>

        <div className="border rounded-lg p-4 bg-gray-50">
          <p className="text-sm text-gray-500">
            Role
          </p>

          <p className="font-semibold text-lg">
            {viewingUser.role}
          </p>
        </div>

        <div className="border rounded-lg p-4 bg-gray-50">
          <p className="text-sm text-gray-500">
            User ID
          </p>

          <p className="font-mono text-sm break-all">
            {viewingUser._id}
          </p>
        </div>

      </div>

      <button
        onClick={() => setViewingUser(null)}
        className="mt-6 w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-900"
      >
        Close
      </button>

    </div>

  </div>

)}
    </main>
  );
}

