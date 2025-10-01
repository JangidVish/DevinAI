import React, { useEffect } from "react";

import { useNavigate } from "react-router-dom";

const UserAuth = ({ children }) => {
  const token = localStorage.getItem("token");

  const navigate = useNavigate();

  useEffect(() => {
    if (!token || token === "undefined") {
      navigate("/");
    }
  }, [token, navigate]);

  // Don't render children if there's no valid token
  if (!token || token === "undefined") {
    return null;
  }

  return <>{children}</>;
};

export default UserAuth;
