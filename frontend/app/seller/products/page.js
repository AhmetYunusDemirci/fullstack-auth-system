"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import API_URL from "../../../lib/api";
import Navbar from "../../../components/Navbar";
import Button from "../../../components/Button";

export default function SellerProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProducts = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/products/my-products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (response.status === 403) {
        setError("Only sellers can access this page.");
        return;
      }

      if (!response.ok) {
        setError(data.message || "Products could not be loaded.");
        return;
      }

      setProducts(data.products || []);
    } catch (error) {
      console.error(error);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // -------------------------
  // DELETE PRODUCT
  // -------------------------
  const handleDelete = async (productId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product? This action cannot be undone."
    );

    if (!confirmDelete) return;

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Product could not be deleted.");
        return;
      }

      // Başarılı silme işlemi sonrası state'i güncelle
      setProducts((currentProducts) =>
        currentProducts.filter((product) => product._id !== productId)
      );
    } catch (error) {
      console.error(error);
      alert("Server Error");
    }
  };

  // -------------------------
  // LOADING STATE (Skeleton)
  // -------------------------
  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8fc]">
        <Navbar />
        <section className="mx-auto max-w-7xl px-6 py-14">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="skeleton mb-2 h-10 w-64 rounded" />
              <div className="skeleton h-5 w-80 rounded" />
            </div>
            <div className="skeleton h-12 w-48 rounded-xl" />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                <div className="skeleton h-56 w-full" />
                <div className="space-y-4 p-6">
                  <div className="skeleton h-6 w-3/4 rounded" />
                  <div className="skeleton h-4 w-full rounded" />
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="skeleton h-16 rounded-xl" />
                    <div className="skeleton h-16 rounded-xl" />
                  </div>
                  <div className="skeleton mt-4 h-10 w-full rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc]">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-14">
        
        {/* HEADER */}
        <div className="mb-10 flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              My Products
            </h1>
            <p className="mt-2 text-gray-500">
              Manage the products you have published on the marketplace.
            </p>
          </div>
          <Link href="/seller/products/new" className="w-full md:w-auto">
            <Button variant="accent" className="px-6">
              + Add New Product
            </Button>
          </Link>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-6 flex items-start gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 font-bold">
              !
            </div>
            <div>
              <h3 className="font-bold text-red-800">Access Denied</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* EMPTY */}
        {!error && products.length === 0 && (
          <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-14 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-4xl">
              📦
            </div>
            <h2 className="mt-5 text-2xl font-bold text-gray-900">
              You haven't added any products yet
            </h2>
            <p className="mt-2 text-gray-500">
              Start your selling journey by publishing your first product to the marketplace.
            </p>
            <Link href="/seller/products/new">
              <Button variant="accent" className="mt-8 inline-flex w-auto px-8">
                Sell a Product
              </Button>
            </Link>
          </div>
        )}

        {/* PRODUCTS GRID */}
        {!error && products.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div
                key={product._id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:border-blue-200 hover:shadow-lg hover:shadow-blue-900/5"
              >
                {/* IMAGE */}
                <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm font-medium text-gray-400">
                      No Image Available
                    </div>
                  )}
                  
                  {/* CATEGORY BADGE */}
                  <div className="absolute left-4 top-4">
                    <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm backdrop-blur">
                      {product.category}
                    </span>
                  </div>
                </div>

                {/* PRODUCT INFO */}
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="truncate text-xl font-bold text-gray-900">
                    {product.name}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-500">
                    {product.description}
                  </p>

                  {/* STATS */}
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-gray-50 p-3 border border-gray-100">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Price
                      </p>
                      <p className="mt-1 text-xl font-bold text-blue-600">
                        ${product.price}
                      </p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3 border border-gray-100">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Stock
                      </p>
                      <p
                        className={`mt-1 text-xl font-bold ${
                          product.stock > 0 ? "text-emerald-600" : "text-red-500"
                        }`}
                      >
                        {product.stock}
                      </p>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="mt-6 mt-auto flex flex-col gap-3 pt-6">
                    <div className="flex gap-3">
                      <Link
                        href={`/products/${product._id}`}
                        className="flex flex-1 items-center justify-center rounded-xl bg-gray-100 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
                      >
                        View Public
                      </Link>
                      <Link
                        href={`/seller/products/edit/${product._id}`}
                        className="flex flex-1 items-center justify-center rounded-xl bg-blue-50 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 hover:text-blue-800"
                      >
                        Edit Item
                      </Link>
                    </div>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="w-full rounded-xl border border-red-100 bg-white py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-50 hover:text-red-600"
                    >
                      Delete Product
                    </button>
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