
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import API_URL from "../../../lib/api";
import Navbar from "../../../components/Navbar";
import toast from "react-hot-toast";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // --- YENİ YORUM STATELERİ ---
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  // --- YORUM DÜZENLEME STATELERİ ---
  const [currentUserId, setCurrentUserId] = useState(null);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  // Yıldız animasyonları (Hover) için state'ler
  const [hoverRating, setHoverRating] = useState(0);
  const [editHoverRating, setEditHoverRating] = useState(0);
  // --- SATICI CEVAPLAMA STATELERİ ---
  const [replyingToReviewId, setReplyingToReviewId] = useState(null);
  const [sellerReplyText, setSellerReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [cartError, setCartError] = useState("");
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  const [isLiked, setIsLiked] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);


  const [relatedProducts, setRelatedProducts] = useState([]);


  useEffect(() => {
    const loadProductAndRelated = async () => {
      try {
        setLoading(true);
        setError("");

        // 1. ANA ÜRÜNÜ ÇEK
        const response = await fetch(`${API_URL}/products/${params.id}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Product could not be loaded.");
          return;
        }

        setProduct(data.product);

        // --- 2. BENZER ÜRÜNLERİ (RELATED PRODUCTS) ÇEK ---
        // (Sadece ana ürün başarılı çekildiyse bu aşamaya geçer)
        try {
          const relatedRes = await fetch(`${API_URL}/products/${params.id}/related`);
          if (relatedRes.ok) {
            const relatedData = await relatedRes.json();
            setRelatedProducts(relatedData.products || []);
          }
        } catch (err) {
          console.error("Failed to fetch related products", err);
        }
        // ------------------------------------------------

      } catch (error) {
        console.error(error);
        setError("Server Error");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadProductAndRelated();
    }
  }, [params.id]);

  // -------------------------
  // WISHLIST LOGIC
  // -------------------------

  useEffect(() => {
    const checkWishlist = async () => {
      const token = localStorage.getItem("token");
      if (!token) return; // Giriş yapmamışsa favorileri kontrol etme

      try {
        const response = await fetch(`${API_URL}/wishlist`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        
        if (response.ok && data.wishlist) {
          // Ürün favoriler listesinde var mı kontrol et
          const liked = data.wishlist.products.some(
            (p) => p._id === params.id || p === params.id
          );
          setIsLiked(liked);
        }
      } catch (err) {
        console.error("Wishlist check error:", err);
      }
    };

    if (params.id) checkWishlist();
  }, [params.id]);

  const handleToggleWishlist = async () => {
    const token = localStorage.getItem("token");
    
    // Giriş yapmamışsa login sayfasına yönlendir
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setWishlistLoading(true);
      const response = await fetch(`${API_URL}/wishlist/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product._id }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setIsLiked(data.message === "Added to wishlist");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setWishlistLoading(false);
    }
  };
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


// YILDIZLARI ÇİZME FONKSİYONU
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`text-xl ${i <= rating ? "text-amber-400" : "text-gray-300"}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  // YORUM GÖNDERME
  const submitReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) return toast.error("Please login to write a review.");
    if (!comment.trim()) return toast.error("Please write a comment.");

    try {
      setReviewLoading(true);
      const res = await fetch(`${API_URL}/products/${params.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating, comment }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Review added successfully!");
        setComment("");
        setRating(5);
        // Sayfayı yenilemeden yeni yorumları göstermek için ürünü tekrar çek
        const updatedRes = await fetch(`${API_URL}/products/${params.id}`);
        const updatedData = await updatedRes.json();
        setProduct(updatedData.product);
      } else {
        toast.error(data.message || "Failed to submit review.");
      }
    } catch (error) {
      toast.error("Server connection error.");
    } finally {
      setReviewLoading(false);
    }
  };
