"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";

export default function HelpCenterPage() {
  const [activeFaq, setActiveFaq] = useState(null);

  // Popüler Sorular Datası
  const faqs = [
    {
      q: "Siparişim ne zaman kargoya verilir?",
      a: "Siparişleriniz onaylandıktan sonra satıcı tarafından 1-3 iş günü içerisinde kargoya teslim edilmektedir. Sipariş durumunuzu 'Siparişlerim' ekranından takip edebilirsiniz."
    },
    {
      q: "Aldığım ürünü nasıl iade edebilirim?",
      a: "Teslim alınmış statüsündeki siparişleriniz için 'Siparişlerim' sayfasından 'İade Talep Et' butonuna tıklayarak iade sürecinizi başlatabilirsiniz. İade süresi teslimattan itibaren 14 gündür."
    },
    {
      q: "Kargo ücretleri ne kadar?",
      a: "Platformumuzda 500 TL ve üzeri alışverişlerinizde kargo ücretsizdir. 500 TL altı siparişlerde standart kargo ücreti uygulanmaktadır."
    },
    {
      q: "Kredi kartına taksit yapıyor musunuz?",
      a: "Evet, ödeme adımında anlaşmalı olduğumuz tüm bankaların kredi kartlarına 12 aya varan taksit seçenekleri sunulmaktadır."
    }
  ];

  // Bilgilendirme Kategorileri Datası
  const categories = [
    { icon: "📦", title: "Siparişler", desc: "Sipariş takibi, iptal işlemleri ve adres değişikliği." },
    { icon: "🚚", title: "Kargo ve Teslimat", desc: "Kargo firmaları, teslimat süreleri ve kargo ücretleri." },
    { icon: "🔄", title: "İade İşlemleri", desc: "İade koşulları, iade kodu alma ve ücret iadesi süreçleri." },
    { icon: "🧾", title: "Kurumsal Fatura", desc: "Vergi mükellefleri için kurumsal fatura talepleri ve e-fatura süreci." },
    { icon: "🛡️", title: "Sigorta ve Garanti", desc: "Elektronik ürün garantileri ve kırılmaya karşı sigorta seçenekleri." },
    { icon: "📖", title: "İşlem Rehberi", desc: "Platformumuzu nasıl kullanacağınıza dair adım adım rehberler." },
    { icon: "🏢", title: "MyStore Hakkında", desc: "Vizyonumuz, kariyer fırsatları ve kullanım koşulları." },
    { icon: "📞", title: "İletişim", desc: "Müşteri hizmetleri iletişim kanalları ve satıcı desteği." },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      {/* HERO ARAMA ALANI */}
      <div className="bg-blue-600 px-6 py-16 text-center text-white">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Merhaba, size nasıl yardımcı olabiliriz?</h1>
        <div className="mx-auto mt-8 max-w-2xl relative">
          <input 
            type="text" 
            placeholder="Sorunuzu buraya yazın (Örn: İade nasıl yaparım?)" 
            className="w-full rounded-2xl py-4 pl-6 pr-12 text-slate-800 outline-none shadow-xl focus:ring-4 focus:ring-blue-300 transition"
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600 bg-blue-50 p-2 rounded-lg hover:bg-blue-100 transition">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">
        
        {/* KATEGORİLER GRID */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-16">
          {categories.map((cat, index) => (
            <Link href="#" key={index} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-300">
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform origin-left">{cat.icon}</div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{cat.title}</h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">{cat.desc}</p>
            </Link>
          ))}
        </div>

        {/* POPÜLER SORULAR (AKORDEON) */}
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-2xl">🔥</span>
            <h2 className="text-2xl font-bold text-slate-900">Popüler Sorular</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="rounded-xl border border-slate-100 bg-slate-50 overflow-hidden transition-all">
                <button 
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="flex w-full items-center justify-between p-5 text-left font-semibold text-slate-800 hover:bg-slate-100 transition"
                >
                  {faq.q}
                  <span className={`text-slate-400 transition-transform duration-300 ${activeFaq === index ? "rotate-180" : ""}`}>
                    ▼
                  </span>
                </button>
                <div 
                  className={`px-5 text-sm text-slate-600 transition-all duration-300 ease-in-out ${
                    activeFaq === index ? "max-h-40 pb-5 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                  }`}
                >
                  {faq.a}
                </div>
              </div>
            ))}
          </div>

          {/* CANLI DESTEK YÖNLENDİRMESİ */}
          <div className="mt-10 rounded-2xl bg-blue-50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-blue-100">
            <div>
              <h4 className="font-bold text-blue-900">Aradığınız cevabı bulamadınız mı?</h4>
              <p className="text-sm text-blue-700 mt-1">Müşteri temsilcilerimiz size yardım etmek için burada.</p>
            </div>
            <Link href="/contact" className="whitespace-nowrap rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-md hover:bg-blue-700 transition">
              Bize Ulaşın
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}