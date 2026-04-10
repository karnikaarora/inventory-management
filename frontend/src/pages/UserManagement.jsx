import React, { useState, useEffect } from 'react';
import Sidebar from '../components/sidebar';
import { useAuth } from '../context/AuthContext';

const UserManagement = () => {
  // Get current logged-in user from AuthContext
  const { user } = useAuth();
  
  // State for search functionality
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for users list
  const [users, setUsers] = useState([]);
  
  // State for loading
  const [loading, setLoading] = useState(true);
  
  // State for modal visibility
  const [showModal, setShowModal] = useState(false);
  
  // State for new user form
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: 'customer'
  });
  
  // State for form validation errors
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: ''
  });

  // State for filters
  const [filters, setFilters] = useState({
    dateRange: 'all', // 'all', 'today', 'week', 'month', 'custom'
    customDateFrom: '',
    customDateTo: '',
    sortBy: 'createdAt', // 'name', 'email', 'role', 'createdAt'
    sortOrder: 'desc', // 'asc', 'desc'
    role: 'all' // 'all', 'admin', 'customer'
  });
  
  // State to control filter panel visibility
  const [showFilters, setShowFilters] = useState(false);

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  // Load users from API
  const loadUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await fetch('http://localhost:5000/api/user/get', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 403) {
        alert('Your session has expired. Please login again.');
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error('Failed to load users:', response.status);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Update form data
    setNewUser({
      ...newUser,
      [name]: value
    });

    // Clear error message when user starts typing
    setFormErrors({
      ...formErrors,
      [name]: ''
    });
  };

  // Validate form before submission
  const validateForm = () => {
    const errors = {};

    // Name validation
    if (!newUser.name.trim()) {
      errors.name = 'User name is required';
    } else if (newUser.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!newUser.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      errors.email = 'Please enter a valid email';
    }

    // Password validation
    if (!newUser.password.trim()) {
      errors.password = 'Password is required';
    } else if (newUser.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    // Address validation
    if (!newUser.address.trim()) {
      errors.address = 'Address is required';
    }

    // Role validation
    if (!newUser.role) {
      errors.role = 'Role is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle new user submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUser)
      });

      // Handle expired token
      if (response.status === 403) {
        alert('Your session has expired. Please login again.');
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      const data = await response.json();

      if (response.status === 201) {
        console.log('User added successfully:', data);
        alert('User added successfully!');
        
        // Reset form and close modal
        setNewUser({
          name: '',
          email: '',
          password: '',
          address: '',
          role: 'customer'
        });
        setFormErrors({
          name: '',
          email: '',
          password: '',
          address: '',
          role: ''
        });
        setShowModal(false);
        
        // Refresh users list
        loadUsers();
      } else {
        console.error('Error adding user:', data);
        alert(data.message || 'Failed to add user');
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Network error. Please try again.');
    }
  };

  // Handle delete user
  const handleDelete = async (userId, userName, userRole) => {
    // Prevent admin from deleting themselves
    if (user?.id === userId) {
      alert('You cannot delete your own account!');
      return;
    }

    // Prevent admin from deleting other admins
    if (userRole === 'admin') {
      alert('You cannot delete admin users!');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/user/delete/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Handle expired token
      if (response.status === 403) {
        alert('Your session has expired. Please login again.');
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      const data = await response.json();

      if (response.ok) {
        console.log('User deleted successfully:', data);
        alert('User deleted successfully!');
        loadUsers();
      } else {
        console.error('Error deleting user:', data);
        alert(data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Network error. Please try again.');
    }
  };

  // Handle role change
  const handleRoleChange = async (userId, newRole) => {
    // Prevent admin from changing their own role
    if (user?.id === userId) {
      alert('You cannot change your own role!');
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/user/update/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      // Handle expired token
      if (response.status === 403) {
        alert('Your session has expired. Please login again.');
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      const data = await response.json();

      if (response.ok) {
        console.log('User role updated successfully:', data);
        alert('User role updated successfully!');
        loadUsers();
      } else {
        console.error('Error updating user role:', data);
        alert(data.message || 'Failed to update user role');
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Network error. Please try again.');
    }
  };

  // Get role badge color
  const getRoleBadge = (role) => {
    if (role === 'admin') return { color: 'text-purple-600 bg-purple-100', text: 'Admin' };
    return { color: 'text-blue-600 bg-blue-100', text: 'Customer' };
  };

  // Filter users based on search term and filters
  const filteredUsers = users.filter(user => {
    // Search filter
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.address.toLowerCase().includes(searchTerm.toLowerCase());

    // Role filter
    const matchesRole = filters.role === 'all' || user.role === filters.role;

    // Date filter
    const userDate = new Date(user.createdAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let matchesDate = true;
    
    if (filters.dateRange === 'today') {
      matchesDate = userDate >= today;
    } else if (filters.dateRange === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      matchesDate = userDate >= weekAgo;
    } else if (filters.dateRange === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      matchesDate = userDate >= monthAgo;
    } else if (filters.dateRange === 'custom') {
      if (filters.customDateFrom) {
        const fromDate = new Date(filters.customDateFrom);
        matchesDate = matchesDate && userDate >= fromDate;
      }
      if (filters.customDateTo) {
        const toDate = new Date(filters.customDateTo);
        toDate.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && userDate <= toDate;
      }
    }

    return matchesSearch && matchesRole && matchesDate;
  }).sort((a, b) => {
    // Sort logic
    let aValue, bValue;
    
    if (filters.sortBy === 'name' || filters.sortBy === 'email') {
      aValue = a[filters.sortBy].toLowerCase();
      bValue = b[filters.sortBy].toLowerCase();
    } else {
      aValue = new Date(a.createdAt);
      bValue = new Date(b.createdAt);
    }
    
    if (filters.sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8">
          {/* Header with Search and Add Button */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {user?.role === 'admin' && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 border rounded-lg transition flex items-center gap-2 ${
                    (filters.dateRange !== 'all' || filters.role !== 'all' || 
                      filters.sortBy !== 'createdAt' || filters.sortOrder !== 'desc') 
                      ? 'border-blue-500 bg-blue-50 text-blue-600' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                </button>
                
                <button
                  onClick={() => {
                    setNewUser({
                      name: '',
                      email: '',
                      password: '',
                      address: '',
                      role: 'customer'
                    });
                    setFormErrors({
                      name: '',
                      email: '',
                      password: '',
                      address: '',
                      role: ''
                    });
                    setShowModal(true);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add User
                </button>
              </div>
            )}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Role Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={filters.role}
                    onChange={(e) => setFilters({...filters, role: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="customer">Customer</option>
                  </select>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>

                {/* Custom Date Range */}
                {filters.dateRange === 'custom' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                      <input
                        type="date"
                        value={filters.customDateFrom}
                        onChange={(e) => setFilters({...filters, customDateFrom: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                      <input
                        type="date"
                        value={filters.customDateTo}
                        onChange={(e) => setFilters({...filters, customDateTo: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                  </>
                )}

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="createdAt">Date Added</option>
                    <option value="name">Name</option>
                    <option value="email">Email</option>
                    <option value="role">Role</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => setFilters({...filters, sortOrder: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setFilters({
                        dateRange: 'all',
                        customDateFrom: '',
                        customDateTo: '',
                        sortBy: 'createdAt',
                        sortOrder: 'desc',
                        role: 'all'
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Search Results Summary */}
          <div className="mb-4 text-sm text-gray-600">
            {searchTerm && (
              <p>Found {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} matching "{searchTerm}"</p>
            )}
            {!searchTerm && (
              <p>Total users: {users.length}</p>
            )}
          </div>

          {/* Users List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Users List</h2>
            </div>
            
            {loading ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">
                  {searchTerm || filters.role !== 'all' || filters.dateRange !== 'all' 
                    ? 'No users found matching your criteria.' 
                    : 'No users found.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined On
                      </th>
                      {user?.role === 'admin' && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((userItem) => {
                      const roleBadge = getRoleBadge(userItem.role);
                      return (
                        <tr key={userItem._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{userItem.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{userItem.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500 max-w-xs truncate" title={userItem.address}>
                              {userItem.address}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${roleBadge.color}`}>
                              {roleBadge.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {new Date(userItem.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          {user?.role === 'admin' && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                <select
                                  value={userItem.role}
                                  onChange={(e) => handleRoleChange(userItem._id, e.target.value)}
                                  disabled={user.id === userItem._id}
                                  className={`px-2 py-1 text-xs border rounded ${
                                    user.id === userItem._id 
                                      ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed' 
                                      : 'border-gray-300 hover:border-gray-400'
                                  }`}
                                >
                                  <option value="customer">Customer</option>
                                  <option value="admin">Admin</option>
                                </select>
                                <button
                                  onClick={() => handleDelete(userItem._id, userItem.name, userItem.role)}
                                  disabled={user.id === userItem._id || userItem.role === 'admin'}
                                  className={`text-red-600 hover:text-red-900 ${
                                    user.id === userItem._id || userItem.role === 'admin'
                                      ? 'opacity-50 cursor-not-allowed' 
                                      : ''
                                  }`}
                                  title={
                                    user.id === userItem._id 
                                      ? 'Cannot delete yourself' 
                                      : userItem.role === 'admin'
                                      ? 'Cannot delete admin users'
                                      : 'Delete user'
                                  }
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div 
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
            onClick={() => setShowModal(false)}
          />
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative z-10 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Add New User</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1" htmlFor="name">
                  <span className="text-red-500">*</span> User Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newUser.name}
                  onChange={handleInputChange}
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter user name"
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 mb-1" htmlFor="email">
                  <span className="text-red-500">*</span> Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={newUser.email}
                  onChange={handleInputChange}
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    formErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="user@example.com"
                />
                {formErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 mb-1" htmlFor="password">
                  <span className="text-red-500">*</span> Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={newUser.password}
                  onChange={handleInputChange}
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    formErrors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter password"
                />
                {formErrors.password && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 mb-1" htmlFor="phone">
                  <span className="text-red-500">*</span> Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={newUser.phone}
                  onChange={handleInputChange}
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    formErrors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter phone number"
                />
                {formErrors.phone && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 mb-1" htmlFor="address">
                  <span className="text-red-500">*</span> Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={newUser.address}
                  onChange={handleInputChange}
                  rows="3"
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    formErrors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter complete address"
                />
                {formErrors.address && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 mb-1" htmlFor="role">
                  <span className="text-red-500">*</span> Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={newUser.role}
                  onChange={handleInputChange}
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    formErrors.role ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
                {formErrors.role && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.role}</p>
                )}
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
