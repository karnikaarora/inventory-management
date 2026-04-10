import React from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/sidebar';

const EmployeeDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-2">Employee Dashboard</h1>
          <p className="text-gray-600 mb-6">Welcome back, <strong>{user?.name}</strong>!</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-semibold text-gray-600">My Orders</h3>
              <p className="text-3xl font-bold mt-2">0</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-semibold text-gray-600">Pending Items</h3>
              <p className="text-3xl font-bold mt-2">0</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-semibold text-gray-600">Completed</h3>
              <p className="text-3xl font-bold mt-2">0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;