import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agentic Doc Suite",
  description: "Multi-tenant document processing suite",
  metadataBase: new URL("https://agentic-6f86bdf9.vercel.app")
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <div className="max-w-7xl mx-auto px-4 py-6">{children}</div>
      </body>
    </html>
  );
}

