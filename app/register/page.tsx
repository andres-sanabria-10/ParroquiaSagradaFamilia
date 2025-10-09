"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Church, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Paso 1: email
  const [email, setEmail] = useState("")

  // Paso 2: código
  const [verificationCode, setVerificationCode] = useState("")

  // Paso 3: datos
  const [name, setName] = useState("")
  const [lastName, setLastName] = useState("")
  const [birthdate, setBirthdate] = useState("")
  const [docNumber, setDocNumber] = useState("")
  const [docType, setDocType] = useState<string>("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Tipos de documento
  const [documentTypes, setDocumentTypes] = useState<Array<{ _id: string; name: string }>>([])

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await fetch("https://api-parroquia.onrender.com/documentType/", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })
        if (!res.ok) throw new Error("Error al cargar tipos de documento")
        const data = await res.json()
        setDocumentTypes(data?.data || [])
      } catch (e) {
        // Silenciar error y dejar selector vacío
        setDocumentTypes([])
      }
    }
    fetchDocs()
  }, [])

  const canGoNextFromStep1 = useMemo(() => {
    if (!email) return false
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }, [email])

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canGoNextFromStep1) return
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("https://api-parroquia.onrender.com/auth/verify-Email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mail: email }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        // Errores conocidos del backend
        if (data?.error === "EMAIL_EXISTS") throw new Error("Este correo ya está registrado.")
        if (data?.error === "INVALID_EMAIL") throw new Error("El correo electrónico no es válido.")
        throw new Error(data?.error || "No se pudo enviar el código")
      }
      setStep(2)
    } catch (err: any) {
      setError(err?.message || "Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!verificationCode) {
      setError("Ingrese el código de verificación")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("https://api-parroquia.onrender.com/auth/verify-Code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mail: email, verificationCode }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || "Código inválido o expirado")
      setStep(3)
    } catch (err: any) {
      setError(err?.message || "Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!name || !lastName || !birthdate || !docNumber || !docType || !email || !password) {
      setError("Por favor, complete todos los campos")
      return
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }
    setLoading(true)
    try {
      const payload = {
        name,
        lastName,
        birthdate,
        documentNumber: docNumber,
        typeDocument: docType, // backend espera el _id
        mail: email,
        password,
        role: "Usuario",
      }
      const res = await fetch("https://api-parroquia.onrender.com/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || "No se pudo registrar")
      router.replace("/login")
    } catch (err: any) {
      // Mensaje claro cuando doc existente
      const message = err?.message?.toLowerCase()?.includes("document")
        ? "El número de documento ya existe"
        : err?.message || "Error inesperado"
      setError(message)
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
            <CardTitle>Crear Cuenta</CardTitle>
            <CardDescription>Únete a nuestra comunidad parroquial</CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <form onSubmit={handleVerifyEmail} className="space-y-4">
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

                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button disabled={!canGoNextFromStep1 || loading} type="submit" className="w-full">
                  {loading ? "Enviando código..." : "Enviar código"}
                </Button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="space-y-2">
                  <Label htmlFor="verificationCode">Código de verificación</Label>
                <Input
                    id="verificationCode"
                    type="text"
                    placeholder="Ingresa el código recibido"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                  required
                />
              </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={() => setStep(1)} disabled={loading}>
                    Atrás
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? "Verificando..." : "Verificar"}
                  </Button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombres</Label>
                    <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellidos</Label>
                    <Input id="lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birthdate">Fecha de nacimiento</Label>
                    <Input id="birthdate" type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="docType">Tipo de documento</Label>
                    <Select value={docType} onValueChange={setDocType}>
                      <SelectTrigger id="docType">
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {documentTypes.map((dt) => (
                          <SelectItem key={dt._id} value={dt._id}>{dt.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="docNumber">Número de documento</Label>
                    <Input id="docNumber" type="text" value={docNumber} onChange={(e) => setDocNumber(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emailFinal">Correo</Label>
                    <Input id="emailFinal" type="email" value={email} disabled />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                    <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                  </div>
              </div>

                {error && <p className="text-sm text-red-500">{error}</p>}
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={() => setStep(2)} disabled={loading}>
                    Atrás
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? "Creando..." : "Crear cuenta"}
              </Button>
                </div>
            </form>
            )}

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Iniciar sesión
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
