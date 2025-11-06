"use client"

import type React from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Church, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

interface SidebarProps {
  items: {
    title: string
    href: string
    icon: React.ComponentType<{ className?: string }>
  }[]
  userRole: string
}

const roleDisplayNames: Record<string, string> = {
  "super": "Párroco",
  "admin": "Secretaria",
  "usuario": "Feligrés",
}

export function Sidebar({ items, userRole }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (isLoggingOut) return // Prevenir múltiples clicks
    
    try {
      setIsLoggingOut(true)
      console.log("🚪 Cerrando sesión...")
      
      // ⚠️ CORRECCIÓN 1: Ruta correcta sin /auth/
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      console.log("📡 Respuesta del logout:", data)

      // Siempre redirigir, incluso si hay error
      if (data.success) {
        console.log("✅ Logout exitoso")
      } else {
        console.warn("⚠️ Logout con advertencias, pero continuando...")
      }

      // ⚠️ CORRECCIÓN 2: Redirigir a /login (página) NO a /api/login (API)
      console.log("🔄 Redirigiendo a /login...")
      
      // Limpiar el historial y redirigir
      window.history.replaceState(null, '', '/login')
      window.location.replace('/login')
      
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error)
      // Incluso con error, redirigir a login
      window.history.replaceState(null, '', '/login')
      window.location.replace('/login')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const displayRole = roleDisplayNames[userRole.toLowerCase()] || userRole

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar border-r">
      <div className="flex items-center gap-2 p-6 border-b">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <Church className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Sagrada Familia</h2>
          <p className="text-sm text-muted-foreground capitalize">{displayRole}</p>
        </div>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isActive && "bg-sidebar-primary text-sidebar-primary-foreground",
                    )}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Button>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="p-4 border-t">
        <Button 
          variant="outline" 
          className="w-full bg-transparent"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isLoggingOut ? 'Cerrando...' : 'Cerrar Sesión'}
        </Button>
      </div>
    </div>
  )
}