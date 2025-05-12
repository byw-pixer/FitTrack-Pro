import type React from "react"
import "./globals.css"
import { ThemeProvider } from "./components/theme-provider"

export const metadata = {
  title: "FitTrack Pro",
  description: "Отслеживайте, анализируйте и улучшайте свой путь к фитнесу",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme="light" storageKey="fittrack-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
