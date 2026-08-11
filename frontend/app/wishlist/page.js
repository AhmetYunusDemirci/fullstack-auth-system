"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import API_URL from "../../lib/api";
import Navbar from "../../components/Navbar";
import Button from "../../components/Button";

export default function WishlistPage() {
  const router = useRouter();
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadWishlist = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Failed to load wishlist.");
        return;
      }

      setWishlist(data.wishlist);
    } catch (err) {
      setError("Server Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleRemove = async (productId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/wishlist/toggle`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        // Ürünü sildikten sonra listeyi yenile
        loadWishlist();
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8fc]">
        <Navbar />
        <div className="mx-auto max-w-7xl px-5 py-10 text-center text-gray-500">Loading your favorites...</div>
      </main>
    );
  }

  const products = wishlist?.products || [];

  return (
    <main className="min-h-screen bg-[#f7f8fc]">
      <Navbar />

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl flex items-center gap-3">
            <span className="text-red-500">❤️</span> My Wishlist
          </h1>
          <p className="mt-2 text-gray-500">
            Products you've saved for later.
          </p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600 font-medium">{error}</div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl border border-gray-200 bg-white px-6 py-20 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-4xl">❤️</div>
            <h2 className="mt-7 text-2xl font-bold tracking-tight text-gray-900">Your wishlist is empty</h2>
            <p className="mx-auto mt-3 max-w-md text-gray-500">Save items you love to your wishlist and review them anytime.</p>
            <Link href="/"><Button className="mt-8">Explore Products</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <div key={product._id} className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                
                {/* Remove Button */}
                <button 
                  onClick={() => handleRemove(product._id)}
                  className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-500 shadow-sm transition hover:bg-red-50 hover:scale-110"
                  title="Remove from wishlist"
                >
                  ✕
                </button>

                {/* Image */}
                <Link href={`/products/${product._id}`} className="relative h-48 w-full bg-gray-100 overflow-hidden">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-gray-400">No Image</div>
                  )}
                </Link>

                {/* Content */}
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{product.name}</h3>
                  <p className="mt-1 text-xs text-gray-500">{product.category || "General"}</p>
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <span className="text-lg font-extrabold text-gray-900">${product.price.toFixed(2)}</span>
                    <Link href={`/products/${product._id}`}>
                      <span className="text-xs font-bold text-blue-600 hover:underline">View</span>
                    </Link>
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