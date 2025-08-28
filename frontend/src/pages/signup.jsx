import React from 'react'
import SignupImage from '../assets/Login-amico.svg'; // Assuming you have an image in the assets folder
import api from '../config/axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/user.context';
import toast, { Toaster } from 'react-hot-toast';
const Signup = () => {
    const [email, setEmail] = React.useState("");
    const [username, setUsername] = React.useState("");

    const [password, setPassword] = React.useState("");
    const navigate = useNavigate();

    const handleSubmit = async(e) => {
        e.preventDefault();
        localStorage.removeItem("token");
        // Handle signup logic here
        try {
            const response = await api.post("/user/register", {
                email: email,
                password: password,
                username: username
            });

            if(!response || !response.data) {
              toast.error("Invalid response from server")
                throw new Error("Invalid response from server");
            }
            // Assuming the server returns a token or some user data

            if (response.status === 200) {
                toast.success("Signup Successful")
                localStorage.setItem("token", response.data.token); // Store token in localStorage

                navigate("/");
            }
        } catch (error) {
            toast.error("Signup failed:", error);
        }
        
    }
    React.useEffect(() => {
        // Any side effects or cleanup can be handled here
    }, []);
  return (
    <div className="flex items-center justify-center h-screen w-screen p-4 flex-row-reverse">
      <Toaster />
        <div className="left w-1/2 p-4 flex items-center justify-center">
        <img src={SignupImage} alt="Signup Illustration" className='w-3/4' />
        </div>
      <div className="right w-1/2 flex flex-col items-center justify-center p-6 ">
          <h1 className="text-3xl font-bold underline text-center mt-10">
            Signup
          </h1>
          <p className="text-center mt-4">Please enter your credentials to Signup.</p>
            <form className="flex flex-col items-center mt-6 w-full">
                 <input
                type="username"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mb-4 p-2 border border-gray-300 rounded md:w-1/2 w-full"
                />
                <input
                type="email"
                placeholder="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mb-4 p-2 border border-gray-300 rounded md:w-1/2 w-full"
                />
                <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mb-4 p-2 border border-gray-300 rounded md:w-1/2 w-full"
                />
                <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded md:w-1/2 w-full hover:bg-blue-600"
                onClick={handleSubmit}
                >
                Signup
                </button>
            </form>
            <p className="text-center mt-4">
              Already have an account? <a href="/login" className="text-blue-500">Login</a>
            </p>
      </div>
    </div>
  )
}

export default Signup
