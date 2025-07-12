import React from 'react'
import { Route,  BrowserRouter, Routes } from 'react-router-dom';
import Home from '../pages/home';
import Login from '../pages/login';
import Signup from '../pages/signup';
import Project from '../pages/Project';
import UserAuth from '../../auth/userAuth';
const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserAuth><Home /></UserAuth>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/project" element={<UserAuth ><Project /></UserAuth>} />

        {/* Add more routes as needed */}
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
