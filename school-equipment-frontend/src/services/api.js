import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// API Calls as arrow functions
export const registerUser = (user) => api.post("/users/register", user);
export const loginUser = (credentials) => api.post("/users/login", credentials);
export const getAllEquipment = () => api.get("/equipment");
export const getAvailableEquipment = () => api.get("/equipment/available");
export const addEquipment = (equipment) => api.post("/equipment", equipment);
export const createBorrowRequest = (request) => api.post("/requests", request);
export const getAllRequests = () => api.get("/requests");
export const getUserRequests = (userId) => api.get(`/requests/user/${userId}`);
export const approveRequest = (id, body) => api.put(`/requests/${id}/approve`, body);
export const rejectRequest = (id, body) => api.put(`/requests/${id}/reject`, body);
export const markReturned = (id) => api.put(`/requests/${id}/return`);
export const updateEquipment = (id, equipment) => api.put(`/equipment/${id}`, equipment);
export const deleteEquipment = (id) => api.delete(`/equipment/${id}`);