import axios from "axios";
const API_BASE = "http://localhost:7071/api"; // replace with your Azure Functions URL

export const getSummary = async (userId) => {
  const res = await axios.get(`${API_BASE}/activities/summary/${userId}`);
  return res.data;
};

export const getActivities = async (userId) => {
  const res = await axios.get(`${API_BASE}/activities/${userId}`);
  return res.data;
};

export const logActivity = async (userId, data) => {
  const res = await axios.post(`${API_BASE}/activities/${userId}`, data);
  return res.data;
};


