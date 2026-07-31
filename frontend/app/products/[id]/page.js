"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import API_URL from "../../../lib/api";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState("");

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
          setError(
            data.message || "Product could not be loaded."
          );
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

  // -------------------------
  // ADD TO CART
  // -------------------------

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login to add products to your cart.");
      router.push("/login");
      return;
    }

    try {
      setAddingToCart(true);
      setCartMessage("");

      const response = await fetch(`${API_URL}/cart`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          productId: product._id,
          quantity,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");

        alert("Your session has expired. Please login again.");

        router.push("/login");

        return;
      }

      if (!response.ok) {
        setCartMessage(
          data.message || "Product could not be added to cart."
        );

        return;
      }

      setCartMessage(
        "Product added to cart successfully."
      );
    } catch (error) {
      console.error(error);

      setCartMessage("Server Error");
    } finally {
      setAddingToCart(false);
    }
  };

  // -------------------------
  // LOADING
  // -------------------------

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-500">
          Loading product...
        </p>
      </main>
    );
  }

  // -------------------------
  // ERROR
  // -------------------------

  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">

          <h2 className="text-2xl font-bold text-red-600">
            Product Error
          </h2>

          <p className="text-gray-600 mt-3">
            {error}
          </p>

          <Link
            href="/"
            className="inline-block mt-6 bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
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

            <Link href="/">
              <h1 className="text-3xl font-bold text-blue-600">
                MyStore
              </h1>
            </Link>

            <div className="flex gap-3">

              <Link
                href="/"
                className="bg-gray-800 text-white px-5 py-2 rounded-lg hover:bg-gray-900"
              >
                Products
              </Link>

              <Link
                href="/cart"
                className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
              >
                My Cart
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

      {/* PRODUCT DETAIL */}

      <section className="max-w-6xl mx-auto px-6 py-10">

        <button
          onClick={() => router.back()}
          className="mb-6 text-blue-600 hover:underline"
        >
          ← Back
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

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

                <div className="text-gray-400 text-xl">
                  No Image
                </div>

              )}

            </div>

            {/* INFORMATION */}

            <div className="p-8">

              <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                {product.category}
              </span>

              <h1 className="text-4xl font-bold mt-5">
                {product.name}
              </h1>

              <p className="text-3xl font-bold text-blue-600 mt-5">
                ${product.price}
              </p>

              {/* DESCRIPTION */}

              <div className="mt-6 border rounded-xl p-5 bg-gray-50">

                <h2 className="font-bold text-lg mb-3">
                  Description
                </h2>

                <p className="text-gray-600 leading-7">
                  {product.description}
                </p>

              </div>

              {/* STOCK */}

              <div className="mt-6">

                <p className="font-semibold">
                  Stock:
                </p>

                <p
                  className={
                    product.stock > 0
                      ? "text-green-600 font-semibold mt-1"
                      : "text-red-600 font-semibold mt-1"
                  }
                >
                  {product.stock > 0
                    ? `${product.stock} products available`
                    : "Out of stock"}
                </p>

              </div>

              {/* QUANTITY */}

              {product.stock > 0 && (

                <div className="mt-6">

                  <label className="font-semibold">
                    Quantity
                  </label>

                  <div className="flex items-center gap-3 mt-2">

                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((current) =>
                          Math.max(1, current - 1)
                        )
                      }
                      className="w-10 h-10 bg-gray-200 rounded-lg text-xl hover:bg-gray-300"
                    >
                      -
                    </button>

                    <span className="text-xl font-semibold w-10 text-center">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((current) =>
                          Math.min(
                            product.stock,
                            current + 1
                          )
                        )
                      }
                      className="w-10 h-10 bg-gray-200 rounded-lg text-xl hover:bg-gray-300"
                    >
                      +
                    </button>

                  </div>

                </div>

              )}

              {/* SELLER */}

              {product.seller && (

                <div className="mt-6 border-t pt-6">

                  <h2 className="font-bold text-lg mb-3">
                    Seller
                  </h2>

                  <p>
                    <span className="font-semibold">
                      Name:
                    </span>{" "}
                    {product.seller.name}{" "}
                    {product.seller.surname}
                  </p>

                  <p className="text-gray-600 mt-1">
                    {product.seller.email}
                  </p>

                </div>

              )}

              {/* CART MESSAGE */}

              {cartMessage && (

                <div className="mt-6 bg-green-100 text-green-700 p-4 rounded-lg">
                  {cartMessage}
                </div>

              )}

              {/* ACTIONS */}

              <div className="flex gap-3 mt-8">

                <button
                  onClick={handleAddToCart}
                  disabled={
                    product.stock <= 0 ||
                    addingToCart
                  }
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {addingToCart
                    ? "Adding..."
                    : "Add to Cart"}
                </button>

                <button
                  disabled={product.stock <= 0}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
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