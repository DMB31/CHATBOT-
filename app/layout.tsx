export const metadata = {
  title: "J'achète en Algérie - Assistant",
  description: "Assistant immobilier pour J'achète en Algérie",
};

import "./globals.css";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}



