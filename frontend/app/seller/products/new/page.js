"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import API_URL from "../../../../lib/api";

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
        router.push("/");
      }, 1000);
    } catch (error) {
      console.error(error);
      setError("Server Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100">

      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-5">

          <div className="flex justify-between items-center">

            <Link href="/">
              <h1 className="text-3xl font-bold text-blue-600">
                MyStore
              </h1>
            </Link>

            <div className="flex gap-3">

              <Link
                href="/"
                className="bg-gray-800 text-white px-5 py-2 rounded-lg hover:bg-gray-900"
              >
                Home
              </Link>

              <Link
                href="/profile"
                className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700"
              >
                Profile
              </Link>

            </div>

          </div>

        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 py-10">

        <div className="bg-white rounded-2xl shadow-xl p-8">

          <h1 className="text-3xl font-bold">
            Sell a Product
          </h1>

          <p className="text-gray-500 mt-2">
            Add your product to the marketplace.
          </p>

          {error && (
            <div className="mt-6 bg-red-100 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-6 bg-green-100 text-green-700 p-4 rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">

            <div>
              <label className="block font-semibold mb-2">
                Product Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Example: iPhone 15"
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your product..."
                rows={5}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>
                <label className="block font-semibold mb-2">
                  Price
                </label>

                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0"
                  className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">
                  Stock
                </label>

                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  placeholder="0"
                  className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

            </div>

            <div>
              <label className="block font-semibold mb-2">
                Category
              </label>

              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Example: Electronics"
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
  <label className="block font-semibold mb-2">
    Image URL
    <span className="text-gray-400 font-normal ml-2">
      (Optional)
    </span>
  </label>

  <input
    type="text"
    name="image"
    value={formData.image}
    onChange={handleChange}
    placeholder="https://example.com/image.jpg"
    className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
  />

  <p className="text-sm text-gray-500 mt-2">
    You can leave this empty if you do not have an image.
  </p>
</div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? "Creating Product..." : "Publish Product"}
            </button>

          </form>

        </div>

      </section>

    </main>
  );
}