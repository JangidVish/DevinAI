import React, { useState } from 'react'

const ResetPassword = () => {
      const [otp, setOtp] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ otp });
  };
  return (
   <div className="flex items-center justify-center min-w-screen min-h-screen bg-gradient-to-r from-purple-900 via-black to-blue-900">
      <div className="bg-black text-white rounded-2xl shadow-2xl p-10 w-[700px] border border-gray-700">
        {/* Title */}
        <h1 className="text-center text-2xl font-bold mb-8 tracking-wider">
          VERIFY YOUR OTP 📲
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
          {/* OTP */}
          <div className="flex items-center space-x-2 bg-gray-900 px-4 py-3 rounded-md shadow-inner focus-within:ring-2 focus-within:ring-purple-500">
            <span role="img" aria-label="otp">🔢</span>
            <input
              type="text"
              placeholder="Enter OTP"
              className="bg-transparent flex-1 outline-none text-gray-200 placeholder-gray-500 tracking-widest text-center"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="mt-4 bg-white text-black font-bold text-lg py-2 rounded-md shadow-lg hover:scale-105 hover:shadow-2xl transition transform"
          >
            VERIFY
          </button>
        </form>
      </div>
    </div>
  )
}

export default ResetPassword

