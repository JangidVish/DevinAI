import React, { useEffect} from 'react'

import {useNavigate } from 'react-router-dom'


const UserAuth = ({children}) => {


    const token = localStorage.getItem('token')
    
    const navigate = useNavigate();

useEffect(()=>{
    
        if(!token || token === "undefined"){
            navigate("/login")
        }
    },[token, navigate])




  return (
    <>
    {children}
    
    </>
  )
}

export default UserAuth
