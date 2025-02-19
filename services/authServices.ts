import axiosClient from "./axiosClient";

export const AuthService = {
  async login(credentials: { email: string; password: string }) {
    return axiosClient.post("/api/auth/login", credentials);
  },
  async register(userData: {
    name: string;
    email: string;
    password: string;
    document: string;
    phone: string;
  }) {
    return axiosClient.post("/api/auth/register", userData);
  },
};
