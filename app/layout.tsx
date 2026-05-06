import "./globals.css";
import type { ReactNode } from "react";
import { AppProviders } from "../components/rise/AppProviders";

export const metadata = {
  title: "RISE Tutoring | Post-Session Tutor Log",
  description: "Generate polished parent reports and structured session payloads for RISE Tutoring.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
