import React from 'react';
import Sidebar from '../components/sidebar';
import { useAuth } from '../context/AuthContext';

const Users = () => {
  const { user } = useAuth();

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-2">Users</h1>
          <p className="text-gray-600 mb-6">Manage system users and roles</p>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500">Users list will go here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
