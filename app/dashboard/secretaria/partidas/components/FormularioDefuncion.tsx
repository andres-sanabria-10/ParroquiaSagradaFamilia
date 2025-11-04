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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useState } from "react"

// --- 1. Schema de Validación (combinando 'create' y 'update' de tu .js) ---
const formSchema = z.object({
  documentNumber: z.string().min(5, "Documento requerido"),
  deathDate: z.string().date("Debe ser una fecha válida"),
  fatherName: z.string().min(2, "Campo requerido"),
  motherName: z.string().min(2, "Campo requerido"),
  civilStatus: z.enum(["soltero", "casado", "union libre"], {
    required_error: "Debe seleccionar un estado civil",
  }),
  cemeteryName: z.string().min(2, "Campo requerido"),
  funeralDate: z.string().date("Debe ser una fecha válida").optional().or(z.literal("")), // Opcional, como en tu .js de update
})

type DefuncionFormValues = z.infer<typeof formSchema>

interface FormularioDefuncionProps {
  onSuccess: () => void
  defaultValues?: Partial<DefuncionFormValues>
}

export function FormularioDefuncion({ onSuccess, defaultValues }: FormularioDefuncionProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  const form = useForm<DefuncionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      documentNumber: "",
      deathDate: "",
      fatherName: "",
      motherName: "",
      cemeteryName: "",
      funeralDate: "",
    },
  })

  const onSubmit = async (data: DefuncionFormValues) => {
    setIsLoading(true)
    
    const isEditing = !!defaultValues
    const url = isEditing
      ? `https://api-parroquiasagradafamilia-s6qu.onrender.com/death/${defaultValues.documentNumber}`
      : "https://api-parroquiasagradafamilia-s6qu.onrender.com/death/"
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
        throw new Error(err.message || "Error al guardar el registro de defunción")
      }
      
      toast.success(isEditing ? "Defunción actualizada" : "Defunción registrada")
      onSuccess() 

    } catch (error: any) {
      toast.error("Error al guardar defunción", { description: error.message })
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
                <FormLabel>Documento del Fallecido</FormLabel>
                <FormControl>
                  <Input placeholder="DNI del fallecido..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="deathDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Defunción</FormLabel>
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
            name="civilStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado Civil</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="soltero">Soltero</SelectItem>
                    <SelectItem value="casado">Casado</SelectItem>
                    <SelectItem value="union libre">Unión Libre</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cemeteryName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Cementerio</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del cementerio..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="funeralDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha del Funeral (Opcional)</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Guardar Registro de Defunción"}
        </Button>
      </form>
    </Form>
  )
}