"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import API_URL from "../../../../../lib/api"; 
import Navbar from "../../../../../components/Navbar"; 
import Input from "../../../../../components/Input";
import Button from "../../../../../components/Button";

import toast from "react-hot-toast";

export default function EditProductPage() {
const params = useParams();
const router = useRouter();

const [formData, setFormData] = useState({
name: "",
description: "",
price: "",
stock: "",
image: "",
category: "",
});

const [product, setProduct] = useState(null);

const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);

const [error, setError] = useState("");
const [success, setSuccess] = useState("");

// --------------------------------
// LOAD PRODUCT
// --------------------------------

useEffect(() => {
const loadProduct = async () => {
const token = localStorage.getItem("token");


  if (!token) {
    router.push("/login");
    return;
  }

  if (!params.id) {
    setError("Product ID is missing.");
    setLoading(false);
    return;
  }

  try {
    setLoading(true);
    setError("");

    const response = await fetch(
      `${API_URL}/products/${params.id}`
    );

    const data = await response.json();

    if (!response.ok) {
      setError(
        data.message || "Product could not be loaded."
      );
      return;
    }

    const loadedProduct = data.product;

    setProduct(loadedProduct);

    // Formu mevcut ürün bilgileriyle doldur
    setFormData({
      name: loadedProduct.name || "",
      description: loadedProduct.description || "",
      price: loadedProduct.price ?? "",
      stock: loadedProduct.stock ?? "",
      image: loadedProduct.image || "",
      category: loadedProduct.category || "",
    });
  } catch (error) {
    console.error(error);
    setError("Unable to connect to the server.");
  } finally {
    setLoading(false);
  }
};

loadProduct();


}, [params.id, router]);

// --------------------------------
// HANDLE INPUT
// --------------------------------

const handleChange = (e) => {
const { name, value } = e.target;


setFormData((current) => ({
  ...current,
  [name]: value,
}));


};

// --------------------------------
// UPDATE PRODUCT
// --------------------------------

const handleSubmit = async (e) => {
e.preventDefault();
setError("");
  setSuccess("");

  const token = localStorage.getItem("token");

  if (!token) {
    router.push("/login");
    return;
  }

  // --- FRONTEND GÜVENLİK VE LİMİT KONTROLLERİ ---
  if (!formData.name.trim() || !formData.description.trim() || formData.price === "" || formData.stock === "" || !formData.category.trim()) {
    return toast.error("Please fill in all required fields.");
  }

  if (formData.name.trim().length > 100) return toast.error("Product name cannot exceed 100 characters.");
  if (formData.description.trim().length > 2000) return toast.error("Description cannot exceed 2000 characters.");
  if (formData.category.trim().length > 50) return toast.error("Category cannot exceed 50 characters.");
  
  if (Number(formData.price) < 0 || Number(formData.price) > 1000000) {
    return toast.error("Price must be between $0 and $1,000,000.");
  }

  if (!Number.isInteger(Number(formData.stock)) || Number(formData.stock) < 0 || Number(formData.stock) > 100000) {
    return toast.error("Stock must be a whole number between 0 and 100,000.");
  }
  // --- GÖRSEL KONTROLÜ ---
  if (formData.image.trim() !== "") {
    const imageRegex = /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i;
    if (!imageRegex.test(formData.image.trim())) {
      return toast.error("Please enter a valid image URL (Must end with .jpg, .png, .webp, etc.)");
    }
  }
try {
  setSaving(true);

  const response = await fetch(
    `${API_URL}/products/${params.id}`,
    {
      method: "PUT",

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
    }
  );

  const data = await response.json();

  // Token expired
  if (response.status === 401) {
    localStorage.removeItem("token");
    router.push("/login");
    return;
  }

  // Not owner
  if (response.status === 403) {

    toast.error(
      data.message ||
        "You can only edit your own products."
    );
    return;
  }

  if (!response.ok) {
    toast.error(
      data.message || "Product could not be updated."
    );
    return;
  }

  setProduct(data.product);

  setFormData({
    name: data.product.name || "",
    description: data.product.description || "",
    price: data.product.price ?? "",
    stock: data.product.stock ?? "",
    image: data.product.image || "",
    category: data.product.category || "",
  });

  setSuccess("Product updated successfully.");

  // Seller products sayfasına dön
  setTimeout(() => {
    router.push("/seller/products");
  }, 1200);
} catch (error) {
  console.error(error);
  toast.error("Unable to connect to the server.");
} finally {
  setSaving(false);
}


};

// --------------------------------
// LOADING
// --------------------------------

if (loading) {
return ( <main className="min-h-screen bg-[#f7f8fc]"> <Navbar />


    <section className="mx-auto max-w-5xl px-6 py-14">

      <div className="mb-8">
        <div className="skeleton h-10 w-64 rounded-lg" />
        <div className="skeleton mt-3 h-5 w-96 rounded-lg" />
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

        <div className="grid grid-cols-1 lg:grid-cols-5">

          <div className="skeleton min-h-[500px] lg:col-span-2" />

          <div className="space-y-6 p-8 lg:col-span-3">
            <div className="skeleton h-12 w-full rounded-xl" />
            <div className="skeleton h-32 w-full rounded-xl" />
            <div className="grid grid-cols-2 gap-5">
              <div className="skeleton h-12 rounded-xl" />
              <div className="skeleton h-12 rounded-xl" />
            </div>
            <div className="skeleton h-12 w-full rounded-xl" />
            <div className="skeleton h-12 w-full rounded-xl" />
          </div>

        </div>
      </div>

    </section>
  </main>
);


}

