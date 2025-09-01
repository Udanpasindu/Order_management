import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import FurnitureDetailPage from './pages/FurnitureDetailPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import UserOrdersPage from './pages/UserOrdersPage';
import VehicleManagement from './pages/VehicleManagement';
import AddEditVehicle from './pages/AddEditVehicle';
import { useAuth } from './context/AuthContext';

// Protected route component
const ProtectedRoute = ({ children, requireAdmin }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && (!user || user.role !== 'admin')) {
    return <Navigate to="/" />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/catalog" element={<CatalogPage />} />
      <Route path="/furniture/:id" element={<FurnitureDetailPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/orders" element={<UserOrdersPage />} />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/vehicles" 
        element={
          <ProtectedRoute requireAdmin={true}>
            <VehicleManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/vehicles/add" 
        element={
          <ProtectedRoute requireAdmin={true}>
            <AddEditVehicle />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/vehicles/edit/:id" 
        element={
          <ProtectedRoute requireAdmin={true}>
            <AddEditVehicle />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main>
              <AppRoutes />
            </main>
            <footer className="bg-gray-800 text-white py-6 mt-12">
              <div className="container mx-auto px-4">
                <p className="text-center">&copy; 2025 Furniture Shop. All rights reserved.</p>
              </div>
            </footer>
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
