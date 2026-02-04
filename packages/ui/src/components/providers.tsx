"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

import { Toaster } from "@merge/ui/components/sonner"
import { TooltipProvider } from "@merge/ui/components/tooltip"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    ><TooltipProvider>{children}</TooltipProvider>
      <Toaster position="top-center" />
    </NextThemesProvider>
  )
}
