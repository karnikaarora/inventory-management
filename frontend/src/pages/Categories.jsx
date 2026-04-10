import React, { useState, useEffect } from 'react';
import axios from 'axios';  
import Sidebar from '../components/sidebar';
import { useAuth } from '../context/AuthContext';

/**
 * CATEGORIES PAGE - COMPLETE FLOW EXPLANATION:
 * 
 * This component manages the complete CRUD operations for categories with full authentication flow.
 * 
 * OVERALL ARCHITECTURE:
 * - Left Column: Add Category Form (40% width)
 * - Right Column: Categories List with Edit/Delete (60% width)
 * 
 * SECURITY FLOW:
 * - Fetch: Public endpoint (no auth required)
 * - Add/Edit/Delete: Protected endpoints (JWT + Admin role required)
 * 
 * DATA FLOW:
 * 1. Component mounts → fetchCategories() → GET /api/category/all
 * 2. User adds category → handleSubmit() → POST /api/category/add
 * 3. User edits category → handleUpdateCategory() → PUT /api/category/update/:id
 * 4. User deletes category → handleDeleteCategory() → DELETE /api/category/delete/:id
 * 5. After any operation → fetchCategories() → Refresh list
 */

const Categories = () => {
   const { user } = useAuth();
   const [categoryName, setCategoryName] = useState("");
   const [categoryDescription, setCategoryDescription] = useState("");
   const [categories, setCategories] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [searchTerm, setSearchTerm] = useState("");
   const [editingCategory, setEditingCategory] = useState(null);
   const [editName, setEditName] = useState("");
   const [editDescription, setEditDescription] = useState("");

   /**
    * FETCH CATEGORIES FUNCTION - PUBLIC ENDPOINT FLOW
    * 
    * SECURITY: No authentication required
    * 
    * COMPLETE FLOW:
    * 1. Component mounts or refreshes → calls fetchCategories()
    * 2. Makes GET request to /api/category/all (no auth headers needed)
    * 3. Backend directly executes getCategories controller (no middleware)
    * 4. MongoDB returns all categories sorted by newest first
    * 5. Frontend receives categories array and updates state
    * 6. UI re-renders with updated categories list
    * 
    * SEARCH FUNCTIONALITY:
    * - searchTerm state filters categories in real-time
    * - Filter is case-insensitive and matches name/description
    * 
    * ERROR HANDLING:
    * - Network errors → setError() with retry option
    * - Loading states → setLoading() during fetch
    */
   const fetchCategories = async () => {
     try {
       setLoading(true);
       setError(null);
       
       // Make GET request to fetch all categories
       // No authentication required for this endpoint
       const response = await axios.get("http://localhost:5000/api/category/all");
       
       if (response.status === 200) {
         console.log("Categories fetched successfully:", response.data);
         setCategories(response.data.categories);
       }
     } catch (error) {
       console.error("Error fetching categories:", error);
       setError("Failed to fetch categories");
     } finally {
       setLoading(false);
     }
   };

   /**
    * DELETE CATEGORY FUNCTION - PROTECTED ENDPOINT FLOW
    * 
    * SECURITY: JWT token + Admin role required
    * 
    * COMPLETE FLOW:
    * 1. User clicks Delete button → confirmation dialog appears
    * 2. User confirms → handleDeleteCategory(categoryId) executes
    * 3. Gets JWT token from localStorage (stored during login)
    * 4. Makes DELETE request to /api/category/delete/:id with:
    *    - Headers: { "Authorization": "Bearer <jwt_token>" }
    *    - URL Param: :id (category ID to delete)
    * 5. Backend middleware chain executes:
    *    a) authenticateToken validates JWT and sets req.user
    *    b) requireAdmin checks req.user.role === 'admin'
    *    c) deleteCategory controller finds and deletes category
    * 6. Frontend receives success → shows alert → fetchCategories() refresh
    * 
    * SECURITY LAYERS:
    * - Layer 1: JWT validation (authenticateToken middleware)
    * - Layer 2: Role verification (requireAdmin middleware)
    * - Layer 3: Controller-level admin check (redundant safety)
    */
   const handleDeleteCategory = async (categoryId) => {
     if (!window.confirm('Are you sure you want to delete this category?')) {
       return;
     }

     try {
       const token = localStorage.getItem("token");
       const response = await axios.delete(
         `http://localhost:5000/api/category/delete/${categoryId}`,
         {
           headers: {
             Authorization: `Bearer ${token}`,
           },
         }
       );

       if (response.status === 200) {
         console.log("Category deleted successfully:", response.data);
         alert("Category Deleted!");
         fetchCategories(); // Refresh the categories list
       }
     } catch (error) {
       console.error("Error deleting category:", error);
       alert("Failed to delete category");
     }
   };

   /**
    * START EDIT CATEGORY FUNCTION - UI STATE FLOW
    * 
    * FLOW:
    * 1. User clicks Edit button → handleStartEdit(category) executes
    * 2. Sets editingCategory = category.id (enables edit mode for this card)
    * 3. Populates edit form fields:
    *    - setEditName(category.name)
    *    - setEditDescription(category.description || "")
    * 4. UI re-renders: Display mode → Edit mode for this category
    * 5. Other categories remain in display mode
    * 
    * UI STATE MANAGEMENT:
    * - editingCategory: Tracks which category is being edited
    * - editName/editDescription: Store current edit values
    * - Only the category with matching ID shows edit form
    */
   const handleStartEdit = (category) => {
     setEditingCategory(category.id);
     setEditName(category.name);
     setEditDescription(category.description || "");
   };

   /**
    * CANCEL EDIT FUNCTION - UI STATE RESET FLOW
    * 
    * FLOW:
    * 1. User clicks Cancel button → handleCancelEdit() executes
    * 2. Resets all edit state:
    *    - setEditingCategory(null) → exits edit mode
    *    - setEditName("") → clears name field
    *    - setEditDescription("") → clears description field
    * 3. UI re-renders: Edit mode → Display mode
    * 4. Category card shows normal display with Edit/Delete buttons
    * 
    * STATE CLEANUP:
    * - Ensures no leftover edit data when canceling
    * - Returns UI to consistent display state
    */
   const handleCancelEdit = () => {
     setEditingCategory(null);
     setEditName("");
     setEditDescription("");
   };

   /**
    * UPDATE CATEGORY FUNCTION - PROTECTED ENDPOINT FLOW
    * 
    * SECURITY: JWT token + Admin role required
    * 
    * COMPLETE FLOW:
    * 1. User modifies edit form and clicks Save → handleUpdateCategory(categoryId) executes
    * 2. Gets JWT token from localStorage (stored during login)
    * 3. Makes PUT request to /api/category/update/:id with:
    *    - Headers: { "Authorization": "Bearer <jwt_token>" }
    *    - URL Param: :id (category ID to update)
    *    - Body: { "name": editName, "description": editDescription }
    * 4. Backend middleware chain executes:
    *    a) authenticateToken validates JWT and sets req.user
    *    b) requireAdmin checks req.user.role === 'admin'
    *    c) updateCategory controller validates and updates category
    * 5. Frontend receives success → shows alert → handleCancelEdit() → fetchCategories()
    * 
    * SECURITY LAYERS:
    * - Layer 1: JWT validation (authenticateToken middleware)
    * - Layer 2: Role verification (requireAdmin middleware)
    * - Layer 3: Controller-level admin check (redundant safety)
    * - Layer 4: Input validation and sanitization
    * 
    * UI FLOW:
    * Success → Clear edit state → Refresh list → Show updated category
    */
   const handleUpdateCategory = async (categoryId) => {
     try {
       const token = localStorage.getItem("token");
       const response = await axios.put(
         `http://localhost:5000/api/category/update/${categoryId}`,
         {
           name: editName,
           description: editDescription,
         },
         {
           headers: {
             Authorization: `Bearer ${token}`,
           },
         }
       );

       if (response.status === 200) {
         console.log("Category updated successfully:", response.data);
         alert("Category Updated!");
         handleCancelEdit(); // Clear edit state
         fetchCategories(); // Refresh the categories list
       }
     } catch (error) {
       console.error("Error updating category:", error);
       alert("Failed to update category");
     }
   };

   // Fetch categories when component mounts
   useEffect(() => {
     fetchCategories();
   }, []);

   /**
    * ADD CATEGORY FUNCTION - PROTECTED ENDPOINT FLOW
    * 
    * SECURITY: JWT token + Admin role required
    * 
    * COMPLETE FLOW:
    * 1. User fills add form and clicks Submit → handleSubmit(e) executes
    * 2. Prevents default form submission → e.preventDefault()
    * 3. Gets JWT token from localStorage (stored during login)
    * 4. Makes POST request to /api/category/add with:
    *    - Headers: { "Authorization": "Bearer <jwt_token>" }
    *    - Body: { "name": categoryName, "description": categoryDescription }
    * 5. Backend middleware chain executes:
    *    a) authenticateToken validates JWT and sets req.user
    *    b) requireAdmin checks req.user.role === 'admin'
    *    c) addCategory controller validates and creates category
    * 6. Frontend receives success → shows alert → clears form → fetchCategories()
    * 
    * SECURITY LAYERS:
    * - Layer 1: JWT validation (authenticateToken middleware)
    * - Layer 2: Role verification (requireAdmin middleware)
    * - Layer 3: Controller-level admin check (redundant safety)
    * - Layer 4: Input validation and sanitization
    * 
    * UI FLOW:
    * Success → Clear form → Refresh list → Show new category
    */

   const handleSubmit = async (e) => {
    e.preventDefault(); 
    try {
      // 1. Get the JWT token from localStorage.
      //    - This token is set in localStorage when the user logs in (see AuthContext.jsx login function).
      //    - The token represents the currently logged-in user and is used to prove their identity to the backend.
      //    - Only authenticated users (with a valid token) can perform protected actions like adding a category.
      const token = localStorage.getItem("token"); // This is the user's JWT token stored during login. It is required for authentication with the backend API.
      // 2. Make a POST request to the backend API to add a new category.
      //    - The request body contains the new category's name and description.
      //    - The Authorization header is set to 'Bearer <token>' so the backend can verify the user's identity and permissions.
      //    - The backend will reject the request if the token is missing, invalid, or expired.
      const response = await axios.post(
        "http://localhost:5000/api/category/add",
        {
          name: categoryName,
          description: categoryDescription,
        },
        {
          headers: {
            // The Authorization header is required for protected routes.
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 3. If the request is successful (status 200 or 201), show a success message, clear the form, and refresh categories list.
      if (response.status === 200 || response.status === 201) {
        console.log("Category added successfully:", response.data); 
        alert("Category Added!");  
        setCategoryName(""); // Clear the category name input
        setCategoryDescription(""); // Clear the description input
        
        // Refresh the categories list to show the newly added category
        fetchCategories();
      }
    } catch (error) {
      // 4. If there is an error (e.g., invalid token, network error), show an error message.
      console.error("Error adding category:", error);
      alert("Failed to add category");
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-2">Categories</h1>
          <p className="text-gray-600 mb-6">Manage product categories</p>
          
          {/* Two Column Layout */}
          <div className="flex gap-6">
            {/* Left Column - Add Category Box */}
            <div className="bg-white p-8 rounded-lg shadow w-2/5">
              <h2 className="text-xl font-semibold mb-6">Add Category</h2>
              {/*
                Form for adding a new category.
                When submitted, calls handleSubmit which sends the data to the backend with the user's JWT token in the Authorization header.
              */}
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-gray-700 mb-2 text-sm font-medium" htmlFor="categoryName">Category Name</label>
                  {/* Input for category name */}
                  <input
                    type="text"
                    id="categoryName"
                    name="categoryName"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base"
                    placeholder="Enter category name"
                    value={categoryName} // Controlled input value
                    onChange={e => setCategoryName(e.target.value)} // Update state on change
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 text-sm font-medium" htmlFor="categoryDescription">Category Description</label>
                  {/* Input for category description */}
                  <textarea
                    id="categoryDescription"
                    name="categoryDescription"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base resize-none"
                    placeholder="Enter category description"
                    rows={4}
                    value={categoryDescription} // Controlled textarea value
                    onChange={e => setCategoryDescription(e.target.value)} // Update state on change
                  />
                </div>
                {/* Button to submit the form */}
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium text-base"
                >
                  Add Category
                </button>
              </form>
            </div>

            {/* Right Column - Categories List */}
            <div className="w-3/5 bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Existing Categories</h2>
              
              {/* Search Box */}
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="🔍 Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
              
              {/* Loading State */}
              {loading && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading categories...</p>
                </div>
              )}
              
              {/* Error State */}
              {error && (
                <div className="text-center py-8">
                  <p className="text-red-500">{error}</p>
                  <button 
                    onClick={fetchCategories}
                    className="mt-2 text-blue-600 hover:underline"
                  >
                    Try Again
                  </button>
                </div>
              )}
              
              {/* Categories List */}
              {!loading && !error && (
                <div>
                  {/* Search Results Indicator */}
                  {searchTerm && (
                    <div className="mb-3 text-sm text-gray-600">
                      Found {categories.filter(category => 
                        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
                      ).length} categories matching "{searchTerm}"
                    </div>
                  )}
                  
                  {categories.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No categories found. Add your first category!</p>
                  ) : (
                    <div className="space-y-3">
                      {categories
                        .filter(category => 
                          searchTerm === '' || 
                          category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
                        )
                        .map((category) => (
                        <div 
                          key={category.id} 
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                        >
                          {editingCategory === category.id ? (
                            // Edit Mode
                            <div className="space-y-3">
                              <div>
                                <label className="block text-gray-700 mb-1">Category Name</label>
                                <input
                                  type="text"
                                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="block text-gray-700 mb-1">Category Description</label>
                                <textarea
                                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                  rows={2}
                                  value={editDescription}
                                  onChange={(e) => setEditDescription(e.target.value)}
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleUpdateCategory(category.id)}
                                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            // Display Mode
                            <div>
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg text-gray-800">{category.name}</h3>
                                  {category.description && (
                                    <p className="text-gray-600 text-sm mt-1">{category.description}</p>
                                  )}
                                  <p className="text-xs text-gray-400 mt-2">
                                    Added on: {new Date(category.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex gap-2 ml-4">
                                  <button
                                    onClick={() => handleStartEdit(category)}
                                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCategory(category.id)}
                                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Categories Count */}
                  {categories.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500">
                        Total Categories: <span className="font-semibold">{categories.length}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
