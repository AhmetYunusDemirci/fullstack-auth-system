import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">

      <div className="bg-white shadow-lg rounded-xl p-10 w-[450px]">

        <h1 className="text-3xl font-bold text-center mb-2">
          FullStack Auth
        </h1>

        <p className="text-center text-gray-500 mb-8">
          Authentication System
        </p>

        <div className="flex flex-col gap-4">

          <Link
            href="/register"
            className="bg-blue-600 text-white py-3 rounded-lg text-center hover:bg-blue-700"
          >
            Register
          </Link>

          <Link
            href="/login"
            className="bg-green-600 text-white py-3 rounded-lg text-center hover:bg-green-700"
          >
            Login
          </Link>

        </div>

      </div>

    </main>
  );
}