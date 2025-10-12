"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Church, ArrowLeft, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Password recovery states
  const [recoveryOpen, setRecoveryOpen] = useState(false)
  const [recoveryStep, setRecoveryStep] = useState<1 | 2 | 3>(1)
  const [recoveryEmail, setRecoveryEmail] = useState("")
  const [resetCode, setResetCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [recoveryLoading, setRecoveryLoading] = useState(false)
  const [recoveryError, setRecoveryError] = useState<string | null>(null)

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

  // Password recovery handlers
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setRecoveryError(null)
    if (!recoveryEmail) {
      setRecoveryError("Por favor, ingrese su correo electrónico")
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(recoveryEmail)) {
      setRecoveryError("Por favor, ingrese un correo electrónico válido")
      return
    }
    setRecoveryLoading(true)
    try {
      const res = await fetch("https://api-parroquia.onrender.com/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mail: recoveryEmail }),
      })
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("El correo electrónico no está registrado")
        }
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || "Error al enviar el código")
      }
      setRecoveryStep(2)
    } catch (err: any) {
      setRecoveryError(err?.message || "Error inesperado")
    } finally {
      setRecoveryLoading(false)
    }
  }

  const handleVerifyResetCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setRecoveryError(null)
    if (!resetCode) {
      setRecoveryError("Por favor, ingrese el código de verificación")
      return
    }
    setRecoveryLoading(true)
    try {
      const res = await fetch("https://api-parroquia.onrender.com/auth/verify-ResetCode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mail: recoveryEmail, resetCode }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || "Código inválido o expirado")
      if (data.message === "Código válido") {
        setRecoveryStep(3)
      } else {
        setRecoveryError("Código inválido o expirado")
      }
    } catch (err: any) {
      setRecoveryError(err?.message || "Error inesperado")
    } finally {
      setRecoveryLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setRecoveryError(null)
    if (!newPassword || !confirmPassword) {
      setRecoveryError("Por favor, complete todos los campos")
      return
    }
    if (newPassword !== confirmPassword) {
      setRecoveryError("Las contraseñas no coinciden")
      return
    }
    setRecoveryLoading(true)
    try {
      const res = await fetch("https://api-parroquia.onrender.com/auth/change-Password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mail: recoveryEmail, newPassword }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || "Error al cambiar la contraseña")
      if (data.message?.includes("exitosamente") || data.message?.includes("successfully")) {
        setRecoveryOpen(false)
        setRecoveryStep(1)
        setRecoveryEmail("")
        setResetCode("")
        setNewPassword("")
        setConfirmPassword("")
        setRecoveryError(null)
        // Show success message or redirect to login
        alert("Contraseña restablecida exitosamente. Por favor, inicie sesión con su nueva contraseña.")
      } else {
        setRecoveryError(data?.message || "Error al cambiar la contraseña")
      }
    } catch (err: any) {
      setRecoveryError(err?.message || "Error inesperado")
    } finally {
      setRecoveryLoading(false)
    }
  }

  const resetRecoveryForm = () => {
    setRecoveryStep(1)
    setRecoveryEmail("")
    setResetCode("")
    setNewPassword("")
    setConfirmPassword("")
    setRecoveryError(null)
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
              <p className="text-sm text-muted-foreground mt-2">
                ¿Olvidaste tu contraseña?{" "}
                <Dialog open={recoveryOpen} onOpenChange={(open) => {
                  setRecoveryOpen(open)
                  if (!open) resetRecoveryForm()
                }}>
                  <DialogTrigger asChild>
                    <button className="text-primary hover:underline">
                      Recuperar acceso
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Recuperar Contraseña</DialogTitle>
                      <DialogDescription>
                        {recoveryStep === 1 && "Ingresa tu correo electrónico para recibir un código de verificación"}
                        {recoveryStep === 2 && "Ingresa el código de verificación enviado a tu correo"}
                        {recoveryStep === 3 && "Ingresa tu nueva contraseña"}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      {recoveryStep === 1 && (
                        <form onSubmit={handleForgotPassword} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="recoveryEmail">Correo electrónico</Label>
                            <Input
                              id="recoveryEmail"
                              type="email"
                              placeholder="tu@email.com"
                              value={recoveryEmail}
                              onChange={(e) => setRecoveryEmail(e.target.value)}
                              required
                            />
                          </div>
                          {recoveryError && <p className="text-sm text-red-500">{recoveryError}</p>}
                          <Button type="submit" className="w-full" disabled={recoveryLoading}>
                            {recoveryLoading ? "Enviando..." : "Enviar código"}
                          </Button>
                        </form>
                      )}

                      {recoveryStep === 2 && (
                        <form onSubmit={handleVerifyResetCode} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="resetCode">Código de verificación</Label>
                            <Input
                              id="resetCode"
                              type="text"
                              placeholder="Ingresa el código recibido"
                              value={resetCode}
                              onChange={(e) => setResetCode(e.target.value)}
                              required
                            />
                          </div>
                          {recoveryError && <p className="text-sm text-red-500">{recoveryError}</p>}
                          <div className="flex gap-2">
                            <Button type="button" variant="secondary" onClick={() => setRecoveryStep(1)} disabled={recoveryLoading}>
                              Atrás
                            </Button>
                            <Button type="submit" className="flex-1" disabled={recoveryLoading}>
                              {recoveryLoading ? "Verificando..." : "Verificar"}
                            </Button>
                          </div>
                        </form>
                      )}

                      {recoveryStep === 3 && (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="newPassword">Nueva contraseña</Label>
                            <Input
                              id="newPassword"
                              type="password"
                              placeholder="••••••••"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                            <Input
                              id="confirmPassword"
                              type="password"
                              placeholder="••••••••"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              required
                            />
                          </div>
                          {recoveryError && <p className="text-sm text-red-500">{recoveryError}</p>}
                          <div className="flex gap-2">
                            <Button type="button" variant="secondary" onClick={() => setRecoveryStep(2)} disabled={recoveryLoading}>
                              Atrás
                            </Button>
                            <Button type="submit" className="flex-1" disabled={recoveryLoading}>
                              {recoveryLoading ? "Restableciendo..." : "Restablecer contraseña"}
                            </Button>
                          </div>
                        </form>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}