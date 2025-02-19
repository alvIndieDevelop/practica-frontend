import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome to Our Platform</CardTitle>
          <CardDescription className="text-center">
            Get started by logging in or creating a new account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/login" className="w-full">
            <Button className="w-full" variant="default">Login</Button>
          </Link>
          <Link href="/register" className="w-full">
            <Button className="w-full" variant="outline">Register</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}