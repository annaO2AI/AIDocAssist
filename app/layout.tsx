import "./globals.css"
import type { ReactNode } from "react"
import { AISearchProvider } from "./context/AISearchContext"

import LayoutWrapper from "./components/LayoutWrapper"

import { Roboto } from "next/font/google";

// Configure Roboto with desired weights and subsets
const roboto = Roboto({
  weight: ["300", "400", "500", "700"], // Common weights: light, regular, medium, bold
  subsets: ["latin"], // Include Latin characters
  display: "swap", // Use font-display: swap for better UX
  variable: "--font-roboto", // Optional: CSS variable for Tailwind
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${roboto.variable} font-roboto`}>
      <body  className={roboto.className} >
        <AISearchProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </AISearchProvider>
      </body>
    </html>
  )
}
