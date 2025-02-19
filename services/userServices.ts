import axiosClient from "./axiosClient";

export const UserService = {
  async findAll() {
    return axiosClient.get("/api/user");
  },
  async findOne(userId: string) {
    return axiosClient.get(`/api/user/${userId}`);
  },
  async create(userData: {
    name: string;
    email: string;
    password: string;
    document: string;
    phone: string;
  }) {
    return axiosClient.post("/api/user", userData);
  },
  async update(
    userId: string,
    userData: Partial<{
      name: string;
      email: string;
      password: string;
      document: string;
      phone: string;
    }>
  ) {
    return axiosClient.put(`/api/user/${userId}`, userData);
  },
  async delete(userId: string) {
    return axiosClient.delete(`/api/user/${userId}`);
  },
};
