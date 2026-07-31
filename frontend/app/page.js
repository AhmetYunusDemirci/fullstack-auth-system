"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import API_URL from "../lib/api";
import Navbar from "../components/Navbar";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

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
      setFilteredProducts(data.products || []);
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

  // FILTER PRODUCTS
  useEffect(() => {
    const searchValue = search.toLowerCase().trim();

    const filtered = products.filter((product) => {
      const matchesSearch =
        !searchValue ||
        product.name?.toLowerCase().includes(searchValue) ||
        product.description?.toLowerCase().includes(searchValue) ||
        product.category?.toLowerCase().includes(searchValue);

      const matchesCategory =
        category === "All" ||
        product.category?.toLowerCase() === category.toLowerCase();

      return matchesSearch && matchesCategory;
    });

    setFilteredProducts(filtered);
  }, [search, category, products]);

  // GET CATEGORIES
  const categories = [
    "All",
    ...new Set(
      products
        .map((product) => product.category)
        .filter((category) => category)
    ),
  ];

  return (
    <main className="min-h-screen bg-gray-100">

      <Navbar />

      {/* PRODUCTS */}

      <section className="max-w-7xl mx-auto px-6 py-10">

        {/* TITLE */}

        <div className="mb-8">

          <h2 className="text-3xl font-bold">
            Products
          </h2>

          <p className="text-gray-500 mt-2">
            Discover products from our sellers.
          </p>

        </div>

        {/* SEARCH + FILTER */}

        <div className="bg-white rounded-xl shadow p-5 mb-8">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* SEARCH */}

            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Products
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by product name, description or category..."
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            {/* CATEGORY */}

            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border rounded-lg px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
              >

                {categories.map((item) => (

                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>

                ))}

              </select>

            </div>

          </div>

          {/* FILTER RESULT */}

          {!loading && !error && (

            <div className="mt-4 text-sm text-gray-500">

              {filteredProducts.length} product(s) found.

            </div>

          )}

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

        {!loading &&
          !error &&
          filteredProducts.length === 0 && (

            <div className="bg-white rounded-xl shadow p-10 text-center">

              <h3 className="text-2xl font-semibold">
                No products found
              </h3>

              <p className="text-gray-500 mt-2">
                Try changing your search or category.
              </p>

            </div>

          )}

        {/* PRODUCT GRID */}

        {!loading &&
          !error &&
          filteredProducts.length > 0 && (

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

              {filteredProducts.map((product) => (

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

                      {product.category && (

                        <span className="inline-block mt-3 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                          {product.category}
                        </span>

                      )}

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