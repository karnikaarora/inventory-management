import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

//if user is logged in, check their role and navigate to the appropriate dashboard, else navigate to login page

const Root = () => {
    const {user} = useAuth();
    const navigate = useNavigate();  //inbuilt hook to navigate programmatically

    //if user is logged in, check their role and navigate to the appropriate dashboard
    React.useEffect(()=>{
        if(user){
            if(user.role === "admin"){
                navigate("/admin/dashboard");
            }
            else if(user.role === "employee"){
                navigate("/employee/dashboard");
            }
            else{
                navigate("/login");
            }
        }
        else {
            navigate("/login");
        }
    }, [user,navigate])
    return null; 
}
export default Root;

