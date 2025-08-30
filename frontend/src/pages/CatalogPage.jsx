import { useState, useEffect } from 'react';
import { getFurniture } from '../services/api';
import FurnitureCard from '../components/FurnitureCard';

export default function CatalogPage() {
  const [furniture, setFurniture] = useState([]);
  const [filteredFurniture, setFilteredFurniture] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priceSort, setPriceSort] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchFurniture = async () => {
      try {
        const data = await getFurniture();
        setFurniture(data);
        setFilteredFurniture(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching furniture:', error);
        setError('Failed to load furniture. Please try again later.');
        setLoading(false);
      }
    };

    fetchFurniture();
  }, []);

  useEffect(() => {
    // Apply filters whenever filter states change
    let results = [...furniture];
    
    // Apply category filter
    if (categoryFilter !== 'All') {
      results = results.filter(item => item.category === categoryFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      results = results.filter(item => 
        item.name.toLowerCase().includes(searchTermLower) || 
        item.description.toLowerCase().includes(searchTermLower)
      );
    }
    
    // Apply price sorting
    if (priceSort === 'low-to-high') {
      results = results.sort((a, b) => a.price - b.price);
    } else if (priceSort === 'high-to-low') {
      results = results.sort((a, b) => b.price - a.price);
    }
    
    setFilteredFurniture(results);
  }, [categoryFilter, priceSort, searchTerm, furniture]);

  // Get unique categories for filter
  const categories = ['All', ...new Set(furniture.map(item => item.category))];

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
      </div>
    );
  }

  return (
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Furniture Catalog</h1>
      
      {/* Filters section */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Search */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search</label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-[color:var(--color-brand)] focus:ring-[color:var(--color-brand)]"
            placeholder="Search furniture..."
          />
        </div>
        
        {/* Category Filter */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
          <select
            id="category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-[color:var(--color-brand)] focus:ring-[color:var(--color-brand)]"
          >
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        {/* Price Sort */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">Sort by Price</label>
          <select
            id="price"
            value={priceSort}
            onChange={(e) => setPriceSort(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-[color:var(--color-brand)] focus:ring-[color:var(--color-brand)]"
          >
            <option value="">No Sorting</option>
            <option value="low-to-high">Price: Low to High</option>
            <option value="high-to-low">Price: High to Low</option>
          </select>
        </div>
      </div>
      
      {/* Results count */}
      <p className="text-sm text-gray-500 mb-4">
        Showing {filteredFurniture.length} {filteredFurniture.length === 1 ? 'item' : 'items'}
      </p>
      
      {/* Furniture grid */}
      {filteredFurniture.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">No furniture items found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredFurniture.map((item) => (
            <FurnitureCard key={item._id} furniture={item} />
          ))}
        </div>
      )}
    </div>
  );
}
