"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import API_URL from "../../lib/api";
import Navbar from "../../components/Navbar";
import Button from "../../components/Button"; // Senin yazdığın buton bileşeni

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
        setError(data.message || "Cart could not be loaded.");
        return;
      }

      setCart(data.cart);
    } catch (error) {
      console.error(error);
      setError("Unable to connect to the server.");
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
  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/cart/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Quantity could not be updated.");
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
      const response = await fetch(`${API_URL}/cart/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Product could not be removed.");
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
    if (!cart || !cart.items) return 0;

    return cart.items.reduce((total, item) => {
      if (!item.product) return total;
      return total + item.product.price * item.quantity;
    }, 0);
  };

  // -------------------------
  // LOADING STATE (Skeleton)
  // -------------------------
  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8fc]">
        <Navbar />
        <section className="mx-auto max-w-7xl px-6 py-10">
          <div className="skeleton mb-2 h-10 w-48 rounded" />
          <div className="skeleton mb-8 h-5 w-64 rounded" />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-5 lg:col-span-2">
              {[1, 2].map((item) => (
                <div key={item} className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-5">
                  <div className="flex flex-col gap-5 md:flex-row">
                    <div className="skeleton h-40 w-full rounded-xl md:w-40 flex-shrink-0" />
                    <div className="flex-1 space-y-4 py-2">
                      <div className="skeleton h-6 w-3/4 rounded" />
                      <div className="skeleton h-4 w-1/4 rounded" />
                      <div className="skeleton mt-4 h-8 w-1/3 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white h-72">
              <div className="skeleton h-full w-full" />
            </div>
          </div>
        </section>
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
        <section className="mx-auto max-w-7xl px-6 py-10">
          <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 font-bold text-xl">
              !
            </div>
            <h3 className="mt-4 text-xl font-bold text-gray-900">Something went wrong</h3>
            <p className="mt-2 text-gray-600">{error}</p>
            <Link href="/">
              <Button className="mt-6 inline-flex w-auto px-6">Back to Products</Button>
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const items = cart?.items || [];

  return (
    <main className="min-h-screen bg-[#f7f8fc]">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">My Cart</h1>
          <p className="mt-2 text-gray-500">Review the products in your cart.</p>
        </div>

        {/* EMPTY CART */}
        {items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-3xl">
              🛒
            </div>
            <h3 className="mt-5 text-2xl font-bold text-gray-900">Your cart is empty</h3>
            <p className="mt-2 text-gray-500">Looks like you haven't added anything yet.</p>
            <Link href="/">
              <Button className="mt-6 inline-flex w-auto px-8">Browse Products</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* CART ITEMS */}
            <div className="space-y-5 lg:col-span-2">
              {items.map((item) => {
                if (!item.product) return null;

                const product = item.product;
                const itemTotal = product.price * item.quantity;

                return (
                  <div key={product._id} className="rounded-2xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-sm">
                    <div className="flex flex-col gap-5 md:flex-row">
                      
                      {/* IMAGE */}
                      <Link href={`/products/${product._id}`} className="group h-40 w-full flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 md:w-40">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                            No Image
                          </div>
                        )}
                      </Link>

                      {/* INFO */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <Link href={`/products/${product._id}`}>
                                <h2 className="text-lg font-bold text-gray-900 transition hover:text-blue-600">
                                  {product.name}
                                </h2>
                              </Link>
                              <p className="mt-1 text-sm text-gray-500">{product.category}</p>
                            </div>
                            <button
                              onClick={() => removeFromCart(product._id)}
                              className="text-sm font-semibold text-red-500 transition hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                          <p className="mt-3 text-xl font-bold text-blue-600">${product.price}</p>
                        </div>

                        {/* QUANTITY & TOTAL */}
                        <div className="mt-4 flex items-end justify-between border-t border-gray-100 pt-4">
                          <div>
                            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                              Quantity
                            </p>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => updateQuantity(product._id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition hover:bg-gray-200 disabled:opacity-40"
                              >
                                -
                              </button>
                              <span className="w-6 text-center font-semibold text-gray-900">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(product._id, item.quantity + 1)}
                                disabled={item.quantity >= product.stock}
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition hover:bg-gray-200 disabled:opacity-40"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                              Total
                            </p>
                            <p className="text-lg font-bold text-gray-900">${itemTotal.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SUMMARY */}
            <div className="lg:sticky lg:top-6 lg:h-fit">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
                
                <div className="mt-5 space-y-4 border-t border-gray-100 pt-5 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Products ({items.reduce((total, item) => total + item.quantity, 0)})</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-emerald-600">Free</span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-5">
                  <span className="text-base font-semibold text-gray-900">Total</span>
                  <span className="text-3xl font-bold tracking-tight text-blue-600">
                    ${calculateTotal().toFixed(2)}
                  </span>
                </div>

                <Button 
                  disabled={items.length === 0} 
                  variant="accent" 
                  size="lg" 
                  className="mt-8"
                >
                  Proceed to Checkout
                </Button>

                <Link href="/" className="mt-4 block text-center text-sm font-medium text-blue-600 transition hover:text-blue-700 hover:underline">
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