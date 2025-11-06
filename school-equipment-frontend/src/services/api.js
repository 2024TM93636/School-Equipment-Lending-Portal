import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

// Create a reusable Axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Register interceptors only once (helps during StrictMode double-mount)
if (!api.interceptorsRegistered) {
  // --------------------- REQUEST INTERCEPTOR ---------------------
  api.interceptors.request.use(
    (config) => {
      const token = sessionStorage.getItem("token");
      if (token) {
        config.headers["Authorization"] = token;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // --------------------- RESPONSE INTERCEPTOR ---------------------
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // clear session and redirect to login
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        window.location.href = "/";
      }
      if (!error.response) {
        console.error("Network error or server is unreachable");
      }
      return Promise.reject(error);
    }
  );

  api.interceptorsRegistered = true;
}

// ==========================================================
//                     USER APIs
// ==========================================================
export const registerUser = (user) => api.post("/users/register", user);
export const loginUser = (credentials) => api.post("/users/login", credentials);
export const getUserById = (userId) => api.get(`/users/${userId}`);
export const logoutUser = () => api.post("/users/logout", {});

// ==========================================================
//                     EQUIPMENT APIs
// ==========================================================
export const getAllEquipment = () => api.get("/equipment");
export const getAvailableEquipment = () => api.get("/equipment/available");
export const addEquipment = (equipment) => api.post("/equipment", equipment);
export const updateEquipment = (id, equipment) =>
  api.put(`/equipment/${id}`, equipment);
export const deleteEquipment = (id) => api.delete(`/equipment/${id}`);

// ==========================================================
//                     BORROW REQUEST APIs
// ==========================================================
export const createBorrowRequest = (request) => api.post("/requests", request);
export const getAllRequests = () => api.get("/requests");
export const getUserRequests = (userId) => api.get(`/requests/user/${userId}`);
export const approveRequest = (id, body) =>
  api.put(`/requests/${id}/approve`, body);
export const rejectRequest = (id, body) =>
  api.put(`/requests/${id}/reject`, body);
export const markReturned = (id) => api.put(`/requests/${id}/return`);
