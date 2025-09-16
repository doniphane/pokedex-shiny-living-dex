"use client"

import Link from "next/link"
import { AuthButton } from "./auth-button"
import { useAuth } from "@/context/auth-context"
import { usePokemon } from "@/context/pokemon-context"
import { Sparkles } from "lucide-react"

export function Header() {
  const { user } = useAuth()
  const { capturedPokemon } = usePokemon()

  return (
    <header className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 shadow-lg border-b-2 border-red-800">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold flex items-center gap-2 hover:text-yellow-300 transition-all duration-200">
          <Sparkles className="w-8 h-8 text-yellow-300 drop-shadow-lg" />
          <span className="drop-shadow-lg">Shiny Pokédex</span>
        </Link>
        <nav className="flex items-center space-x-6">
          <ul className="flex space-x-6">
            <li>
              <Link href="/" className="hover:text-yellow-300 hover:underline transition-all duration-200 font-medium">
                Accueil
              </Link>
            </li>
            <li>
              <Link href="/living-dex" className="hover:text-yellow-300 hover:underline flex items-center gap-1 transition-all duration-200 font-medium">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                Living Dex
              </Link>
            </li>
            <li>
              <Link href="/captures" className="hover:text-yellow-300 hover:underline flex items-center transition-all duration-200 font-medium">
                Mes Captures
                {user && capturedPokemon.length > 0 && (
                  <span className="ml-2 bg-yellow-400 text-red-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg ring-2 ring-yellow-300">
                    {capturedPokemon.length}
                  </span>
                )}
              </Link>
            </li>
          </ul>
          <AuthButton />
        </nav>
      </div>
    </header>
  )
}
