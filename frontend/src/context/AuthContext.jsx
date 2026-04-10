import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

//Role-Based Access: Admin users can access all features, while regular users have limited access.
//Private Routes: If a user tries to access a protected route without being logged in, they will be redirected to the login page.
//Stay logged in: When a user logs in, their authentication token and user details are stored in localStorage.


/**
 * 1. Global State: Creates a shared "AuthContext" to store user data and login status across the entire app.
 * 2. Persistence: On refresh, "verifyUser" checks localStorage for a saved user/token to keep the user logged in.
 * 3. Login Logic: Authenticates with the backend, saves the returned User & Token to localStorage, and updates the global state.
 * 4. Logout Logic: Clears all user data from both the application state and browser localStorage.
 * 5. Loading Guard: Uses a 'loading' state to prevent child components from rendering until the auth check is complete.
 */

// creating context 
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // on page refresh, check if user data exists in localStorage and set it to state
    const verifyUser = () => {
      try {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (storedUser && token) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false); // Check hone ke baad loading band
      }
    };
    verifyUser();
  }, []);

  // Login function that makes API call with email and password
  const login = async (email, password) => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data;

      // Save token and user data to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Update state with user data
      setUser(user);

      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // if person is logging out, remove user data from state and localStorage
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // Update user details in real-time
  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem("user", JSON.stringify(updatedUserData));
  };

  return (
    // this is the value that will be accessible to all components wrapped inside AuthProvider
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {!loading && children} 
    </AuthContext.Provider>
  );
};
export const useAuth= () => useContext(AuthContext);
export default AuthProvider;