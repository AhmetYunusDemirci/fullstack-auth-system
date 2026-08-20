"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import API_URL from "../../lib/api";
 
import toast from "react-hot-toast";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState("idle"); // idle, loading, success, error

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e) => {
    e.preventDefault();

    // --- FRONTEND GÜVENLİK VE LİMİT KONTROLLERİ ---
    if (formData.name.trim().length > 50) {
      toast.error("Name cannot exceed 50 characters.");
      return;
    }
    
    if (formData.subject.trim().length > 100) {
      toast.error("Subject cannot exceed 100 characters.");
      return;
    }
    
    if (formData.message.trim().length > 3000) {
      toast.error("Message cannot exceed 3000 characters.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    // ---------------------------------------------

    try {
      setLoading(true); // Varsa kendi loading state'ini kullan

      const response = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Your message has been sent successfully!");
        // Formu temizle
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        // Backend'den gelen spesifik hatayı ekrana bas
        toast.error(data.message || "Failed to send message.");
      }
    } catch (error) {
      console.error("Contact Form Error:", error);
      toast.error("Server connection error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f8fc]">
      <Navbar />

      {/* HERO BÖLÜMÜ */}
      <section className="relative overflow-hidden bg-[#0f172a] py-16">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-32 -right-20 h-96 w-96 rounded-full bg-blue-500 blur-3xl" />
          <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-indigo-500 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            How can we <span className="text-blue-400">help you?</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-300">
            Have a question about your order, want to report an issue, or just want to say hi? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* İLETİŞİM İÇERİĞİ */}
      <section className="max-w-7xl mx-auto px-6 py-16 -mt-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* SOL BİLGİ KARTLARI */}
          <div className="lg:col-span-1 space-y-6">
            
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl mb-5">
                📍
              </div>
              <h3 className="text-xl font-bold text-slate-900">Headquarters</h3>
              <p className="mt-2 text-slate-500 leading-relaxed">
                İstanbul<br />
                Türkiye
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mb-5">
                ✉️
              </div>
              <h3 className="text-xl font-bold text-slate-900">Email Us</h3>
              <p className="mt-2 text-slate-500 leading-relaxed">
                For general inquiries:<br />
                <a href="mailto:support@mystore.com" className="text-blue-600 hover:underline font-medium">Mystore@email.com</a>
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl mb-5">
                ⏱️
              </div>
              <h3 className="text-xl font-bold text-slate-900">Business Hours</h3>
              <p className="mt-2 text-slate-500 leading-relaxed">
                Monday - Friday<br />
                09:00 AM - 06:00 PM (GMT+3)
              </p>
            </div>

          </div>

          {/* SAĞ İLETİŞİM FORMU */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-8 sm:p-10 border-b border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900">Send us a message</h2>
              <p className="text-slate-500 mt-2">Fill out the form below and our team will get back to you within 24 hours.</p>
            </div>

            <div className="p-8 sm:p-10">
              {status === "success" ? (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto mb-5">
                    ✓
                  </div>
                  <h3 className="text-2xl font-bold text-emerald-900">Message Sent!</h3>
                  <p className="mt-2 text-emerald-700">Thank you for reaching out. We will get back to you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Full Name</label>
                      <input 
                        type="text" 
                        id="name" 
                        name="name" 
                        required 
                        maxLength={35} 
                        value={formData.name} 
                        onChange={handleChange}
                        className="w-full mt-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition text-slate-900" 
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Email Address</label>
                      <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        required 
                        maxLength={70}
                        value={formData.email} 
                        onChange={handleChange}
                        className="w-full mt-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition text-slate-900" 
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Subject</label>
                    <input 
                      type="text" 
                      id="subject" 
                      name="subject" 
                      required 
                      maxLength={100}
                      value={formData.subject} 
                      onChange={handleChange}
                      className="w-full mt-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition text-slate-900" 
                      placeholder="How can we help?"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Your Message</label>
                    <textarea 
                      id="message" 
                      name="message" 
                      required 
                      maxLength={3000}
                      rows="5"
                      value={formData.message} 
                      onChange={handleChange}
                      className="w-full mt-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition text-slate-900 resize-none" 
                      placeholder="Write your message here..."
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={status === "loading"}
                    className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {status === "loading" ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}