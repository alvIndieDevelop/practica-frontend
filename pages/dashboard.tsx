"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/auth";
import { Product, products, wallet } from "@/lib/products";
import { ShoppingCart, User, Clock, Copy } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/router";
import { use, useEffect, useState } from "react";

interface PurchaseModalState {
  isOpen: boolean;
  product: Product | null;
  token: string | null;
  sessionId: string | null;
  step: "generate" | "validate";
}

export default function Dashboard() {
  const [balance, setBalance] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [purchaseModal, setPurchaseModal] = useState<PurchaseModalState>({
    isOpen: false,
    product: null,
    token: null,
    sessionId: null,
    step: "generate",
  });
  const [tokenInput, setTokenInput] = useState("");
  const [sessionIdInput, setSessionIdInput] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  const user = auth.getCurrentUser();
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (user) {
        const balance = await wallet.getBalance(user.user._id);
        setBalance(balance);
      }
    };

    fetchWalletBalance();
  }, [user]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      setTransactions(wallet.getTransactions(user.user._id));
    }
  }, [user, router]);

  const handleAddBalance = async () => {
    try {
      if (user) {
        const payload = {
          ...user.user,
          amount: 100,
        };
        await wallet.addBalance(payload);
        const newBalance = await wallet.getBalance(user.user._id);
        setBalance(newBalance);
        toast({
          title: "Added Balance",
          description: "You have successfully added $100 to your wallet.",
        });
      } else {
        throw new Error("something went wrong");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleStartPurchase = (product: Product) => {
    setPurchaseModal({
      isOpen: true,
      product,
      token: null,
      sessionId: null,
      step: "generate",
    });
  };

  const handleGenerateToken = async () => {
    if (!user || !purchaseModal.product) return;

    try {
      setProcessing(true);
      const purchaseToken = await wallet.generatePurchaseToken(
        purchaseModal.product.id,
        purchaseModal.product.price,
        user.user._id
      );

      setPurchaseModal((prev) => ({
        ...prev,
        sessionId: purchaseToken.transactionId,
        token: purchaseToken.token,
        step: "validate",
      }));

      toast({
        title: "Token Generated",
        description:
          "Please copy the token and use it to confirm your purchase.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setPurchaseModal((prev) => ({ ...prev, isOpen: false }));
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmPurchase = async () => {
    if (!tokenInput || !sessionIdInput) {
      toast({
        title: "Error",
        description: "Please enter the token",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessing(true);
      const payload = {
        sessionId: sessionIdInput,
        token: tokenInput,
        userId: user?.user._id || "",
        amount: purchaseModal.product?.price || 0,
      };
      const result = await wallet.processPayment(payload);
      console.log(result);
      setBalance(result.newBalance);
      if (user?.user.email) {
        setTransactions(wallet.getTransactions(user.user._id));
      }

      toast({
        title: "Success",
        description: `Successfully purchased ${purchaseModal.product?.name}`,
      });

      setPurchaseModal({
        isOpen: false,
        product: null,
        token: null,
        sessionId: null,
        step: "generate",
      });
      setTokenInput("");
      setSessionIdInput("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const copyToken = () => {
    if (purchaseModal.token) {
      navigator.clipboard.writeText(purchaseModal.token);
      toast({
        title: "Copied",
        description: "Token copied to clipboard",
      });
    }
  };

  const copySessionId = () => {
    if (purchaseModal.sessionId) {
      navigator.clipboard.writeText(purchaseModal.sessionId);
      toast({
        title: "Copied",
        description: "Token copied to clipboard",
      });
    }
  };

  const handleLogout = () => {
    auth.logout();
    router.push("/login");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-4">
            <Button variant="default" onClick={handleAddBalance}>
              add 100$
            </Button>
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <span className="font-semibold">
                Balance: ${balance.toFixed(2)}
              </span>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span className="font-medium">{user.user.name}</span>
              </div>
              <p>Email: {user.user.email}</p>
              <p>Document: {user.user.document}</p>
              <p>Phone: {user.user.phone}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <p className="text-sm text-gray-500">No transactions yet</p>
                ) : (
                  transactions.slice(0, 5).map((transaction) => {
                    const product = products.find(
                      (p) => p.id === transaction.productId
                    );
                    return (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between py-2 border-b"
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="font-medium">{product?.name}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(
                                transaction.timestamp
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            ${transaction.amount.toFixed(2)}
                          </p>
                          <span
                            className={`text-sm ${
                              transaction.status === "completed"
                                ? "text-green-500"
                                : transaction.status === "failed"
                                ? "text-red-500"
                                : "text-yellow-500"
                            }`}
                          >
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-xl font-semibold mb-4">Available Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id}>
              <div className="relative h-48 w-full">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover rounded-t-lg"
                />
              </div>
              <CardHeader>
                <CardTitle>{product.name}</CardTitle>
                <CardDescription>{product.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">${product.price}</span>
                  <Button
                    onClick={() => handleStartPurchase(product)}
                    disabled={processing}
                  >
                    {processing ? "Processing..." : "Purchase"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Dialog
        open={purchaseModal.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setPurchaseModal({
              isOpen: false,
              product: null,
              token: null,
              sessionId: null,
              step: "generate",
            });
            setTokenInput("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {purchaseModal.step === "generate"
                ? "Generate Purchase Token"
                : "Confirm Purchase"}
            </DialogTitle>
            <DialogDescription>
              {purchaseModal.step === "generate"
                ? "Click the button below to generate a purchase token"
                : "Enter the token to confirm your purchase"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {purchaseModal.product && (
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{purchaseModal.product.name}</p>
                  <p className="text-sm text-gray-500">
                    ${purchaseModal.product.price}
                  </p>
                </div>
              </div>
            )}

            {purchaseModal.step === "generate" ? (
              <Button
                onClick={handleGenerateToken}
                disabled={processing}
                className="w-full"
              >
                {processing ? "Generating..." : "Generate Token"}
              </Button>
            ) : (
              <div className="space-y-4">
                {purchaseModal.token && (
                  <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                    <code className="flex-1 font-mono text-sm">
                      {purchaseModal.token}
                    </code>
                    <Button size="icon" variant="ghost" onClick={copyToken}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {purchaseModal.sessionId && (
                  <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                    <code className="flex-1 font-mono text-sm">
                      {purchaseModal.sessionId}
                    </code>
                    <Button size="icon" variant="ghost" onClick={copySessionId}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="token">Enter Token to Confirm</Label>
                  <Input
                    id="token"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="Paste your token here"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="token">Enter session to Confirm</Label>
                  <Input
                    id="token"
                    value={sessionIdInput}
                    onChange={(e) => setSessionIdInput(e.target.value)}
                    placeholder="Paste your session here"
                  />
                </div>
                <Button
                  onClick={handleConfirmPurchase}
                  disabled={processing || !tokenInput || !sessionIdInput}
                  className="w-full"
                >
                  {processing ? "Processing..." : "Confirm Purchase"}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
