import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { PokemonProvider } from "@/context/pokemon-context"
import { AuthProvider } from "@/context/auth-context"
import { Header } from "@/components/header"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Pokédex",
  description: "Une application Pokédex pour explorer les Pokémon",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <AuthProvider>
          <PokemonProvider>
            <Header />
            {children}
          </PokemonProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
