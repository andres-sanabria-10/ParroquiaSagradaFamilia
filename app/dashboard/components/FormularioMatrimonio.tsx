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
  husbandDocumentNumber: z.string().min(5, "Documento requerido"),
  husbandTypeDocument: z.string({ required_error: "Debe seleccionar un tipo." }),
  husbandName: z.string().min(2, "Nombre requerido"),
  husbandLastName: z.string().min(2, "Apellido requerido"),
  husbandMail: z.string().email("Email requerido"),
  husbandBirthdate: z.string().date("Fecha requerida"),
  wifeDocumentNumber: z.string().min(5, "Documento requerido"),
  wifeTypeDocument: z.string({ required_error: "Debe seleccionar un tipo." }),
  wifeName: z.string().min(2, "Nombre requerido"),
  wifeLastName: z.string().min(2, "Apellido requerido"),
  wifeMail: z.string().email("Email requerido"),
  wifeBirthdate: z.string().date("Fecha requerida"),
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

// ✨ CORRECCIÓN AQUÍ
interface DocumentType {
  _id: string
  document_type_name: string
}

interface FormularioMatrimonioProps {
  onSuccess: () => void
  defaultValues?: Partial<MatrimonioFormValues>
  documentTypes: DocumentType[]
}

const API_URL = "https://api-parroquiasagradafamilia-s6qu.onrender.com"

