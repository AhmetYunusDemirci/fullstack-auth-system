"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import API_URL from "../lib/api";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

export default function Navbar() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  // --- SIDEBAR (DRAWER) STATELERİ ---
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [categories, setCategories] = useState([]);

  // Navbar yüklendiğinde kategorileri veritabanından çek
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/products/categories`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
        }
      } catch (err) {
        console.error("Navbar categories error:", err);
      }
    };
    fetchCategories();
  }, []);

  const loadUser = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        setUser(null);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        setUser(null);
        setLoading(false);
        return;
      }

      const data = await response.json();

      setUser(data.user);
    } catch (error) {
      console.error(error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  // --- YENİ: CANLI BİLDİRİM (SOCKET.IO) DİNLEYİCİSİ ---
  useEffect(() => {
    // Sadece giriş yapmış satıcılar için soketi dinle
    if (user && user.role === "seller") {
      // API_URL genelde "http://localhost:5000/api" şeklindedir, soket ise ana domainde çalışır.
      const socketUrl = API_URL.replace("/api", ""); 
      const socket = io(socketUrl);

      // Sadece BU satıcının ID'sine özel açılan kanalı dinliyoruz
      socket.on(`seller_notification_${user.id}`, (data) => {
        // Ekrana 6 saniye kalacak, alkış ikonlu şık bir bildirim bas!
        toast.success(data.message, {
          duration: 6000,
          icon: '💰',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
      });

      // Bileşen ekrandan kalktığında bağlantıyı temizle
      return () => {
        socket.disconnect();
      };
    }
  }, [user]);
  // ----------------------------------------------------

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setMobileOpen(false);
    router.push("/");
  };

  return (
      <>
    <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/90 backdrop-blur-xl">

      <div className="mx-auto max-w-7xl px-6">

        <div className="flex h-20 items-center justify-between">
             

             {/* HAMBURGER MENÜ (TÜMÜ) BUTONU */}
          <button 
            onClick={() => setIsDrawerOpen(true)} 
            className="flex items-center gap-1.5 font-bold text-slate-700 hover:text-blue-600 transition mr-4 p-2 rounded-lg hover:bg-slate-100"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
            <span className="hidden md:inline">Tümü</span>
          </button> 
          {/* LOGO */}

          <Link
            href="/"
            className="group flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white shadow-lg shadow-blue-600/20 transition group-hover:scale-105">
              M
            </div>
            <div className="hidden sm:block">
              <div className="text-xl font-extrabold tracking-tight text-gray-900">
                MyStore
              </div>
              <div className="text-[11px] font-medium text-gray-400">
                ONLINE MARKETPLACE
              </div>
            </div>
          </Link>

          {/* DESKTOP NAV */}
          
          {/* gap-1'i gap-5 yaptık ki linkler birbirinden ayrılsın, ferahlasın */}
          <nav className="hidden items-center gap-5 lg:flex">

            <Link href="/" className="nav-link">
              Home
            </Link>

            <Link href="/contact" className="nav-link">
              Contact
            </Link>

            {user && (
              <Link href="/profile" className="nav-link">
                Profile
              </Link>
            )}

            {user && (
              <Link href="/my-orders" className="nav-link">
                My Orders
              </Link>
            )}

            {user && (
              <Link href="/wishlist" className="nav-link flex items-center gap-1.5 hover:text-red-500 transition">
                <span className="text-lg">❤️</span>
                <span className="hidden xl:inline">Wishlist</span>
              </Link>
            )}

            <Link
            href="/bestsellers"
            className="flex items-center gap-1 text-sm font-semibold text-orange-600 hover:text-orange-700 transition"
          >
            🔥 Best Sellers
          </Link>

            {user && (
              <Link href="/cart" className="nav-link flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="20" r="1" />
                  <circle cx="19" cy="20" r="1" />
                  <path d="M3 4h2l2.4 11.4a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 8H6" />
                </svg>
                Cart
              </Link>
            )}

            {user?.role === "admin" && (
              <Link href="/admin" className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z" />
                  <path d="M9 12h6" />
                  <path d="M12 9v6" />
                </svg>
                Admin Panel
              </Link>
            
            )}
           

            {/* SELLER DROPDOWN MENÜSÜ */}
            {user?.role === "seller" && (
              <div className="group relative ml-2">
                
                {/* Dropdown Tetikleyici (Buton) */}
                <button className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-700 transition hover:bg-amber-100">
                  <span className="text-base">🛍️</span> Seller Center
                  {/* Aşağı Ok İkonu (Hover olunca döner) */}
                  <svg className="h-4 w-4 text-amber-600 transition-transform duration-300 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown İçeriği (Açılan Kutu) */}
                <div className="invisible absolute right-0 top-full z-50 pt-3 opacity-0 translate-y-2 transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="w-48 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-amber-900/5">
                    
                    <Link
                      href="/seller/products"
                      className="block px-5 py-3.5 text-sm font-medium text-gray-700 transition hover:bg-amber-50 hover:text-amber-800"
                    >
                      📦 My Products
                    </Link>
                    
                    <div className="h-px w-full bg-gray-50"></div>
                    
                    <Link
                      href="/seller/orders"
                      className="block px-5 py-3.5 text-sm font-medium text-gray-700 transition hover:bg-amber-50 hover:text-amber-800"
                    >
                      📋 Orders
                    </Link>
                    <div className="h-px w-full bg-gray-50"></div>
                    
                    <Link
                      href="/seller/reviews"
                      className="block px-5 py-3.5 text-sm font-medium text-gray-700 transition hover:bg-amber-50 hover:text-amber-800"
                    >
                      ⭐ Customer Reviews
                    </Link>

                  </div>
                </div>

              </div>
            )}

          </nav>

          {/* RIGHT SIDE */}

          <div className="hidden items-center gap-3 lg:flex">

            {!user && !loading && (
              <>
                <Link href="/login" className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100">
                  Login
                </Link>
                <Link href="/register" className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
                  Create Account
                </Link>
              </>
            )}

            {user && (
              <>
                <div className="hidden xl:block text-right">
                  <p className="text-xs text-gray-400">Signed in as</p>
                  <p className="max-w-[130px] truncate text-sm font-semibold text-gray-800">{user.name}</p>
                </div>
                <button onClick={handleLogout} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600">
                  Logout
                </button>
              </>
            )}

          </div>

          {/* MOBILE BUTTON */}

          <button onClick={() => setMobileOpen(!mobileOpen)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-700 lg:hidden">
            {mobileOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12" />
                <path d="M18 6 6 18" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
              </svg>
            )}
          </button>

        </div>

        {/* MOBILE MENU */}

        {mobileOpen && (

          <div className="border-t border-gray-100 py-4 lg:hidden">
            <nav className="flex flex-col gap-1">

              <Link href="/" onClick={() => setMobileOpen(false)} className="rounded-xl px-4 py-3 font-medium text-gray-700 hover:bg-gray-100">
                Home
              </Link>

              <Link href="/contact" onClick={() => setMobileOpen(false)} className="rounded-xl px-4 py-3 font-medium text-gray-700 hover:bg-gray-100">
                Contact
              </Link>

              {user && (
                <Link href="/profile" onClick={() => setMobileOpen(false)} className="rounded-xl px-4 py-3 font-medium text-gray-700 hover:bg-gray-100">
                  Profile
                </Link>
              )}

              {user && (
                <Link href="/my-orders" onClick={() => setMobileOpen(false)} className="rounded-xl px-4 py-3 font-medium text-gray-700 hover:bg-gray-100">
                  My Orders
                </Link>
              )}

             {user && (
                <Link href="/wishlist" onClick={() => setMobileOpen(false)} className="rounded-xl px-4 py-3 font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                  <span>❤️</span> My Wishlist
                </Link>
              )}

              <Link
                href="/bestsellers"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-3 font-medium text-orange-600 hover:bg-orange-50 transition"
              >
                🔥 Best Sellers
              </Link>

              {user && (
                <Link href="/cart" onClick={() => setMobileOpen(false)} className="rounded-xl px-4 py-3 font-medium text-gray-700 hover:bg-gray-100">
                  My Cart
                </Link>
              )}

              {user?.role === "admin" && (
                <Link href="/admin" onClick={() => setMobileOpen(false)} className="mt-1 rounded-xl bg-gray-900 px-4 py-3 font-semibold text-white">
                  Admin Panel
                </Link>
              )}

              {/* MOBİL SELLER KISMI DA SARI/AMBER YAPILDI */}
              {user?.role === "seller" && (
                <div className="my-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 shadow-sm">
                  <p className="mb-2 px-2 text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1">
                    <span className="text-base">🛍️</span> Seller Tools
                  </p>
                  <div className="flex flex-col gap-1">
                    <Link
                      href="/seller/products"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-xl px-3 py-2.5 font-medium text-amber-900 hover:bg-amber-100 transition"
                    >
                      My Products
                    </Link>
                    <Link
                      href="/seller/orders"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-xl px-3 py-2.5 font-medium text-amber-900 hover:bg-amber-100 transition"
                    >
                      Order Management
                    </Link>

                    <Link
                      href="/seller/reviews"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-xl px-3 py-2.5 font-medium text-amber-900 hover:bg-amber-100 transition"
                    >
                      Customer Reviews
                    </Link>
                  </div>
                </div>
              )}

              {!user && !loading && (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="mt-2 rounded-xl px-4 py-3 font-semibold text-gray-700 hover:bg-gray-100">
                    Login
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="rounded-xl bg-blue-600 px-4 py-3 text-center font-semibold text-white">
                    Create Account
                  </Link>
                </>
              )}

              {user && (
                <button onClick={handleLogout} className="mt-2 rounded-xl bg-red-50 px-4 py-3 text-left font-semibold text-red-600">
                  Logout
                </button>
              )}

            </nav>
          </div>

        )}

      </div>
      
    </header>
    {/* ========================================= */}
      {/* --- SOL SIDEBAR (DRAWER) E-TİCARET MENÜSÜ --- */}
      {/* ========================================= */}

      {/* Arka Plan Karartması (Overlay) */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 z-[60] bg-black/60 transition-opacity"
          onClick={() => setIsDrawerOpen(false)}
        ></div>
      )}

      {/* Kayarak Gelen Panel */}
      <div 
        className={`fixed top-0 left-0 z-[70] h-full w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-in-out flex flex-col overflow-y-auto ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Kullanıcı Karşılama ve Kapatma Butonu */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xl font-bold">
              {user ? user.name.charAt(0).toUpperCase() : "👤"}
            </div>
            <span className="font-bold text-lg">
              {user ? `Merhaba, ${user.name}` : "Merhaba, Giriş Yapın"}
            </span>
          </div>
          <button onClick={() => setIsDrawerOpen(false)} className="text-white hover:text-red-400 transition p-1">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="py-4">
          
          {/* BÖLÜM 1: ÖNE ÇIKANLAR */}
          <div className="px-6 py-3 border-b border-slate-100">
            <h3 className="text-lg font-extrabold text-slate-800 mb-4">Öne Çıkanlar</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/bestsellers" onClick={() => setIsDrawerOpen(false)} className="flex items-center justify-between py-2 text-slate-600 hover:text-blue-600 font-medium transition group">
                  <span>Çok Satanlar</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">›</span>
                </Link>
              </li>
              {/* Buraya Yeni Çıkanlar vb. eklenebilir */}
            </ul>
          </div>

          {/* BÖLÜM 2: KATEGORİYE GÖRE ALIŞVERİŞ YAP */}
          <div className="px-6 py-5 border-b border-slate-100">
            <h3 className="text-lg font-extrabold text-slate-800 mb-4">Kategoriye Göre Alışveriş Yap</h3>
            <ul className="space-y-1">
              {/* Sadece ilk 4'ü veya tamamını göster */}
              {categories.slice(0, showAllCategories ? categories.length : 4).map((cat, index) => (
                <li key={index}>
                  <Link 
                    href={`/?category=${cat}`} // Veya /categories/${cat} - rotana göre ayarla
                    onClick={() => setIsDrawerOpen(false)} 
                    className="flex items-center justify-between py-2 text-slate-600 hover:text-blue-600 font-medium transition group"
                  >
                    <span className="capitalize">{cat}</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">›</span>
                  </Link>
                </li>
              ))}
            </ul>
            
            {/* DEVAMINI GÖRÜNTÜLE BUTONU */}
            {categories.length > 4 && (
              <button 
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="flex items-center gap-2 mt-4 text-sm font-bold text-slate-500 hover:text-slate-800 transition"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform duration-300 ${showAllCategories ? "rotate-180" : ""}`}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
                {showAllCategories ? "Daha Az Göster" : "Tümünü Görüntüle"}
              </button>
            )}
          </div>

          {/* BÖLÜM 3: YARDIM VE AYARLAR */}
          <div className="px-6 py-5 mb-10">
            <h3 className="text-lg font-extrabold text-slate-800 mb-4">Yardım ve Ayarlar</h3>
            <ul className="space-y-1">
              
              {/* YARDIM MERKEZİ - HERKESE AÇIK */}
              <li>
                <Link href="/help" onClick={() => setIsDrawerOpen(false)} className="flex items-center justify-between py-2 text-slate-600 hover:text-blue-600 font-medium transition group">
                  <span>Yardım Merkezi</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">›</span>
                </Link>
              </li>

              {user ? (
                <>
                  <li>
                    <Link href="/profile" onClick={() => setIsDrawerOpen(false)} className="flex items-center justify-between py-2 text-slate-600 hover:text-blue-600 font-medium transition group">
                      <span>Profil Hesabım</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">›</span>
                    </Link>
                  </li>
                  <li>
                    <button onClick={() => { setIsDrawerOpen(false); handleLogout(); }} className="w-full flex items-center justify-between py-2 text-slate-600 hover:text-red-600 font-medium transition group">
                      <span>Çıkış Yap</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">›</span>
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <Link href="/login" onClick={() => setIsDrawerOpen(false)} className="flex items-center justify-between py-2 text-slate-600 hover:text-blue-600 font-medium transition group">
                    <span>Giriş Yap / Üye Ol</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">›</span>
                  </Link>
                </li>
              )}
            </ul>
          </div>

        </div>
      </div>
      {/* ========================================= */}
      </>
  );
}