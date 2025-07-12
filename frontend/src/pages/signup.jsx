import React from 'react'
import SignupImage from '../assets/Login-amico.svg'; // Assuming you have an image in the assets folder
import api from '../config/axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/user.context';
const Signup = () => {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const navigate = useNavigate();
    const {setUser} = React.useContext(UserContext);
    const handleSubmit = async(e) => {
        e.preventDefault();
        // Handle signup logic here
        try {
            const response = await api.post("/user/register", {
                email: email,
                password: password
            });

            if(!response || !response.data) {
                throw new Error("Invalid response from server");
            }
            // Assuming the server returns a token or some user data

            if (response.status === 200) {
                console.log("Signup successful:", response.data);
                localStorage.setItem("token", response.data.token); // Store token in localStorage
                setUser(response.data.user); // Set user in context
                navigate("/");
            }
        } catch (error) {
            console.error("Signup failed:", error);
        }
        console.log("Signup form submitted");
    }
    React.useEffect(() => {
        // Any side effects or cleanup can be handled here
    }, []);
  return (
    <div className="flex items-center justify-center h-screen w-screen p-4 flex-row-reverse">
        <div className="left w-1/2 p-4 flex items-center justify-center">
        <img src={SignupImage} alt="Signup Illustration" className='w-3/4' />
        </div>
      <div className="right w-1/2 flex flex-col items-center justify-center p-6 ">
          <h1 className="text-3xl font-bold underline text-center mt-10">
            Signup
          </h1>
          <p className="text-center mt-4">Please enter your credentials to Signup.</p>
            <form className="flex flex-col items-center mt-6">
                <input
                type="ekmail"
                placeholder="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mb-4 p-2 border border-gray-300 rounded"
                />
                <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mb-4 p-2 border border-gray-300 rounded"
                />
                <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={handleSubmit}
                >
                Signup
                </button>
            </form>
            <p className="text-center mt-4">
              Already have an account? <a href="/login" className="text-blue-500">Sign up</a>
            </p>
      </div>
    </div>
  )
}

export default Signup
