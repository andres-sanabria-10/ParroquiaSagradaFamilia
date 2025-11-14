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
} from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"

// --- Schema (sin cambios) ---
const formSchema = z.object({
  documentNumber: z.string().min(5, "Debe tener al menos 5 caracteres"),
  typeDocument: z.string({ required_error: "Debe seleccionar un tipo." }),
  name: z.string().min(2, "El nombre es requerido"),
  lastName: z.string().min(2, "El apellido es requerido"),
  mail: z.string().email("Debe ser un email válido"),
  birthdate: z.string().date("Debe ser una fecha válida"),
  deathDate: z.string().date("Debe ser una fecha válida"),
  fatherName: z.string().min(2, "Campo requerido"),
  motherName: z.string().min(2, "Campo requerido"),
  civilStatus: z.enum(["soltero", "casado", "union libre"], {
    required_error: "Debe seleccionar un estado civil",
  }),
  cemeteryName: z.string().min(2, "Campo requerido"),
  funeralDate: z.string().date("Debe ser una fecha válida").optional().or(z.literal("")),
})

type DefuncionFormValues = z.infer<typeof formSchema>

// ✨ CORRECCIÓN AQUÍ
interface DocumentType {
  _id: string
  document_type_name: string 
}

interface FormularioDefuncionProps {
  onSuccess: () => void
  defaultValues?: Partial<DefuncionFormValues>
  documentTypes: DocumentType[]
}

const API_URL = "https://api-parroquiasagradafamilia-s6qu.onrender.com"

export function FormularioDefuncion({ onSuccess, defaultValues, documentTypes }: FormularioDefuncionProps) {
  const [isLoading, setIsLoading] = useState(false)

  const isEditing = !!defaultValues?.documentNumber
  const [userExists, setUserExists] = useState(isEditing)
  const [isCheckingUser, setIsCheckingUser] = useState(false)
  
  const form = useForm<DefuncionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {},
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

  const onSubmit = async (data: DefuncionFormValues) => {
    setIsLoading(true)
    
    const url = isEditing
      ? `${API_URL}/death/${defaultValues?.documentNumber}`
      : `${API_URL}/death/`
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto pr-4">

        {/* ========================================================== */}
        {/* Este Card solo se muestra si NO estamos editando */}
        {/* ========================================================== */}
        {!isEditing && (
          <Card>
            <CardHeader>
              <CardTitle>Datos del Fallecido</CardTitle>
              <CardDescription>
                Ingresa el DNI. Si el usuario existe, sus datos se cargarán automáticamente.
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
                            placeholder="DNI del fallecido..." 
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
                          {/* ✨ CORRECCIÓN AQUÍ */}
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
        )}

        <Card>
          <CardHeader>
            <CardTitle>Datos del Sacramento</CardTitle>
            {isEditing && <CardDescription>Esta información sí se puede modificar.</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField control={form.control} name="deathDate" render={({ field }) => (<FormItem><FormLabel>Fecha de Defunción</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="fatherName" render={({ field }) => (<FormItem><FormLabel>Nombre del Padre</FormLabel><FormControl><Input placeholder="Nombre completo..." {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="motherName" render={({ field }) => (<FormItem><FormLabel>Nombre de la Madre</FormLabel><FormControl><Input placeholder="Nombre completo..." {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="civilStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado Civil</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Seleccionar estado..." /></SelectTrigger>
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
              <FormField control={form.control} name="cemeteryName" render={({ field }) => (<FormItem><FormLabel>Nombre del Cementerio</FormLabel><FormControl><Input placeholder="Nombre del cementerio..." {...field} /></FormControl><FormMessage /></FormItem>)} />
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
          </CardContent>
        </Card>
        
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Guardar Registro"}
        </Button>
      </form>
    </Form>
  )
}