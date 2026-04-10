import React from 'react';
import Sidebar from '../components/sidebar';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-2">Profile</h1>
          <p className="text-gray-600 mb-6">Manage your account settings</p>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">Name</label>
                <p className="text-gray-900 text-lg">{user?.name}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Email</label>
                <p className="text-gray-900 text-lg">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Role</label>
                <p className="text-gray-900 text-lg capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
