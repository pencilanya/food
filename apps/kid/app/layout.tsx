import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Мой ланчбокс",
  description: "Детская версия школьного ланчбокса",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}</body></html>;
}
