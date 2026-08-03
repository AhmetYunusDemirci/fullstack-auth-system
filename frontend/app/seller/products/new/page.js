"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import API_URL from "../../../../lib/api";
import Navbar from "../../../../components/Navbar";
import Input from "../../../../components/Input";
import Button from "../../../../components/Button";

export default function NewProductPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    image: "",
    category: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    if (
      !formData.name ||
      !formData.description ||
      !formData.price ||
      !formData.stock ||
      !formData.category
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: Number(formData.price),
          stock: Number(formData.stock),
          image: formData.image,
          category: formData.category,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        setError(data.message || "Product could not be created.");
        return;
      }

      setSuccess("Product created successfully.");

      setTimeout(() => {
        router.push("/seller/products"); // Ürün başarıyla eklenince satıcı paneline dönmesi UX açısından daha iyi olabilir (istediğin gibi değiştirebilirsin).
      }, 1500);
    } catch (error) {
      console.error(error);
      setError("Server Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f8fc]">
      <Navbar />

      <section className="mx-auto max-w-3xl px-6 py-14">
        <div className="card">
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Sell a Product
            </h1>
            <p className="mt-2 text-gray-500">
              Add your product to the marketplace and start selling today.
            </p>
          </div>

          {/* ERROR ALERT */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
               <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-200 text-xs font-bold text-red-700 mt-0.5">
                !
              </div>
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          {/* SUCCESS ALERT */}
          {success && (
            <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-3">
              <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-200 text-xs font-bold text-emerald-700 mt-0.5">
                ✓
              </div>
              <p className="text-sm font-medium text-emerald-800">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* NAME */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Product Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Example: iPhone 15 Pro Max"
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Description <span className="text-red-500">*</span>
              </label>
              {/* Input bileşeni sadece input tag'i içerdiği için burada .input class'ını textarea'ya direkt verdik */}
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your product's features, condition, etc..."
                rows={5}
                className="input resize-y"
              />
            </div>

            {/* PRICE & STOCK */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Price ($) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Stock <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>

            {/* CATEGORY */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Category <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Example: Electronics, Clothing, etc."
              />
            </div>

            {/* IMAGE */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Image URL
                <span className="ml-2 font-normal text-gray-400">
                  (Optional)
                </span>
              </label>
              <Input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/product-image.jpg"
              />
              <p className="mt-2 text-xs text-gray-500">
                Provide a direct link to an image (JPEG, PNG). Leave empty if you don't have one.
              </p>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-4 border-t border-gray-100">
              <Button
                type="submit"
                disabled={loading}
                variant="accent"
                className="w-full sm:w-auto sm:px-10"
              >
                {loading ? "Publishing..." : "Publish Product"}
              </Button>
            </div>

          </form>
        </div>
      </section>
    </main>
  );
}