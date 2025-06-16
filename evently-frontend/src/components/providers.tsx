"use client";

import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";

export default function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <Toaster />
        {children}
      </AuthProvider>
    </ThemeProvider>
  )
}
