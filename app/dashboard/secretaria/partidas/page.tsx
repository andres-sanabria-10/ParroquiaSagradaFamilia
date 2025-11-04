"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  FileText,
  Church,
  DollarSign,
  ClipboardList,
  Calendar,
  Search,
  Edit,
  Trash2,
  PlusCircle,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

import { FormularioBautismo } from "./components/FormularioBautismo"
import { FormularioConfirmacion } from "./components/FormularioConfirmacion" 
// Aquí importaremos los de Matrimonio y Defuncion más adelante

// --- Sidebar ---
const sidebarItems = [
  {
    title: "Gestión de Partidas",
    href: "/dashboard/secretaria/partidas",
    icon: FileText,
  },
  {
    title: "Solicitudes de Partidas",
    href: "/dashboard/secretaria/solicitud-partida",
    icon: ClipboardList,
  },
  {
    title: "Gestión de Misas",
    href: "/dashboard/secretaria/misas",
    icon: Church,
  },
  {
    title: "Solicitudes de Misa",
    href: "/dashboard/secretaria/solicitud-misa",
    icon: Calendar,
  },
  {
    title: "Contabilidad",
    href: "/dashboard/secretaria/contabilidad",
    icon: DollarSign,
  },
]

// --- Tipos de Datos (Interfaces) ---
interface UserInfo {
  name: string
  lastName: string
  documentNumber: string
  mail: string
}

interface Bautismo {
  _id: string
  baptized: UserInfo
  baptismDate: string
  placeBirth: string
  fatherName: string
  motherName: string
  godfather1: string
  godfather2?: string
}

// --- INTERFAZ CORREGIDA para Confirmaciones ---
interface Confirmacion {
  _id: string
  confirmed: UserInfo
  confirmationDate: string
  fatherName: string
  motherName: string
  godfather: string
  baptizedParish?: string
}

// Aquí irían las interfaces para Matrimonio y Defuncion más adelante

