import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "AH Mock — BunqPal demo",
  description: "Mock Albert Heijn shopping site for BunqPal hackathon"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-ah-border py-8 text-center text-sm text-neutral-500">
          AH Mock · Built for the Bunq hackathon. Not affiliated with Albert Heijn.
        </footer>
      </body>
    </html>
  );
}
