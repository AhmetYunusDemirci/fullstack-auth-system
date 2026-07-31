"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import API_URL from "../../lib/api";

export default function CartPage() {
  const router = useRouter();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // -------------------------
  // LOAD CART
  // -------------------------

  const loadCart = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/cart`, {
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
        setError(
          data.message || "Cart could not be loaded."
        );
        return;
      }

      setCart(data.cart);
    } catch (error) {
      console.error(error);
      setError("Server Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  // -------------------------
  // UPDATE QUANTITY
  // -------------------------

  const updateQuantity = async (
    productId,
    newQuantity
  ) => {
    if (newQuantity < 1) {
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${API_URL}/cart/${productId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            quantity: newQuantity,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Quantity could not be updated."
        );

        return;
      }

      setCart(data.cart);
    } catch (error) {
      console.error(error);
      alert("Server Error");
    }
  };

  // -------------------------
  // REMOVE PRODUCT
  // -------------------------

  const removeFromCart = async (productId) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${API_URL}/cart/${productId}`,
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
            "Product could not be removed."
        );

        return;
      }

      setCart(data.cart);
    } catch (error) {
      console.error(error);
      alert("Server Error");
    }
  };

  // -------------------------
  // CALCULATE TOTAL
  // -------------------------

  const calculateTotal = () => {
    if (!cart || !cart.items) {
      return 0;
    }

    return cart.items.reduce(
      (total, item) => {
        if (!item.product) {
          return total;
        }

        return (
          total +
          item.product.price * item.quantity
        );
      },
      0
    );
  };

  // -------------------------
  // LOADING
  // -------------------------

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-500">
          Loading cart...
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
            Cart Error
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

  const items = cart?.items || [];

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
                href="/profile"
                className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700"
              >
                Profile
              </Link>

            </div>

          </div>

        </div>

      </header>

      {/* CART */}

      <section className="max-w-7xl mx-auto px-6 py-10">

        <div className="mb-8">

          <h1 className="text-4xl font-bold">
            My Cart
          </h1>

          <p className="text-gray-500 mt-2">
            Review the products in your cart.
          </p>

        </div>

        {/* EMPTY CART */}

        {items.length === 0 ? (

          <div className="bg-white rounded-2xl shadow p-12 text-center">

            <div className="text-6xl mb-5">
              🛒
            </div>

            <h2 className="text-2xl font-bold">
              Your cart is empty
            </h2>

            <p className="text-gray-500 mt-2">
              Add some products to your cart.
            </p>

            <Link
              href="/"
              className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Browse Products
            </Link>

          </div>

        ) : (

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* CART ITEMS */}

            <div className="lg:col-span-2 space-y-5">

              {items.map((item) => {

                if (!item.product) {
                  return null;
                }

                const product = item.product;

                const itemTotal =
                  product.price *
                  item.quantity;

                return (

                  <div
                    key={product._id}
                    className="bg-white rounded-2xl shadow p-5"
                  >

                    <div className="flex flex-col md:flex-row gap-5">

                      {/* IMAGE */}

                      <Link
                        href={`/products/${product._id}`}
                        className="w-full md:w-40 h-40 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0"
                      >

                        {product.image ? (

                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover hover:scale-105 transition"
                          />

                        ) : (

                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image
                          </div>

                        )}

                      </Link>

                      {/* INFO */}

                      <div className="flex-1">

                        <div className="flex justify-between gap-4">

                          <div>

                            <Link
                              href={`/products/${product._id}`}
                            >
                              <h2 className="text-xl font-bold hover:text-blue-600">
                                {product.name}
                              </h2>
                            </Link>

                            <p className="text-gray-500 mt-1">
                              {product.category}
                            </p>

                          </div>

                          <button
                            onClick={() =>
                              removeFromCart(
                                product._id
                              )
                            }
                            className="text-red-600 hover:text-red-800 font-semibold"
                          >
                            Remove
                          </button>

                        </div>

                        <p className="text-blue-600 font-bold text-xl mt-4">
                          ${product.price}
                        </p>

                        {/* QUANTITY */}

                        <div className="flex justify-between items-center mt-5">

                          <div>

                            <p className="text-sm text-gray-500 mb-2">
                              Quantity
                            </p>

                            <div className="flex items-center gap-3">

                              <button
                                onClick={() =>
                                  updateQuantity(
                                    product._id,
                                    item.quantity - 1
                                  )
                                }
                                disabled={
                                  item.quantity <= 1
                                }
                                className="w-9 h-9 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-40"
                              >
                                -
                              </button>

                              <span className="font-semibold text-lg w-8 text-center">
                                {item.quantity}
                              </span>

                              <button
                                onClick={() =>
                                  updateQuantity(
                                    product._id,
                                    item.quantity + 1
                                  )
                                }
                                disabled={
                                  item.quantity >=
                                  product.stock
                                }
                                className="w-9 h-9 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-40"
                              >
                                +
                              </button>

                            </div>

                          </div>

                          {/* ITEM TOTAL */}

                          <div className="text-right">

                            <p className="text-sm text-gray-500">
                              Total
                            </p>

                            <p className="text-2xl font-bold">
                              ${itemTotal}
                            </p>

                          </div>

                        </div>

                      </div>

                    </div>

                  </div>

                );
              })}

            </div>

            {/* SUMMARY */}

            <div>

              <div className="bg-white rounded-2xl shadow p-6 sticky top-6">

                <h2 className="text-2xl font-bold">
                  Order Summary
                </h2>

                <div className="border-t mt-5 pt-5">

                  <div className="flex justify-between text-gray-600">

                    <span>
                      Products
                    </span>

                    <span>
                      {items.reduce(
                        (total, item) =>
                          total +
                          item.quantity,
                        0
                      )}
                    </span>

                  </div>

                  <div className="flex justify-between items-center mt-5">

                    <span className="text-lg font-semibold">
                      Total
                    </span>

                    <span className="text-3xl font-bold text-blue-600">
                      ${calculateTotal()}
                    </span>

                  </div>

                </div>

                <button
                  disabled={items.length === 0}
                  className="w-full mt-6 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:bg-gray-400"
                >
                  Buy Now
                </button>

                <Link
                  href="/"
                  className="block text-center mt-4 text-blue-600 hover:underline"
                >
                  Continue Shopping
                </Link>

              </div>

            </div>

          </div>

        )}

      </section>

    </main>
  );
}