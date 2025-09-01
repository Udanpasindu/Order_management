import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getAllOrders, 
  updateOrderStatus, 
  getAllVehicles, 
  assignVehicleToOrder,
  unassignVehicleFromOrder 
} from '../services/api';
import OrderItem from '../components/OrderItem';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [vehicleAssignLoading, setVehicleAssignLoading] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [vehicleUnassignLoading, setVehicleUnassignLoading] = useState(false);
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Redirect if not admin
    if (!isLoading && (!isAuthenticated || !isAdmin())) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, isAdmin, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersData, vehiclesData] = await Promise.all([
          getAllOrders(),
          getAllVehicles()
        ]);
        
        setOrders(ordersData);
        setVehicles(vehiclesData.filter(v => v.isAvailable)); // Only available vehicles
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleViewDetails = (orderId) => {
    const order = orders.find((o) => o._id === orderId);
    setSelectedOrder(order);
    setNewStatus(order.status);
    setSelectedVehicle('');
    // Set delivery notes from order if available
    setDeliveryNotes(order.deliveryNotes || '');
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
    setNewStatus('');
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || newStatus === selectedOrder.status) return;
    
    setStatusUpdateLoading(true);
    try {
      // Debug: Check token before making request
      const token = localStorage.getItem('token');
      console.log('Current token:', token ? 'Token exists' : 'No token found');
      console.log('Current user role:', isAdmin() ? 'admin' : 'not admin');
      
      const updatedOrder = await updateOrderStatus(selectedOrder._id, newStatus);
      
      // Update orders in state
      setOrders(
        orders.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
      
      // If order is cancelled and had a vehicle, refresh vehicle list
      if (updatedOrder.status === 'Cancelled' && selectedOrder.vehicle) {
        const vehiclesData = await getAllVehicles();
        setVehicles(vehiclesData.filter(v => v.isAvailable));
      }
      
      setSelectedOrder(updatedOrder);
      setStatusUpdateLoading(false);
    } catch (error) {
      console.error('Error updating order status:', error);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      setError('Failed to update order status');
      setStatusUpdateLoading(false);
    }
  };
  
  const handleAssignVehicle = async () => {
    if (!selectedOrder || !selectedVehicle) return;
    
    setVehicleAssignLoading(true);
    try {
      const updatedOrder = await assignVehicleToOrder(
        selectedOrder._id, 
        selectedVehicle,
        deliveryNotes
      );
      
      // Update orders in state
      setOrders(
        orders.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
      
      // Update vehicle list - remove assigned vehicle
      const vehiclesData = await getAllVehicles();
      setVehicles(vehiclesData.filter(v => v.isAvailable));
      
      setSelectedOrder(updatedOrder);
      setSelectedVehicle('');
      setVehicleAssignLoading(false);
    } catch (error) {
      console.error('Error assigning vehicle:', error);
      setError('Failed to assign vehicle to order');
      setVehicleAssignLoading(false);
    }
  };
  
  const handleUnassignVehicle = async () => {
    if (!selectedOrder || !selectedOrder.vehicle) return;
    
    setVehicleUnassignLoading(true);
    try {
      const updatedOrder = await unassignVehicleFromOrder(selectedOrder._id);
      
      // Update orders in state
      setOrders(
        orders.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
      
      // Update vehicle list - add the now available vehicle
      const vehiclesData = await getAllVehicles();
      setVehicles(vehiclesData.filter(v => v.isAvailable));
      
      setSelectedOrder(updatedOrder);
      setDeliveryNotes('');
      setVehicleUnassignLoading(false);
    } catch (error) {
      console.error('Error unassigning vehicle:', error);
      setError('Failed to unassign vehicle from order');
      setVehicleUnassignLoading(false);
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
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
      
      <div className="flex flex-wrap gap-4 mb-8">
        <button 
          onClick={() => navigate('/admin')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Manage Orders
        </button>
        <button 
          onClick={() => navigate('/admin/vehicles')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        >
          Manage Vehicles
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Orders</h2>
        
        {orders.length === 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <OrderItem 
                    key={order._id} 
                    order={order} 
                    onViewDetails={handleViewDetails} 
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-500/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Order Details
                </h3>
                <button
                  onClick={handleCloseDetails}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Order Information</h4>
                  <p className="mt-1 text-sm text-gray-900">
                    <span className="font-medium">Order ID:</span> {selectedOrder._id}
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    <span className="font-medium">Date:</span> {formatDate(selectedOrder.createdAt)}
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    <span className="font-medium">Total Amount:</span> ${selectedOrder.totalAmount.toFixed(2)}
                  </p>
                  <div className="mt-1 flex items-center">
                    <span className="font-medium text-sm text-gray-900 mr-2">Status:</span>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Customer Information</h4>
                  <p className="mt-1 text-sm text-gray-900">
                    <span className="font-medium">Name:</span> {selectedOrder.customer.name}
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    <span className="font-medium">Email:</span> {selectedOrder.customer.email}
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    <span className="font-medium">Phone:</span> {selectedOrder.customer.phone}
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    <span className="font-medium">Address:</span> {selectedOrder.customer.address}
                  </p>
                </div>
              </div>
              
              <h4 className="text-sm font-medium text-gray-500 mb-2">Order Items</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedOrder.items.map((item) => (
                      <tr key={item._id}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.furniture?.name || 'Unknown Item'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          ${item.price?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                          ${(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                        Total:
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                        ${selectedOrder.totalAmount.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              <div className="mt-6 border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Update Order Status</h4>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-[color:var(--color-brand)] focus:ring-[color:var(--color-brand)] sm:text-sm"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <button
                    onClick={handleUpdateStatus}
                    disabled={statusUpdateLoading || newStatus === selectedOrder.status}
                    className={`inline-flex justify-center py-2.5 px-4 border border-transparent shadow-sm text-sm font-semibold rounded-lg text-[color:var(--color-brand-foreground)] ${
                      statusUpdateLoading || newStatus === selectedOrder.status
                        ? 'bg-blue-300'
                        : 'bg-[color:var(--color-brand)] hover:brightness-95'
                    }`}
                  >
                    {statusUpdateLoading ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              </div>

              {/* Vehicle Assignment Section */}
              <div className="mt-6 border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  {selectedOrder.vehicle ? 'Assigned Vehicle' : 'Assign Vehicle'}
                </h4>

                {selectedOrder.vehicle ? (
                  <div>
                    <div className="bg-gray-50 p-3 rounded mb-3">
                      <h5 className="font-medium mb-2">{selectedOrder.vehicle.vehicleName}</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-gray-700 mb-1">
                            <span className="font-medium">Type:</span> {selectedOrder.vehicle.vehicleType}
                          </p>
                          <p className="text-sm text-gray-700 mb-1">
                            <span className="font-medium">Number:</span> {selectedOrder.vehicle.vehicleNumber}
                          </p>
                          <p className="text-sm text-gray-700 mb-1">
                            <span className="font-medium">Capacity:</span> {selectedOrder.vehicle.capacity}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-700 mb-1">
                            <span className="font-medium">Driver:</span> {selectedOrder.vehicle.driverName}
                          </p>
                          <p className="text-sm text-gray-700 mb-1">
                            <span className="font-medium">Contact:</span> {selectedOrder.vehicle.driverContact}
                          </p>
                          <p className="text-sm text-gray-700 mb-1">
                            <span className="font-medium">License:</span> {selectedOrder.vehicle.driverLicense}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedOrder.vehicle.vehicleImages?.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Vehicle Image</p>
                            <img 
                              src={selectedOrder.vehicle.vehicleImages[0]} 
                              alt={selectedOrder.vehicle.vehicleName} 
                              className="h-32 object-cover rounded"
                            />
                          </div>
                        )}
                        {selectedOrder.vehicle.driverImage && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Driver Image</p>
                            <img 
                              src={selectedOrder.vehicle.driverImage} 
                              alt={selectedOrder.vehicle.driverName} 
                              className="h-32 object-cover rounded"
                            />
                          </div>
                        )}
                      </div>

                      {selectedOrder.deliveryNotes && (
                        <div className="mt-3 p-2 bg-blue-50 rounded">
                          <p className="text-xs text-gray-500 mb-1">Delivery Notes</p>
                          <p className="text-sm">{selectedOrder.deliveryNotes}</p>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={handleUnassignVehicle}
                      disabled={vehicleUnassignLoading}
                      className={`w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-semibold rounded-lg text-white ${
                        vehicleUnassignLoading 
                          ? 'bg-red-300' 
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {vehicleUnassignLoading ? 'Unassigning...' : 'Unassign Vehicle'}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {vehicles.length === 0 ? (
                      <p className="text-sm text-gray-600">No vehicles available for assignment</p>
                    ) : (
                      <>
                        <select
                          value={selectedVehicle}
                          onChange={(e) => setSelectedVehicle(e.target.value)}
                          className="rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-[color:var(--color-brand)] focus:ring-[color:var(--color-brand)] sm:text-sm"
                        >
                          <option value="">-- Select a vehicle --</option>
                          {vehicles.map((vehicle) => (
                            <option key={vehicle._id} value={vehicle._id}>
                              {vehicle.vehicleName} - {vehicle.vehicleNumber} - {vehicle.driverName}
                            </option>
                          ))}
                        </select>

                        <div>
                          <label htmlFor="deliveryNotes" className="block text-xs font-medium text-gray-700 mb-1">
                            Delivery Notes (optional)
                          </label>
                          <textarea
                            id="deliveryNotes"
                            value={deliveryNotes}
                            onChange={(e) => setDeliveryNotes(e.target.value)}
                            placeholder="Special instructions for delivery..."
                            className="rounded-lg border border-gray-300 w-full px-3 py-2 shadow-sm focus:border-[color:var(--color-brand)] focus:ring-[color:var(--color-brand)] sm:text-sm"
                            rows={3}
                          />
                        </div>
                        
                        <button
                          onClick={handleAssignVehicle}
                          disabled={vehicleAssignLoading || !selectedVehicle}
                          className={`inline-flex justify-center py-2.5 px-4 border border-transparent shadow-sm text-sm font-semibold rounded-lg text-white ${
                            vehicleAssignLoading || !selectedVehicle
                              ? 'bg-green-300'
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {vehicleAssignLoading ? 'Assigning...' : 'Assign Vehicle'}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
