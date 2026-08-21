"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import API_URL from "../../../lib/api";
import Navbar from "../../../components/Navbar"; 
// Eğer Admin için ayrı bir Sidebar'ın varsa buraya import edebilirsin, ben genel Navbar ile uyumlu yaptım.

export default function AdminReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAdminReviews = async () => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/products/admin/all-reviews`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to load reviews.");
      
      setReviews(data.reviews || []);
      setStats(data.stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminReviews();
  }, []);

  const handleDeleteReview = async (productId, reviewId) => {
    if (!window.confirm("Are you sure you want to permanently delete this review? This action cannot be undone.")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/products/admin/reviews/${productId}/${reviewId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Review permanently deleted.");
        // Sayfayı yenilemeden listeden çıkar ve istatistikleri güncellemek için verileri tekrar çek
        loadAdminReviews(); 
      } else {
        toast.error(data.message || "Failed to delete review.");
      }
    } catch (error) {
      toast.error("Server connection error.");
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(<span key={i} className={`text-lg ${i <= rating ? "text-amber-400" : "text-gray-200"}`}>★</span>);
    }
    return stars;
  };

  if (loading) return <main className="min-h-screen bg-slate-50"><Navbar /><div className="p-10 text-center animate-pulse text-slate-500">Loading moderation panel...</div></main>;

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <Navbar />
      
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* BAŞLIK */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-700">
              🛡️ Admin Moderation
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Review Management</h1>
            <p className="mt-2 text-slate-500">Monitor all platform reviews and delete malicious content.</p>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600">{error}</div>
        ) : (
          <>
            {/* İSTATİSTİK KARTLARI */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-5">
                  <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-2xl">📝</div>
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase">Total Reviews</p>
                    <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.totalReviews}</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-5">
                  <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center text-2xl">⭐</div>
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase">Avg. Platform Rating</p>
                    <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.averageRating} / 5.0</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-5">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center text-2xl">🏆</div>
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase">5-Star Ratio</p>
                    <p className="text-3xl font-extrabold text-slate-900 mt-1">%{stats.fiveStarRatio}</p>
                  </div>
                </div>
              </div>
            )}

            {/* YORUMLAR LİSTESİ */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-800">Recent Platform Reviews</h3>
              </div>
              
              <div className="divide-y divide-slate-100">
                {reviews.length === 0 ? (
                  <div className="p-10 text-center text-slate-500">No reviews found on the platform.</div>
                ) : (
                  reviews.map(review => (
                    <div key={review._id} className="p-6 flex flex-col md:flex-row gap-6 hover:bg-slate-50/50 transition">
                      
                      {/* Sol: Yorum Yapan & Yıldız */}
                      <div className="md:w-1/4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center">
                            {review.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{review.name}</p>
                            <p className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex mb-1">{renderStars(review.rating)}</div>
                        {review.likes && review.likes.length > 0 && (
                          <p className="text-[11px] text-emerald-600 font-semibold">{review.likes.length} people found helpful</p>
                        )}
                      </div>

                      {/* Orta: Yorum & Ürün */}
                      <div className="md:w-2/4">
                        <div className="mb-3 inline-flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold text-slate-400">On Product:</span>
                          <Link href={`/products/${review.productId}`} className="text-sm font-bold text-blue-600 hover:underline">
                            {review.productName}
                          </Link>
                        </div>
                        <p className="text-slate-700 text-sm break-words whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-100">
                          {review.comment}
                        </p>
                        
                        {/* Satıcı cevabı varsa admin de görsün */}
                        {review.sellerReply?.comment && (
                          <div className="mt-3 ml-4 border-l-2 border-amber-300 pl-3">
                            <span className="text-[10px] font-bold text-amber-600 uppercase">Seller Replied:</span>
                            <p className="text-xs text-slate-500 italic mt-1 line-clamp-2">{review.sellerReply.comment}</p>
                          </div>
                        )}
                      </div>

                      {/* Sağ: Aksiyon (SİL) */}
                      <div className="md:w-1/4 flex items-center justify-end">
                        <button 
                          onClick={() => handleDeleteReview(review.productId, review._id)}
                          className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-600 hover:text-white transition shadow-sm"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          Delete Review
                        </button>
                      </div>

                    </div>
                  ))
                )}
              </div>
            </div>

          </>
        )}
      </div>
    </main>
  );
}