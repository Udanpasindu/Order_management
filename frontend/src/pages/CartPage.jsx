import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/api';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) errors.phone = 'Phone is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    
    return errors;
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      const orderData = {
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address
        },
        items: cartItems.map((item) => ({
          furniture: item._id,
          quantity: item.quantity,
          price: item.price
        }))
      };
      
      await createOrder(orderData);
      clearCart();
      setOrderSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 5000);
    } catch (error) {
      console.error('Error creating order:', error);
      setOrderError('Failed to process your order. Please try again.');
    }
  };

  if (orderSuccess) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-8">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-lg font-medium text-green-800">Order Placed Successfully!</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Thank you for your order. You will receive a confirmation email shortly.</p>
              </div>
              <div className="mt-4">
                <Link
                  to="/"
                  className="text-sm font-medium text-green-700 hover:text-green-600"
                >
                  ← Return to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        <div className="text-center py-12">
          <p className="text-lg text-gray-600 mb-6">Your cart is empty</p>
            <Link
              to="/catalog"
              className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold text-[color:var(--color-brand-foreground)] bg-[color:var(--color-brand)] hover:brightness-95"
            >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
      
      {orderError && (
        <div className="bg-red-100 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{orderError}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100">
            <ul className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <li key={item._id} className="p-4 sm:p-6 flex flex-col sm:flex-row">
                  <div className="flex-shrink-0 mr-6">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-1 flex flex-col mt-4 sm:mt-0">
                    <div className="flex justify-between">
                      <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                      <p className="text-lg font-medium text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex items-center border rounded-lg">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-l-lg"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="px-3 py-1">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-r-lg"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-sm text-red-600 hover:text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex justify-between">
            <Link
              to="/catalog"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              ← Continue Shopping
            </Link>
            <button
              onClick={clearCart}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
            >
              Clear Cart
            </button>
          </div>
        </div>
        
        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-100">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
            <div className="flow-root">
              <ul className="mb-6 divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <li key={item._id} className="flex justify-between py-2">
                    <div>
                      <span className="text-gray-700">{item.name}</span>
                      <span className="text-gray-500 ml-2">x {item.quantity}</span>
                    </div>
                    <span className="text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <dt className="text-lg font-medium text-gray-900">Total</dt>
                  <dd className="text-lg font-bold text-blue-600">
                    ${getTotalPrice().toFixed(2)}
                  </dd>
                </div>
              </div>
            </div>
            
            {!isCheckingOut ? (
              <button
                onClick={() => setIsCheckingOut(true)}
                className="mt-6 w-full rounded-lg shadow-sm py-3 px-4 text-base font-medium text-[color:var(--color-brand-foreground)] bg-[color:var(--color-brand)] hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[color:var(--color-brand)]"
              >
                Checkout
              </button>
            ) : (
              <form onSubmit={handleCheckout} className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm ${
                          formErrors.name ? 'border-red-300' : 'border-gray-300'
                        } focus:border-[color:var(--color-brand)] focus:ring-[color:var(--color-brand)]`}
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm ${
                          formErrors.email ? 'border-red-300' : 'border-gray-300'
                        } focus:border-[color:var(--color-brand)] focus:ring-[color:var(--color-brand)]`}
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm ${
                          formErrors.phone ? 'border-red-300' : 'border-gray-300'
                        } focus:border-[color:var(--color-brand)] focus:ring-[color:var(--color-brand)]`}
                    />
                    {formErrors.phone && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Delivery Address
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      rows={3}
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm ${
                          formErrors.address ? 'border-red-300' : 'border-gray-300'
                        } focus:border-[color:var(--color-brand)] focus:ring-[color:var(--color-brand)]`}
                    />
                    {formErrors.address && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>
                    )}
                  </div>
                </div>
                
                <div className="mt-6 flex flex-col space-y-2">
                  <button
                    type="submit"
                    className="w-full rounded-lg shadow-sm py-3 px-4 text-base font-medium text-[color:var(--color-brand-foreground)] bg-[color:var(--color-brand)] hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[color:var(--color-brand)]"
                  >
                    Place Order
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCheckingOut(false)}
                    className="w-full bg-white border border-gray-300 rounded-lg shadow-sm py-3 px-4 text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[color:var(--color-brand)]"
                  >
                    Back to Cart
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
