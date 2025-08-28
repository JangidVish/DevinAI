import React, { createContext, useState } from "react";
import { useEffect } from "react";
import api from "../config/axios";

// Create the context
 const UserContext = createContext();


// Provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    const  fetchUser =async()=>{
      try {
        setLoading(true);
         const res =  await api.get("/user/profile");
         setUser(res.data); 
        //  console.log(res.data)
      } catch (error) {
        console.log(error)
        setUser(null);
      }finally{
        setLoading(false);
      }
    }
    fetchUser();
  },[])


  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {!loading && children}
    </UserContext.Provider>
  );
};

export { UserContext };