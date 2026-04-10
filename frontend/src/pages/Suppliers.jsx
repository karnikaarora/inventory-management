import React, { useState, useEffect } from 'react';
import Sidebar from '../components/sidebar';
import { useAuth } from '../context/AuthContext';

const Suppliers = () => {
  // Get current logged-in user from AuthContext
  const { user } = useAuth();
  
  // State for search functionality
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for suppliers list
  const [suppliers, setSuppliers] = useState([]);
  
  // State for loading
  const [loading, setLoading] = useState(true);
  
  // State for modal visibility
  const [showModal, setShowModal] = useState(false);
  
  // State for new supplier form
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  
  // State for form validation errors
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  // State for filters
  const [filters, setFilters] = useState({
    dateRange: 'all', // 'all', 'today', 'week', 'month', 'custom'
    customDateFrom: '',
    customDateTo: '',
    sortBy: 'createdAt', // 'name', 'email', 'createdAt'
    sortOrder: 'desc' // 'asc', 'desc'
  });
  
  // State to control filter panel visibility
  const [showFilters, setShowFilters] = useState(false);

  // Load suppliers on component mount
  useEffect(() => {
    loadSuppliers();
  }, []);

  // Load suppliers from API
  const loadSuppliers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await fetch('http://localhost:5000/api/supplier/get', {
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
        setSuppliers(data);
      } else {
        console.error('Failed to load suppliers:', response.status);
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Update form data
    setNewSupplier({
      ...newSupplier,
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
    if (!newSupplier.name.trim()) {
      errors.name = 'Supplier name is required';
    } else if (newSupplier.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!newSupplier.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newSupplier.email)) {
      errors.email = 'Please enter a valid email';
    }

    // Phone validation
    if (!newSupplier.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d+$/.test(newSupplier.phone)) {
      errors.phone = 'Phone number should contain numbers only';
    } else if (newSupplier.phone.length < 10) {
      errors.phone = 'Phone number must be at least 10 digits';
    }

    // Address validation
    if (!newSupplier.address.trim()) {
      errors.address = 'Address is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle new supplier submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch('http://localhost:5000/api/supplier/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newSupplier)
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
        console.log('Supplier added successfully:', data);
        alert('Supplier added successfully!');
        
        // Reset form and close modal
        setNewSupplier({
          name: '',
          email: '',
          phone: '',
          address: ''
        });
        setFormErrors({
          name: '',
          email: '',
          phone: '',
          address: ''
        });
        setShowModal(false);
        
        // Refresh suppliers list
        loadSuppliers();
        
        // Refresh dashboard stats - emit custom event
        window.dispatchEvent(new CustomEvent('dashboard-refresh', { 
          detail: { type: 'supplier', action: 'add' }
        }));
        
      } else {
        console.error('Error adding supplier:', data);
        alert(data.message || 'Failed to add supplier');
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Network error. Please try again.');
    }
  };

  // Handle delete supplier
  const handleDelete = async (supplierId, supplierName) => {
    if (!window.confirm(`Are you sure you want to delete supplier "${supplierName}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/supplier/delete/${supplierId}`, {
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
        console.log('Supplier deleted successfully:', data);
        alert('Supplier deleted successfully!');
        loadSuppliers();
        
        // Refresh dashboard stats - emit custom event
        window.dispatchEvent(new CustomEvent('dashboard-refresh', { 
          detail: { type: 'supplier', action: 'delete' }
        }));
      } else {
        console.error('Error deleting supplier:', data);
        alert(data.message || 'Failed to delete supplier');
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Network error. Please try again.');
    }
  };

  // Filter suppliers based on search term and filters
  const filteredSuppliers = suppliers.filter(supplier => {
    // Search filter
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          supplier.phone.includes(searchTerm);

    // Date filter
    const supplierDate = new Date(supplier.createdAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let matchesDate = true;
    
    if (filters.dateRange === 'today') {
      matchesDate = supplierDate >= today;
    } else if (filters.dateRange === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      matchesDate = supplierDate >= weekAgo;
    } else if (filters.dateRange === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      matchesDate = supplierDate >= monthAgo;
    } else if (filters.dateRange === 'custom') {
      if (filters.customDateFrom) {
        const fromDate = new Date(filters.customDateFrom);
        matchesDate = matchesDate && supplierDate >= fromDate;
      }
      if (filters.customDateTo) {
        const toDate = new Date(filters.customDateTo);
        toDate.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && supplierDate <= toDate;
      }
    }

    return matchesSearch && matchesDate;
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
                  placeholder="Search suppliers..."
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
                    (filters.dateRange !== 'all' || filters.sortBy !== 'createdAt' || filters.sortOrder !== 'desc') 
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
                    setNewSupplier({
                      name: '',
                      email: '',
                      phone: '',
                      address: ''
                    });
                    setFormErrors({
                      name: '',
                      email: '',
                      phone: '',
                      address: ''
                    });
                    setShowModal(true);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Supplier
                </button>
              </div>
            )}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        sortOrder: 'desc'
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
              <p>Found {filteredSuppliers.length} supplier{filteredSuppliers.length !== 1 ? 's' : ''} matching "{searchTerm}"</p>
            )}
            {!searchTerm && (
              <p>Total suppliers: {suppliers.length}</p>
            )}
          </div>

          {/* Suppliers List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Suppliers List</h2>
            </div>
            
            {loading ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">Loading suppliers...</p>
              </div>
            ) : filteredSuppliers.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">
                  {searchTerm || filters.dateRange !== 'all' 
                    ? 'No suppliers found matching your criteria.' 
                    : 'No suppliers found.'}
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
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Added On
                      </th>
                      {user?.role === 'admin' && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSuppliers.map((supplier) => (
                      <tr key={supplier._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{supplier.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{supplier.phone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 max-w-xs truncate" title={supplier.address}>
                            {supplier.address}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(supplier.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        {user?.role === 'admin' && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleDelete(supplier._id, supplier.name)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Supplier Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div 
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
            onClick={() => setShowModal(false)}
          />
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative z-10 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Add New Supplier</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1" htmlFor="name">
                  <span className="text-red-500">*</span> Supplier Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newSupplier.name}
                  onChange={handleInputChange}
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter supplier name"
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
                  value={newSupplier.email}
                  onChange={handleInputChange}
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    formErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="supplier@example.com"
                />
                {formErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
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
                  value={newSupplier.phone}
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
                  value={newSupplier.address}
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
                  Add Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
