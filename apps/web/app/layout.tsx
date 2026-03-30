import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RISE — GCSE Revision & AI Tutoring",
  description:
    "RISE helps UK GCSE students revise smarter with AI-powered tutoring and personalised study tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
