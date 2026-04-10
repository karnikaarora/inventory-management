import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/sidebar';
import { useNavigate } from 'react-router-dom';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for customer statistics
  const [stats, setStats] = useState({
    orders: { total: 0, pending: 0, completed: 0 },
    products: { total: 0, available: 0, outOfStock: 0 },
    profile: { completed: false, ordersThisMonth: 0 }
  });
  
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);

  // Load customer dashboard data
  const loadCustomerData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error('No token found');
        return;
      }

      // Load customer orders
      const ordersResponse = await fetch('http://localhost:5000/api/order/customer', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Load products
      const productsResponse = await fetch('http://localhost:5000/api/product/get', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (ordersResponse.status === 403 || productsResponse.status === 403) {
        alert('Your session has expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      
      let ordersData = [];
      let productsData = [];
      
      if (ordersResponse.ok) {
        ordersData = await ordersResponse.json();
        setRecentOrders(ordersData.slice(0, 5)); // Recent 5 orders
      }
      
      if (productsResponse.ok) {
        productsData = await productsResponse.json();
      }

      // Calculate statistics
      const customerStats = {
        orders: {
          total: ordersData.length,
          pending: ordersData.filter(order => order.status === 'pending').length,
          completed: ordersData.filter(order => order.status === 'delivered').length
        },
        products: {
          total: productsData.length,
          available: productsData.filter(product => product.stock > 0).length,
          outOfStock: productsData.filter(product => product.stock === 0).length
        },
        profile: {
          completed: !!(user?.name && user?.email && user?.address),
          ordersThisMonth: ordersData.filter(order => {
            const orderDate = new Date(order.createdAt);
            const currentMonth = new Date().getMonth();
            return orderDate.getMonth() === currentMonth;
          }).length
        }
      };
      
      setStats(customerStats);
      console.log('Customer dashboard data loaded:', customerStats);
    } catch (error) {
      console.error('Error loading customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadCustomerData();
  }, []);

  // Listen for order updates to refresh dashboard
  useEffect(() => {
    const handleOrderUpdate = () => {
      console.log('Order update detected, refreshing dashboard...');
      loadCustomerData();
    };

    window.addEventListener('order-placed', handleOrderUpdate);
    return () => window.removeEventListener('order-placed', handleOrderUpdate);
  }, []);

  return (
    <div className="flex h-screen">
      {/* SIDEBAR - Customer Navigation */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Inventory Management System</h1>
            <p className="text-gray-600">Welcome back, <strong>{user?.name}</strong>! Manage your orders and view products.</p>
          </div>
          
          {/* Dashboard Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* My Orders */}
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer" 
                 onClick={() => navigate('/customer-dashboard/orders')}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600">My Orders</h3>
                  <p className="text-3xl font-bold mt-2 text-blue-600">
                    {loading ? '...' : stats.orders.total}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs text-yellow-600">
                      {stats.orders.pending} pending
                    </span>
                    <span className="text-xs text-green-600">
                      {stats.orders.completed} completed
                    </span>
                  </div>
                </div>
                <div className="text-blue-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Available Products */}
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
                 onClick={() => navigate('/customer-dashboard/products')}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600">Available Products</h3>
                  <p className="text-3xl font-bold mt-2 text-green-600">
                    {loading ? '...' : stats.products.available}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.products.outOfStock} out of stock
                  </p>
                </div>
                <div className="text-green-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Profile Completion */}
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
                 onClick={() => navigate('/customer-dashboard/profile')}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600">Profile</h3>
                  <p className="text-lg font-bold mt-2 text-purple-600">
                    {stats.profile.completed ? 'Complete' : 'Incomplete'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.profile.ordersThisMonth} orders this month
                  </p>
                </div>
                <div className="text-purple-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600">Quick Actions</h3>
                  <div className="mt-2 space-y-1">
                    <button 
                      onClick={() => navigate('/customer-dashboard/products')}
                      className="w-full text-left text-sm text-blue-600 hover:text-blue-800 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      + New Order
                    </button>
                    <button 
                      onClick={() => navigate('/customer-dashboard/products')}
                      className="w-full text-left text-sm text-green-600 hover:text-green-800 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      View Catalog
                    </button>
                  </div>
                </div>
                <div className="text-orange-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders and Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
                <button 
                  onClick={() => navigate('/customer-dashboard/orders')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              
              {loading ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">Loading orders...</p>
                </div>
              ) : recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{order.orderNumber}</p>
                        <p className="text-sm text-gray-600">
                          {order.items?.[0]?.name || 'Unknown Product'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">₹{order.totalAmount || 0}</p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <p className="text-gray-500">No orders yet</p>
                  <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
                    Place First Order
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions & Account Info */}
            <div className="space-y-6">
              {/* Account Information */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Name:</span>
                    <span className="text-sm font-medium">{user?.name || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="text-sm font-medium">{user?.email || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Role:</span>
                    <span className="text-sm font-medium capitalize">{user?.role || 'Customer'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Member Since:</span>
                    <span className="text-sm font-medium">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => navigate('/customer-dashboard/products')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Browse Products
                  </button>
                  <button 
                    onClick={() => navigate('/customer-dashboard/products')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Order
                  </button>
                  <button 
                    onClick={() => navigate('/customer-dashboard/profile')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Edit Profile
                  </button>
                  <button 
                    onClick={() => navigate('/customer-dashboard/orders')}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    Order History
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
