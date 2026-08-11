
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import API_URL from "../../../lib/api";
import Navbar from "../../../components/Navbar";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [cartError, setCartError] = useState("");
  const [showFullDescription, setShowFullDescription] = useState(false);

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

    setCartMessage("");
    setCartError("");

    if (!token) {
      setCartError(
        "Please login to add products to your cart."
      );

      setTimeout(() => {
        router.push("/login");
      }, 1200);

      return;
    }

    try {
      setAddingToCart(true);

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

        setCartError(
          "Your session has expired. Please login again."
        );

        setTimeout(() => {
          router.push("/login");
        }, 1200);

        return;
      }

      if (!response.ok) {
        setCartError(
          data.message ||
            "Product could not be added to cart."
        );

        return;
      }

      setCartMessage(
        "Product added to your cart successfully."
      );
    } catch (error) {
      console.error(error);
      setCartError("Server Error");
    } finally {
      setAddingToCart(false);
    }
  };

  // -------------------------
  // BUY NOW
  // -------------------------

  const handleBuyNow = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setCartError(
        "Please login before continuing."
      );

      setTimeout(() => {
        router.push("/login");
      }, 1200);

      return;
    }

    /*
     * Payment / order system is not implemented yet.
     * For now we send the user to the cart.
     */
    await handleAddToCart();

    setTimeout(() => {
      router.push("/cart");
    }, 700);
  };

  // -------------------------
  // LOADING
  // -------------------------

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Navbar />

        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="animate-pulse">

            <div className="h-4 bg-slate-200 rounded w-48 mb-8" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

              <div className="h-[520px] bg-slate-200 rounded-3xl" />

              <div className="space-y-6">

                <div className="h-6 bg-slate-200 rounded w-28" />

                <div className="h-12 bg-slate-200 rounded w-4/5" />

                <div className="h-10 bg-slate-200 rounded w-40" />

                <div className="h-32 bg-slate-200 rounded-2xl" />

                <div className="h-14 bg-slate-200 rounded-xl" />

                <div className="h-14 bg-slate-200 rounded-xl" />

              </div>

            </div>

          </div>
        </div>
      </main>
    );
  }

  // -------------------------
  // ERROR
  // -------------------------

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Navbar />

        <section className="min-h-[70vh] flex items-center justify-center px-6">

          <div className="max-w-md w-full bg-white border border-red-100 rounded-3xl shadow-xl p-10 text-center">

            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center text-3xl">
              !
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mt-6">
              Product unavailable
            </h2>

            <p className="text-slate-500 mt-3 leading-6">
              {error}
            </p>

            <Link
              href="/"
              className="inline-flex items-center justify-center mt-7 bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 transition"
            >
              ← Back to Products
            </Link>

          </div>

        </section>
      </main>
    );
  }

  if (!product) {
    return null;
  }

  const isInStock = product.stock > 0;

  return (
    <main className="min-h-screen bg-slate-50">

      <Navbar />

      {/* PAGE CONTENT */}

      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8 lg:py-12">

        {/* BREADCRUMB */}

        <div className="flex items-center gap-2 text-sm mb-8 overflow-x-auto whitespace-nowrap">

          <Link
            href="/"
            className="text-slate-500 hover:text-blue-600 transition"
          >
            Home
          </Link>

          <span className="text-slate-300">
            /
          </span>

          <span className="text-slate-500">
            {product.category || "Products"}
          </span>

          <span className="text-slate-300">
            /
          </span>

          <span className="text-slate-900 font-medium truncate max-w-[220px]">
            {product.name}
          </span>

        </div>

        {/* PRODUCT MAIN */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start">

          {/* IMAGE */}

          <div className="lg:sticky lg:top-8">

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

              <div className="aspect-square bg-slate-100 relative flex items-center justify-center overflow-hidden">

                {product.image ? (

                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition duration-500 hover:scale-105"
                  />

                ) : (

                  <div className="flex flex-col items-center justify-center text-slate-400">

                    <div className="text-6xl mb-4">
                      📦
                    </div>

                    <span className="font-medium">
                      No image available
                    </span>

                  </div>

                )}

                {/* STOCK BADGE */}

                <div className="absolute top-5 left-5">

                  {isInStock ? (

                    <span className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-sm text-emerald-700 px-4 py-2 rounded-full text-sm font-bold shadow-sm">

                      <span className="w-2 h-2 rounded-full bg-emerald-500" />

                      In Stock

                    </span>

                  ) : (

                    <span className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-sm text-red-700 px-4 py-2 rounded-full text-sm font-bold shadow-sm">

                      <span className="w-2 h-2 rounded-full bg-red-500" />

                      Out of Stock

                    </span>

                  )}

                </div>

              </div>

            </div>

            {/* BACK BUTTON */}

            <button
              onClick={() => router.back()}
              className="mt-5 text-sm font-semibold text-slate-500 hover:text-blue-600 transition"
            >
              ← Back to previous page
            </button>

          </div>

          {/* PRODUCT INFORMATION */}

          <div>

            {/* CATEGORY */}

            {product.category && (

              <span className="inline-flex items-center bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-full text-sm font-semibold">
                {product.category}
              </span>

            )}

            {/* NAME */}

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mt-5 leading-tight">
              {product.name}
            </h1>

            {/* PRICE */}

            <div className="mt-6 flex items-end gap-3">

              <span className="text-4xl font-extrabold text-slate-900">
                ${product.price}
              </span>

              <span className="text-sm text-slate-400 mb-1">
                USD
              </span>

            </div>

            {/* STOCK INFORMATION */}

            <div className="mt-5 flex items-center gap-3">

              {isInStock ? (

                <>
                  <span className="inline-flex items-center gap-2 text-emerald-700 font-semibold">

                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />

                    In stock

                  </span>

                  <span className="text-slate-300">
                    •
                  </span>

                  <span className="text-slate-500 text-sm">
                    {product.stock} available
                  </span>
                </>

              ) : (

                <span className="text-red-600 font-semibold">
                  Currently unavailable
                </span>

              )}

            </div>


            {/* DIVIDER */}

            <div className="border-t border-slate-200 my-8" />

            {/* PURCHASE AREA */}

            {isInStock && (

              <div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-5">

                  {/* QUANTITY */}

                  <div>

                    <p className="text-sm font-semibold text-slate-700 mb-2">
                      Quantity
                    </p>

                    <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white">

                      <button
                        type="button"
                        onClick={() =>
                          setQuantity((current) =>
                            Math.max(1, current - 1)
                          )
                        }
                        disabled={quantity <= 1}
                        className="w-11 h-11 flex items-center justify-center text-xl text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                      >
                        −
                      </button>

                      <span className="w-12 text-center font-bold text-slate-900">
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
                        disabled={
                          quantity >= product.stock
                        }
                        className="w-11 h-11 flex items-center justify-center text-xl text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                      >
                        +
                      </button>

                    </div>

                  </div>

                </div>

                {/* MESSAGES */}

                {cartMessage && (

                  <div className="mt-5 flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-4 rounded-xl">

                    <span className="text-lg">
                      ✓
                    </span>

                    <p className="font-medium">
                      {cartMessage}
                    </p>

                  </div>

                )}

                {cartError && (

                  <div className="mt-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 px-4 py-4 rounded-xl">

                    <span className="text-lg">
                      !
                    </span>

                    <p className="font-medium">
                      {cartError}
                    </p>

                  </div>

                )}

                {/* ACTION BUTTONS */}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">

                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-base hover:bg-blue-700 active:scale-[0.98] transition disabled:bg-slate-400 disabled:cursor-not-allowed shadow-sm"
                  >
                    {addingToCart
                      ? "Adding..."
                      : "Add to Cart"}
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={addingToCart}
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-base hover:bg-slate-800 active:scale-[0.98] transition disabled:bg-slate-400 disabled:cursor-not-allowed shadow-sm"
                  >
                    Buy Now
                  </button>

                </div>

              </div>

            )}

            {!isInStock && (

              <div className="bg-slate-100 border border-slate-200 rounded-2xl p-5">

                <p className="font-bold text-slate-800">
                  This product is currently out of stock.
                </p>

                <p className="text-sm text-slate-500 mt-1">
                  Please check back later.
                </p>

              </div>

            )}

            {/* SELLER */}

            {product.seller && (

              <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-5">

                <div className="flex items-center gap-4">

                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">

                    {product.seller.name
                      ? product.seller.name
                          .charAt(0)
                          .toUpperCase()
                      : "S"}

                  </div>

                  <div>

                    <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                      Sold by
                    </p>

                    <p className="font-bold text-slate-900">
                      {product.seller.name}{" "}
                      {product.seller.surname}
                    </p>

                    <p className="text-sm text-slate-500">
                      {product.seller.email}
                    </p>

                  </div>

                </div>

              </div>

            )}

            {/* TRUST FEATURES */}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">

              <div className="border border-slate-200 bg-white rounded-xl p-4">

                <div className="text-xl mb-2">
                  🔒
                </div>

                <p className="font-semibold text-sm">
                  Secure
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Safe shopping
                </p>

              </div>

              <div className="border border-slate-200 bg-white rounded-xl p-4">

                <div className="text-xl mb-2">
                  ✓
                </div>

                <p className="font-semibold text-sm">
                  Quality
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Verified listing
                </p>

              </div>

              <div className="border border-slate-200 bg-white rounded-xl p-4">

                <div className="text-xl mb-2">
                  ⚡
                </div>

                <p className="font-semibold text-sm">
                  Fast
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Easy checkout
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* DESCRIPTION SECTION */}

<div className="mt-12 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 lg:p-10">

  <h2 className="text-2xl font-bold text-slate-900">
    Product Description
  </h2>

  <div className="mt-5 border-t border-slate-100 pt-5">

    <p
      className={`text-slate-600 leading-8 max-w-4xl ${
        !showFullDescription
          ? "line-clamp-3"
          : ""
      }`}
    >
      {product.description ||
        "No description is available for this product."}
    </p>

    {product.description &&
      product.description.length > 180 && (

        <button
          type="button"
          onClick={() =>
            setShowFullDescription(
              (current) => !current
            )
          }
          className="mt-4 text-blue-600 font-semibold hover:text-blue-700 transition"
        >
          {showFullDescription
            ? "Show less"
            : "Read more"}
        </button>

      )}

  </div>

</div>

      </section>

    </main>
  );
}

