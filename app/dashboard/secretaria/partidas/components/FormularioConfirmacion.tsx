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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select" // Importamos Select
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"

// --- 1. Schema de Validación ACTUALIZADO ---
const formSchema = z.object({
  // --- Campos del Usuario ---
  documentNumber: z.string().min(5, "Debe tener al menos 5 caracteres"),
  typeDocument: z.string({ required_error: "Debe seleccionar un tipo." }), // ✨ CAMBIO AQUÍ
  name: z.string().min(2, "El nombre es requerido"),
  lastName: z.string().min(2, "El apellido es requerido"),
  mail: z.string().email("Debe ser un email válido"),
  birthdate: z.string().date("Debe ser una fecha válida"),
  
  // --- Campos de Confirmación ---
  confirmationDate: z.string().date("Debe ser una fecha válida"),
  fatherName: z.string().min(2, "Campo requerido"),
  motherName: z.string().min(2, "Campo requerido"),
  godfather: z.string().min(2, "Campo requerido"),
  baptizedParish: z.string().optional(),
})

type ConfirmacionFormValues = z.infer<typeof formSchema>

interface DocumentType {
  _id: string
  name: string
}

interface FormularioConfirmacionProps {
  onSuccess: () => void
  defaultValues?: Partial<ConfirmacionFormValues>
  documentTypes: DocumentType[] // ✨ Prop para recibir la lista
}

const API_URL = "https://api-parroquiasagradafamilia-s6qu.onrender.com"

export function FormularioConfirmacion({ onSuccess, defaultValues, documentTypes }: FormularioConfirmacionProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  const isEditing = !!defaultValues?.documentNumber
  const [userExists, setUserExists] = useState(isEditing)
  const [isCheckingUser, setIsCheckingUser] = useState(false)
  
  const form = useForm<ConfirmacionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      documentNumber: "",
      name: "",
      lastName: "",
      mail: "",
      birthdate: "",
      confirmationDate: "",
      fatherName: "",
      motherName: "",
      godfather: "",
      baptizedParish: "",
    },
  })

  const { setValue, trigger, getValues } = form

  const handleCheckUser = async () => {
    if (isEditing || isCheckingUser) return;
    const documentNumber = getValues("documentNumber");
    if (documentNumber.length < 5) return; 

    setIsCheckingUser(true);
    try {
      const res = await fetch(`${API_URL}/user/by-document/${documentNumber}`, { 
        method: 'GET',
        credentials: 'include',
      });

      if (res.ok) {
        const user = await res.json();
        setValue("name", user.name);
        setValue("lastName", user.lastName);
        setValue("mail", user.mail);
        setValue("birthdate", format(new Date(user.birthdate), "yyyy-MM-dd"));
        setValue("typeDocument", user.typeDocument._id);
        setUserExists(true);
        toast.success("Usuario encontrado. Datos autocompletados.");
        trigger(["name", "lastName", "mail", "birthdate", "typeDocument"]);
      } else {
        setUserExists(false); 
        toast.info("Usuario no registrado. Por favor, complete los datos.");
      }
    } catch (error) {
      setUserExists(false);
      toast.error("Error al verificar el usuario.");
    } finally {
      setIsCheckingUser(false);
    }
  };

  const onSubmit = async (data: ConfirmacionFormValues) => {
    setIsLoading(true)
    
    const url = isEditing
      ? `${API_URL}/confirmation/${defaultValues?.documentNumber}`
      : `${API_URL}/confirmation/`
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto pr-4">
        <Card>
          <CardHeader>
            <CardTitle>Datos del Confirmado</CardTitle>
            <CardDescription>
              {isEditing 
                ? "La información del feligrés no puede ser editada desde esta pantalla." 
                : "Ingresa el DNI. Si el usuario existe, sus datos se cargarán automáticamente."
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="documentNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Documento</FormLabel>
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Input 
                          placeholder="DNI del confirmado..." 
                          {...field} 
                          onBlur={handleCheckUser} 
                          disabled={isEditing} 
                        />
                      </FormControl>
                      {isCheckingUser && <Loader2 className="h-4 w-4 animate-spin" />}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="typeDocument"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Documento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value} disabled={userExists}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {documentTypes.map((doc) => (
                          <SelectItem key={doc._id} value={doc._id}>
                            {doc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nombres</FormLabel><FormControl><Input placeholder="Nombres..." {...field} disabled={userExists} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>Apellidos</FormLabel><FormControl><Input placeholder="Apellidos..." {...field} disabled={userExists} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="mail" render={({ field }) => (<FormItem><FormLabel>Correo</FormLabel><FormControl><Input type="email" placeholder="correo..." {...field} disabled={userExists} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="birthdate" render={({ field }) => (<FormItem><FormLabel>Fecha Nacimiento</FormLabel><FormControl><Input type="date" {...field} disabled={userExists} /></FormControl><FormMessage /></FormItem>)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Datos del Sacramento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField control={form.control} name="confirmationDate" render={({ field }) => (<FormItem><FormLabel>Fecha de Confirmación</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="fatherName" render={({ field }) => (<FormItem><FormLabel>Nombre del Padre</FormLabel><FormControl><Input placeholder="Nombre completo..." {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="motherName" render={({ field }) => (<FormItem><FormLabel>Nombre de la Madre</FormLabel><FormControl><Input placeholder="Nombre completo..." {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <FormField control={form.control} name="godfather" render={({ field }) => (<FormItem><FormLabel>Padrino/Madrina</FormLabel><FormControl><Input placeholder="Nombre completo..." {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="baptizedParish" render={({ field }) => (<FormItem><FormLabel>Parroquia de Bautismo (Opcional)</FormLabel><FormControl><Input placeholder="Nombre de la parroquia..." {...field} /></FormControl><FormMessage /></FormItem>)} />
          </CardContent>
        </Card>
        
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Guardar Registro"}
        </Button>
      </form>
    </Form>
  )
}