// YORUM GÜNCELLEME
  const submitEditReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) return toast.error("Please login.");
    if (!editComment.trim()) return toast.error("Please write a comment.");

    try {
      setEditLoading(true);
      const res = await fetch(`${API_URL}/products/${params.id}/reviews`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating: editRating, comment: editComment }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Review updated successfully!");
        setEditingReviewId(null); // Düzenleme modundan çık
        
        // Ürünü tekrar çekip yeni yıldızı/yorumu ekrana yansıt
        const updatedRes = await fetch(`${API_URL}/products/${params.id}`);
        const updatedData = await updatedRes.json();
        setProduct(updatedData.product);
      } else {
        toast.error(data.message || "Failed to update review.");
      }
    } catch (error) {
      toast.error("Server connection error.");
    } finally {
      setEditLoading(false);
    }
  };
  // YORUM BEĞENME (Faydalı Bulma) FONKSİYONU
  const handleToggleLike = async (reviewId) => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Please login to like reviews.");

    try {
      const res = await fetch(`${API_URL}/products/${params.id}/reviews/${reviewId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        // Ekranın anında tepki vermesi için ürünü sessizce tekrar çekiyoruz
        const updatedRes = await fetch(`${API_URL}/products/${params.id}`);
        const updatedData = await updatedRes.json();
        setProduct(updatedData.product);
      }
    } catch (error) {
      console.error(error);
    }
  };
  // SATICI CEVABI GÖNDERME
  const submitSellerReply = async (e, reviewId) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setReplyLoading(true);
      const res = await fetch(`${API_URL}/products/${params.id}/reviews/${reviewId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reply: sellerReplyText }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Reply published successfully!");
        setReplyingToReviewId(null);
        setSellerReplyText("");
        
        // Ürünü tekrar çekip cevabı ekranda göster
        const updatedRes = await fetch(`${API_URL}/products/${params.id}`);
        const updatedData = await updatedRes.json();
        setProduct(updatedData.product);
      } else {
        toast.error(data.message || "Failed to post reply.");
      }
    } catch (error) {
      toast.error("Server connection error.");
    } finally {
      setReplyLoading(false);
    }
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
{/* WISHLIST HEART BUTTON */}
                <button
                  onClick={handleToggleWishlist}
                  disabled={wishlistLoading}
                  className="absolute top-5 right-5 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/95 backdrop-blur-sm shadow-md transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50"
                  title={isLiked ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <span className={`text-2xl transition-colors ${isLiked ? "text-red-500 drop-shadow-md" : "text-gray-300 grayscale"}`}>
                    {isLiked ? "❤️" : "🤍"}
                  </span>
                </button>

                {/* STOCK BADGE */}

                <div className="absolute top-5 left-5 z-10">

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

            {/* YILDIZLARI BURAYA EKLİYORUZ */}
            <div className="mt-3 flex items-center gap-2">
              <div className="flex">{renderStars(product.rating || 0)}</div>
              <span className="text-sm font-semibold text-gray-500">
                {product.rating ? product.rating.toFixed(1) : "0.0"} ({product.numReviews || 0} reviews)
              </span>
            </div>

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

            {/* SATICI (SELLER) BİLGİ KARTI */}
            {product.seller && (
              <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-5 transition hover:border-blue-200 hover:bg-blue-50/50">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Sold By</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600 shadow-inner">
                      {product.seller.name.charAt(0)}{product.seller.surname?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{product.seller.name} {product.seller.surname}</p>
                      <p className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                        <span className="text-[10px]">✔</span> Verified Seller
                      </p>
                    </div>
                  </div>
                  <Link 
                    href={`/sellers/${product.seller._id}`} 
                    className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-600 shadow-sm border border-gray-200 transition hover:bg-blue-600 hover:text-white"
                  >
                    Visit Store
                  </Link>
                </div>
              </div>
            )}
            {/* ----------------------------- */}

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
{/* REVIEWS SECTION */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Yorum Formu (Sol Kısım) */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Write a Review</h2>
            <p className="text-sm text-slate-500 mb-6">You must have purchased and received this item to leave a review.</p>
            
            <form onSubmit={submitReview} className="space-y-4">
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Your Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      className={`text-3xl transition-colors duration-200 ${
                        star <= (hoverRating || rating) ? "text-amber-400" : "text-gray-300"
                      }`}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                    >
                      ★
                    </button>
                  ))}
                  <span className="ml-3 text-sm font-semibold text-slate-500">
                    {rating === 5 ? "Excellent" : rating === 4 ? "Very Good" : rating === 3 ? "Good" : rating === 2 ? "Fair" : "Poor"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Comment</label>
                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength="500"
                  rows="4"
                  placeholder="What did you like or dislike?"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 resize-none"
                ></textarea>
                <p className="text-xs text-slate-400 mt-1 text-right">{comment.length}/500</p>
              </div>

              <button 
                type="submit" 
                disabled={reviewLoading}
                className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition disabled:opacity-50"
              >
                {reviewLoading ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>

          {/* Yorumlar Listesi (Sağ Kısım) */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Customer Reviews</h2>
            
            {product.reviews && product.reviews.length > 0 ? (
              <div className="space-y-6">
                {product.reviews.map((review) => (
                  <div key={review._id} className="bg-white border border-slate-200 rounded-2xl p-6 transition-all">
                    
                    {/* EĞER BU YORUM DÜZENLENİYORSA FORMU GÖSTER */}
                    {editingReviewId === review._id ? (
                      <form onSubmit={submitEditReview} className="space-y-4 animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-slate-900">Edit Your Review</h3>
                          <button type="button" onClick={() => setEditingReviewId(null)} className="text-sm font-semibold text-slate-500 hover:text-slate-700">Cancel</button>
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                type="button"
                                key={star}
                                className={`text-2xl transition-colors duration-200 ${
                                  star <= (editHoverRating || editRating) ? "text-amber-400" : "text-gray-300"
                                }`}
                                onMouseEnter={() => setEditHoverRating(star)}
                                onMouseLeave={() => setEditHoverRating(0)}
                                onClick={() => setEditRating(star)}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <textarea 
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                            maxLength="500"
                            rows="3"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 resize-none"
                          ></textarea>
                        </div>
                        <button type="submit" disabled={editLoading} className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
                          {editLoading ? "Saving..." : "Save Changes"}
                        </button>
                      </form>
                    ) : (
                      
                      /* DÜZENLENMİYORSA NORMAL YORUMU GÖSTER */
                      <>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center">
                              {review.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{review.name}</p>
                              <p className="text-xs text-emerald-600 font-semibold">✔ Verified Purchase</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                            
                            {/* EĞER YORUM KULLANICIYA AİTSE "EDIT" BUTONU ÇIKAR */}
                            {currentUserId === review.user && (
                              <button 
                                onClick={() => {
                                  setEditingReviewId(review._id);
                                  setEditRating(review.rating);
                                  setEditComment(review.comment);
                                }} 
                                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition underline decoration-transparent hover:decoration-blue-700 underline-offset-2"
                              >
                                Edit Review
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex mb-3">{renderStars(review.rating)}</div>
                        <p className="text-slate-600 text-sm leading-relaxed break-words whitespace-pre-wrap">{review.comment}</p>
                      </>
                    )}
                    {/* --- YENİ: FAYDALI BUL (HELPFUL) BUTONU --- */}
                        <div className="mt-4 flex items-center gap-3">
                          <button
                            onClick={() => handleToggleLike(review._id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                              review.likes && review.likes.includes(currentUserId)
                                ? "bg-blue-50 border-blue-200 text-blue-600"
                                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                            }`}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill={review.likes && review.likes.includes(currentUserId) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                            </svg>
                            Helpful
                            {review.likes && review.likes.length > 0 && (
                              <span className="ml-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">{review.likes.length}</span>
                            )}
                          </button>
                          
                          
                          {/* Kaç kişinin faydalı bulduğunu yazıyla da belirt */}
                          {review.likes && review.likes.length > 0 && (
                            <span className="text-[11px] font-medium text-slate-400">
                              {review.likes.length} {review.likes.length === 1 ? "person" : "people"} found this helpful
                            </span>

                          )}
                          {/* --- SATICI CEVABI GÖSTERİMİ VE DÜZENLEMESİ --- */}
                        {(review.sellerReply && review.sellerReply.comment && replyingToReviewId !== review._id) ? (
                          
                          /* 1. DURUM: CEVAP VAR VE DÜZENLEME MODUNDA DEĞİL (GÖRÜNTÜLEME) */
                          <div className="mt-5 ml-4 border-l-4 border-amber-400 pl-4 py-3 bg-amber-50/50 rounded-r-xl w-full overflow-hidden shadow-sm relative group">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                                  Seller Response
                                </span>
                                <span className="text-[11px] font-medium text-slate-400">
                                  {new Date(review.sellerReply.repliedAt).toLocaleDateString()}
                                </span>
                              </div>
                              
                              {/* YENİ: DÜZENLE (EDIT) BUTONU (Sadece satıcı görebilir) */}
                              {currentUserId === (product.seller._id || product.seller) && (
                                <button 
                                  onClick={() => {
                                    setReplyingToReviewId(review._id);
                                    setSellerReplyText(review.sellerReply.comment); // Eski yazıyı forma doldur
                                  }}
                                  className="text-[11px] font-bold text-amber-600 hover:text-amber-800 transition opacity-0 group-hover:opacity-100 underline decoration-transparent hover:decoration-amber-800"
                                >
                                  Edit Reply
                                </button>
                              )}
                            </div>
                            
                            <p className="text-sm text-slate-700 italic break-words break-all whitespace-pre-wrap w-full">
                              {review.sellerReply.comment}
                            </p>
                          </div>
                        ) : (
                          
                          /* 2. DURUM: CEVAP YAZMA VEYA DÜZENLEME FORMU */
                          currentUserId === (product.seller._id || product.seller) && (
                            <div className="mt-4 w-full">
                              {replyingToReviewId === review._id ? (
                                <form onSubmit={(e) => submitSellerReply(e, review._id)} className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-5 animate-fadeIn w-full shadow-sm">
                                  <label className="block text-xs font-bold text-amber-700 uppercase tracking-wide mb-3">
                                    {review.sellerReply?.comment ? "Edit Official Response" : "Write Official Response"}
                                  </label>
                                  
                                  <textarea
                                    value={sellerReplyText}
                                    onChange={(e) => setSellerReplyText(e.target.value)}
                                    maxLength="1000"
                                    rows="4"
                                    className="w-full min-w-full bg-white border border-amber-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition resize-y"
                                    placeholder="Thank the customer or address their concern..."
                                  ></textarea>
                                  
                                  <div className="flex justify-between items-center mt-1 mb-3">
                                    <span className="text-[10px] text-amber-600 font-medium">Do not use offensive language.</span>
                                    <span className={`text-[10px] font-bold ${sellerReplyText.length >= 950 ? "text-red-500" : "text-amber-500"}`}>
                                      {sellerReplyText.length} / 1000
                                    </span>
                                  </div>

                                  <div className="flex justify-end gap-2 border-t border-amber-200/50 pt-3">
                                    <button 
                                      type="button" 
                                      onClick={() => {
                                        setReplyingToReviewId(null);
                                        setSellerReplyText("");
                                      }} 
                                      className="text-xs font-bold text-slate-500 hover:text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-lg transition"
                                    >
                                      Cancel
                                    </button>
                                    <button type="submit" disabled={replyLoading} className="text-xs font-bold bg-amber-500 text-white px-5 py-2 rounded-lg hover:bg-amber-600 transition disabled:opacity-50 shadow-md">
                                      {replyLoading ? "Saving..." : (review.sellerReply?.comment ? "Save Changes" : "Post Response")}
                                    </button>
                                  </div>
                                </form>
                              ) : (
                                
                                /* SADECE HİÇ CEVAP YOKSA "REPLY AS SELLER" BUTONU ÇIKAR */
                                !(review.sellerReply && review.sellerReply.comment) && (
                                  <button onClick={() => {
                                    setReplyingToReviewId(review._id);
                                    setSellerReplyText("");
                                  }} className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition flex items-center gap-1.5 border border-amber-100">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
                                    Reply as Seller
                                  </button>
                                )
                              )}
                            </div>
                          )
                        )}
                        {/* --------------------------------- */}
                        </div>
                        {/* ------------------------------------------- */}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-10 text-center">
                <div className="text-4xl mb-3">⭐</div>
                <h3 className="text-lg font-bold text-slate-900">No reviews yet</h3>
                <p className="text-slate-500 mt-1">Be the first one to review this product after purchase!</p>
              </div>
            )}
          </div>

        </div>
      </section>
   {/* --- ÖNERİLEN ÜRÜNLER (RELATED PRODUCTS) --- */}
      {relatedProducts.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200 mt-10">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-2xl">✨</span>
            <h2 className="text-2xl font-bold text-slate-900">You Might Also Like</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((item) => (
              <Link href={`/products/${item._id}`} key={item._id} className="group block">
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-lg hover:border-blue-200 group-hover:-translate-y-1">
                  
                  {/* Resim Kısmı */}
                  <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400 text-sm">No Image</div>
                    )}
                  </div>
                  
                  {/* Detay Kısmı */}
                  <div className="p-4">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">{item.category}</p>
                    <h3 className="text-sm font-bold text-slate-800 line-clamp-2 mb-2 group-hover:text-blue-700 transition">
                      {item.name}
                    </h3>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-lg font-extrabold text-slate-900">${item.price}</p>
                      <div className="flex items-center gap-1">
                        <span className="text-amber-400 text-xs">★</span>
                        <span className="text-xs font-bold text-slate-600">{item.rating ? item.rating.toFixed(1) : "New"}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      {/* ------------------------------------------- */}
    </main>
  );
}

