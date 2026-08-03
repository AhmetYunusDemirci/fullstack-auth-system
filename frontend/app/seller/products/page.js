"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import API_URL from "../../../lib/api";

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

      const response = await fetch(
        `${API_URL}/products/my-products`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (response.status === 403) {
        setError(
          "Only sellers can access this page."
        );
        return;
      }

      if (!response.ok) {
        setError(
          data.message ||
            "Products could not be loaded."
        );
        return;
      }

      setProducts(data.products || []);
    } catch (error) {
      console.error(error);
      setError("Server Error");
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
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) {
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${API_URL}/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Product could not be deleted."
        );
        return;
      }

      alert("Product deleted successfully.");

      setProducts((currentProducts) =>
        currentProducts.filter(
          (product) =>
            product._id !== productId
        )
      );
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
          Loading your products...
        </h2>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">

      {/* HEADER */}

      <header className="bg-white shadow-sm">

        <div className="max-w-7xl mx-auto px-6 py-5">

          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">

            <div>

              <Link href="/">
                <h1 className="text-3xl font-bold text-blue-600">
                  MyStore
                </h1>
              </Link>

              <p className="text-gray-500 mt-1">
                Seller Product Management
              </p>

            </div>

            <div className="flex flex-wrap gap-3">

              <Link
                href="/"
                className="bg-gray-800 text-white px-5 py-2 rounded-lg hover:bg-gray-900"
              >
                Home
              </Link>

              <Link
                href="/profile"
                className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700"
              >
                Profile
              </Link>

            

            </div>

          </div>

        </div>

      </header>

      {/* CONTENT */}

      <section className="max-w-7xl mx-auto px-6 py-10">

        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">

          <div>

            <h1 className="text-4xl font-bold">
              My Products
            </h1>

            <p className="text-gray-500 mt-2">
              Manage the products you have published.
            </p>

          </div>

          <Link
            href="/seller/products/new"
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
          >
            + Add New Product
          </Link>

        </div>

        {/* ERROR */}

        {error && (
          <div className="bg-red-100 text-red-700 p-5 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* EMPTY */}

        {!error && products.length === 0 && (

          <div className="bg-white rounded-2xl shadow p-12 text-center">

            <div className="text-5xl mb-5">
              📦
            </div>

            <h2 className="text-2xl font-bold">
              You have no products
            </h2>

            <p className="text-gray-500 mt-2">
              Start selling by publishing your first product.
            </p>

            <Link
              href="/seller/products/new"
              className="inline-block mt-6 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
            >
              Sell a Product
            </Link>

          </div>

        )}

        {/* PRODUCTS */}

        {!error && products.length > 0 && (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {products.map((product) => (

              <div
                key={product._id}
                className="bg-white rounded-2xl shadow overflow-hidden"
              >

                {/* IMAGE */}

                <div className="h-56 bg-gray-200 flex items-center justify-center overflow-hidden">

                  {product.image ? (

                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />

                  ) : (

                    <span className="text-gray-400">
                      No Image
                    </span>

                  )}

                </div>

                {/* PRODUCT INFO */}

                <div className="p-6">

                  <h2 className="text-xl font-bold truncate">
                    {product.name}
                  </h2>

                  <p className="text-gray-500 mt-2 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mt-5">

                    <div className="bg-gray-50 rounded-lg p-3">

                      <p className="text-sm text-gray-500">
                        Price
                      </p>

                      <p className="text-xl font-bold text-blue-600">
                        ${product.price}
                      </p>

                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">

                      <p className="text-sm text-gray-500">
                        Stock
                      </p>

                      <p
                        className={
                          product.stock > 0
                            ? "text-xl font-bold text-green-600"
                            : "text-xl font-bold text-red-600"
                        }
                      >
                        {product.stock}
                      </p>

                    </div>

                  </div>

                  <p className="text-sm text-gray-500 mt-4">
                    Category:{" "}
                    <span className="font-semibold">
                      {product.category}
                    </span>
                  </p>

                  {/* ACTIONS */}

                  <div className="flex gap-3 mt-6">

                    <Link
                      href={`/products/${product._id}`}
                      className="flex-1 text-center bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900"
                    >
                      View
                    </Link>

                    <Link
                      href={`/seller/products/edit/${product._id}`}
                      className="flex-1 text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                    >
                      Edit
                    </Link>

                  </div>

                  <button
                    onClick={() =>
                      handleDelete(product._id)
                    }
                    className="w-full mt-3 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>

    </main>
  );
}