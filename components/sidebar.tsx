"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Church, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface SidebarProps {
  items: {
    title: string
    href: string
    icon: React.ComponentType<{ className?: string }>
  }[]
  userRole: string
}

export function Sidebar({ items, userRole }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar border-r">
      <div className="flex items-center gap-2 p-6 border-b">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <Church className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Sagrada Familia</h2>
          <p className="text-sm text-muted-foreground capitalize">{userRole}</p>
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
        <Link href="/">
          <Button variant="outline" className="w-full bg-transparent">
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </Link>
      </div>
    </div>
  )
}
