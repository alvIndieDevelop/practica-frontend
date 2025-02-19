import axios from "axios";
import { options } from "@/lib/options";

const axiosClient = axios.create({
  baseURL: options.APP.API_GATEWAY_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(
  (response) => response,
  (error) => {
    console.error("API request error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosClient;
