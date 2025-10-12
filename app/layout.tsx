// app/layout.tsx

import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

// 1. Importa el Toaster desde la librería de componentes UI
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: "Parroquia Sagrada Familia",
  description: "Sistema de gestión parroquial - Sagrada Familia",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
        
        {/* 2. Añade el componente Toaster aquí, justo antes de cerrar el body */}
        {/* Este componente es el que renderiza todas las notificaciones */}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}