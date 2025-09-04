import React from 'react'
import { Route,  BrowserRouter, Routes } from 'react-router-dom';
import Home from '../pages/home';
import Login from '../pages/login';
import Signup from '../pages/signup';
import Project from '../pages/Project';

import { UserProvider } from '../context/user.context';
import UserAuth from '../../auth/userAuth';
import ForgetPasswordUI from '../pages/forget-passwrd';
import ResetPassword from '../pages/resetpassword';
const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserAuth><UserProvider><Home /></UserProvider> </UserAuth>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/project" element={<UserAuth><UserProvider ><Project /></UserProvider></UserAuth>} />
        <Route path="/forgot-password" element={<ForgetPasswordUI />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Add more routes as needed */}
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
