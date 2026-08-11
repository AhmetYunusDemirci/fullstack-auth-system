"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import API_URL from "../../lib/api";
import Navbar from "../../components/Navbar";
import Button from "../../components/Button";
import { toast } from "react-hot-toast";

export default function CartPage() {
  const router = useRouter();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code: "YAZ20", discountPercentage: 20 }
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  // CHECKOUT MODAL STATES
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [addressForm, setAddressForm] = useState({
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });

  const [cardForm, setCardForm] = useState({
    cardHolderName: "",
    cardNumber: "",
    expireMonth: "",
    expireYear: "",
    cvc: "",
  });

  // --------------------------------
  // LOAD CART
  // --------------------------------

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

  // --------------------------------
  // UPDATE QUANTITY
  // --------------------------------

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

        body: JSON.stringify({
          quantity: newQuantity,
        }),
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

  // --------------------------------
  // REMOVE PRODUCT
  // --------------------------------

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
  // --------------------------------
  // CHECKOUT (SİPARİŞ VER)
  // --------------------------------

   const handleAddressChange = (e) => {
    const { name, value } = e.target;
    
    // Şehir ve Ülke için sadece harf ve boşluk (Türkçe karakterler dahil)
    if (name === "city" || name === "country") {
      const regex = /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]*$/;
      if (!regex.test(value) || value.length > 50) return;
    }
    
    // Posta kodu için sadece rakam ve maksimum 5 hane
    if (name === "postalCode") {
      const regex = /^[0-9]*$/;
      if (!regex.test(value) || value.length > 5) return;
    }

    // Adres için maksimum karakter sınırı
    if (name === "address" && value.length > 200) return;

    setAddressForm({ ...addressForm, [name]: value });
  };

