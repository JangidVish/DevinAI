
import React, { useState, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/axios';
import toast, { Toaster } from 'react-hot-toast';
import LoginImage from '../assets/Login-amico.svg';
import { UserContext } from '../context/user.context';


const VerifyAccount = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const otpRef = useRef();
  const { user } = useContext(UserContext);

  React.useEffect(() => {
    console.log('User details from context:', user);
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6 || !/^[0-9]{6}$/.test(otp)) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/user/verify-account', { otp });
      if (response.data.success) {
        toast.success('Account verified successfully!');
        navigate('/');
      } else {
        toast.error(response.data.message || 'OTP not matched');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'OTP not matched');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-w-screen min-h-screen bg-gradient-to-r from-purple-900 via-black to-blue-900">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="bg-black text-white rounded-2xl shadow-2xl p-10 w-[700px] border border-gray-700">
        <h1 className="text-center text-2xl font-bold mb-8 tracking-wider">
          VERIFY YOUR ACCOUNT
        </h1>
        <div className="flex justify-center mb-8">
          <img src={LoginImage} alt="Verify Account" className="w-40 h-40" />
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
          <div className="flex items-center space-x-2 bg-gray-900 px-4 py-3 rounded-md shadow-inner focus-within:ring-2 focus-within:ring-purple-500">
            <span role="img" aria-label="key">🔑</span>
            <input
              type="text"
              maxLength={6}
              minLength={6}
              pattern="[0-9]{6}"
              value={otp}
              ref={otpRef}
              onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="Enter 6-digit OTP"
              className="bg-transparent outline-none w-full text-white placeholder-gray-400"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyAccount;
