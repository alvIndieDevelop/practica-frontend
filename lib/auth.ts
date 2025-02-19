import { User } from "lucide-react";
import { z } from "zod";
import { AuthService } from "@/services/authServices";

export const userSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  document: z.string().min(5),
  phone: z.string().min(10),
});

export type User = z.infer<typeof userSchema>;

export type UserData = {
  _id: string;
  name: string;
  email: string;
  password: string;
  document: string;
  phone: string;
  walletId: string;
};

export type Auth = {
  user: UserData;
  token: string;
};

// Mock user data storage with an example user
let users: Auth[] = [];

let currentUser: Auth | null = null;

export const auth = {
  register: async (userData: User) => {
    try {
      await AuthService.register(userData);
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    try {
      const response = await AuthService.login({ email, password });
      console.log(response.data);
      // push to local storage
      currentUser = response.data;
      console.log(currentUser);
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  getCurrentUser: () => currentUser,

  logout: () => {
    currentUser = null;
  },
};
