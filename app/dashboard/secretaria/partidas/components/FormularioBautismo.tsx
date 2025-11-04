"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useState } from "react"

// --- 1. Definir el Schema de Validación con Zod ---
// (Basado en tu formulario HTML)
const formSchema = z.object({
  documentNumber: z.string().min(5, "Debe tener al menos 5 caracteres"),
  baptismDate: z.string().date("Debe ser una fecha válida"),
  placeBirth: z.string().min(2, "Campo requerido"),
  fatherName: z.string().min(2, "Campo requerido"),
  motherName: z.string().min(2, "Campo requerido"),
  godfather1: z.string().min(2, "Campo requerido"),
  godfather2: z.string().optional(),
})

type BautismoFormValues = z.infer<typeof formSchema>

// --- Props del Componente ---
interface FormularioBautismoProps {
  onSuccess: () => void // Función para cerrar el modal al tener éxito
  defaultValues?: Partial<BautismoFormValues> // Para modo "Editar"
}

export function FormularioBautismo({ onSuccess, defaultValues }: FormularioBautismoProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  // --- 2. Configurar react-hook-form ---
  const form = useForm<BautismoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      documentNumber: "",
      baptismDate: "",
      placeBirth: "",
      fatherName: "",
      motherName: "",
      godfather1: "",
      godfather2: "",
    },
  })

  // --- 3. Lógica de Envío (Submit) ---
  const onSubmit = async (data: BautismoFormValues) => {
    setIsLoading(true)
    
    // Determinar si es Crear (POST) o Editar (PUT)
    const isEditing = !!defaultValues
    const url = isEditing
      ? `https://api-parroquiasagradafamilia-s6qu.onrender.com/baptism/${defaultValues.documentNumber}`
      : "https://api-parroquiasagradafamilia-s6qu.onrender.com/baptism/"
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
        throw new Error(err.message || "Error al guardar el registro")
      }
      
      toast.success(isEditing ? "Bautismo actualizado" : "Bautismo registrado")
      onSuccess() // Cierra el modal y refresca la tabla

    } catch (error: any) {
      toast.error("Error al guardar", { description: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="documentNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Documento (Bautizado)</FormLabel>
                <FormControl>
                  <Input placeholder="DNI del bautizado..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="baptismDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Bautismo</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="placeBirth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lugar de Nacimiento</FormLabel>
              <FormControl>
                <Input placeholder="Ciudad, País" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fatherName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Padre</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre completo..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="motherName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de la Madre</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre completo..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="godfather1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Padrino 1</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre completo..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="godfather2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Padrino 2 (Opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre completo..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Guardar Registro"}
        </Button>
      </form>
    </Form>
  )
}