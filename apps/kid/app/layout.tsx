import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Боксик — собери свой ланч",
  description: "Игровой конструктор школьного ланчбокса",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}</body></html>;
}
