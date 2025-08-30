import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFurniture, seedFurniture } from '../services/api';
import FurnitureCard from '../components/FurnitureCard';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const [furniture, setFurniture] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchFurniture = async () => {
      try {
        const data = await getFurniture();
        setFurniture(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching furniture:', error);
        setError('Failed to load furniture. Please try again later.');
        setLoading(false);
      }
    };

    fetchFurniture();
  }, []);

  const handleSeedData = async () => {
    try {
      setLoading(true);
      await seedFurniture();
      const data = await getFurniture();
      setFurniture(data);
      setLoading(false);
    } catch (error) {
      console.error('Error seeding furniture:', error);
      setError('Failed to seed furniture data.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-auto my-4 max-w-4xl">
        <p>{error}</p>
        {isAdmin() && furniture.length === 0 && (
          <button
            onClick={handleSeedData}
            className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Seed Sample Furniture Data
          </button>
        )}
      </div>
    );
  }

  // Display featured items on home page (first 3 items)
  const featuredItems = furniture.slice(0, 3);

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_-10%,_color-mix(in_oklab,var(--color-brand)_35%,transparent)_0%,_transparent_60%)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900">
              <span className="block">Elegant Furniture</span>
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-[color:var(--color-brand)] to-[color:var(--color-accent)]">For Your Home</span>
            </h1>
            <p className="mt-4 sm:mt-6 max-w-3xl mx-auto text-base sm:text-lg md:text-xl text-gray-600">
              Discover quality pieces for every room. Designed for comfort and crafted to last.
            </p>
            <div className="mt-8">
              <Link
                to="/catalog"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-semibold text-[color:var(--color-brand-foreground)] bg-[color:var(--color-brand)] hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[color:var(--color-brand)]"
              >
                Browse Catalog
              </Link>
            </div>
          </div>
        </div>
      </section>

      {furniture.length === 0 && isAdmin() && (
        <div className="text-center mb-8">
          <p className="text-lg text-gray-600 mb-4">No furniture items found.</p>
          <button
            onClick={handleSeedData}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Seed Sample Furniture Data
          </button>
        </div>
      )}

  {featuredItems.length > 0 && (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Items</h2>
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
            {featuredItems.map((item) => (
              <FurnitureCard key={item._id} furniture={item} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              to="/catalog"
      className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold text-[color:var(--color-brand-foreground)] bg-[color:var(--color-brand)] hover:brightness-95"
            >
              View All Products
            </Link>
          </div>
        </div>
      )}

      {/* How it works section */}
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Browse</h3>
            <p className="mt-2 text-base text-gray-500">
              Explore our extensive collection of furniture for every room
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Order</h3>
            <p className="mt-2 text-base text-gray-500">
              Select your favorite pieces and place your order
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Delivery</h3>
            <p className="mt-2 text-base text-gray-500">
              Enjoy fast and reliable delivery to your doorstep
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
