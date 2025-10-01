import React from "react";
import SignupImage from "../assets/Login-amico.svg"; // Assuming you have an image in the assets folder
import api from "../config/axios";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/user.context";
import toast, { Toaster } from "react-hot-toast";
const Signup = () => {
  const [email, setEmail] = React.useState("");
  const [username, setUsername] = React.useState("");

  const [password, setPassword] = React.useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    // Handle signup logic here
    try {
      const response = await api.post("/user/register", {
        email: email,
        password: password,
        username: username,
      });

      if (!response || !response.data) {
        toast.error("Invalid response from server");
        throw new Error("Invalid response from server");
      }
      // Assuming the server returns a token or some user data

      if (response.status === 200) {
        toast.success("Signup Successful");
        localStorage.setItem("token", response.data.token); // Store token in localStorage

        navigate("/home");
      }
    } catch (error) {
      toast.error("Signup failed:", error);
    }
  };
  React.useEffect(() => {
    // Any side effects or cleanup can be handled here
  }, []);
  return (
    <div className="flex items-center justify-center min-w-screen min-h-screen bg-gradient-to-r from-purple-900 via-black to-blue-900">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="bg-black text-white rounded-2xl shadow-2xl p-10 w-[700px] border border-gray-700">
        {/* Title */}
        <h1 className="text-center text-2xl font-bold mb-8 tracking-wider">
          CREATE YOUR ACCOUNT 🚀
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
          {/* Username */}
          <div className="flex items-center space-x-2 bg-gray-900 px-4 py-3 rounded-md shadow-inner focus-within:ring-2 focus-within:ring-purple-500">
            <span role="img" aria-label="user">
              👤
            </span>
            <input
              type="text"
              placeholder="Username"
              className="bg-transparent flex-1 outline-none text-gray-200 placeholder-gray-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="flex items-center space-x-2 bg-gray-900 px-4 py-3 rounded-md shadow-inner focus-within:ring-2 focus-within:ring-purple-500">
            <span role="img" aria-label="mail">
              📧
            </span>
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
            <span role="img" aria-label="lock">
              🔒
            </span>
            <input
              type="password"
              placeholder="Password"
              className="bg-transparent flex-1 outline-none text-gray-200 placeholder-gray-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="mt-4 bg-white text-black font-bold text-lg py-2 rounded-md shadow-lg hover:scale-105 hover:shadow-2xl transition transform"
          >
            SIGN UP
          </button>
        </form>
        <p className="mt-4 text-center">
          Already have an account?{" "}
          <a href="/login" className="text-purple-400">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
