"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { UserPlus, FileText, Church, DollarSign, Calendar, ClipboardList, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"

const API_URL = "https://api-parroquiasagradafamilia-s6qu.onrender.com"

const sidebarItems = [
  { title: "Registro de Administrador", href: "/dashboard/parroco/registro", icon: UserPlus },
  { title: "Gestión de Partidas", href: "/dashboard/parroco/partidas", icon: FileText },
  { title: "Solicitudes de Partidas", href: "/dashboard/parroco/solicitud-partida", icon: ClipboardList },
  { title: "Gestión de Misas", href: "/dashboard/parroco/misas", icon: Church },
  { title: "Solicitudes de Misa", href: "/dashboard/parroco/solicitud-misa", icon: Calendar },
  { title: "Contabilidad", href: "/dashboard/parroco/contabilidad", icon: DollarSign },
]

// 👇 rol fijo
const formSchema = z.object({
  name: z.string().min(2, "El nombre es requerido"),
  lastName: z.string().min(2, "El apellido es requerido"),
  documentNumber: z.string().min(5, "El documento es requerido"),
  typeDocument: z.string({ required_error: "Debe seleccionar un tipo." }),
  birthdate: z.coerce.date({ invalid_type_error: "Debe ser una fecha válida" }),
  mail: z.string().email("Debe ser un email válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  role: z.literal("administrador", { errorMap: () => ({ message: "Rol inválido" }) }),
})

type AdminFormValues = z.infer<typeof formSchema>

// le dejamos varias opciones de cómo puede venir desde el backend
interface DocumentType {
  _id: string
  document_type_name: string  
  __v?: number
}

export default function RegistroAdministrador() {
  const [isLoading, setIsLoading] = useState(false)
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([])

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await fetch(`${API_URL}/documentType/`, { credentials: "include" })
        if (!res.ok) throw new Error("Error al cargar tipos de documento")
        const data = await res.json()
        setDocumentTypes(data?.data || [])
      } catch (e) {
        toast.error("No se pudieron cargar los tipos de documento")
        setDocumentTypes([])
      }
    }
    fetchDocs()
  }, [])

  const form = useForm<AdminFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      lastName: "",
      documentNumber: "",
      mail: "",
      password: "",
      role: "administrador", // 👈 ya viene con administrador
    },
  })

  const onSubmit = async (data: AdminFormValues) => {
    setIsLoading(true)
    try {
      const payload = {
        ...data,
        birthdate: data.birthdate.toISOString().split("T")[0],
      }

      const res = await fetch(`${API_URL}/user`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Error al crear el administrador")
      }

      toast.success("Administrador Registrado", {
        description: `El usuario ${data.name} ${data.lastName} ha sido creado.`,
      })
      form.reset({ role: "administrador" })
    } catch (error: any) {
      toast.error("Error al registrar", { description: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-muted/40">
      <Sidebar items={sidebarItems} userRole="párroco" />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Registro de Administrador
            </h1>
            <p className="text-muted-foreground">
              Registra un nuevo administrador en el sistema
            </p>
          </div>

          <Card className="shadow-sm border-muted max-w-5xl">
            <CardHeader className="pb-4">
              <CardTitle>Nuevo Administrador</CardTitle>
              <CardDescription>Complete todos los datos del nuevo administrador</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid gap-5 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombres</FormLabel>
                          <FormControl>
                            <Input placeholder="Nombres..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Apellidos</FormLabel>
                          <FormControl>
                            <Input placeholder="Apellidos..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="documentNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de Documento</FormLabel>
                          <FormControl>
                            <Input placeholder="DNI..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* 👇 aquí el select corregido */}
                    <FormField
                      control={form.control}
                      name="typeDocument"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Documento</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar tipo..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {documentTypes.map((doc) => (
                                <SelectItem key={doc._id} value={doc._id}>
                                  {doc.document_type_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                  </div>

                  <FormField
                    control={form.control}
                    name="birthdate"
                    render={({ field }) => (
                      <FormItem className="md:w-1/3">
                        <FormLabel>Fecha de Nacimiento</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={
                              field.value ? new Date(field.value).toISOString().split("T")[0] : ""
                            }
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-5 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="mail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Correo Electrónico</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="correo@ejemplo.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* 👇 solo 1 rol */}
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rol</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar rol..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="administrador">Administrador</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="md:w-1/2">
                        <FormLabel>Contraseña Temporal</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Mínimo 8 caracteres" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col gap-3 pt-2 md:flex-row">
                    <Button type="submit" className="md:flex-1" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Registrando...
                        </>
                      ) : (
                        "Registrar Administrador"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="md:flex-1"
                      onClick={() => form.reset({ role: "administrador" })}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
