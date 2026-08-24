"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import API_URL from "../lib/api";
import Navbar from "../components/Navbar";

// Alt bileşeni Suspense ile sarmalamamız gerektiği için sayfayı ikiye bölüyoruz
function HomeContent() {
  const searchParams = useSearchParams(); // YENİ: URL'i dinler
  const categoryFromUrl = searchParams.get("category"); // URL'deki ?category= değerini alır

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  // YENİ: URL'de bir kategori parametresi varsa onu uygula ve ekrana kaydır
  useEffect(() => {
    if (categoryFromUrl) {
      setCategory(categoryFromUrl); // Dropdown'ı seçilen kategoriyle eşitle
      
      // Müşteri menüden tıkladığında otomatik olarak ürünlere (aşağıya) kaysın
      setTimeout(() => {
        document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      setCategory("All");
    }
  }, [categoryFromUrl]);

  // ... (Geri kalan kodların aynı şekilde devam edecek)

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // --- YENİ FİLTRE STATE'LERİ ---
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState("newest");

  // Filtreleri sıfırlama fonksiyonu
  const resetFilters = () => {
    setSearch("");
    setCategory("All");
    setMinPrice("");
    setMaxPrice("");
    setInStock(false);
    setSort("newest");
  };

  // Kategorileri tutacağımız state
  const [categories, setCategories] = useState(["All"]);
  const [bestSellers, setBestSellers] = useState([]);
  const [bestSellersLoading, setBestSellersLoading] = useState(true);

  // Çok satanları getiren fonksiyon
  const loadBestSellers = async () => {
    try {
      const response = await fetch(`${API_URL}/products/bestsellers/top`);
      if (response.ok) {
        const data = await response.json();
        setBestSellers(data.products || []);
      }
    } catch (err) {
      console.error("Çok satanlar yüklenemedi", err);
    } finally {
      setBestSellersLoading(false);
    }
  };

  // 1. Sadece ilk açılışta tüm kategorileri getiren fonksiyon
  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      if (response.ok) {
        const data = await response.json();
        const uniqueCategories = [
          "All",
          ...new Set(data.products.map((p) => p.category).filter(Boolean)),
        ];
        setCategories(uniqueCategories);
      }
    } catch (err) {
      console.error("Kategoriler yüklenemedi", err);
    }
  };

 // 2. Arama ve Kategori parametreleriyle ürünleri getiren fonksiyon
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const queryParams = new URLSearchParams();
      if (search) queryParams.append("search", search);
      if (category && category !== "All") queryParams.append("category", category);
      
      // --- YENİ FİLTRE PARAMETRELERİ ---
      if (minPrice) queryParams.append("minPrice", minPrice);
      if (maxPrice) queryParams.append("maxPrice", maxPrice);
      if (inStock) queryParams.append("inStock", "true");
      if (sort) queryParams.append("sort", sort);
      // ---------------------------------

      const response = await fetch(`${API_URL}/products?${queryParams.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Products could not be loaded.");
        return;
      }

      setProducts(data.products || []);
    } catch (error) {
      console.error(error);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }, [search, category, minPrice, maxPrice, inStock, sort]); // Bağımlılıklar (Dependencies) güncellendi
// 1. Sayfa yüklendiğinde kategorileri çek
  // Sayfa yüklendiğinde kategorileri ve çok satanları çek
  useEffect(() => {
    loadCategories();
    loadBestSellers(); // YENİ
  }, []);

  // 2. Filtreler değiştiğinde ürünleri yeniden çek (Debounce ile)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadProducts();
    }, 300); // Kullanıcı yazarken her harfte API'yi yormamak için 300ms bekler

    return () => clearTimeout(delayDebounceFn);
  }, [loadProducts]);
  return (
    <main className="min-h-screen bg-[#f7f8fc]">

      <Navbar />

      {/* HERO */}

      <section className="relative overflow-hidden bg-[#0f172a]">

        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-32 -right-20 h-96 w-96 rounded-full bg-blue-500 blur-3xl" />
          <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-indigo-500 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28">

          <div className="max-w-3xl">

            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-blue-200 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Discover something you love
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Everything you need,
              <span className="block text-blue-400">
                all in one place.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Explore products from trusted sellers and discover
              great deals made for everyday life.
            </p>

            {/* HERO SEARCH */}

            <div className="mt-9 max-w-2xl">

              <div className="flex items-center rounded-2xl bg-white p-2 shadow-2xl">

                <div className="flex h-12 w-12 items-center justify-center text-gray-400">

                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>

                </div>

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search for products..."
                  className="h-12 flex-1 bg-transparent px-2 text-gray-900 outline-none placeholder:text-gray-400"
                />

                <button
                  onClick={() =>
                    document
                      .getElementById("products")
                      ?.scrollIntoView({
                        behavior: "smooth",
                      })
                  }
                  className="hidden rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 sm:block"
                >
                  Search
                </button>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* TRUST BAR */}

      <section className="border-b border-gray-200 bg-white">

        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-gray-200 px-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0">

          <div className="flex items-center gap-4 py-5 sm:px-8">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 3 4 7v5c0 5 3.5 8 8 9 4.5-1 8-4 8-9V7l-8-4Z" />
                <path d="m9 12 2 2 4-4" />
              </svg>

            </div>

            <div>
              <p className="font-semibold text-gray-900">
                Secure Shopping
              </p>

              <p className="text-sm text-gray-500">
                Safe and protected
              </p>
            </div>

          </div>

          <div className="flex items-center gap-4 py-5 sm:px-8">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">

              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 7h11v10H3z" />
                <path d="M14 10h4l3 3v4h-7z" />
                <circle cx="7" cy="19" r="2" />
                <circle cx="17" cy="19" r="2" />
              </svg>

            </div>

            <div>
              <p className="font-semibold text-gray-900">
                Trusted Sellers
              </p>

              <p className="text-sm text-gray-500">
                Quality products
              </p>
            </div>

          </div>

          <div className="flex items-center gap-4 py-5 sm:px-8">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">

              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2v20" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
              </svg>

            </div>

            <div>
              <p className="font-semibold text-gray-900">
                Great Value
              </p>

              <p className="text-sm text-gray-500">
                Competitive prices
              </p>
            </div>

          </div>

        </div>

      </section>
  {/* BEST SELLERS (ÇOK SATANLAR) */}
      {!bestSellersLoading && bestSellers.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pt-16 lg:pt-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-600 mb-3 border border-orange-200">
                <span className="text-sm">🔥</span> Trending Now
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Best Sellers</h2>
            </div>
            {/* Animasyonlu ateş ikonu veya link eklenebilir */}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {bestSellers.map((product) => (
              <Link href={`/products/${product._id}`} key={`best-${product._id}`} className="group">
                <article className="relative overflow-hidden rounded-2xl border-2 border-orange-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:border-orange-300 hover:-translate-y-1">
                  
                  {/* Satış Rozeti (Top Seller) */}
                  <div className="absolute top-0 right-0 z-10">
                     <div className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-bl-xl flex items-center gap-1 shadow-sm">
                       🔥 Top Seller
                     </div>
                  </div>

                  <div className="relative h-56 bg-gray-100 overflow-hidden">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">No Image</div>
                    )}
                  </div>
                  
                  <div className="p-5">
                    {/* Yıldız Gösterimi (Opsiyonel) */}
                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-amber-400 text-sm">★</span>
                      <span className="text-xs font-bold text-gray-600">{product.rating ? product.rating.toFixed(1) : "New"}</span>
                      {product.sold > 0 && <span className="text-[10px] text-gray-400 ml-1">({product.sold} sold)</span>}
                    </div>
                    
                    <h3 className="truncate text-lg font-bold text-gray-900 transition group-hover:text-orange-600">{product.name}</h3>
                    <div className="mt-4 flex items-end justify-between">
                      <p className="text-2xl font-extrabold text-gray-900">${product.price}</p>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}
      {/* -------------------------------------- */}
      {/* PRODUCTS */}

      <section
        id="products"
        className="mx-auto max-w-7xl px-6 py-14 lg:py-20"
      >

        {/* SECTION HEADER */}

        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

          <div>

            <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
              Marketplace
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Explore our products
            </h2>

            <p className="mt-2 text-gray-500">
              Find products selected from our marketplace.
            </p>

          </div>

          {!loading && !error && (
            <div className="text-sm text-gray-500">
              <span className="font-semibold text-gray-900">
                {products.length}
              </span>{" "}
              products found
            </div>
          )}

        </div>

        {/* FILTERS */}

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all">
          
          {/* ÜST SATIR: ARAMA VE KATEGORİ */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            
            <div className="relative flex-1">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-medium text-gray-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 lg:w-52"
            >
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>

          </div>

          {/* ALT SATIR: GELİŞMİŞ FİLTRELER */}
          <div className="mt-4 flex flex-col flex-wrap gap-4 border-t border-gray-100 pt-4 md:flex-row md:items-center md:justify-between">
            
            {/* SOL KISIM: Fiyat ve Stok */}
            <div className="flex flex-wrap items-center gap-5">
              
              {/* Fiyat Aralığı */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Price:</span>
                <input
                  type="number"
                  placeholder="Min $"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="h-9 w-20 rounded-lg border border-gray-200 bg-gray-50 px-2 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max $"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="h-9 w-20 rounded-lg border border-gray-200 bg-gray-50 px-2 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="hidden h-5 w-px bg-gray-200 md:block"></div>

              {/* Stok Durumu */}
              <label className="flex cursor-pointer items-center gap-2 group">
                <div className={`flex h-5 w-9 items-center rounded-full p-1 transition-colors duration-300 ${inStock ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <div className={`h-3 w-3 rounded-full bg-white transition-transform duration-300 ${inStock ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </div>
                <input type="checkbox" className="hidden" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />
                <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">In Stock Only</span>
              </label>

            </div>

            {/* SAĞ KISIM: Sıralama ve Temizle */}
            <div className="flex items-center gap-4">
              
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-9 rounded-lg border border-gray-200 bg-transparent px-3 text-sm font-semibold text-gray-700 outline-none transition focus:border-blue-500"
              >
                <option value="newest">Latest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="oldest">Oldest First</option>
              </select>

              {(search || category !== "All" || minPrice || maxPrice || inStock || sort !== "newest") && (
                <button
                  onClick={resetFilters}
                  className="text-sm font-bold text-red-500 transition hover:text-red-700"
                >
                  Clear All
                </button>
              )}

            </div>
          </div>
        </div>

        {/* LOADING */}

        {loading && (

          <div className="grid grid-cols-1 gap-6 pt-10 sm:grid-cols-2 lg:grid-cols-4">

            {[1, 2, 3, 4].map((item) => (

              <div
                key={item}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
              >

                <div className="skeleton h-64" />

                <div className="space-y-4 p-5">

                  <div className="skeleton h-5 w-3/4 rounded" />

                  <div className="skeleton h-4 w-full rounded" />

                  <div className="skeleton h-4 w-2/3 rounded" />

                  <div className="skeleton h-8 w-1/3 rounded" />

                </div>

              </div>

            ))}

          </div>

        )}

        {/* ERROR */}

        {!loading && error && (

          <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-10 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">

              !

            </div>

            <h3 className="mt-4 text-xl font-bold text-gray-900">
              Something went wrong
            </h3>

            <p className="mt-2 text-gray-600">
              {error}
            </p>

            <button
              onClick={loadProducts}
              className="mt-6 rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white transition hover:bg-gray-800"
            >
              Try Again
            </button>

          </div>

        )}

        {/* EMPTY */}

        {!loading &&
          !error && products.length === 0 && (

            <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-14 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl">
                🔎
              </div>

              <h3 className="mt-5 text-2xl font-bold text-gray-900">
                No products found
              </h3>

              <p className="mt-2 text-gray-500">
                Try another search term or category.
              </p>

             <button
                onClick={resetFilters}
                className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 shadow-lg shadow-blue-600/20"
              >
                Clear All Filters
              </button>

            </div>

          )}

        {/* PRODUCT GRID */}

        {!loading &&
          !error && products.length > 0 && (

            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

              {products.map((product) => (

                <Link
                  href={`/products/${product._id}`}
                  key={product._id}
                  className="group"
                >

                  <article className="product-card overflow-hidden rounded-2xl border border-gray-200 bg-white">

                    {/* IMAGE */}

                    <div className="relative h-64 overflow-hidden bg-gray-100">

                      {product.image ? (

                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                        />

                      ) : (

                        <div className="flex h-full items-center justify-center text-gray-400">
                          No Image
                        </div>

                      )}

                      {/* STOCK BADGE */}

                      <div className="absolute left-4 top-4">

                        {product.stock > 0 ? (

                          <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-emerald-600 shadow-sm backdrop-blur">
                            In Stock
                          </span>

                        ) : (

                          <span className="rounded-full bg-red-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm">
                            Sold Out
                          </span>

                        )}

                      </div>

                      {/* CATEGORY */}

                      {product.category && (

                        <div className="absolute right-4 top-4">

                          <span className="rounded-full bg-gray-900/80 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
                            {product.category}
                          </span>

                        </div>

                      )}

                      {/* VIEW */}

                      <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/60 to-transparent px-4 pb-4 pt-12 transition duration-300 group-hover:translate-y-0">

                        <span className="text-sm font-semibold text-white">
                          View product →
                        </span>

                      </div>

                    </div>

                    {/* INFO */}

                    <div className="p-5">

                      <h3 className="truncate text-lg font-bold text-gray-900 transition group-hover:text-blue-600">
                        {product.name}
                      </h3>

                      <p className="mt-2 min-h-[40px] line-clamp-2 text-sm leading-5 text-gray-500">
                        {product.description || "Discover more about this product."}
                      </p>

                      <div className="mt-5 flex items-end justify-between">

                        <div>

                          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Price
                          </p>

                          <p className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
                            ${product.price}
                          </p>

                        </div>

                        <div className="text-right">

                          <p className="text-xs text-gray-400">
                            Available
                          </p>

                          <p
                            className={`mt-1 text-sm font-semibold ${
                              product.stock > 0
                                ? "text-emerald-600"
                                : "text-red-500"
                            }`}
                          >
                            {product.stock > 0
                              ? `${product.stock} left`
                              : "Unavailable"}
                          </p>

                        </div>

                      </div>

                    </div>

                  </article>

                </Link>

              ))}

            </div>

          )}

      </section>

      {/* CTA */}

      <section className="mx-auto max-w-7xl px-6 pb-16">

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-12 sm:px-12">

          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

          <div className="relative max-w-2xl">

            <p className="text-sm font-bold uppercase tracking-widest text-blue-100">
              MyStore Marketplace
            </p>

            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              Find your next favorite product.
            </h2>

            <p className="mt-4 text-blue-100">
              Browse our marketplace and discover products
              from sellers on MyStore.
            </p>

            <button
              onClick={() =>
                document
                  .getElementById("products")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
              className="mt-7 rounded-xl bg-white px-6 py-3 font-bold text-blue-600 shadow-lg transition hover:bg-gray-100"
            >
              Browse Products
            </button>

          </div>

        </div>

      </section>

      {/* FOOTER */}

      <footer className="border-t border-gray-200 bg-white">

        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <span className="font-bold text-gray-900">
              MyStore
            </span>{" "}
            — Your online marketplace.
          </div>

          <div>
            © {new Date().getFullYear()} MyStore. All rights reserved.
          </div>

        </div>

      </footer>

    </main>
  );
}
// Next.js'in URL (useSearchParams) kullanırken sayfanın bozulmaması için istediği güvenlik sarmalayıcısı (Suspense)
export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>}>
      <HomeContent />
    </Suspense>
  );
}