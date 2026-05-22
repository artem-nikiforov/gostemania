import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Гостемания",
  description: "Тренажёр работы с Гостем для сотрудников ресторана Бургер Кинг",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full">
      <body className="min-h-full bg-white text-bk-brown antialiased">
        {children}
      </body>
    </html>
  );
}
