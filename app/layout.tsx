import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Address Validation App",
  description: "Validação de moradas",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
Update layout.tsx
