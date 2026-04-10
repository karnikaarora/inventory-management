import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";  
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Collects user email & password and authenticates them via the backend
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // login: function from AuthContext that calls backend API
  const { login } = useAuth();  
  // navigate: function to redirect user to different routes programmatically
  const navigate = useNavigate();

  // FORM SUBMISSION HANDLER
  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setLoading(true);
    setError(null); 
    
    if (!email || !password) {
      setError("Email and password are required");
      setLoading(false);
      return; 
    }

    try {
      // AUTHENTICATE WITH BACKEND
      // login() function from AuthContext makes a POST request to: http://localhost:5000/api/auth/login
      // Sends: { email, password }
      // 
      // Backend (AuthController) does:
      // 1. Searches MongoDB collection "users" for the provided email
      // 2. If email found: compares password with hashed password in database using bcrypt.compare()
      // 3. If password matches: creates JWT token and returns token + user data (name, email, role)
      // 4. If email/password not found: throws error with message "User not found" or "Invalid credentials"
      //
      // AuthContext then saves:
      // - token → localStorage (for API authentication in future requests)
      // - user → localStorage (to keep user logged in on page refresh)
      // - user state → component state (for immediate use)
      await login(email, password); 

      navigate("/");  // SUCCESSFUL LOGIN: Redirect to Root component which will further redirect to appropriate dashboard based on user role
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Invalid Credentials!";
      setError(errorMessage); 
      setLoading(false); 
    }
  };

  return (
    // MAIN CONTAINER: Centers the login card on the page
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {/* LOGIN CARD: Material design card component */}
      <Card className="w-[350px]">
        {/* CARD HEADER: Title and description */}
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        
        {/* CARD CONTENT: Form with inputs and button */}
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* ERROR ALERT: Shows only if error state has a value */}
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-100 rounded border border-red-300">
                {error}
              </div>
            )}

            {/* EMAIL INPUT FIELD */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input 
                type="email" 
                placeholder="admin@example.com" 
                value={email} // Controlled input - value comes from state
                onChange={(e) => setEmail(e.target.value)} // Update state on user input
                required // HTML5 validation - prevents submit if empty
                disabled={loading} // Disable input while loading (during authentication)
              />
            </div>

            {/* PASSWORD INPUT FIELD */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input 
                type="password" // Hides password characters
                placeholder="Enter your password"
                value={password} // Controlled input - value comes from state
                onChange={(e) => setPassword(e.target.value)} // Update state on user input
                required // HTML5 validation - prevents submit if empty
                disabled={loading} // Disable input while loading (during authentication)
              />
            </div>

            {/* SUBMIT BUTTON */}
            <Button type="submit" className="w-full" disabled={loading}>
              {/* Button text changes based on loading state */}
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;