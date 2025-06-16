import DefaultLayout from "@/components/layout/default";
import Providers from "@/components/providers";
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Evently",
  description: "A modern event management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${manrope.variable} antialiased`}
      >
        <Providers>
          <DefaultLayout>
            {children}
          </DefaultLayout>
        </Providers>
      </body>
    </html>
  );
}
