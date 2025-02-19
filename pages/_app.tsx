import { Toaster } from "@/components/ui/toaster";
import { Inter } from 'next/font/google';
import type { AppProps } from 'next/app';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={inter.className}>
      <Component {...pageProps} />
      <Toaster />
    </main>
  );
}