const handleCardChange = (e) => {
    const { name, value } = e.target;

    // Kart Üzerindeki İsim: Sadece harf kabul et ve BÜYÜK HARFE çevir
    if (name === "cardHolderName") {
      const regex = /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]*$/;
      if (!regex.test(value) || value.length > 50) return;
      setCardForm({ ...cardForm, [name]: value.toUpperCase() });
      return;
    }

    // Kart Numarası: Sadece rakam kabul et ve 4'erli boşluk bırak
    if (name === "cardNumber") {
      let rawValue = value.replace(/\D/g, "");
      if (rawValue.length > 16) rawValue = rawValue.slice(0, 16);
      const formattedValue = rawValue.replace(/(\d{4})/g, "$1 ").trim();
      setCardForm({ ...cardForm, [name]: formattedValue });
      return;
    }

    // AY (Month): Sadece 01 - 12 arası giriş yapılabilir
    if (name === "expireMonth") {
      if (!/^[0-9]*$/.test(value) || value.length > 2) return;
      
      // Kullanıcı 13, 15 gibi aylar veya 00 yazmaya çalışırsa engelle
      if (value.length === 2 && (parseInt(value, 10) > 12 || parseInt(value, 10) === 0)) {
        return; 
      }
    }
    
    // YIL (Year): Sadece rakam, Max 4 hane
    if (name === "expireYear") {
      if (!/^[0-9]*$/.test(value) || value.length > 4) return;
    }
    
    // CVC: Sadece rakam, Max 3 hane
    if (name === "cvc") {
      if (!/^[0-9]*$/.test(value) || value.length > 3) return;
    }

    setCardForm({ ...cardForm, [name]: value });
  };
   // --------------------------------
  // APPLY COUPON
  // --------------------------------
  const handleApplyCoupon = async () => {
    if (!couponCodeInput.trim()) return;
    
    setCouponError("");
    setCouponLoading(true);

    try {
      const response = await fetch(`${API_URL}/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCodeInput }),
      });

      const data = await response.json();

      if (!response.ok) {
        setCouponError(data.message || "Invalid coupon code.");
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon({
          code: data.code,
          discountPercentage: data.discountPercentage
        });
        setCouponCodeInput(""); // Girdiyi temizle
      }
    } catch (error) {
      setCouponError("Server connection error.");
    } finally {
      setCouponLoading(false);
    }
  };
  const handleCheckout = async (e) => {
    e.preventDefault();
     // --- YENİ: KART TARİH VE EKSİK VERİ KONTROLLERİ ---
    // 1. CVC 3 haneden kısa olamaz
    if (cardForm.cvc.length < 3) {
      toast.error("CVC kodu 3 haneli olmalıdır!");
      return;
    }
    
    // 2. Yıl ve Ay eksik veya formata uymuyorsa
    if (cardForm.expireYear.length < 4 || cardForm.expireMonth.length < 2) {
      toast.error("Lütfen Ay ve Yıl bilgilerini tam giriniz (Örn: 12 / 2030)");
      return;
    }

    // 3. Son kullanma tarihi geçmiş mi kontrolü
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // getMonth() 0-11 arası döner, +1 ekliyoruz
    const expYear = parseInt(cardForm.expireYear, 10);
    const expMonth = parseInt(cardForm.expireMonth, 10);

    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      toast.error("Kartınızın son kullanma tarihi geçmiş!");
      return;
    }
    // ---------------------------------------------------

    const token = localStorage.getItem("token");

    try {
      setCheckoutLoading(true);
      
      const response = await fetch(`${API_URL}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // Hem adres hem kart bilgilerini backend'e yolluyoruz
        body: JSON.stringify({ addressForm, cardForm, couponCode: appliedCoupon?.code }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Checkout failed.");
        return;
      }

      alert("Checkout successful.");
      router.push("/my-orders");

    } catch (error) {
      console.error(error);
      alert("Server Error");
    } finally {
      setCheckoutLoading(false);
    }
  };

  // --------------------------------
  // TOTAL
  // --------------------------------

  const calculateTotal = () => {
    if (!cart?.items) return 0;

    return cart.items.reduce((total, item) => {
      if (!item.product) return total;

      return total + item.product.price * item.quantity;
    }, 0);
  };

  const items = cart?.items || [];

  const totalQuantity = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const basePrice = calculateTotal();
  const discountAmount = appliedCoupon ? basePrice * (appliedCoupon.discountPercentage / 100) : 0;
  const totalPrice = basePrice - discountAmount;

  // --------------------------------
  // LOADING
  // --------------------------------

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8fc]">
        <Navbar />

        <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">

          <div className="animate-pulse">

            <div className="h-9 w-48 rounded-lg bg-gray-200" />

            <div className="mt-3 h-4 w-72 rounded bg-gray-200" />

            <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">

              <div className="space-y-4 lg:col-span-2">

                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-gray-200 bg-white p-5"
                  >
                    <div className="flex gap-5">

                      <div className="h-32 w-32 flex-shrink-0 rounded-xl bg-gray-200" />

                      <div className="flex-1 space-y-4">

                        <div className="h-5 w-2/3 rounded bg-gray-200" />

                        <div className="h-4 w-1/4 rounded bg-gray-200" />

                        <div className="h-8 w-32 rounded bg-gray-200" />

                      </div>

                    </div>
                  </div>
                ))}

              </div>

              <div className="h-80 rounded-2xl bg-gray-200" />

            </div>

          </div>

        </section>
      </main>
    );
  }

  // --------------------------------
  // ERROR
  // --------------------------------

  if (error) {
    return (
      <main className="min-h-screen bg-[#f7f8fc]">

        <Navbar />

        <section className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-6">

          <div className="w-full rounded-3xl border border-red-100 bg-white p-10 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-2xl text-red-500">
              !
            </div>

            <h2 className="mt-5 text-2xl font-bold text-gray-900">
              Something went wrong
            </h2>

            <p className="mt-2 text-gray-500">
              {error}
            </p>

            <Link href="/">
              <Button className="mt-7 inline-flex w-auto px-8">
                Back to Products
              </Button>
            </Link>

          </div>

        </section>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc]">

      <Navbar />

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">

        {/* PAGE HEADER */}

        <div className="mb-10">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
                Shopping Cart
              </p>

              <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-gray-950 sm:text-5xl">
                Your Cart
              </h1>

              <p className="mt-3 text-gray-500">
                Review your selected products before checkout.
              </p>

            </div>

            {items.length > 0 && (
              <div className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm">
                {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
              </div>
            )}

          </div>

        </div>

        {/* EMPTY CART */}

        {items.length === 0 ? (

          <div className="rounded-3xl border border-gray-200 bg-white px-6 py-20 text-center shadow-sm">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-4xl">
              🛒
            </div>

            <h2 className="mt-7 text-3xl font-extrabold tracking-tight text-gray-900">
              Your cart is empty
            </h2>

            <p className="mx-auto mt-3 max-w-md text-gray-500">
              You haven't added any products yet. Explore our marketplace
              and find something you love.
            </p>

            <Link href="/">
              <Button
                className="mt-8 inline-flex w-auto px-8"
                size="lg"
              >
                Start Shopping
              </Button>
            </Link>

          </div>

        ) : (

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_380px]">

            {/* PRODUCTS */}

            <div>

              <div className="mb-4 flex items-center justify-between">

                <h2 className="text-lg font-bold text-gray-900">
                  Cart Items
                </h2>

                <span className="text-sm text-gray-400">
                  {items.length} products
                </span>

              </div>

              <div className="space-y-4">

                {items.map((item) => {

                  if (!item.product) return null;

                  const product = item.product;

                  const itemTotal =
                    product.price * item.quantity;

                  return (
                    <article
                      key={product._id}
                      className="group rounded-3xl border border-gray-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:p-5"
                    >

                      <div className="flex flex-col gap-5 sm:flex-row">

                        {/* IMAGE */}

                        <Link
                          href={`/products/${product._id}`}
                          className="group/image relative h-56 w-full flex-shrink-0 overflow-hidden rounded-2xl bg-gray-100 sm:h-40 sm:w-40"
                        >

                          {product.image ? (

                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-full w-full object-cover transition duration-500 group-hover/image:scale-105"
                            />

                          ) : (

                            <div className="flex h-full w-full items-center justify-center text-sm font-medium text-gray-400">
                              No Image
                            </div>

                          )}

                          <div className="absolute inset-x-3 bottom-3">

                            <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur">
                              {product.category || "Product"}
                            </span>

                          </div>

                        </Link>

                        {/* PRODUCT CONTENT */}

                        <div className="flex min-w-0 flex-1 flex-col">

                          <div className="flex items-start justify-between gap-4">

                            <div className="min-w-0">

                              <Link href={`/products/${product._id}`}>

                                <h3 className="truncate text-xl font-bold text-gray-900 transition group-hover:text-blue-600">
                                  {product.name}
                                </h3>

                              </Link>

                              <p className="mt-1 text-sm text-gray-400">
                                Product from MyStore marketplace
                              </p>

                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                removeFromCart(product._id)
                              }
                              className="flex-shrink-0 rounded-lg px-2 py-1 text-sm font-semibold text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                            >
                              Remove
                            </button>

                          </div>

                          {/* PRICE */}

                          <div className="mt-4">

                            <span className="text-2xl font-extrabold tracking-tight text-gray-950">
                              ${Number(product.price).toFixed(2)}
                            </span>

                            {product.stock > 0 && (
                              <span className="ml-3 text-sm font-medium text-emerald-600">
                                In stock
                              </span>
                            )}

                          </div>

                          {/* BOTTOM */}

                          <div className="mt-5 flex flex-col gap-4 border-t border-gray-100 pt-4 sm:flex-row sm:items-end sm:justify-between">

                            {/* QUANTITY */}

                            <div>

                              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                                Quantity
                              </p>

                              <div className="inline-flex items-center rounded-xl border border-gray-200 bg-gray-50 p-1">

                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(
                                      product._id,
                                      item.quantity - 1
                                    )
                                  }
                                  disabled={item.quantity <= 1}
                                  className="flex h-9 w-9 items-center justify-center rounded-lg text-lg font-semibold text-gray-600 transition hover:bg-white hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                  −
                                </button>

                                <span className="w-10 text-center text-sm font-bold text-gray-900">
                                  {item.quantity}
                                </span>

                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(
                                      product._id,
                                      item.quantity + 1
                                    )
                                  }
                                  disabled={
                                    item.quantity >= product.stock
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-lg text-lg font-semibold text-gray-600 transition hover:bg-white hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                  +
                                </button>

                              </div>

                            </div>

                            {/* ITEM TOTAL */}

                            <div className="sm:text-right">

                              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                Item Total
                              </p>

                              <p className="mt-1 text-xl font-extrabold text-gray-950">
                                ${itemTotal.toFixed(2)}
                              </p>

                            </div>

                          </div>

                        </div>

                      </div>

                    </article>
                  );
                })}

              </div>

              {/* CONTINUE SHOPPING */}

              <Link
                href="/"
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition hover:gap-3 hover:text-blue-700"
              >
                ← Continue Shopping
              </Link>

            </div>

            {/* ORDER SUMMARY */}
  <aside className="xl:sticky xl:top-6 xl:h-fit">
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className="p-6 sm:p-7">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-gray-950">
            Order Summary
          </h2>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
            {totalQuantity} items
          </span>
        </div>
          
        {/* COUPON CODE BOX */}
        <div className="mt-6 border-t border-gray-100 pt-6">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
            Promo Code
          </label>
          
          {!appliedCoupon ? (
            <div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                  placeholder="Enter code" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-blue-500 transition text-gray-900 text-sm uppercase tracking-wider"
                />
                <Button onClick={handleApplyCoupon} disabled={couponLoading || !couponCodeInput} className="!px-4">
                  {couponLoading ? "..." : "Apply"}
                </Button>
              </div>
              {couponError && <p className="mt-2 text-xs text-red-500 font-medium">{couponError}</p>}
            </div>
          ) : (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-emerald-500">🎟️</span>
                <span className="font-bold text-emerald-700 tracking-wider">{appliedCoupon.code}</span>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md">-%{appliedCoupon.discountPercentage}</span>
              </div>
              <button onClick={() => setAppliedCoupon(null)} className="text-xs font-bold text-gray-400 hover:text-red-500 transition">Remove</button>
            </div>
          )}
        </div>

        {/* PRICE DETAILS */}
        <div className="mt-6 space-y-4 border-t border-gray-100 pt-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-semibold text-gray-900">${basePrice.toFixed(2)}</span>
          </div>

          {appliedCoupon && (
            <div className="flex justify-between text-sm text-emerald-600 font-medium">
              <span>Discount ({appliedCoupon.code})</span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Shipping</span>
            <span className="font-bold text-emerald-600">Free</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Taxes</span>
            <span className="text-gray-400">Calculated at checkout</span>
          </div>
        </div>

        {/* TOTAL */}
        <div className="mt-6 border-t border-gray-100 pt-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total
              </p>
              <p className="mt-1 text-3xl font-extrabold tracking-tight text-gray-950">
                ${totalPrice.toFixed(2)}
              </p>
            </div>
            <span className="mb-1 text-xs font-semibold text-gray-400">
              USD
            </span>
          </div>
        </div>

        {/* CHECKOUT */}
        <Button
          disabled={items.length === 0}
          onClick={() => setShowCheckout(true)}
          variant="accent"
          size="lg"
          className="mt-7 w-full"
        >
          Proceed to Checkout
        </Button>

        <p className="mt-4 text-center text-xs leading-5 text-gray-400">
          Secure checkout experience. Your order will be
          processed safely.
        </p>
      </div>

      {/* BENEFITS */}
      <div className="border-t border-gray-100 bg-gray-50 px-6 py-5 sm:px-7">
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
              ✓
            </span>
            <span className="font-medium text-gray-600">
              Secure payment
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
              ✓
            </span>
            <span className="font-medium text-gray-600">
              Free shipping
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
              ✓
            </span>
            <span className="font-medium text-gray-600">
              Trusted marketplace
            </span>
          </div>
        </div>
      </div>
    </div>
  </aside>

          </div>
        )}

     </section>

      {/* CHECKOUT MODAL */}
      {showCheckout && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl">
            
            <div className="mb-6 flex items-center justify-between sticky top-0 bg-white z-10 pb-2 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Secure Checkout</h2>
                <p className="text-sm text-gray-500 mt-1">Shipping & Payment Details</p>
              </div>
              <button
                onClick={() => setShowCheckout(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-900"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCheckout} className="space-y-6">
              
              {/* ADRES BİLGİLERİ */}
              <div className="space-y-4 bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                <h3 className="font-bold text-gray-900 flex items-center gap-2"><span className="text-blue-500">📍</span> Shipping Address</h3>
                <div>
                  <input type="text" name="address" required value={addressForm.address} onChange={handleAddressChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition text-gray-900 text-sm" placeholder="Full Address (e.g., 123 Main St, Apt 4B)" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" name="city" required value={addressForm.city} onChange={handleAddressChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition text-gray-900 text-sm" placeholder="City" />
                  <input type="text" name="postalCode" inputMode="numeric" required value={addressForm.postalCode} onChange={handleAddressChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition text-gray-900 text-sm" placeholder="Postal Code" />
                </div>
                <div>
                  <input type="text" name="country" required value={addressForm.country} onChange={handleAddressChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition text-gray-900 text-sm" placeholder="Country" />
                </div>
              </div>

              {/* KREDİ KARTI BİLGİLERİ (IYZICO) */}
              <div className="space-y-4 bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                <h3 className="font-bold text-gray-900 flex items-center gap-2"><span className="text-emerald-500">💳</span> Payment Information</h3>
                
                <div>
                  <label className="text-xs font-semibold text-gray-500 ml-1">Name on Card</label>
                  <input type="text" name="cardHolderName" required value={cardForm.cardHolderName} onChange={handleCardChange} className="w-full mt-1 bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition text-gray-900 text-sm tracking-wide uppercase" placeholder="JOHN DOE" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 ml-1">Card Number</label>
                  <input type="text" name="cardNumber" maxLength="19" required value={cardForm.cardNumber} onChange={handleCardChange} className="w-full mt-1 bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition text-gray-900 text-sm font-mono tracking-widest" placeholder="4543 0000 0000 0000" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 ml-1">Month</label>
                    <input type="text" name="expireMonth" inputMode="numeric" required value={cardForm.expireMonth} onChange={handleCardChange} className="w-full mt-1 bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition text-gray-900 text-sm text-center font-mono" placeholder="MM" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 ml-1">Year</label>
                    <input type="text" name="expireYear" inputMode="numeric" required value={cardForm.expireYear} onChange={handleCardChange} className="w-full mt-1 bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition text-gray-900 text-sm text-center font-mono" placeholder="YYYY" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 ml-1">CVC</label>
                    <input type="text" name="cvc" inputMode="numeric" required value={cardForm.cvc} onChange={handleCardChange} className="w-full mt-1 bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition text-gray-900 text-sm text-center font-mono" placeholder="123" />
                  </div>
                </div> 
                
              </div>

              <div className="mt-8 flex gap-3 pt-2">
                <Button type="button" onClick={() => setShowCheckout(false)} className="flex-1 !bg-gray-100 !text-gray-700 hover:!bg-gray-200">
                  Cancel
                </Button>
                <Button type="submit" disabled={checkoutLoading} variant="accent" className="flex-1 disabled:opacity-70 bg-emerald-600 hover:bg-emerald-700 border-emerald-600 shadow-emerald-600/20">
                  {checkoutLoading ? "Processing Payment..." : `Pay $${totalPrice.toFixed(2)}`}
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}

    </main>
  );
}
        
  