export default function GestionPartidasSecretaria() {
  // --- Estados para BAUTISMOS ---
  const [bautismoSearchTerm, setBautismoSearchTerm] = useState("")
  const [bautismoSearchResults, setBautismoSearchResults] = useState<Bautismo[]>([])
  const [isBautismoLoading, setIsBautismoLoading] = useState(false)
  const [isBautismoDeleting, setIsBautismoDeleting] = useState(false)
  const [isCreateBautismoModalOpen, setIsCreateBautismoModalOpen] = useState(false)
  const [editingBautismo, setEditingBautismo] = useState<Bautismo | null>(null)

  // --- Estados para CONFIRMACIONES ---
  const [confirmacionSearchTerm, setConfirmacionSearchTerm] = useState("")
  const [confirmacionSearchResults, setConfirmacionSearchResults] = useState<Confirmacion[]>([])
  const [isConfirmacionLoading, setIsConfirmacionLoading] = useState(false)
  const [isConfirmacionDeleting, setIsConfirmacionDeleting] = useState(false)
  const [isCreateConfirmacionModalOpen, setIsCreateConfirmacionModalOpen] = useState(false)
  const [editingConfirmacion, setEditingConfirmacion] = useState<Confirmacion | null>(null)

  // --- Lógica para Búsqueda (Leer) - BAUTISMOS ---
  const handleBautismoSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!bautismoSearchTerm) return
    
    setIsBautismoLoading(true)
    setBautismoSearchResults([])
    try {
      const res = await fetch(`https://api-parroquiasagradafamilia-s6qu.onrender.com/baptism/${bautismoSearchTerm}`, {
        method: 'GET',
        credentials: 'include',
      })
      
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "Bautismo no encontrado")
      }
      
      const data: Bautismo = await res.json()
      setBautismoSearchResults([data])
      toast.success("Bautismo encontrado")
      
    } catch (error: any) {
      toast.error("Error al buscar bautismo", { description: error.message })
    } finally {
      setIsBautismoLoading(false)
    }
  }

  // --- Lógica para Eliminar - BAUTISMOS ---
  const handleBautismoDelete = async (documentNumber: string) => {
    setIsBautismoDeleting(true)
    try {
      const res = await fetch(`https://api-parroquiasagradafamilia-s6qu.onrender.com/baptism/${documentNumber}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "No se pudo eliminar el registro de bautismo")
      }
      
      toast.success("Bautismo eliminado correctamente")
      setBautismoSearchResults([]) 
      setBautismoSearchTerm("") 
      
    } catch (error: any) {
      toast.error("Error al eliminar bautismo", { description: error.message })
    } finally {
      setIsBautismoDeleting(false)
    }
  }

  // --- Lógica para el éxito del formulario (Crear/Editar) - BAUTISMOS ---
  const handleBautismoFormSuccess = () => {
    setIsCreateBautismoModalOpen(false)
    setEditingBautismo(null)
    if (bautismoSearchTerm) {
      handleBautismoSearch() // Refrescar si hay búsqueda activa
    }
  }

  // --- Funciones para CONFIRMACIONES ---

  // Lógica para Búsqueda (Leer) - CONFIRMACIONES
  const handleConfirmacionSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!confirmacionSearchTerm) return
    
    setIsConfirmacionLoading(true)
    setConfirmacionSearchResults([])
    try {
      const res = await fetch(`https://api-parroquiasagradafamilia-s6qu.onrender.com/confirmation/${confirmacionSearchTerm}`, {
        method: 'GET',
        credentials: 'include',
      })
      
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "Confirmación no encontrada")
      }
      
      const data: Confirmacion = await res.json()
      setConfirmacionSearchResults([data])
      toast.success("Confirmación encontrada")
      
    } catch (error: any) {
      toast.error("Error al buscar confirmación", { description: error.message })
    } finally {
      setIsConfirmacionLoading(false)
    }
  }

  // Lógica para Eliminar - CONFIRMACIONES
  const handleConfirmacionDelete = async (documentNumber: string) => {
    setIsConfirmacionDeleting(true)
    try {
      const res = await fetch(`https://api-parroquiasagradafamilia-s6qu.onrender.com/confirmation/${documentNumber}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "No se pudo eliminar el registro de confirmación")
      }
      
      toast.success("Confirmación eliminada correctamente")
      setConfirmacionSearchResults([]) 
      setConfirmacionSearchTerm("") 
      
    } catch (error: any) {
      toast.error("Error al eliminar confirmación", { description: error.message })
    } finally {
      setIsConfirmacionDeleting(false)
    }
  }

  // Lógica para el éxito del formulario (Crear/Editar) - CONFIRMACIONES
  const handleConfirmacionFormSuccess = () => {
    setIsCreateConfirmacionModalOpen(false)
    setEditingConfirmacion(null)
    if (confirmacionSearchTerm) {
      handleConfirmacionSearch() // Refrescar si hay búsqueda activa
    }
  }


  return (
    <div className="flex h-screen bg-background">
      <Sidebar items={sidebarItems} userRole="secretaria" />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Gestión de Partidas Sacramentales</h1>
            <p className="text-muted-foreground">Administra los registros de bautismos, confirmaciones, matrimonios y defunciones.</p>
          </div>

          <Tabs defaultValue="bautismo" className="w-full">
            <TabsList>
              <TabsTrigger value="bautismo">Bautismos</TabsTrigger>
              <TabsTrigger value="confirmacion">Confirmaciones</TabsTrigger>
              <TabsTrigger value="matrimonio">Matrimonios</TabsTrigger>
              <TabsTrigger value="defuncion">Defunciones</TabsTrigger>
            </TabsList>

            {/* ================================== */}
            {/* === PANEL DE BAUTISMOS (COMPLETO) === */}
            {/* ================================== */}
            <TabsContent value="bautismo">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Registros de Bautismo</CardTitle>
                      <CardDescription>Busca, crea, edita o elimina registros de bautismo.</CardDescription>
                    </div>
                    {/* Conectar Modal de CREAR */}
                    <Dialog open={isCreateBautismoModalOpen} onOpenChange={setIsCreateBautismoModalOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <PlusCircle className="mr-2 h-4 w-4" /> Registrar Bautismo
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Registrar Nuevo Bautismo</DialogTitle>
                          <DialogDescription>
                            Completa los campos para registrar una nueva partida de bautismo.
                          </DialogDescription>
                        </DialogHeader>
                        <FormularioBautismo onSuccess={handleBautismoFormSuccess} />
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* --- Barra de Búsqueda --- */}
                  <form onSubmit={handleBautismoSearch} className="flex items-center space-x-2 mb-4">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por Número de Documento..."
                      value={bautismoSearchTerm}
                      onChange={(e) => setBautismoSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                    <Button type="submit" disabled={isBautismoLoading}>
                      {isBautismoLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Buscar"}
                    </Button>
                  </form>

                  {/* --- Tabla de Resultados --- */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Documento</TableHead>
                        <TableHead>Fecha Bautismo</TableHead>
                        <TableHead>Padre</TableHead>
                        <TableHead>Madre</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isBautismoLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Buscando...
                          </TableCell>
                        </TableRow>
                      ) : bautismoSearchResults.length > 0 ? (
                        bautismoSearchResults.map((b) => (
                          <TableRow key={b._id}>
                            <TableCell className="font-medium">{b.baptized.name} {b.baptized.lastName}</TableCell>
                            <TableCell>{b.baptized.documentNumber}</TableCell>
                            <TableCell>{new Date(b.baptismDate).toLocaleDateString()}</TableCell>
                            <TableCell>{b.fatherName}</TableCell>
                            <TableCell>{b.motherName}</TableCell>
                            <TableCell className="text-right space-x-2">
                              {/* Conectar Modal de EDITAR */}
                              <Dialog open={editingBautismo?._id === b._id} onOpenChange={(isOpen) => {
                                if (!isOpen) setEditingBautismo(null);
                              }}>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" onClick={() => setEditingBautismo(b)}>
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-3xl">
                                  <DialogHeader>
                                    <DialogTitle>Editar Registro de Bautismo</DialogTitle>
                                    <DialogDescription>Modifica los datos del registro.</DialogDescription>
                                  </DialogHeader>
                                  {editingBautismo && (
                                    <FormularioBautismo
                                      onSuccess={handleBautismoFormSuccess}
                                      defaultValues={{
                                        documentNumber: editingBautismo.baptized.documentNumber,
                                        baptismDate: new Date(editingBautismo.baptismDate).toISOString().split('T')[0],
                                        placeBirth: editingBautismo.placeBirth,
                                        fatherName: editingBautismo.fatherName,
                                        motherName: editingBautismo.motherName,
                                        godfather1: editingBautismo.godfather1,
                                        godfather2: editingBautismo.godfather2 || "",
                                      }}
                                    />
                                  )}
                                </DialogContent>
                              </Dialog>
                              
                              {/* Botón Eliminar */}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm"><Trash2 className="w-4 h-4" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Estás seguro de eliminar este registro?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta acción es permanente. Se eliminará el registro de bautismo de:
                                      <br />
                                      <strong className="py-2 block">{b.baptized.name} {b.baptized.lastName}</strong>
                                      No podrás deshacer esta acción.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleBautismoDelete(b.baptized.documentNumber)}
                                      disabled={isBautismoDeleting}
                                    >
                                      {isBautismoDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sí, eliminar"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center">No se encontraron resultados. Realiza una búsqueda.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ======================================= */}
            {/* === PANEL DE CONFIRMACIONES (CORREGIDO) === */}
            {/* ======================================= */}
            <TabsContent value="confirmacion">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Registros de Confirmación</CardTitle>
                      <CardDescription>Busca, crea, edita o elimina registros de confirmación.</CardDescription>
                    </div>
                    {/* Conectar Modal de CREAR Confirmación */}
                    <Dialog open={isCreateConfirmacionModalOpen} onOpenChange={setIsCreateConfirmacionModalOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <PlusCircle className="mr-2 h-4 w-4" /> Registrar Confirmación
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Registrar Nueva Confirmación</DialogTitle>
                          <DialogDescription>
                            Completa los campos para registrar una nueva partida de confirmación.
                          </DialogDescription>
                        </DialogHeader>
                        {/* --- Usamos el formulario corregido --- */}
                        <FormularioConfirmacion onSuccess={handleConfirmacionFormSuccess} />
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* --- Barra de Búsqueda Confirmación --- */}
                  <form onSubmit={handleConfirmacionSearch} className="flex items-center space-x-2 mb-4">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por Número de Documento..."
                      value={confirmacionSearchTerm}
                      onChange={(e) => setConfirmacionSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                    <Button type="submit" disabled={isConfirmacionLoading}>
                      {isConfirmacionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Buscar"}
                    </Button>
                  </form>

                  {/* --- Tabla de Resultados Confirmación (CORREGIDA) --- */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Documento</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Padre</TableHead>
                        <TableHead>Madre</TableHead>
                        <TableHead>Padrino/Madrina</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isConfirmacionLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Buscando...
                          </TableCell>
                        </TableRow>
                      ) : confirmacionSearchResults.length > 0 ? (
                        confirmacionSearchResults.map((c) => (
                          <TableRow key={c._id}>
                            <TableCell className="font-medium">{c.confirmed.name} {c.confirmed.lastName}</TableCell>
                            <TableCell>{c.confirmed.documentNumber}</TableCell>
                            <TableCell>{new Date(c.confirmationDate).toLocaleDateString()}</TableCell>
                            <TableCell>{c.fatherName}</TableCell>
                            <TableCell>{c.motherName}</TableCell>
                            <TableCell>{c.godfather}</TableCell>
                            <TableCell className="text-right space-x-2">
                              {/* Conectar Modal de EDITAR Confirmación */}
                              <Dialog open={editingConfirmacion?._id === c._id} onOpenChange={(isOpen) => {
                                if (!isOpen) setEditingConfirmacion(null);
                              }}>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" onClick={() => setEditingConfirmacion(c)}>
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-3xl">
                                  <DialogHeader>
                                    <DialogTitle>Editar Registro de Confirmación</DialogTitle>
                                    <DialogDescription>Modifica los datos del registro.</DialogDescription>
                                  </DialogHeader>
                                  {editingConfirmacion && (
                                    // --- Pasamos los valores corregidos ---
                                    <FormularioConfirmacion
                                      onSuccess={handleConfirmacionFormSuccess}
                                      defaultValues={{
                                        documentNumber: editingConfirmacion.confirmed.documentNumber,
                                        confirmationDate: new Date(editingConfirmacion.confirmationDate).toISOString().split('T')[0],
                                        fatherName: editingConfirmacion.fatherName,
                                        motherName: editingConfirmacion.motherName,
                                        godfather: editingConfirmacion.godfather,
                                        baptizedParish: editingConfirmacion.baptizedParish || "",
                                      }}
                                    />
                                  )}
                                </DialogContent>
                              </Dialog>
                              
                              {/* Botón Eliminar Confirmación */}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm"><Trash2 className="w-4 h-4" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Estás seguro de eliminar este registro?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta acción es permanente. Se eliminará el registro de confirmación de:
                                      <br />
                                      <strong className="py-2 block">{c.confirmed.name} {c.confirmed.lastName}</strong>
                                      No podrás deshacer esta acción.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleConfirmacionDelete(c.confirmed.documentNumber)}
                                      disabled={isConfirmacionDeleting}
                                    >
                                      {isConfirmacionDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sí, eliminar"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center">No se encontraron resultados. Realiza una búsqueda.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- Paneles de Matrimonio y Defuncion (Vacíos por ahora) --- */}
            <TabsContent value="matrimonio">
              <Card>
                <CardHeader><CardTitle>Gestión de Matrimonios</CardTitle></CardHeader>
                <CardContent><p>Aquí irá la interfaz para el CRUD de Matrimonios.</p></CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="defuncion">
              <Card>
                <CardHeader><CardTitle>Gestión de Defunciones</CardTitle></CardHeader>
                <CardContent><p>Aquí irá la interfaz para el CRUD de Defunciones.</p></CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}