import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  document: z.string().min(5),
  phone: z.string().min(10),
});

export type User = z.infer<typeof userSchema>;

// Mock user data storage with an example user
let users: User[] = [{
  name: "John Doe",
  email: "john@example.com",
  password: "password123",
  document: "12345678",
  phone: "1234567890"
}];

let currentUser: User | null = null;

export const auth = {
  register: async (userData: User) => {
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }
    users.push(userData);
    return userData;
  },

  login: async (email: string, password: string) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    currentUser = user;
    return user;
  },

  getCurrentUser: () => currentUser,

  logout: () => {
    currentUser = null;
  }
};