"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import API_URL from "../../../lib/api";
import Navbar from "../../../components/Navbar";

export default function SellerReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/login");

      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/products/seller/reviews`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to load reviews.");
        
        setReviews(data.reviews || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [router]);

  // SADECE GÖRÜNÜM İÇİN YILDIZ ÇİZİCİ
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`text-xl ${i <= rating ? "text-amber-400" : "text-gray-200"}`}>★</span>
      );
    }
    return stars;
  };

  if (loading) {
    return <main className="min-h-screen bg-[#f7f8fc]"><Navbar /><div className="p-10 text-center text-slate-500 animate-pulse">Loading customer reviews...</div></main>;
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc]">
      <Navbar />
      
      <div className="mx-auto max-w-7xl px-6 py-10">
        
        {/* BAŞLIK */}
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-700">
            <span className="text-sm">⭐</span> Review Management
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Customer Reviews</h1>
          <p className="mt-2 text-slate-500">Monitor what customers are saying about your products and reply to them.</p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600">{error}</div>
        ) : reviews.length === 0 ? (
           <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-sm">
             <div className="text-5xl mb-4 opacity-50">⭐</div>
             <h3 className="text-xl font-bold text-slate-900">No reviews yet</h3>
             <p className="text-slate-500 mt-2">When customers review your products, they will appear here.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {reviews.map((review) => (
              <div key={review._id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 transition hover:shadow-md">
                
                {/* SOL KISIM: Ürün Bilgisi */}
                <div className="md:w-1/4 flex-shrink-0 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-6">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Reviewed Product</p>
                  <Link href={`/products/${review.productId}`} className="flex items-center gap-3 group">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                      {review.productImage ? (
                        <img src={review.productImage} alt={review.productName} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">No Img</div>
                      )}
                    </div>
                    <p className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition line-clamp-2">{review.productName}</p>
                  </Link>
                </div>

                {/* SAĞ KISIM: Yorum ve Cevapla Butonu */}
                <div className="md:w-3/4 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm">
                          {review.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{review.name}</p>
                          <div className="flex">{renderStars(review.rating)}</div>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                        {new Date(review.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <p className="text-slate-700 text-sm leading-relaxed mt-4 break-words whitespace-pre-wrap">
                      "{review.comment}"
                    </p>

                    {/* Satıcı daha önce cevap verdiyse göster */}
                    {review.sellerReply && review.sellerReply.comment && (
                      <div className="mt-4 bg-amber-50/50 border-l-4 border-amber-400 pl-4 py-3 rounded-r-lg shadow-sm">
                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block mb-1">Your Response:</span>
                        {/* DÜZELTME: line-clamp-2 kaldırıldı, yerine break-words ve whitespace-pre-wrap eklendi */}
                        <p className="text-sm text-slate-700 italic break-words whitespace-pre-wrap leading-relaxed">
                          {review.sellerReply.comment}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* AKSİYON BUTONU */}
                  <div className="mt-5 flex justify-end">
                    <Link 
                      href={`/products/${review.productId}`} 
                      className={`px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-sm ${
                        review.sellerReply && review.sellerReply.comment 
                          ? "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                          : "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/20"
                      }`}
                    >
                      {review.sellerReply && review.sellerReply.comment ? "View on Product Page" : "Reply to Customer 💬"}
                    </Link>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}