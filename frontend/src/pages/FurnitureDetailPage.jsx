import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFurnitureById } from '../services/api';
import { useCart } from '../context/CartContext';

export default function FurnitureDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [furniture, setFurniture] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchFurnitureDetail = async () => {
      try {
        const data = await getFurnitureById(id);
        setFurniture(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching furniture details:', error);
        setError('Failed to load furniture details. Please try again later.');
        setLoading(false);
      }
    };

    fetchFurnitureDetail();
  }, [id]);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(furniture);
    }
    setAddedToCart(true);
    
    // Reset after 2 seconds
    setTimeout(() => {
      setAddedToCart(false);
    }, 2000);
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !furniture) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-auto my-4 max-w-4xl">
        <p>{error || 'Furniture item not found'}</p>
        <button
          onClick={() => navigate('/catalog')}
          className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Back to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
  <div className="bg-gray-100 rounded-xl overflow-hidden border border-gray-100">
          <img 
            src={furniture.imageUrl} 
            alt={furniture.name} 
            className="w-full h-96 object-cover"
          />
        </div>
        
        {/* Details */}
        <div>
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <button 
                  onClick={() => navigate('/')}
                  className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  Home
                </button>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <button 
                    onClick={() => navigate('/catalog')}
                    className="text-sm font-medium text-gray-700 hover:text-blue-600"
                  >
                    Catalog
                  </button>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-sm font-medium text-gray-500">{furniture.name}</span>
                </div>
              </li>
            </ol>
          </nav>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{furniture.name}</h1>
          
          <div className="flex items-center mb-4">
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {furniture.category}
            </span>
            <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold ${furniture.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {furniture.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
          
          <p className="text-3xl font-bold text-gray-900 mb-4">
            ${furniture.price.toFixed(2)}
          </p>
          
          <div className="border-t border-gray-200 py-4">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-600 mb-6">{furniture.description}</p>
            
            {furniture.inStock && (
              <div className="mt-6">
                <div className="flex items-center mb-4">
                  <label htmlFor="quantity" className="block mr-4 text-sm font-medium text-gray-700">
                    Quantity:
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    min="1"
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-20 rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-[color:var(--color-brand)] focus:ring-[color:var(--color-brand)]"
                  />
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={addedToCart}
                  className={`w-full py-3 px-4 rounded-lg ${
                    addedToCart 
                      ? 'bg-green-500 text-white' 
                      : 'bg-[color:var(--color-brand)] text-[color:var(--color-brand-foreground)] hover:brightness-95'
                  } transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[color:var(--color-brand)]`}
                >
                  {addedToCart ? 'Added to Cart!' : 'Add to Cart'}
                </button>
              </div>
            )}
            
            {!furniture.inStock && (
              <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      This item is currently out of stock.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
