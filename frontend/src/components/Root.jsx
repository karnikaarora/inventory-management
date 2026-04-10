import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

//if user is logged in, check their role and navigate to the appropriate dashboard, else navigate to login page

const Root = () => {
    const { user, loading } = useAuth();  // Get both user AND loading state
    const navigate = useNavigate();  //inbuilt hook to navigate programmatically

    //if user is logged in, check their role and navigate to the appropriate dashboard
    useEffect(() => {
        // Wait for AuthContext to finish loading first
        if (loading) {
            return;  // Don't do anything while loading
        }

        // Now that loading is done, check if user exists
        if (user) {
            if (user.role === "admin") {
                navigate("/admin/dashboard");
            }
            else if (user.role === "employee") {
                navigate("/employee/dashboard");
            }
            else if (user.role === "customer") {
                navigate("/customer-dashboard");
            }
            else {
                navigate("/login");
            }
        }
        else {
            // No user logged in, go to login page
            navigate("/login");
        }
    }, [user, loading, navigate])  // Added loading to dependency array

    return null; 
}
export default Root;

