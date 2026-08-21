"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import API_URL from "../../../lib/api";
import Navbar from "../../../components/Navbar";

export default function SellerProfilePage() {
  const params = useParams();
  const [products, setProducts] = useState([]);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSellerProducts = async () => {
      try {
        setLoading(true);
        // Backend'e satıcı ID'sini göndererek sadece onun ürünlerini çekiyoruz
        const res = await fetch(`${API_URL}/products?seller=${params.id}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to load seller's products.");

        setProducts(data.products || []);
        
        // Satıcı bilgisini ürünlerin içinden alıyoruz
        if (data.products && data.products.length > 0) {
          setSeller(data.products[0].seller);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchSellerProducts();
  }, [params.id]);

  return (
    <main className="min-h-screen bg-[#f7f8fc]">
      <Navbar />

      {/* SELLER HERO BÖLÜMÜ */}
      <section className="bg-white border-b border-gray-200 pt-10 pb-16">
        <div className="mx-auto max-w-7xl px-6">
          {loading ? (
            <div className="animate-pulse flex items-center gap-5">
              <div className="h-24 w-24 rounded-full bg-gray-200"></div>
              <div className="space-y-3">
                <div className="h-8 w-48 rounded bg-gray-200"></div>
                <div className="h-4 w-32 rounded bg-gray-200"></div>
              </div>
            </div>
          ) : seller ? (
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-4xl font-bold text-white shadow-xl shadow-blue-600/20">
                {seller.name.charAt(0)}{seller.surname.charAt(0)}
              </div>
              <div className="pt-2">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">
                  <span className="text-sm">🛍️</span> Official Store
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900">{seller.name} {seller.surname}</h1>
                <p className="mt-2 text-gray-500">Discover all products published by this verified seller.</p>
                <div className="mt-4 flex items-center justify-center sm:justify-start gap-4 text-sm font-semibold text-gray-600">
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <span className="text-gray-900 font-bold">{products.length}</span> Products
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <h1 className="text-2xl font-bold text-gray-900">Seller Store</h1>
              <p className="text-gray-500 mt-2">This seller currently has no active products.</p>
            </div>
          )}
        </div>
      </section>

      {/* SELER'IN ÜRÜNLERİ (PRODUCT GRID) */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <h2 className="text-xl font-bold text-gray-900 mb-8 border-b border-gray-200 pb-4">
          All Products from {seller?.name || "this Seller"}
        </h2>
        
        {loading ? (
           <div className="text-center text-gray-500 animate-pulse">Loading products...</div>
        ) : error ? (
           <div className="text-red-500 text-center">{error}</div>
        ) : products.length === 0 ? (
           <div className="text-center text-gray-500 py-10 bg-white rounded-2xl border border-gray-200">No products found for this seller.</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <Link href={`/products/${product._id}`} key={product._id} className="group">
                <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-xl hover:-translate-y-1">
                  <div className="relative h-60 bg-gray-100 overflow-hidden">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">No Image</div>
                    )}
                    {product.stock === 0 && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">Sold Out</div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="truncate text-lg font-bold text-gray-900 transition group-hover:text-blue-600">{product.name}</h3>
                    <p className="mt-2 text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</p>
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