
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
  const { name, value } = e.target;

  if (name === "price") {
    // Sadece sayı ve en fazla 2 ondalık basamak
    if (!/^\d*(\.\d{0,2})?$/.test(value)) {
      return;
    }

    // Maksimum fiyat
    if (value !== "" && Number(value) > 999999.99) {
      setError("Price cannot be higher than $999,999.99.");
      return;
    }
  }

  if (name === "stock") {
    // Sadece tam sayı
    if (!/^\d*$/.test(value)) {
      return;
    }

    // Maksimum stok
    if (value !== "" && Number(value) > 999999) {
      setError("Stock quantity cannot be higher than 999,999.");
      return;
    }
  }

  if (name === "category") {
    // Maksimum 30 karakter
    if (value.length > 30) {
      setError("Category cannot be longer than 30 characters.");
      return;
    }

    // Sadece kategori için uygun karakterler
    if (!/^[a-zA-Z0-9ğüşıöçĞÜŞİÖÇ&\-\s]*$/.test(value)) {
      setError(
        "Category can only contain letters, numbers, spaces, & and -."
      );
      return;
    }
  }

  setFormData((current) => ({
    ...current,
    [name]: value,
  }));

  setError("");
  setSuccess("");
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
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.price ||
      !formData.stock ||
      !formData.category.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (Number(formData.price) < 0) {
      setError("Price cannot be negative.");
      return;
    }

    if (Number(formData.stock) < 0) {
      setError("Stock cannot be negative.");
      return;
    }
    if (Number(formData.price) > 999999.99) {
  setError("Price cannot be higher than $999,999.99.");
  return;
}

if (
  !Number.isInteger(Number(formData.stock)) ||
  Number(formData.stock) > 999999
) {
  setError("Stock must be a whole number between 0 and 999,999.");
  return;
}

if (formData.category.trim().length > 30) {
  setError("Category cannot be longer than 30 characters.");
  return;
}

