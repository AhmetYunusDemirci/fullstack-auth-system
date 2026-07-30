"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import API_URL from "../lib/api";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/products`);

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Products could not be loaded.");
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

  return (
    <main className="min-h-screen bg-gray-100">

      {/* HEADER */}

      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <Link href="/">
                <h1 className="text-3xl font-bold text-blue-600">
                  MyStore
                </h1>
              </Link>

              <p className="text-gray-500 mt-1">
                Simple and secure online marketplace
              </p>
            </div>

            <div className="flex gap-3">

  <Link
    href="/login"
    className="bg-gray-800 text-white px-5 py-2 rounded-lg hover:bg-gray-900"
  >
    Login
  </Link>

  <Link
    href="/register"
    className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
  >
    Register
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

      {/* PRODUCTS */}

      <section className="max-w-7xl mx-auto px-6 py-10">

        <div className="mb-8">

          <h2 className="text-3xl font-bold">
            Products
          </h2>

          <p className="text-gray-500 mt-2">
            Discover products from our sellers.
          </p>

        </div>

        {/* LOADING */}

        {loading && (
          <div className="flex justify-center py-20">

            <p className="text-xl text-gray-500">
              Loading products...
            </p>

          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="bg-red-100 text-red-700 p-5 rounded-xl">
            {error}
          </div>
        )}

        {/* EMPTY */}

        {!loading && !error && products.length === 0 && (
          <div className="bg-white rounded-xl shadow p-10 text-center">

            <h3 className="text-2xl font-semibold">
              No products yet
            </h3>

            <p className="text-gray-500 mt-2">
              Products will appear here when sellers add them.
            </p>

          </div>
        )}

        {/* PRODUCT GRID */}

        {!loading && !error && products.length > 0 && (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {products.map((product) => (

              <Link
                href={`/products/${product._id}`}
                key={product._id}
                className="group"
              >

                <div className="bg-white rounded-xl shadow overflow-hidden hover:shadow-xl transition">

                  {/* IMAGE */}

                  <div className="h-52 bg-gray-200 flex items-center justify-center overflow-hidden">

                    {product.image ? (

                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />

                    ) : (

                      <div className="text-gray-400 text-lg">
                        No Image
                      </div>

                    )}

                  </div>

                  {/* PRODUCT INFO */}

                  <div className="p-5">

                    <h3 className="text-xl font-semibold truncate">
                      {product.name}
                    </h3>

                    <p className="text-gray-500 mt-2 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex justify-between items-center mt-5">

                      <span className="text-2xl font-bold text-blue-600">
                        ${product.price}
                      </span>

                      <span
                        className={
                          product.stock > 0
                            ? "text-green-600 text-sm font-semibold"
                            : "text-red-600 text-sm font-semibold"
                        }
                      >
                        {product.stock > 0
                          ? `${product.stock} in stock`
                          : "Out of stock"}
                      </span>

                    </div>

                  </div>

                </div>

              </Link>

            ))}

          </div>

        )}

      </section>

    </main>
  );
}