import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Боксик — ланч без суеты",
  description: "Семейное планирование школьного ланчбокса",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}</body></html>;
}
