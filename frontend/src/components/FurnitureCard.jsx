import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function FurnitureCard({ furniture }) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  
  const handleAddToCart = () => {
    addToCart(furniture);
    setIsAdded(true);
    
    // Reset the button after 2 seconds
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100">
      <Link to={`/furniture/${furniture._id}`}>
        <img 
          src={furniture.imageUrl} 
          alt={furniture.name}
          className="w-full h-48 object-cover transition-transform duration-300 hover:scale-[1.02]"
        />
      </Link>
      <div className="p-4">
        <Link to={`/furniture/${furniture._id}`}>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 tracking-tight">{furniture.name}</h2>
        </Link>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{furniture.description}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xl font-bold text-gray-900">${furniture.price.toFixed(2)}</span>
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{furniture.category}</span>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={isAdded}
          className={`mt-4 w-full py-2.5 px-4 rounded-lg ${
            isAdded 
              ? 'bg-green-500 text-white' 
              : 'bg-[color:var(--color-brand)] text-[color:var(--color-brand-foreground)] hover:brightness-95'
          } transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[color:var(--color-brand)]`}
        >
          {isAdded ? 'Added to Cart!' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
