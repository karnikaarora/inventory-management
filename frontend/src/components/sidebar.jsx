import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiHome,
  FiTag,
  FiBox,
  FiTruck,
  FiShoppingCart,
  FiUsers,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiHeart,
} from "react-icons/fi";

const Sidebar = () => {
  const [isOpen, setIsOpen] = React.useState(true); 
  const { logout, user } = useAuth();  
  const location = useLocation();  

  // Admin menu items
  const adminMenuItems = [
    { label: "Dashboard", icon: FiHome, path: "/admin/dashboard" },
    { label: "Categories", icon: FiTag, path: "/admin-dashboard/categories" },
    { label: "Products", icon: FiBox, path: "/admin-dashboard/products" },
    { label: "Suppliers", icon: FiTruck, path: "/admin-dashboard/suppliers" },
    { label: "Orders", icon: FiShoppingCart, path: "/admin-dashboard/orders" },
    { label: "Users", icon: FiUsers, path: "/admin-dashboard/users" },
    { label: "Profile", icon: FiUser, path: "/admin-dashboard/profile" },
  ];

  // Customer menu items - Only what customers need!
  const customerMenuItems = [
    { label: "Dashboard", icon: FiHome, path: "/customer-dashboard" },
    { label: "Products", icon: FiBox, path: "/customer-dashboard/products" },
    { label: "Favorites", icon: FiHeart, path: "/favorites" },
    { label: "Orders", icon: FiShoppingCart, path: "/customer-dashboard/orders" },
    { label: "Profile", icon: FiUser, path: "/customer-dashboard/profile" },
  ];

  // Employee menu items (if needed)
  const employeeMenuItems = [
    { label: "Dashboard", icon: FiHome, path: "/employee/dashboard" },
    { label: "Products", icon: FiBox, path: "/employee-dashboard/products" },
    { label: "Orders", icon: FiShoppingCart, path: "/employee-dashboard/orders" },
    { label: "Profile", icon: FiUser, path: "/employee-dashboard/profile" },
  ];

  // Choose menu based on user role
  const getMenuItems = () => {
    if (user?.role === 'admin') return adminMenuItems;
    if (user?.role === 'customer') return customerMenuItems;
    if (user?.role === 'employee') return employeeMenuItems;
    return [];
  };

  const menuItems = getMenuItems();

  const isActive = (path) => location.pathname === path;

  // Handle logout
  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* SIDEBAR CONTAINER - Black and White Theme */}
      <div
        className={`${
          isOpen ? "w-64" : "w-20"
        } bg-gray-900 border-r border-gray-800 text-white transition-all duration-300 shadow-lg`}
      >
        {/* HEADER: Title */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          {isOpen && <h1 className="text-lg font-bold text-white">Inventory MS</h1>}
          {/* Toggle Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-gray-800 rounded transition text-gray-300"
          >
            {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>

        {/* MENU ITEMS */}
        <nav className="flex-1 px-2 py-4 space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={index}
                to={item.path}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-md transition-all duration-200
                  ${
                    active
                      ? "bg-white text-gray-900 font-semibold shadow-sm"
                      : "text-gray-300 hover:bg-gray-800"
                  }
                `}
              >
                <Icon size={22} className="shrink-0" />
                {isOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* DIVIDER */}
        <div className="border-t border-gray-800 mx-2"></div>

        {/* USER INFO & LOGOUT */}
        <div className="p-4 space-y-3 border-t border-gray-800">
          {/* Current User Info */}
          {isOpen && (
            <div className="text-sm">
              <p className="text-gray-400 text-xs">Logged in as:</p>
              <p className="text-white font-semibold truncate">{user?.name}</p>
              <p className="text-gray-300 text-xs capitalize">{user?.role}</p>
            </div>
          )}

          {/* Logout Button - White text on gray-900 */}
          <button
            onClick={handleLogout}
            className={`
              flex items-center space-x-3 w-full px-4 py-3 rounded-md
              bg-white text-gray-900 hover:bg-gray-100 transition-all duration-200 font-medium shadow-sm
              ${isOpen ? "justify-start" : "justify-center"}
            `}
          >
            <FiLogOut size={20} />
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-auto">
        {/* Your page content will be rendered here */}
      </div>
    </div>
  );
};

export default Sidebar;