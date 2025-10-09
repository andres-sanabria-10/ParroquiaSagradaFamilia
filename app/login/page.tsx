"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Church, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mail: email, password }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || "Error al iniciar sesión")
      }
      const data = await res.json()
      const roleFromServer: string | undefined = data?.role

      const redirect = new URLSearchParams(window.location.search).get("redirect")

      if (redirect) {
        router.replace(redirect)
        return
      }

      switch ((roleFromServer || role).toLowerCase()) {
        case "parroco":
          router.replace("/dashboard/parroco")
          break
        case "secretaria":
          router.replace("/dashboard/secretaria")
          break
        case "feligres":
          router.replace("/dashboard/feligres")
          break
        case "admin":
        case "superadmin":
          router.replace("/")
          break
        default:
          router.replace("/")
      }
    } catch (err: any) {
      setError(err?.message || "Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al inicio</span>
          </Link>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <Church className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Sagrada Familia</h1>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Iniciar Sesión</CardTitle>
            <CardDescription>Accede a tu cuenta parroquial</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <p className="text-sm text-red-500" role="alert">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Ingresando..." : "Iniciar Sesión"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                ¿No tienes cuenta?{" "}
                <Link href="/register" className="text-primary hover:underline">
                  Crear cuenta
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
