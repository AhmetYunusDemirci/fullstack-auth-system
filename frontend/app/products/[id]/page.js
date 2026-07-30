"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import API_URL from "../../../lib/api";

export default function ProductDetailPage() {
  const params = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/products/${params.id}`
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Product could not be loaded.");
          return;
        }

        setProduct(data.product);
      } catch (error) {
        console.error(error);
        setError("Server Error");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadProduct();
    }
  }, [params.id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <h2 className="text-2xl font-semibold">
          Loading product...
        </h2>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">

        <div className="bg-white p-8 rounded-xl shadow text-center">

          <p className="text-red-600 text-lg">
            {error}
          </p>

          <Link
            href="/"
            className="inline-block mt-5 bg-blue-600 text-white px-5 py-3 rounded-lg"
          >
            Back to Products
          </Link>

        </div>

      </main>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-100">

      {/* HEADER */}

      <header className="bg-white shadow-sm">

        <div className="max-w-7xl mx-auto px-6 py-5">

          <div className="flex justify-between items-center">

            <Link
              href="/"
              className="text-3xl font-bold text-blue-600"
            >
              MyStore
            </Link>

            <Link
              href="/"
              className="bg-gray-800 text-white px-5 py-2 rounded-lg hover:bg-gray-900"
            >
              Products
            </Link>

          </div>

        </div>

      </header>

      {/* PRODUCT DETAIL */}

      <section className="max-w-6xl mx-auto px-6 py-12">

        <Link
          href="/"
          className="text-blue-600 hover:underline"
        >
          ← Back to Products
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mt-6">

          <div className="grid grid-cols-1 md:grid-cols-2">

            {/* IMAGE */}

            <div className="bg-gray-200 min-h-[450px] flex items-center justify-center">

              {product.image ? (

                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full max-h-[550px] object-cover"
                />

              ) : (

                <span className="text-gray-400 text-xl">
                  No Image Available
                </span>

              )}

            </div>

            {/* INFORMATION */}

            <div className="p-8">

              <h1 className="text-4xl font-bold">
                {product.name}
              </h1>

              <p className="text-3xl font-bold text-blue-600 mt-5">
                ${product.price}
              </p>

              <div className="mt-8">

                <h2 className="text-xl font-semibold">
                  Description
                </h2>

                <p className="text-gray-600 mt-3 leading-7">
                  {product.description}
                </p>

              </div>

              <div className="mt-8 border rounded-xl p-5 bg-gray-50">

                <p>
                  <span className="font-bold">
                    Stock:
                  </span>{" "}
                  {product.stock}
                </p>

                <p className="mt-3">

                  <span className="font-bold">
                    Seller:
                  </span>{" "}

                  {product.seller
                    ? `${product.seller.name} ${product.seller.surname}`
                    : "Unknown"}

                </p>

              </div>

              {/* ACTIONS */}

              <div className="flex gap-4 mt-8">

                <button
                  disabled={product.stock <= 0}
                  className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Add to Cart
                </button>

                <button
                  disabled={product.stock <= 0}
                  className="flex-1 bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>

              </div>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}