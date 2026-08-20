
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

  const handleDelete = async (productId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product? This action cannot be undone."
    );

    if (!confirmed) return;

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: "DELETE",
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

      if (!response.ok) {
        alert(data.message || "Product could not be deleted.");
        return;
      }

      setProducts((currentProducts) =>
        currentProducts.filter((product) => product._id !== productId)
      );
    } catch (error) {
      console.error(error);
      alert("Server Error");
    }
  };

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (total, product) => total + Number(product.stock || 0),
    0
  );

  const outOfStock = products.filter(
    (product) => Number(product.stock || 0) === 0
  ).length;

  const lowStock = products.filter(
    (product) =>
      Number(product.stock || 0) > 0 &&
      Number(product.stock || 0) <= 5
  ).length;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8fc]">
        <Navbar />

        <section className="mx-auto max-w-7xl px-6 py-12">
          <div className="animate-pulse">
            <div className="h-10 w-64 rounded-lg bg-gray-200" />
            <div className="mt-3 h-5 w-80 rounded bg-gray-200" />

            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-28 rounded-2xl bg-gray-200"
                />
              ))}
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-3xl bg-white"
                >
                  <div className="h-56 bg-gray-200" />

                  <div className="space-y-4 p-6">
                    <div className="h-6 w-3/4 rounded bg-gray-200" />
                    <div className="h-4 w-full rounded bg-gray-200" />
                    <div className="h-4 w-2/3 rounded bg-gray-200" />

                    <div className="grid grid-cols-2 gap-3 pt-3">
                      <div className="h-20 rounded-xl bg-gray-100" />
                      <div className="h-20 rounded-xl bg-gray-100" />
                    </div>

                    <div className="h-10 rounded-xl bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc]">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-12 lg:py-14">

        {/* PAGE HEADER */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
              Seller Center
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
              My Products
            </h1>

            <p className="mt-3 max-w-2xl text-base leading-7 text-gray-500">
              Manage your marketplace products, monitor stock levels,
              and keep your listings up to date.
            </p>
          </div>

          <Link
            href="/seller/products/new"
            className="w-full md:w-auto"
          >
            <Button
              variant="accent"
              className="w-full px-7 py-3.5 md:w-auto"
            >
              + Add New Product
            </Button>
          </Link>

        </div>

        {/* STATISTICS */}
        {!error && (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {/* TOTAL PRODUCTS */}
            <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Products
                  </p>

                  <p className="mt-2 text-3xl font-extrabold text-gray-900">
                    {totalProducts}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
                  📦
                </div>

              </div>
            </div>

            {/* TOTAL STOCK */}
            <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Stock
                  </p>

                  <p className="mt-2 text-3xl font-extrabold text-gray-900">
                    {totalStock > 99999 ? "100,000+" : totalStock.toLocaleString()}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                  📊
                </div>

              </div>
            </div>

            {/* LOW STOCK */}
            <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Low Stock
                  </p>

                  <p className="mt-2 text-3xl font-extrabold text-amber-600">
                    {lowStock}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-xl">
                  ⚠️
                </div>

              </div>
            </div>

            {/* OUT OF STOCK */}
            <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Out of Stock
                  </p>

                  <p className="mt-2 text-3xl font-extrabold text-red-600">
                    {outOfStock}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-xl">
                  ⛔
                </div>

              </div>
            </div>

          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mt-10 overflow-hidden rounded-3xl border border-red-200 bg-white shadow-sm">

            <div className="bg-red-50 px-6 py-4">
              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 font-bold text-red-600">
                  !
                </div>

                <div>
                  <h2 className="font-bold text-red-900">
                    Unable to Load Products
                  </h2>

                  <p className="mt-1 text-sm text-red-700">
                    {error}
                  </p>
                </div>

              </div>
            </div>

            <div className="px-6 py-5">
              <Link
                href="/"
                className="inline-flex rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Back to Home
              </Link>
            </div>

          </div>
        )}

        {/* EMPTY STATE */}
        {!error && products.length === 0 && (
          <div className="mt-10 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

            <div className="flex flex-col items-center px-6 py-20 text-center">

              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-50 to-emerald-50 text-5xl shadow-inner">
                📦
              </div>

              <h2 className="mt-7 text-2xl font-extrabold text-gray-900">
                Your product catalog is empty
              </h2>

              <p className="mt-3 max-w-lg leading-7 text-gray-500">
                You haven't published any products yet.
                Add your first product and start building your
                marketplace catalog.
              </p>

              <Link href="/seller/products/new">
                <Button
                  variant="accent"
                  className="mt-8 px-8 py-3"
                >
                  + Publish Your First Product
                </Button>
              </Link>

            </div>
          </div>
        )}

        {/* PRODUCT GRID */}
        {!error && products.length > 0 && (
          <div className="mt-10">

            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Your Listings
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {products.length} published product
                  {products.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">

              {products.map((product) => {

                const stock = Number(product.stock || 0);

                const stockStatus =
                  stock === 0
                    ? {
                        label: "Out of Stock",
                        className:
                          "bg-red-50 text-red-700 border-red-100",
                      }
                    : stock <= 5
                    ? {
                        label: "Low Stock",
                        className:
                          "bg-amber-50 text-amber-700 border-amber-100",
                      }
                    : {
                        label: "In Stock",
                        className:
                          "bg-emerald-50 text-emerald-700 border-emerald-100",
                      };

                return (
                  <article
                    key={product._id}
                    className="group flex flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5"
                  >

                    {/* IMAGE */}
                    <Link
                      href={`/products/${product._id}`}
                      className="relative block h-64 overflow-hidden bg-gray-100"
                    >

                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <div className="text-center">
                            <div className="text-4xl">📦</div>
                            <p className="mt-2 text-sm font-medium text-gray-400">
                              No Image
                            </p>
                          </div>
                        </div>
                      )}

                      {/* IMAGE OVERLAY */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />

                      {/* CATEGORY */}
                      {product.category && (
                        <div className="absolute left-4 top-4">
                          <span className="rounded-full border border-white/60 bg-white/90 px-3 py-1.5 text-xs font-bold text-gray-800 shadow-sm backdrop-blur-md">
                            {product.category}
                          </span>
                        </div>
                      )}

                      {/* STOCK STATUS */}
                      <div className="absolute right-4 top-4">
                        <span
                          className={`rounded-full border px-3 py-1.5 text-xs font-bold shadow-sm backdrop-blur-md ${stockStatus.className}`}
                        >
                          {stockStatus.label}
                        </span>
                      </div>

                    </Link>

                    {/* CONTENT */}
                    <div className="flex flex-1 flex-col p-6">

                      <Link href={`/products/${product._id}`}>
                        <h3 className="line-clamp-1 text-xl font-bold text-gray-900 transition hover:text-blue-600">
                          {product.name}
                        </h3>
                      </Link>

                      <p className="mt-2 line-clamp-2 min-h-[42px] text-sm leading-6 text-gray-500">
                        {product.description}
                      </p>

                      {/* PRICE + STOCK */}
                      <div className="mt-6 grid grid-cols-2 gap-3">

                        <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-500">
                            Price
                          </p>

                          <p className="mt-1 text-2xl font-extrabold text-blue-700">
                            ${Number(product.price || 0).toFixed(2)}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                            Stock
                          </p>

                          <p
                            className={`mt-1 text-2xl font-extrabold ${
                              stock === 0
                                ? "text-red-600"
                                : stock <= 5
                                ? "text-amber-600"
                                : "text-emerald-600"
                            }`}
                          >
                            {stock}
                          </p>
                        </div>

                      </div>

                      {/* ACTIONS */}
                      <div className="mt-6 space-y-3">

                        <div className="grid grid-cols-2 gap-3">

                          <Link
                            href={`/products/${product._id}`}
                            className="flex items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                          >
                            View Product
                          </Link>

                          <Link
                            href={`/seller/products/edit/${product._id}`}
                            className="flex items-center justify-center rounded-xl bg-blue-50 px-3 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                          >
                            Edit Product
                          </Link>

                        </div>

                        <button
                          onClick={() => handleDelete(product._id)}
                          className="w-full rounded-xl border border-red-100 bg-white px-3 py-2.5 text-sm font-semibold text-red-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                        >
                          Delete Product
                        </button>

                      </div>

                    </div>
                  </article>
                );
              })}

            </div>
          </div>
        )}

      </section>
    </main>
  );
}

