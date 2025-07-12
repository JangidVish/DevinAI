import React, { createContext, useState } from "react";

// Create the context
 const UserContext = createContext();


// Provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);


  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext };