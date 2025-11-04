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

// --- 1. Schema de Validación CORREGIDO (según tu .js) ---
const formSchema = z.object({
  documentNumber: z.string().min(5, "Debe tener al menos 5 caracteres"),
  confirmationDate: z.string().date("Debe ser una fecha válida"),
  fatherName: z.string().min(2, "Campo requerido"),
  motherName: z.string().min(2, "Campo requerido"),
  godfather: z.string().min(2, "Campo requerido"), // Corregido de 'godparent' a 'godfather'
  baptizedParish: z.string().optional(), // Campo opcional
})

type ConfirmacionFormValues = z.infer<typeof formSchema>

// --- Props del Componente ---
interface FormularioConfirmacionProps {
  onSuccess: () => void
  defaultValues?: Partial<ConfirmacionFormValues> // Para modo "Editar"
}

export function FormularioConfirmacion({ onSuccess, defaultValues }: FormularioConfirmacionProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  // --- 2. Configurar react-hook-form con valores por defecto CORREGIDOS ---
  const form = useForm<ConfirmacionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      documentNumber: "",
      confirmationDate: "",
      fatherName: "",
      motherName: "",
      godfather: "",
      baptizedParish: "",
    },
  })

  // --- 3. Lógica de Envío (Submit) ---
  const onSubmit = async (data: ConfirmacionFormValues) => {
    setIsLoading(true)
    
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
        body: JSON.stringify(data), // Envía los datos corregidos
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "Error al guardar el registro de confirmación")
      }
      
      toast.success(isEditing ? "Confirmación actualizada" : "Confirmación registrada")
      onSuccess() 

    } catch (error: any) {
      toast.error("Error al guardar confirmación", { description: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      {/* --- 4. Formulario CORREGIDO con todos los campos --- */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fatherName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Padre</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre completo del padre..." {...field} />
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
                  <Input placeholder="Nombre completo de la madre..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="godfather"
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
        <FormField
          control={form.control}
          name="baptizedParish"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parroquia donde fue Bautizado (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Nombre de la parroquia..." {...field} />
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