if (!/[a-zA-ZğüşıöçĞÜŞİÖÇ]/.test(formData.category)) {
  setError("Category must contain at least one letter.");
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
          name: formData.name.trim(),
          description: formData.description.trim(),
          price: Number(formData.price),
          stock: Number(formData.stock),
          image: formData.image.trim(),
          category: formData.category.trim(),
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

      setSuccess("Your product has been published successfully.");

      setTimeout(() => {
        router.push("/seller/products");
      }, 1200);
    } catch (error) {
      console.error(error);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f8fc]">
      <Navbar />

      {/* PAGE HEADER */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">

          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

            <div>
              <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
                <Link
                  href="/seller/products"
                  className="transition hover:text-blue-600"
                >
                  Seller Center
                </Link>

                <span>›</span>

                <span className="text-gray-900">
                  Add Product
                </span>
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                Add a new product
              </h1>

              <p className="mt-3 max-w-2xl text-gray-500">
                Create your product listing, add the necessary details,
                and publish it to the marketplace.
              </p>
            </div>

            <Link
              href="/seller/products"
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
            >
              ← Back to My Products
            </Link>

          </div>

        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-6 py-10">

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">

          {/* FORM */}
          <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">

            {/* FORM HEADER */}
            <div className="border-b border-gray-100 px-7 py-6">
              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
                  ✦
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Product information
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Add the details customers will see.
                  </p>
                </div>

              </div>
            </div>

            <div className="p-7">

              {/* ALERTS */}
              {error && (
                <div className="mb-7 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">

                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-600">
                    !
                  </div>

                  <div>
                    <p className="font-semibold text-red-800">
                      Something went wrong
                    </p>

                    <p className="mt-1 text-sm text-red-700">
                      {error}
                    </p>
                  </div>

                </div>
              )}

              {success && (
                <div className="mb-7 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">

                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-600">
                    ✓
                  </div>

                  <div>
                    <p className="font-semibold text-emerald-800">
                      Product published
                    </p>

                    <p className="mt-1 text-sm text-emerald-700">
                      Your product was created successfully.
                    </p>
                  </div>

                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-7">

                {/* PRODUCT NAME */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Product name
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <Input
                    type="text"
                    name="name"
                    maxLength={40} 
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. iPhone 15 Pro Max"
                  />

                  <p className="mt-2 text-xs text-gray-400">
                    Use a clear and descriptive product name.
                  </p>
                </div>

                {/* DESCRIPTION */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-sm font-semibold text-gray-900">
                      Description
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <span className="text-xs text-gray-400">
                      {formData.description.length} characters
                    </span>
                  </div>

                  <textarea
                    name="description"
                    value={formData.description}
                    maxLength={2000}
                    required
                    onChange={handleChange}
                    placeholder="Tell customers about the product, its features, condition and specifications..."
                    rows={7}
                    className="w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />

                  <p className="mt-2 text-xs text-gray-400">
                    A detailed description helps customers understand your product.
                  </p>
                </div>

                {/* PRICE / STOCK */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-900">
                      Price
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <div className="relative">

                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                        $
                      </span>

                      <Input
  type="number"
  name="price"
  value={formData.price}
  onChange={handleChange}
  min="0"
  max="999999.99"
  step="0.01"
  placeholder="0.00"
  className="pl-9"
/>

                    </div>

                    <p className="mt-2 text-xs text-gray-400">
                      Set the selling price in USD.
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-900">
                      Stock quantity
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <Input
  type="number"
  name="stock"
  value={formData.stock}
  onChange={handleChange}
  min="0"
  max="999999"
  step="1"
  placeholder="0"
/>

                    <p className="mt-2 text-xs text-gray-400">
                      Number of items currently available.
                    </p>
                  </div>

                </div>

                {/* CATEGORY */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Category
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <Input
  type="text"
  name="category"
  value={formData.category}
  onChange={handleChange}
  maxLength={25}
  placeholder="e.g. Electronics, Clothing, Home"
/>

                  <p className="mt-2 text-xs text-gray-400">
                    Choose a simple category that best describes your product.
                  </p>
                </div>

                {/* IMAGE */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Product image
                    <span className="ml-2 font-normal text-gray-400">
                      Optional
                    </span>
                  </label>

                  <Input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://example.com/product-image.jpg"
                  />

                  <p className="mt-2 text-xs text-gray-400">
                    Paste a direct URL to a JPEG, PNG or WebP image.
                  </p>
                </div>

                {/* DIVIDER */}
                <div className="border-t border-gray-100 pt-7">

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <p className="text-sm text-gray-500">
                      Fields marked with{" "}
                      <span className="text-red-500">*</span>{" "}
                      are required.
                    </p>

                    <div className="flex flex-col gap-3 sm:flex-row">

                      <Link
                        href="/seller/products"
                        className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                      >
                        Cancel
                      </Link>

                      <Button
                        type="submit"
                        disabled={loading}
                        variant="accent"
                        className="!w-auto px-8"
                      >
                        {loading
                          ? "Publishing..."
                          : "Publish Product"}
                      </Button>

                    </div>

                  </div>

                </div>

              </form>

            </div>

          </div>

          {/* LIVE PREVIEW */}
          <aside className="lg:sticky lg:top-6 lg:h-fit">

            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

              <div className="border-b border-gray-100 px-6 py-5">

                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Live preview
                </p>

                <h2 className="mt-1 text-lg font-bold text-gray-900">
                  Customer view
                </h2>

              </div>

              {/* IMAGE PREVIEW */}
              <div className="mt-4 p-2 w-full max-w-sm rounded-2xl border border-gray-200 bg-gray-50 shadow-sm transition-all"> 

                {formData.image ? (
                  <img
                    src={formData.image}
                    alt={formData.name || "Product preview"}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-gray-400">

                    <div className="text-5xl">
                      📦
                    </div>

                    <p className="mt-4 text-sm font-medium">
                      Product image preview
                    </p>

                    <p className="mt-1 text-xs">
                      Add an image URL above
                    </p>

                  </div>
                )}

              </div>

              {/* PREVIEW INFO */}
              <div className="p-6">

                <div className="flex items-center justify-between gap-3">

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                    {formData.category || "Category"}
                  </span>

                  <span className="text-xs text-gray-400">
                    {formData.stock
                      ? `${formData.stock} in stock`
                      : "Stock"}
                  </span>

                </div>

                <h3 className="mt-4 line-clamp-2 text-xl font-bold text-gray-900">
                  {formData.name || "Your product name"}
                </h3>

                <p className="mt-3 line-clamp-4 text-sm leading-6 text-gray-500">
                  {formData.description ||
                    "Your product description will appear here. Add a clear description to help customers understand what you are selling."}
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-5">

                  <span className="text-2xl font-bold text-blue-600">
                    {formData.price
                      ? `$${Number(formData.price).toFixed(2)}`
                      : "$0.00"}
                  </span>

                  <span className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
                    View Product
                  </span>

                </div>

              </div>

            </div>

            {/* SELLER TIP */}
            <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-5">

              <div className="flex gap-3">

                <div className="text-xl">
                  💡
                </div>

                <div>
                  <h3 className="font-semibold text-blue-900">
                    Seller tip
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-blue-800/80">
                    Use a clear product name, detailed description
                    and high-quality image to make your listing more attractive.
                  </p>
                </div>

              </div>

            </div>

          </aside>

        </div>

      </section>

    </main>
  );
}

