"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import API_URL from "../../lib/api";
import Navbar from "../../components/Navbar";

export default function BestSellersPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const response = await fetch(`${API_URL}/products/bestsellers/all`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error("Failed to fetch best sellers", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-xl font-bold text-orange-400 animate-pulse">🔥 Loading Top Products...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      {/* HERO SECTION */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-500 py-16 text-center text-white">
        <div className="mx-auto max-w-3xl px-6">
          <span className="mb-4 inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-bold tracking-widest backdrop-blur-sm">
            🔥 TRENDING NOW
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Wall of Fame</h1>
          <p className="mt-4 text-lg text-orange-100">
            Discover the most loved and frequently purchased items by our community. Grab them before they run out!
          </p>
        </div>
      </div>

      {/* PRODUCTS GRID */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
            <span className="text-5xl">🛍️</span>
            <h3 className="mt-4 text-xl font-bold text-slate-900">No sales yet!</h3>
            <p className="text-slate-500 mt-2">When products are sold, they will appear on this wall.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product, index) => (
              <Link href={`/products/${product._id}`} key={product._id} className="group">
                <article className="relative h-full flex flex-col overflow-hidden rounded-2xl border-2 border-orange-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:border-orange-400 hover:-translate-y-1">
                  
                  {/* SIRALAMA NUMARASI (1, 2, 3...) */}
                  <div className="absolute top-3 left-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white font-black shadow-md border-2 border-white">
                    {index + 1}
                  </div>

                  <div className="relative h-60 bg-gray-100 overflow-hidden shrink-0">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">No Image</div>
                    )}
                  </div>
                  
                  <div className="flex flex-col flex-grow p-5">
                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-amber-400 text-sm">★</span>
                      <span className="text-xs font-bold text-gray-600">{product.rating ? product.rating.toFixed(1) : "New"}</span>
                      <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full ml-auto">
                        {product.sold} Sold
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 transition group-hover:text-orange-600 line-clamp-2">{product.name}</h3>
                    
                    <div className="mt-auto pt-4 flex items-end justify-between">
                      <p className="text-2xl font-extrabold text-gray-900">${product.price}</p>
                      <span className="text-sm font-semibold text-blue-600 group-hover:underline">View Details</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}