// --------------------------------
// ERROR
// --------------------------------

if (error && !product) {
return ( <main className="min-h-screen bg-[#f7f8fc]"> <Navbar />

```
    <section className="mx-auto max-w-5xl px-6 py-14">

      <div className="rounded-3xl border border-red-200 bg-white p-10 text-center shadow-sm">

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-2xl font-bold text-red-600">
          !
        </div>

        <h1 className="mt-5 text-2xl font-bold text-gray-900">
          Product Could Not Be Loaded
        </h1>

        <p className="mx-auto mt-2 max-w-lg text-gray-500">
          {error}
        </p>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">

          <Link href="/seller/products">
            <Button className="w-full sm:w-auto">
              Back to My Products
            </Button>
          </Link>

          <Link href="/">
            <button
              type="button"
              className="w-full rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 sm:w-auto"
            >
              Marketplace
            </button>
          </Link>

        </div>

      </div>

    </section>
  </main>
);


}

return ( <main className="min-h-screen bg-[#f7f8fc]">


  <Navbar />

  <section className="mx-auto max-w-5xl px-6 py-12">

    {/* PAGE HEADER */}

    <div className="mb-8">

      <Link
        href="/seller/products"
        className="inline-flex items-center text-sm font-semibold text-gray-500 transition hover:text-blue-600"
      >
        ← Back to My Products
      </Link>

      <div className="mt-5">

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Seller Center
            </p>

            <h1 className="mt-1 text-4xl font-bold tracking-tight text-gray-900">
              Edit Product
            </h1>

            <p className="mt-2 text-gray-500">
              Update your product information and keep your listing up to date.
            </p>

          </div>

          {product?.category && (
            <span className="w-fit rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
              {product.category}
            </span>
          )}

        </div>

      </div>

    </div>

    {/* FORM CARD */}

    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

      <form onSubmit={handleSubmit}>

        <div className="grid grid-cols-1 lg:grid-cols-5">

          {/* LEFT - PRODUCT PREVIEW */}

          <div className="border-b border-gray-200 bg-gray-50 p-6 lg:col-span-2 lg:border-b-0 lg:border-r">

            <div className="sticky top-6">

              <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                Product Preview
              </p>

              <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white">

                <div className="aspect-square overflow-hidden bg-gray-100">

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
                    <div className="flex h-full items-center justify-center text-gray-400">
                      <div className="text-center">
                        <div className="text-5xl">📦</div>
                        <p className="mt-3 text-sm font-medium">
                          No image
                        </p>
                      </div>
                    </div>
                  )}

                </div>

                <div className="p-5">

                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Current Listing
                  </p>

                  <h2 className="mt-2 truncate text-xl font-bold text-gray-900">
                    {formData.name || "Product name"}
                  </h2>

                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-500">
                    {formData.description ||
                      "Your product description will appear here."}
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-5">

                    <span className="text-2xl font-bold text-blue-600">
                      $
                      {formData.price !== ""
                        ? Number(formData.price).toFixed(2)
                        : "0.00"}
                    </span>

                    <span className="text-sm font-medium text-gray-500">
                      Stock: {formData.stock || 0}
                    </span>

                  </div>

                </div>

              </div>

              <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">

                <p className="text-sm font-semibold text-blue-900">
                  💡 Listing tip
                </p>

                <p className="mt-1 text-xs leading-relaxed text-blue-700">
                  Keep your title clear, description detailed,
                  and product image up to date to make your listing
                  more attractive to customers.
                </p>

              </div>

            </div>

          </div>

          {/* RIGHT - EDIT FORM */}

          <div className="p-6 sm:p-8 lg:col-span-3">

            {/* ERROR */}

            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">

                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">
                  !
                </div>

                <p className="text-sm font-medium text-red-800">
                  {error}
                </p>

              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">

                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-600">
                  ✓
                </div>

                <div>
                  <p className="text-sm font-semibold text-emerald-800">
                    {success}
                  </p>

                  <p className="mt-1 text-xs text-emerald-700">
                    Returning to your products...
                  </p>
                </div>

              </div>
            )}

            <div className="space-y-6">

              {/* NAME */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Product Name{" "}
                  <span className="text-red-500">*</span>
                </label>

                <Input
                  type="text"
                  name="name"
                  maxLength={50}
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Example: iPhone 15 Pro Max"
                />

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Description{" "}
                  <span className="text-red-500">*</span>
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  maxLength={2000}
                  required
                  onChange={handleChange}
                  placeholder="Describe your product..."
                  rows={6}
                  className="input w-full resize-y"
                />

              </div>

              {/* PRICE / STOCK */}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Price ($){" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <Input
                    type="number"
                    name="price"
                    max="999999.99"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Stock{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <Input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    max="999999"
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
                  />

                </div>

              </div>

              {/* CATEGORY */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Category{" "}
                  <span className="text-red-500">*</span>
                </label>

                <Input
                  type="text"
                  name="category"
                  maxLength={25}
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Example: Electronics"
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

                <p className="mt-2 text-xs leading-relaxed text-gray-500">
                  Paste a direct image URL. The preview on the left
                  updates automatically.
                </p>

              </div>

            </div>

            {/* ACTIONS */}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">

              <Link
                href="/seller/products"
                className="flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 sm:w-auto"
              >
                Cancel
              </Link>

              <Button
                type="submit"
                disabled={saving}
                variant="accent"
                className="w-full sm:w-auto sm:px-10"
              >
                {saving ? "Saving Changes..." : "Save Changes"}
              </Button>

            </div>

          </div>

        </div>

      </form>

    </div>

  </section>

</main>

);
}

