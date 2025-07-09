"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "#0a3a19",
          "--success-text": "#ffffff",
          "--success-border": "#15803d",
          "--error-bg": "#3a0a0a",
          "--error-text": "#ffffff",
          "--error-border": "#b91c1c",
          "--info-bg": "#172554",
          "--info-text": "#ffffff",
          "--info-border": "#1e40af",
          "--warning-bg": "#451a03",
          "--warning-text": "#ffffff",
          "--warning-border": "#854d0e",
        } as React.CSSProperties
      }
      richColors
      closeButton
      {...props}
    />
  )
}

export { Toaster }
