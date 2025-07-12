import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001", // Replace with your API URL
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`, // Get token from localStorage
  },
});

export default api;
