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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// --- 1. Schema de Validación (basado en tu .js) ---
const formSchema = z.object({
  husbandDocumentNumber: z.string().min(5, "Documento requerido"),
  wifeDocumentNumber: z.string().min(5, "Documento requerido"),
  marriageDate: z.string().date("Debe ser una fecha válida"),
  father_husband: z.string().optional(),
  mother_husband: z.string().optional(),
  father_wife: z.string().optional(),
  mother_wife: z.string().optional(),
  godfather1: z.string().min(2, "Campo requerido"),
  godfather2: z.string().min(2, "Campo requerido"),
  witness1: z.string().min(2, "Campo requerido"),
  witness2: z.string().min(2, "Campo requerido"),
})

type MatrimonioFormValues = z.infer<typeof formSchema>

interface FormularioMatrimonioProps {
  onSuccess: () => void
  defaultValues?: Partial<MatrimonioFormValues>
}

export function FormularioMatrimonio({ onSuccess, defaultValues }: FormularioMatrimonioProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  const form = useForm<MatrimonioFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      husbandDocumentNumber: "",
      wifeDocumentNumber: "",
      marriageDate: "",
      father_husband: "",
      mother_husband: "",
      father_wife: "",
      mother_wife: "",
      godfather1: "",
      godfather2: "",
      witness1: "",
      witness2: "",
    },
  })

  const onSubmit = async (data: MatrimonioFormValues) => {
    setIsLoading(true)
    
    const isEditing = !!defaultValues
    // En edición, el ID para la URL es el DNI del esposo (basado en tu .js)
    const url = isEditing
      ? `https://api-parroquiasagradafamilia-s6qu.onrender.com/marriage/${defaultValues.husbandDocumentNumber}`
      : "https://api-parroquiasagradafamilia-s6qu.onrender.com/marriage/"
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
        throw new Error(err.message || "Error al guardar el registro de matrimonio")
      }
      
      toast.success(isEditing ? "Matrimonio actualizado" : "Matrimonio registrado")
      onSuccess() 

    } catch (error: any) {
      toast.error("Error al guardar matrimonio", { description: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto pr-4">
        
        <Card>
          <CardHeader>
            <CardTitle>Datos de los Contrayentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="husbandDocumentNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Documento del Esposo</FormLabel>
                    <FormControl>
                      <Input placeholder="DNI del esposo..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="wifeDocumentNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Documento de la Esposa</FormLabel>
                    <FormControl>
                      <Input placeholder="DNI de la esposa..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="marriageDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Matrimonio</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Datos de los Padres</CardTitle>
            <CardDescription>(Opcional)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="father_husband"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Padre del Esposo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre completo..." {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mother_husband"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Madre del Esposo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre completo..." {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="father_wife"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Padre de la Esposa</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre completo..." {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mother_wife"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Madre de la Esposa</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre completo..." {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Padrinos y Testigos</CardTitle>
            <CardDescription>Campos requeridos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                    <FormLabel>Padrino 2</FormLabel>
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
                name="witness1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Testigo 1</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre completo..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="witness2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Testigo 2</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre completo..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Guardar Registro de Matrimonio"}
        </Button>
      </form>
    </Form>
  )
}