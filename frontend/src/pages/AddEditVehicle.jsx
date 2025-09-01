import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVehicleById, createVehicle, updateVehicle } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AddEditVehicle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated, isLoading } = useAuth();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    vehicleName: '',
    vehicleType: 'Truck',
    vehicleNumber: '',
    capacity: '',
    vehicleImages: [''],
    driverName: '',
    driverContact: '',
    driverLicense: '',
    driverImage: '',
    isAvailable: true
  });
  
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Redirect if not admin
    if (!isLoading && (!isAuthenticated || !isAdmin())) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, isAdmin, navigate]);

  useEffect(() => {
    const fetchVehicle = async () => {
      if (isEditMode) {
        try {
          const data = await getVehicleById(id);
          setFormData(data);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching vehicle:', error);
          setError('Failed to load vehicle details.');
          setLoading(false);
        }
      }
    };

    fetchVehicle();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' ? parseFloat(value) || '' : value
    }));
  };

  const handleVehicleImageChange = (index, value) => {
    const updatedImages = [...formData.vehicleImages];
    updatedImages[index] = value;
    setFormData(prev => ({
      ...prev,
      vehicleImages: updatedImages
    }));
  };

  const addVehicleImageField = () => {
    setFormData(prev => ({
      ...prev,
      vehicleImages: [...prev.vehicleImages, '']
    }));
  };

  const removeVehicleImageField = (index) => {
    if (formData.vehicleImages.length > 1) {
      const updatedImages = [...formData.vehicleImages];
      updatedImages.splice(index, 1);
      setFormData(prev => ({
        ...prev,
        vehicleImages: updatedImages
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.vehicleName || !formData.vehicleNumber || !formData.capacity || !formData.driverName) {
      setError('Please fill in all required fields.');
      return;
    }
    
    // Filter out any empty image URLs
    const filteredVehicleImages = formData.vehicleImages.filter(img => img.trim() !== '');
    if (filteredVehicleImages.length === 0 || !formData.driverImage) {
      setError('Please add at least one vehicle image and a driver image.');
      return;
    }
    
    try {
      setSubmitting(true);
      const dataToSubmit = {
        ...formData,
        vehicleImages: filteredVehicleImages
      };
      
      if (isEditMode) {
        await updateVehicle(id, dataToSubmit);
      } else {
        await createVehicle(dataToSubmit);
      }
      
      navigate('/admin/vehicles');
    } catch (error) {
      console.error('Error saving vehicle:', error);
      setError('Failed to save vehicle. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">{isEditMode ? 'Edit Vehicle' : 'Add New Vehicle'}</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vehicle Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Vehicle Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Name*
                </label>
                <input
                  type="text"
                  name="vehicleName"
                  value={formData.vehicleName}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Type*
                </label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                >
                  <option value="Truck">Truck</option>
                  <option value="Van">Van</option>
                  <option value="Car">Car</option>
                  <option value="Motorcycle">Motorcycle</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Number*
                </label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity*
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  min="0"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Availability
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">Vehicle is available</span>
                </div>
              </div>
            </div>
            
            {/* Driver Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Driver Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Driver Name*
                </label>
                <input
                  type="text"
                  name="driverName"
                  value={formData.driverName}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Driver Contact*
                </label>
                <input
                  type="text"
                  name="driverContact"
                  value={formData.driverContact}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Driver License*
                </label>
                <input
                  type="text"
                  name="driverLicense"
                  value={formData.driverLicense}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Driver Image URL*
                </label>
                <input
                  type="text"
                  name="driverImage"
                  value={formData.driverImage}
                  onChange={handleChange}
                  placeholder="https://example.com/driver-image.jpg"
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              
              {formData.driverImage && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Driver Image Preview:</p>
                  <img 
                    src={formData.driverImage} 
                    alt="Driver Preview" 
                    className="h-32 w-32 object-cover rounded-full border border-gray-300"
                    onError={(e) => e.target.src = "https://via.placeholder.com/150?text=Invalid+URL"}
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Vehicle Images */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Vehicle Images*</h2>
              <button 
                type="button"
                onClick={addVehicleImageField}
                className="text-sm bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded"
              >
                Add Image
              </button>
            </div>
            
            {formData.vehicleImages.map((image, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-grow">
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={image}
                      onChange={(e) => handleVehicleImageChange(index, e.target.value)}
                      placeholder="https://example.com/vehicle-image.jpg"
                      className="w-full p-2 border border-gray-300 rounded"
                      required={index === 0}
                    />
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeVehicleImageField(index)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {image && (
                    <img 
                      src={image} 
                      alt={`Vehicle Preview ${index + 1}`} 
                      className="mt-2 h-32 object-cover rounded border border-gray-300"
                      onError={(e) => e.target.src = "https://via.placeholder.com/300x150?text=Invalid+URL"}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/admin/vehicles')}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
            >
              {submitting ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                  Saving...
                </>
              ) : (
                `${isEditMode ? 'Update' : 'Save'} Vehicle`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