export function FormularioMatrimonio({ onSuccess, defaultValues, documentTypes }: FormularioMatrimonioProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  const isEditing = !!defaultValues?.husbandDocumentNumber
  
  const [husbandExists, setHusbandExists] = useState(isEditing)
  const [wifeExists, setWifeExists] = useState(isEditing)
  const [isCheckingHusband, setIsCheckingHusband] = useState(false)
  const [isCheckingWife, setIsCheckingWife] = useState(false)

  const form = useForm<MatrimonioFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {},
  })

  const { setValue, trigger, getValues } = form

  const handleCheckUser = async (
    docNumber: string,
    type: 'husband' | 'wife'
  ) => {
    if (isEditing) return;
    if (docNumber.length < 5) return;

    const setIsChecking = type === 'husband' ? setIsCheckingHusband : setIsCheckingWife;
    const setUserExists = type === 'husband' ? setHusbandExists : setWifeExists;
    const toastTitle = type === 'husband' ? "Esposo" : "Esposa";

    setIsChecking(true);
    try {
      const res = await fetch(`${API_URL}/user/by-document/${docNumber}`, { 
        method: 'GET',
        credentials: 'include',
      });

      if (res.ok) {
        const user = await res.json();
        setValue(`${type}Name`, user.name);
        setValue(`${type}LastName`, user.lastName);
        setValue(`${type}Mail`, user.mail);
        setValue(`${type}Birthdate`, format(new Date(user.birthdate), "yyyy-MM-dd"));
        setValue(`${type}TypeDocument`, user.typeDocument._id);
        setUserExists(true);
        toast.success(`${toastTitle} encontrado. Datos autocompletados.`);
        trigger([`${type}Name`, `${type}LastName`, `${type}Mail`, `${type}Birthdate`, `${type}TypeDocument`]);
      } else {
        setUserExists(false); 
        toast.info(`${toastTitle} no registrado. Por favor, complete los datos.`);
      }
    } catch (error) {
      setUserExists(false);
      toast.error(`Error al verificar ${toastTitle}.`);
    } finally {
      setIsChecking(false);
    }
  };

  const onSubmit = async (data: MatrimonioFormValues) => {
    setIsLoading(true)
    
    const url = isEditing
      ? `${API_URL}/marriage/${defaultValues?.husbandDocumentNumber}`
      : `${API_URL}/marriage/`
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
        
        {/* ========================================================== */}
        {/* ✨ CAMBIO AQUÍ: Estos Cards solo se muestran si NO estamos editando */}
        {/* ========================================================== */}
        {!isEditing && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Datos del Esposo</CardTitle>
                <CardDescription>Busca por DNI o crea un nuevo registro.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="husbandDocumentNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Documento</FormLabel>
                        <div className="flex items-center space-x-2">
                          <FormControl>
                            <Input 
                              placeholder="DNI del esposo..." 
                              {...field} 
                              onBlur={() => handleCheckUser(field.value, 'husband')} 
                              disabled={isEditing} 
                            />
                          </FormControl>
                          {isCheckingHusband && <Loader2 className="h-4 w-4 animate-spin" />}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="husbandTypeDocument"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Documento</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value} disabled={husbandExists}>
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
                  <FormField control={form.control} name="husbandName" render={({ field }) => (<FormItem><FormLabel>Nombres</FormLabel><FormControl><Input placeholder="Nombres..." {...field} disabled={husbandExists} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="husbandLastName" render={({ field }) => (<FormItem><FormLabel>Apellidos</FormLabel><FormControl><Input placeholder="Apellidos..." {...field} disabled={husbandExists} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="husbandMail" render={({ field }) => (<FormItem><FormLabel>Correo</FormLabel><FormControl><Input type="email" placeholder="correo..." {...field} disabled={husbandExists} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="husbandBirthdate" render={({ field }) => (<FormItem><FormLabel>Fecha Nacimiento</FormLabel><FormControl><Input type="date" {...field} disabled={husbandExists} /></FormControl><FormMessage /></FormItem>)} />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Datos de la Esposa</CardTitle>
                <CardDescription>Busca por DNI o crea un nuevo registro.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="wifeDocumentNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Documento</FormLabel>
                        <div className="flex items-center space-x-2">
                          <FormControl>
                            <Input 
                              placeholder="DNI de la esposa..." 
                              {...field} 
                              onBlur={() => handleCheckUser(field.value, 'wife')} 
                              disabled={isEditing} 
                            />
                          </FormControl>
                          {isCheckingWife && <Loader2 className="h-4 w-4 animate-spin" />}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="wifeTypeDocument"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Documento</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value} disabled={wifeExists}>
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
                  <FormField control={form.control} name="wifeName" render={({ field }) => (<FormItem><FormLabel>Nombres</FormLabel><FormControl><Input placeholder="Nombres..." {...field} disabled={wifeExists} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="wifeLastName" render={({ field }) => (<FormItem><FormLabel>Apellidos</FormLabel><FormControl><Input placeholder="Apellidos..." {...field} disabled={wifeExists} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="wifeMail" render={({ field }) => (<FormItem><FormLabel>Correo</FormLabel><FormControl><Input type="email" placeholder="correo..." {...field} disabled={wifeExists} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="wifeBirthdate" render={({ field }) => (<FormItem><FormLabel>Fecha Nacimiento</FormLabel><FormControl><Input type="date" {...field} disabled={wifeExists} /></FormControl><FormMessage /></FormItem>)} />
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Datos del Sacramento</CardTitle>
            {isEditing && <CardDescription>Esta información sí se puede modificar.</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField control={form.control} name="marriageDate" render={({ field }) => (<FormItem><FormLabel>Fecha de Matrimonio</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="father_husband" render={({ field }) => (<FormItem><FormLabel>Padre del Esposo (Opcional)</FormLabel><FormControl><Input placeholder="Nombre completo..." {...field} /></FormControl></FormItem>)} />
              <FormField control={form.control} name="mother_husband" render={({ field }) => (<FormItem><FormLabel>Madre del Esposo (Opcional)</FormLabel><FormControl><Input placeholder="Nombre completo..." {...field} /></FormControl></FormItem>)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="father_wife" render={({ field }) => (<FormItem><FormLabel>Padre de la Esposa (Opcional)</FormLabel><FormControl><Input placeholder="Nombre completo..." {...field} /></FormControl></FormItem>)} />
              <FormField control={form.control} name="mother_wife" render={({ field }) => (<FormItem><FormLabel>Madre de la Esposa (Opcional)</FormLabel><FormControl><Input placeholder="Nombre completo..." {...field} /></FormControl></FormItem>)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="godfather1" render={({ field }) => (<FormItem><FormLabel>Padrino 1</FormLabel><FormControl><Input placeholder="Nombre completo..." {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="godfather2" render={({ field }) => (<FormItem><FormLabel>Padrino 2</FormLabel><FormControl><Input placeholder="Nombre completo..." {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="witness1" render={({ field }) => (<FormItem><FormLabel>Testigo 1</FormLabel><FormControl><Input placeholder="Nombre completo..." {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="witness2" render={({ field }) => (<FormItem><FormLabel>Testigo 2</FormLabel><FormControl><Input placeholder="Nombre completo..." {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
          </CardContent>
        </Card>
        
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Guardar Registro"}
        </Button>
      </form>
    </Form>
  )
}