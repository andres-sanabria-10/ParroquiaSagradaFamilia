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

// --- 1. Importar el formulario ---
import { FormularioBautismo } from "./components/FormularioBautismo"

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

export default function GestionPartidasSecretaria() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Bautismo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // --- 2. Estados para controlar los Modals (Dialogs) ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  // Guarda el objeto 'Bautismo' que se está editando
  const [editingBautismo, setEditingBautismo] = useState<Bautismo | null>(null)

  // --- Lógica para Búsqueda (Leer) ---
  // (Modificado para ser llamado sin un evento)
  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault() // Prevenir el envío del formulario si viene de un evento
    if (!searchTerm) return
    
    setIsLoading(true)
    setSearchResults([])
    try {
      const res = await fetch(`https://api-parroquiasagradafamilia-s6qu.onrender.com/baptism/${searchTerm}`, {
        method: 'GET',
        credentials: 'include',
      })
      
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "Bautismo no encontrado")
      }
      
      const data: Bautismo = await res.json()
      setSearchResults([data])
      toast.success("Bautismo encontrado")
      
    } catch (error: any) {
      toast.error("Error al buscar", { description: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  // --- Lógica para Eliminar ---
  const handleDelete = async (documentNumber: string) => {
    setIsDeleting(true)
    try {
      const res = await fetch(`https://api-parroquiasagradafamilia-s6qu.onrender.com/baptism/${documentNumber}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "No se pudo eliminar el registro")
      }
      
      toast.success("Bautismo eliminado correctamente")
      setSearchResults([]) 
      setSearchTerm("") 
      
    } catch (error: any) {
      toast.error("Error al eliminar", { description: error.message })
    } finally {
      setIsDeleting(false)
    }
  }

  // --- 3. Función para manejar el éxito del formulario (Crear/Editar) ---
  const handleFormSuccess = () => {
    setIsCreateModalOpen(false) // Cierra el modal de crear
    setEditingBautismo(null) // Cierra el modal de editar
    
    // Si estábamos buscando un término, volvemos a buscar para refrescar los datos
    if (searchTerm) {
      handleSearch()
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
                    {/* --- 4. Conectar Modal de CREAR --- */}
                    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
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
                        {/* Reemplazamos el placeholder con el formulario real */}
                        <FormularioBautismo onSuccess={handleFormSuccess} />
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* --- Barra de Búsqueda --- */}
                  <form onSubmit={handleSearch} className="flex items-center space-x-2 mb-4">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por Número de Documento..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Buscar"}
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
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Buscando...
                          </TableCell>
                        </TableRow>
                      ) : searchResults.length > 0 ? (
                        searchResults.map((b) => (
                          <TableRow key={b._id}>
                            <TableCell className="font-medium">{b.baptized.name} {b.baptized.lastName}</TableCell>
                            <TableCell>{b.baptized.documentNumber}</TableCell>
                            <TableCell>{new Date(b.baptismDate).toLocaleDateString()}</TableCell>
                            <TableCell>{b.fatherName}</TableCell>
                            <TableCell>{b.motherName}</TableCell>
                            <TableCell className="text-right space-x-2">
                              {/* --- 5. Conectar Modal de EDITAR --- */}
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
                                  {/* Reemplazamos el placeholder con el formulario real y pasamos los datos */}
                                  {editingBautismo && (
                                    <FormularioBautismo
                                      onSuccess={handleFormSuccess}
                                      // Transformamos los datos para que coincidan con el formulario
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
                              
                              {/* --- Botón Eliminar (Ya estaba bien) --- */}
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
                                      onClick={() => handleDelete(b.baptized.documentNumber)}
                                      disabled={isDeleting}
                                    >
                                      {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sí, eliminar"}
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

            {/* ================================== */}
            {/* === PANELES PENDIENTES === */}
            {/* ================================== */}
            <TabsContent value="confirmacion">
              <Card>
                <CardHeader><CardTitle>Gestión de Confirmaciones</CardTitle></CardHeader>
                <CardContent><p>Aquí irá la interfaz para el CRUD de Confirmaciones.</p></CardContent>
              </Card>
            </TabsContent>
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