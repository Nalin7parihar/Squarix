import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Squarix",
  description: "Track and split expenses with friends",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
      <ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
  {/* Overall layout - column */}
  <div className="flex min-h-screen flex-col bg-background">
    {/* Header at the top */}
    <Header />

    {/* Content below header: sidebar + page content */}
    <div className="flex flex-1">
      {/* Sidebar on the left */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  </div>

  <Toaster />
</ThemeProvider>

      </body>
    </html>
  )
}
