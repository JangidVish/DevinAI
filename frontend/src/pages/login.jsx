import React from 'react'
import LoginImage from '../assets/Login-amico.svg'; 
import api from '../config/axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/user.context.jsx';


const Login = () => {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
        const navigate = useNavigate();

            const {setUser} = React.useContext(UserContext);
  

    const handleSubmit = async(e) => {

        e.preventDefault();
        // Handle login logic here
        try {
            const response = await api.post("/user/login", {
                email: email,
                password: password
            });

            if(!response || !response.data) {
                throw new Error("Invalid response from server");
            }
       

            if (response.status === 200) {
                localStorage.setItem("token", response.data.token); // Store token in localStorage
                console.log(response.data);
                setUser(response.data.user); // Set user in context
                navigate("/");
            }
        } catch (error) {
            console.error("Login failed:", error);
        }
        console.log("Login form submitted");
    }   
  return (
    <div className="flex items-center justify-center h-screen w-screen p-4">
        <div className="left w-1/2 p-4 flex items-center justify-center">
        <img src={LoginImage} alt="Login Illustration" className='w-3/4' />
        </div>
      <div className="right w-1/2 flex flex-col items-center justify-center p-6 ">
          <h1 className="text-3xl font-bold underline text-center mt-10">
            Login
          </h1>
          <p className="text-center mt-4">Please enter your credentials to login.</p>
            <form className="flex flex-col items-center mt-6">
                <input
                type="email"
                placeholder="email"
                className="mb-4 p-2 border border-gray-300 rounded"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                />
                <input
                type="password"
                placeholder="Password"
                className="mb-4 p-2 border border-gray-300 rounded"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
                <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={handleSubmit}
                >
                Login
                </button>
            </form>
            <p className="text-center mt-4">
              Don't have an account? <a href="/signup" className="text-blue-500">Sign up</a>
            </p>
      </div>
    </div>
  )
}

export default Login
