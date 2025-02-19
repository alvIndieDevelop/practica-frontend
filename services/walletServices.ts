import axiosClient from "./axiosClient";

export const WalletService = {
  async findWalletByUserId(userId: string) {
    return axiosClient.get(`/api/wallet/findWalletByUserId?userId=${userId}`);
  },
  async addToWallet(payload: {
    name: string;
    email: string;
    document: string;
    phone: string;
    amount: number;
  }) {
    return axiosClient.post("/api/wallet/addToWallet", payload);
  },
  async pay(payload: { userId: string; amount: number }) {
    return axiosClient.post("/api/wallet/pay", payload);
  },
  async confirmPayment(payload: {
    sessionId: string;
    token: string;
    userId: string;
    amount: number;
  }) {
    return axiosClient.post("/api/wallet/confirmPayment", payload);
  },
};
