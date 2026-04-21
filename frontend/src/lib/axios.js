import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:3000/api" : (import.meta.env.VITE_API_URL || "/api"),
  withCredentials: true,
});

export const getResponseData = (response) => response?.data?.data;

export const getErrorMessage = (error, fallback = "Something went wrong") =>
  error?.response?.data?.message ||
  error?.response?.data?.errors?.message ||
  error?.response?.data?.errors?.auth ||
  error?.response?.data?.errors?.server ||
  fallback;
