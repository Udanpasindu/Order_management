import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllVehicles, deleteVehicle, toggleVehicleAvailability } from '../services/api';
import { useAuth } from '../context/AuthContext';
import VehicleCard from '../components/VehicleCard';

export default function VehicleManagement() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Redirect if not admin
    if (!isLoading && (!isAuthenticated || !isAdmin())) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, isAdmin, navigate]);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data = await getAllVehicles();
        setVehicles(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        setError('Failed to load vehicles. Please try again later.');
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const handleDelete = async (vehicleId) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await deleteVehicle(vehicleId);
        setVehicles(vehicles.filter(vehicle => vehicle._id !== vehicleId));
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        setError('Failed to delete vehicle. Please try again.');
      }
    }
  };

  const handleToggleAvailability = async (vehicleId) => {
    try {
      const updatedVehicle = await toggleVehicleAvailability(vehicleId);
      setVehicles(vehicles.map(vehicle => 
        vehicle._id === vehicleId ? updatedVehicle : vehicle
      ));
    } catch (error) {
      console.error('Error toggling vehicle availability:', error);
      setError('Failed to update vehicle status. Please try again.');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Vehicle Management</h1>
        <button 
          onClick={() => navigate('/admin/vehicles/add')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add New Vehicle
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {vehicles.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No vehicles found. Add a vehicle to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle._id}
              vehicle={vehicle}
              onDelete={handleDelete}
              onToggleAvailability={handleToggleAvailability}
              isAdmin={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
