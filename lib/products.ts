import { randomBytes } from "crypto";
import { WalletService } from "@/services/walletServices";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Premium Subscription",
    description: "Access to all premium features",
    price: 99.99,
    image:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60",
  },
  {
    id: "2",
    name: "Basic Package",
    description: "Essential features for starters",
    price: 49.99,
    image:
      "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&auto=format&fit=crop&q=60",
  },
  {
    id: "3",
    name: "Pro Bundle",
    description: "Complete solution for professionals",
    price: 149.99,
    image:
      "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop&q=60",
  },
];

interface Transaction {
  id: string;
  userId: string;
  productId: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  timestamp: Date;
}

interface PurchaseToken {
  token: string;
  productId: string;
  amount: number;
  expiresAt: Date;
  transactionId: string;
}

// Mock storage
let walletBalance = 1000;
const activeTokens: PurchaseToken[] = [];
const transactions: Transaction[] = [];

const generateTransactionId = (): string => {
  return `TRX-${randomBytes(8).toString("hex").toUpperCase()}`;
};

const generateToken = async (
  productId: string,
  amount: number,
  userId: string
): Promise<PurchaseToken> => {
  // send to get token and sessionID
  const { data } = await WalletService.pay({
    amount,
    userId,
  });
  console.log(data);

  const transactionId = data.sessionId || generateTransactionId();
  const token = data.token || randomBytes(16).toString("hex");
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 5); // Token expires in 5 minutes

  // Create pending transaction
  transactions.push({
    id: transactionId,
    userId,
    productId,
    amount,
    status: "pending",
    timestamp: new Date(),
  });

  const purchaseToken = {
    token,
    productId,
    amount,
    expiresAt,
    transactionId,
  };

  activeTokens.push(purchaseToken);
  return purchaseToken;
};

const validateToken = async (payload: {
  sessionId: string;
  token: string;
  userId: string;
  amount: number;
}): Promise<PurchaseToken | null> => {
  try {
    // sessionId: string;
    // token: string;
    // userId: string;
    // amount: string;
    await WalletService.confirmPayment(payload);

    const purchaseToken = activeTokens.find((t) => t.token === payload.token);

    if (!purchaseToken) {
      return null;
    }

    if (new Date() > purchaseToken.expiresAt) {
      // Remove expired token and mark transaction as failed
      const index = activeTokens.indexOf(purchaseToken);
      activeTokens.splice(index, 1);

      const transaction = transactions.find(
        (t) => t.id === purchaseToken.transactionId
      );
      if (transaction) {
        transaction.status = "failed";
      }

      return null;
    }

    return purchaseToken;
  } catch (error) {
    return null;
  }
};

export const wallet = {
  getBalance: async (userId: string): Promise<number> => {
    try {
      const { data } = await WalletService.findWalletByUserId(userId);
      return data.amount;
    } catch (error) {
      return 0;
    }
  },

  addBalance: async (payload: {
    name: string;
    email: string;
    document: string;
    phone: string;
    amount: number;
  }) => {
    try {
      return await WalletService.addToWallet(payload);
    } catch (error) {
      return 0;
    }
  },

  getTransactions: (userId: string) => {
    return transactions
      .filter((t) => t.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  },

  // Step 1: Generate purchase token
  generatePurchaseToken: async (
    productId: string,
    amount: number,
    userId: string
  ) => {
    const currWalletBalance = await wallet.getBalance(userId);
    if (currWalletBalance < amount) {
      throw new Error("Insufficient funds");
    }

    // Validate product exists
    const product = products.find((p) => p.id === productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Validate amount matches product price
    if (product.price !== amount) {
      throw new Error("Invalid amount");
    }

    return await generateToken(productId, amount, userId);
  },

  // Step 2: Process payment with token
  processPayment: async (payload: {
    sessionId: string;
    token: string;
    userId: string;
    amount: number;
  }) => {
    const purchaseToken = await validateToken(payload);

    if (!purchaseToken) {
      throw new Error("Invalid or expired token");
    }

    try {
      let currWalletBalance = await wallet.getBalance(payload.userId);
      if (currWalletBalance < purchaseToken.amount) {
        throw new Error("Insufficient funds");
      }

      // Process payment
      currWalletBalance -= purchaseToken.amount;

      // Update transaction status
      const transaction = transactions.find(
        (t) => t.id === purchaseToken.transactionId
      );
      if (transaction) {
        transaction.status = "completed";
      }

      // Remove used token
      const index = activeTokens.indexOf(purchaseToken);
      activeTokens.splice(index, 1);

      return {
        success: true,
        newBalance: currWalletBalance,
        transactionId: purchaseToken.transactionId,
        message: "Payment processed successfully",
      };
    } catch (error) {
      // Mark transaction as failed
      const transaction = transactions.find(
        (t) => t.id === purchaseToken.transactionId
      );
      if (transaction) {
        transaction.status = "failed";
      }

      throw error;
    }
  },
};
