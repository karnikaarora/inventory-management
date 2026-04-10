import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import AdminDashboard from './pages/AdminDashboard'; 
import EmployeeDashboard from './pages/EmployeeDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import Categories from './pages/Categories';
import Products from './pages/Products';
import Suppliers from './pages/Suppliers';
import Orders from './pages/Orders';
import UserManagement from './pages/UserManagement';
import CustomerOrders from './pages/CustomerOrders';
import CustomerProducts from './pages/CustomerProducts';
import CustomerProfile from './pages/CustomerProfile';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import About from './pages/about';
import Contact from './pages/contact';
import Analytics from './pages/Analytics';
import Root from './components/Root';
import ProtectedRoute from './utils/ProtectedRoutes';


function App() {
  return (
    <Router>
      <Routes>
        {/* Root component checks user role and navigates to appropriate dashboard */}
        <Route path="/" element={<Root />} />

        {/* Public Login Route */}
        <Route path="/login" element={<Login />} />
        
        {/* Admin Dashboard - PROTECTED */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Admin Analytics - PROTECTED */}
        <Route 
          path="/admin-dashboard/analytics" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Analytics />
            </ProtectedRoute>
          } 
        />

        {/* Employee Dashboard - PROTECTED */}
        <Route 
          path="/employee/dashboard" 
          element={
            <ProtectedRoute requiredRole="employee">
              <EmployeeDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Customer Dashboard - PROTECTED */}
        <Route 
          path="/customer-dashboard" 
          element={
            <ProtectedRoute requiredRole="customer">
              <CustomerDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Customer Sub Pages - PROTECTED */}
        <Route 
          path="/customer-dashboard/orders" 
          element={
            <ProtectedRoute requiredRole="customer">
              <CustomerOrders />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/customer-dashboard/products" 
          element={
            <ProtectedRoute requiredRole="customer">
              <CustomerProducts />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/customer-dashboard/profile" 
          element={
            <ProtectedRoute requiredRole="customer">
              <CustomerProfile />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/favorites" 
          element={
            <ProtectedRoute requiredRole="customer">
              <Favorites />
            </ProtectedRoute>
          } 
        />

        {/* Admin Sub Pages - PROTECTED */}
        <Route 
          path="/admin-dashboard/categories" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Categories />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin-dashboard/products" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Products />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin-dashboard/suppliers" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Suppliers />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin-dashboard/orders" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Orders />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin-dashboard/users" 
          element={
            <ProtectedRoute requiredRole="admin">
              <UserManagement />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin-dashboard/profile" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Profile />
            </ProtectedRoute>
          } 
        />

        {/* Other pages */}
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} /> 
      </Routes>
    </Router>
  );
}

export default App;