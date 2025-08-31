import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrdersByEmail, cancelOrder } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function UserOrdersPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [canceling, setCanceling] = useState(false);
  const [cancelEmail, setCancelEmail] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    const loadOrders = async () => {
      if (isLoading || !user || !user.email) return;
      
      try {
        setLoading(true);
        // Get orders by user email from the backend
        const userOrders = await getOrdersByEmail(user.email);
        
        // Sort by createdAt desc
        userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(userOrders);
        setLoading(false);
        
        // Also update localStorage for backward compatibility
        const orderIds = userOrders.map(order => order._id);
        localStorage.setItem('myOrders', JSON.stringify(orderIds));
      } catch (err) {
        console.error('Failed to load orders', err);
        setError('Failed to load your orders.');
        setLoading(false);
        
        // Fallback to localStorage if API call fails
        fallbackToLocalStorage();
      }
    };
    
    const fallbackToLocalStorage = async () => {
      try {
        const stored = localStorage.getItem('myOrders');
        const ids = stored ? JSON.parse(stored) : [];

        if (!Array.isArray(ids) || ids.length === 0) {
          setOrders([]);
          setLoading(false);
          return;
        }

        // This is the old approach as fallback
        const results = [];
        for (const id of ids) {
          try {
            // We would use getOrderById here but it requires auth which might have failed
            // For simplicity in this fallback, we'll just use existing orders
            const order = orders.find(o => o._id === id);
            if (order) results.push(order);
          } catch {
            // Skip failed fetches silently
          }
        }

        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(results);
      } catch (err) {
        console.error('Fallback also failed', err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [isLoading, user]);

  const canCancel = (order) => {
    return order && (order.status === 'Pending' || order.status === 'Processing');
  };
  
  // Initialize cancelEmail with user's email when available
  useEffect(() => {
    if (user && user.email) {
      setCancelEmail(user.email);
    }
  }, [user]);

  const handleCancelOrder = async (order) => {
    if (!order?._id) return;
    
    // Use user email from auth context if available, otherwise use manual input
    const emailToUse = user?.email || cancelEmail;
    
    if (!emailToUse || !/\S+@\S+\.\S+/.test(emailToUse)) {
      setError('Please enter your email to confirm cancellation.');
      return;
    }
    
    setError('');
    setCanceling(true);
    try {
      const updated = await cancelOrder(order._id, emailToUse);
      // update local state for orders and selectedOrder
      setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
      setSelectedOrder(updated);
      // also update list in localStorage if needed
      try {
        const stored = JSON.parse(localStorage.getItem('myOrders') || '[]');
        if (!stored.includes(updated._id)) {
          stored.unshift(updated._id);
          localStorage.setItem('myOrders', JSON.stringify(stored.slice(0, 50)));
        }
      } catch {/* ignore */}
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to cancel the order.');
    } finally {
      setCanceling(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
          <p className="text-gray-500">You have no orders yet.</p>
          <button
            onClick={() => navigate('/catalog')}
            className="mt-4 inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold text-[color:var(--color-brand-foreground)] bg-[color:var(--color-brand)] hover:brightness-95"
          >
            Browse Furniture
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id} className="bg-white border-b hover:bg-gray-50/80">
                  <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">{order._id.substring(0,8)}...</td>
                  <td className="py-4 px-6">{formatDate(order.createdAt)}</td>
                  <td className="py-4 px-6">${order.totalAmount.toFixed(2)}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'Shipped' ? 'bg-indigo-100 text-indigo-800' :
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right space-x-4">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      View Details
                    </button>
                    {canCancel(order) && (
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="font-medium text-red-600 hover:underline"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-500/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Order Details</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Order Information</h4>
                  <p className="mt-1 text-sm text-gray-900"><span className="font-medium">Order ID:</span> {selectedOrder._id}</p>
                  <p className="mt-1 text-sm text-gray-900"><span className="font-medium">Date:</span> {formatDate(selectedOrder.createdAt)}</p>
                  <p className="mt-1 text-sm text-gray-900"><span className="font-medium">Total Amount:</span> ${selectedOrder.totalAmount.toFixed(2)}</p>
                  <div className="mt-1 flex items-center">
                    <span className="font-medium text-sm text-gray-900 mr-2">Status:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedOrder.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedOrder.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                      selectedOrder.status === 'Shipped' ? 'bg-indigo-100 text-indigo-800' :
                      selectedOrder.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      selectedOrder.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Customer Information</h4>
                  <p className="mt-1 text-sm text-gray-900"><span className="font-medium">Name:</span> {selectedOrder.customer.name}</p>
                  <p className="mt-1 text-sm text-gray-900"><span className="font-medium">Email:</span> {selectedOrder.customer.email}</p>
                  <p className="mt-1 text-sm text-gray-900"><span className="font-medium">Phone:</span> {selectedOrder.customer.phone}</p>
                  <p className="mt-1 text-sm text-gray-900"><span className="font-medium">Address:</span> {selectedOrder.customer.address}</p>
                </div>
              </div>

              <h4 className="text-sm font-medium text-gray-500 mb-2">Order Items</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedOrder.items.map((item) => (
                      <tr key={item._id}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.furniture?.name || 'Unknown Item'}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{item.quantity}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">${item.price?.toFixed(2) || '0.00'}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">${(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">Total:</td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">${selectedOrder.totalAmount.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {canCancel(selectedOrder) && (
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Cancel this order</h4>
                  <p className="text-sm text-gray-600 mb-3">Enter your email to confirm cancellation.</p>
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={cancelEmail}
                      onChange={(e) => setCancelEmail(e.target.value)}
                      className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-[color:var(--color-brand)] focus:border-[color:var(--color-brand)]"
                    />
                    <button
                      disabled={canceling}
                      onClick={() => handleCancelOrder(selectedOrder)}
                      className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60"
                    >
                      {canceling ? 'Cancelling…' : 'Cancel Order'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
