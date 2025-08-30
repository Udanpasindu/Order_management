import React from 'react';

const OrderItem = ({ order, onViewDetails }) => {
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

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <tr className="bg-white border-b hover:bg-gray-50/80">
      <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">
        {order._id.substring(0, 8)}...
      </td>
      <td className="py-4 px-6">{order.customer.name}</td>
      <td className="py-4 px-6">{formatDate(order.createdAt)}</td>
      <td className="py-4 px-6">${order.totalAmount.toFixed(2)}</td>
      <td className="py-4 px-6">
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
      </td>
      <td className="py-4 px-6 text-right">
        <button
          onClick={() => onViewDetails(order._id)}
          className="font-medium text-blue-600 hover:underline"
        >
          View Details
        </button>
      </td>
    </tr>
  );
};

export default OrderItem;
