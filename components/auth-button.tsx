"use client"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function AuthButton() {
  const [isLoading, setIsLoading] = useState(false)
  const { user, logout } = useAuth()

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await logout()
      window.location.reload()
    } catch (error) {
      console.error("Erreur de déconnexion:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      {user ? (
        <Button 
          onClick={handleSignOut} 
          disabled={isLoading} 
          variant="outline"
          className=" text-black  hover:text-red-600 transition-all duration-200 font-medium"
        >
          {isLoading ? "Chargement..." : "Déconnexion"}
        </Button>
      ) : (
        <Button 
          asChild
          className="bg-yellow-400 hover:bg-yellow-300 text-red-700 font-bold shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-yellow-300 hover:border-yellow-200"
        >
          <Link href="/auth/login">Connexion</Link>
        </Button>
      )}
    </div>
  )
}
