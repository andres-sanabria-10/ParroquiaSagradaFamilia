"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useState } from "react"

// --- 1. Definir el Schema de Validación con Zod para Confirmación ---
const formSchema = z.object({
  documentNumber: z.string().min(5, "Debe tener al menos 5 caracteres"),
  confirmationDate: z.string().date("Debe ser una fecha válida"),
  bishopName: z.string().min(2, "Campo requerido"),
  godparent: z.string().min(2, "Campo requerido"),
})

type ConfirmacionFormValues = z.infer<typeof formSchema>

// --- Props del Componente ---
interface FormularioConfirmacionProps {
  onSuccess: () => void
  defaultValues?: Partial<ConfirmacionFormValues> // Para modo "Editar"
}

export function FormularioConfirmacion({ onSuccess, defaultValues }: FormularioConfirmacionProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  // --- 2. Configurar react-hook-form ---
  const form = useForm<ConfirmacionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      documentNumber: "",
      confirmationDate: "",
      bishopName: "",
      godparent: "",
    },
  })

  // --- 3. Lógica de Envío (Submit) ---
  const onSubmit = async (data: ConfirmacionFormValues) => {
    setIsLoading(true)
    
    // Determinar si es Crear (POST) o Editar (PUT)
    const isEditing = !!defaultValues
    const url = isEditing
      ? `https://api-parroquiasagradafamilia-s6qu.onrender.com/confirmation/${defaultValues.documentNumber}`
      : "https://api-parroquiasagradafamilia-s6qu.onrender.com/confirmation/"
    const method = isEditing ? "PUT" : "POST"

    try {
      const res = await fetch(url, {
        method: method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "Error al guardar el registro de confirmación")
      }
      
      toast.success(isEditing ? "Confirmación actualizada" : "Confirmación registrada")
      onSuccess() // Cierra el modal y refresca la tabla

    } catch (error: any) {
      toast.error("Error al guardar confirmación", { description: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="documentNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de Documento (Confirmado)</FormLabel>
              <FormControl>
                <Input placeholder="DNI del confirmado..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmationDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha de Confirmación</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bishopName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Obispo</FormLabel>
              <FormControl>
                <Input placeholder="Nombre completo del obispo..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="godparent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Padrino/Madrina</FormLabel>
              <FormControl>
                <Input placeholder="Nombre completo del padrino/madrina..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Guardar Registro de Confirmación"}
        </Button>
      </form>
    </Form>
  )
}