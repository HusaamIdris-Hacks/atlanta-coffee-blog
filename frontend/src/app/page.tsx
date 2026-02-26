import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">Atlanta Coffee Shops</h1>
      <p className="mb-6 text-gray-600">
        Discover and explore coffee shops around Atlanta.
      </p>
      <Link
        href="/map"
        className="inline-block px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-900"
      >
        View Map
      </Link>
    </main>
  );
}
