import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001", // Replace with your API URL
  withCredentials: true,
});

export default api;
