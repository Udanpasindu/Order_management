import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function VehicleCard({ vehicle, onDelete, onToggleAvailability, isAdmin }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4 border border-gray-200">
      <div className="p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold">{vehicle.vehicleName}</h3>
          <span 
            className={`px-2 py-1 rounded text-xs font-semibold 
            ${vehicle.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
          >
            {vehicle.isAvailable ? 'Available' : 'Not Available'}
          </span>
        </div>
        
        <div className="mt-2">
          <p className="text-gray-600"><span className="font-medium">Type:</span> {vehicle.vehicleType}</p>
          <p className="text-gray-600"><span className="font-medium">Number:</span> {vehicle.vehicleNumber}</p>
          <p className="text-gray-600"><span className="font-medium">Driver:</span> {vehicle.driverName}</p>
        </div>
        
        <div className="mt-2">
          {vehicle.vehicleImages && vehicle.vehicleImages.length > 0 && (
            <img 
              src={vehicle.vehicleImages[0]} 
              alt={vehicle.vehicleName} 
              className="w-full h-48 object-cover rounded"
            />
          )}
        </div>
        
        <button
          onClick={toggleExpand}
          className="mt-3 text-blue-600 hover:text-blue-800 text-sm"
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </button>
        
        {isExpanded && (
          <div className="mt-3 bg-gray-50 p-3 rounded">
            <h4 className="font-semibold mb-2">Vehicle Details</h4>
            <p className="text-gray-600"><span className="font-medium">Capacity:</span> {vehicle.capacity}</p>
            
            <h4 className="font-semibold mt-3 mb-2">Driver Details</h4>
            <p className="text-gray-600"><span className="font-medium">Contact:</span> {vehicle.driverContact}</p>
            <p className="text-gray-600"><span className="font-medium">License:</span> {vehicle.driverLicense}</p>
            
            <div className="mt-3">
              <p className="font-medium mb-1">Driver Image:</p>
              <img 
                src={vehicle.driverImage} 
                alt={vehicle.driverName} 
                className="w-24 h-24 object-cover rounded-full"
              />
            </div>
            
            {vehicle.vehicleImages && vehicle.vehicleImages.length > 1 && (
              <div className="mt-3">
                <p className="font-medium mb-1">More Vehicle Images:</p>
                <div className="flex flex-wrap gap-2">
                  {vehicle.vehicleImages.slice(1).map((image, index) => (
                    <img 
                      key={index} 
                      src={image} 
                      alt={`${vehicle.vehicleName} - ${index + 2}`} 
                      className="w-24 h-24 object-cover rounded"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {isAdmin && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => onToggleAvailability(vehicle._id)}
              className={`px-3 py-1 rounded text-xs font-semibold
              ${vehicle.isAvailable 
                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
            >
              {vehicle.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
            </button>
            <button
              onClick={() => navigate(`/admin/vehicles/edit/${vehicle._id}`)}
              className="px-3 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800 hover:bg-blue-200"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(vehicle._id)}
              className="px-3 py-1 rounded text-xs font-semibold bg-red-100 text-red-800 hover:bg-red-200"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
