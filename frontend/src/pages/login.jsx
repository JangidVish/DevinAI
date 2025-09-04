import React from 'react'
import LoginImage from '../assets/Login-amico.svg'; 
import api from '../config/axios';
import { useNavigate } from 'react-router-dom';

import toast, { Toaster } from 'react-hot-toast';


const Login = () => {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
        const navigate = useNavigate();


  

    const handleSubmit = async(e) => {

        e.preventDefault();
        // Handle login logic here
        console.log(email, password);
        if(!email || !password) {
            toast.error("Please fill all the fields");
            return;
        }
        try {
            const response = await api.post("/user/login", {
                email: email,
                password: password
            });

            if(!response || !response.data) {
              toast.error("Invalid response from server")
                throw new Error("Invalid response from server");
                
            }
            console.log("Response when login: ", response)
       

     
                localStorage.setItem("token", response.data.token); 
                toast.success("Login Successfull")
       
                navigate("/");
        } catch (error) {
            console.error("Login failed:", error.response.data.error);
            toast.error(`Login Failed: ${error.response.data.error}` )
        }
        console.log("Login form submitted");
    }   
  return (
        <div className="flex items-center justify-center min-w-screen min-h-screen bg-gradient-to-r from-purple-900 via-black to-blue-900">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="bg-black text-white rounded-2xl shadow-2xl p-10 w-[700px] border border-gray-700">
        <h1 className="text-center text-2xl font-bold mb-8 tracking-wider">
          LOGIN TO CONTINUE YOUR JOURNEY!
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
          {/* Email */}
          <div className="flex items-center space-x-2 bg-gray-900 px-4 py-3 rounded-md shadow-inner focus-within:ring-2 focus-within:ring-purple-500">
            <span role="img" aria-label="mail">📧</span>
            <input
              type="email"
              placeholder="Email"
              className="bg-transparent flex-1 outline-none text-gray-200 placeholder-gray-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="flex items-center space-x-2 bg-gray-900 px-4 py-3 rounded-md shadow-inner focus-within:ring-2 focus-within:ring-purple-500">
            <span role="img" aria-label="lock">🔒</span>
            <input
              type="password"
              placeholder="Password"
              className="bg-transparent flex-1 outline-none text-gray-200 placeholder-gray-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <a href="/forgot-password" className=' text-purple-400'>Forgot your password? </a>

          {/* Button */}
          <button
            type="submit"
            className=" bg-white text-black font-bold text-lg py-2 rounded-md shadow-lg hover:scale-105 hover:shadow-2xl transition transform"
          >
            LOGIN
          </button>
        </form>
           <p className='mt-4 text-center'>Don't have an account? <a href="/signup" className="text-purple-400">Register</a></p>
      </div>
   
    </div>
  )
}

export default Login
