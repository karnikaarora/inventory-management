import React, { useState, useEffect } from 'react';
import Sidebar from '../components/sidebar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CustomerProducts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for products list
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set()); // Track favorite product IDs
  
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    supplier: 'all',
    stockStatus: 'all', // 'all', 'inStock', 'outOfStock', 'lowStock'
    priceRange: 'all', // 'all', 'under1000', '1000to5000', '5000to10000', 'above10000'
    sortBy: 'name', // 'name', 'price', 'stock', 'createdAt'
    sortOrder: 'asc' // 'asc', 'desc'
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(1);

  // Load products
  const loadProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await fetch('http://localhost:5000/api/product/get', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 403) {
        alert('Your session has expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
        loadFavorites(); // Load favorites after products
      } else {
        console.error('Failed to load products:', response.status);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load favorites
  const loadFavorites = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/favorite/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const favoriteIds = new Set(data.map(fav => fav.productId.toString()));
        setFavorites(favoriteIds);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  // Toggle favorite
  const toggleFavorite = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const isFavorite = favorites.has(productId.toString());
      
      if (isFavorite) {
        // Remove from favorites
        const response = await fetch(`http://localhost:5000/api/favorite/remove/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const newFavorites = new Set(favorites);
          newFavorites.delete(productId.toString());
          setFavorites(newFavorites);
          alert('Removed from favorites!');
        }
      } else {
        // Add to favorites
        const response = await fetch('http://localhost:5000/api/favorite/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ productId })
        });

        if (response.ok) {
          const newFavorites = new Set(favorites);
          newFavorites.add(productId.toString());
          setFavorites(newFavorites);
          alert('Added to favorites!');
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Network error. Please try again.');
    }
  };

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Get stock status badge
  const getStockBadge = (stock) => {
    if (stock === 0) {
      return 'text-red-600 bg-red-100';
    } else if (stock < 10) {
      return 'text-yellow-600 bg-yellow-100';
    } else {
      return 'text-green-600 bg-green-100';
    }
  };

  // Get stock status text
  const getStockText = (stock) => {
    if (stock === 0) return 'Out of Stock';
    if (stock < 10) return `Low Stock (${stock})`;
    return `In Stock (${stock})`;
  };

  // Filter and sort products
  const filteredProducts = products.filter(product => {
    // Search filter
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.category?.toLowerCase().includes(searchTerm.toLowerCase());

    // Category filter
    const matchesCategory = filters.category === 'all' || product.category === filters.category;

    // Supplier filter
    const matchesSupplier = filters.supplier === 'all' || product.supplier === filters.supplier;

    // Stock status filter
    let matchesStock = true;
    if (filters.stockStatus === 'inStock') {
      matchesStock = product.stock > 10;
    } else if (filters.stockStatus === 'lowStock') {
      matchesStock = product.stock > 0 && product.stock <= 10;
    } else if (filters.stockStatus === 'outOfStock') {
      matchesStock = product.stock === 0;
    }

    // Price range filter
    let matchesPrice = true;
    const price = product.price || 0;
    if (filters.priceRange === 'under1000') {
      matchesPrice = price < 1000;
    } else if (filters.priceRange === '1000to5000') {
      matchesPrice = price >= 1000 && price <= 5000;
    } else if (filters.priceRange === '5000to10000') {
      matchesPrice = price > 5000 && price <= 10000;
    } else if (filters.priceRange === 'above10000') {
      matchesPrice = price > 10000;
    }

    return matchesSearch && matchesCategory && matchesSupplier && matchesStock && matchesPrice;
  }).sort((a, b) => {
    let aValue, bValue;
    
    if (filters.sortBy === 'price') {
      aValue = a.price || 0;
      bValue = b.price || 0;
    } else if (filters.sortBy === 'stock') {
      aValue = a.stock || 0;
      bValue = b.stock || 0;
    } else {
      aValue = a.name?.toLowerCase() || '';
      bValue = b.name?.toLowerCase() || '';
    }
    
    if (filters.sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Handle order product
  const handleOrderProduct = (product) => {
    setSelectedProduct(product);
    setOrderQuantity(1);
    setShowOrderModal(true);
  };

  // Handle place order
  const handlePlaceOrder = async () => {
    if (!selectedProduct || orderQuantity < 1) {
      alert('Please select a valid quantity');
      return;
    }

    // Check if enough stock is available
    if (orderQuantity > selectedProduct.stock) {
      alert(`Only ${selectedProduct.stock} units available in stock!`);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const orderData = {
        items: [{
          name: selectedProduct.name,
          quantity: orderQuantity,
          price: selectedProduct.price
        }],
        totalAmount: selectedProduct.price * orderQuantity,
        customerName: user?.name || 'Customer',
        customerEmail: user?.email || '',
        customerPhone: user?.phone || '',
        customerAddress: user?.address || '',
        paymentMethod: 'Cash on Delivery',
        deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      };

      const response = await fetch('http://localhost:5000/api/order/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (response.status === 403) {
        alert('Your session has expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      const data = await response.json();

      if (response.ok) {
        alert('Order placed successfully! Stock has been updated.');
        setShowOrderModal(false);
        setSelectedProduct(null);
        setOrderQuantity(1);
        
        // Refresh products to show updated stock
        loadProducts();
        
        // Dispatch event to refresh dashboard
        window.dispatchEvent(new CustomEvent('order-placed', {
          detail: { message: 'New order placed' }
        }));
        
        // Navigate to orders page
        navigate('/customer-dashboard/orders');
      } else {
        alert(data.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Network error. Please try again.');
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Products Catalog</h1>
              <p className="text-gray-600 mt-1">Browse and order products</p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 border rounded-lg transition flex items-center gap-2 ${
                  (filters.category !== 'all' || filters.supplier !== 'all' || filters.stockStatus !== 'all' || 
                   filters.priceRange !== 'all' || filters.sortBy !== 'name' || filters.sortOrder !== 'asc') 
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
                onClick={() => navigate('/customer-dashboard/orders')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                My Orders
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Search products by name or description..."
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

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="all">All Categories</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Food">Food</option>
                    <option value="Books">Books</option>
                  </select>
                </div>

                {/* Supplier Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
                  <select
                    value={filters.supplier}
                    onChange={(e) => setFilters({...filters, supplier: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="all">All Suppliers</option>
                    {Array.from(new Set(products.map(p => p.supplier))).map(supplier => (
                      <option key={supplier} value={supplier}>{supplier}</option>
                    ))}
                  </select>
                </div>

                {/* Stock Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock Status</label>
                  <select
                    value={filters.stockStatus}
                    onChange={(e) => setFilters({...filters, stockStatus: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="all">All Stock</option>
                    <option value="inStock">In Stock</option>
                    <option value="lowStock">Low Stock</option>
                    <option value="outOfStock">Out of Stock</option>
                  </select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="all">All Prices</option>
                    <option value="under1000">Under ₹1,000</option>
                    <option value="1000to5000">₹1,000 - ₹5,000</option>
                    <option value="5000to10000">₹5,000 - ₹10,000</option>
                    <option value="above10000">Above ₹10,000</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="name">Name</option>
                    <option value="price">Price</option>
                    <option value="stock">Stock</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-4">
                  <div className="animate-pulse">
                    <div className="h-32 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                  {/* Product Image Placeholder */}
                  <div className="h-48 bg-gray-100 rounded-t-lg flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                    
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xl font-bold text-blue-600">₹{product.price}</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockBadge(product.stock)}`}>
                        {getStockText(product.stock)}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOrderProduct(product)}
                        disabled={product.stock === 0}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                          product.stock === 0
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {product.stock === 0 ? 'Out of Stock' : 'Order Now'}
                      </button>
                      <button 
                        onClick={() => toggleFavorite(product._id)}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                      >
                        <svg 
                          className={`w-4 h-4 ${favorites.has(product._id.toString()) ? 'text-red-500 fill-current' : 'text-gray-600'}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500">
                  {searchTerm || filters.category !== 'all' || filters.supplier !== 'all' 
                    ? 'Try adjusting your search or filters' 
                    : 'No products available at the moment'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Modal */}
      {showOrderModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Place Order</h2>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Product:</span>
                <span>{selectedProduct.name}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Price:</span>
                <span>₹{selectedProduct.price}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Available Stock:</span>
                <span>{selectedProduct.stock}</span>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <input
                type="number"
                min="1"
                max={selectedProduct.stock}
                value={orderQuantity}
                onChange={(e) => setOrderQuantity(Math.min(parseInt(e.target.value) || 1, selectedProduct.stock))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Amount:</span>
                <span className="text-xl font-bold text-blue-600">
                  ₹{selectedProduct.price * orderQuantity}
                </span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowOrderModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handlePlaceOrder}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerProducts;
