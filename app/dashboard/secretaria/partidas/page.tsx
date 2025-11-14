"use client"

import { useState, useEffect } from "react" 
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label" 
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
  DialogFooter,
  DialogClose,
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
  Send,
  UserPlus,
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns" 

// --- Importar todos los formularios ---
import { FormularioBautismo } from "../../components/FormularioBautismo"
import { FormularioConfirmacion } from "../../components/FormularioConfirmacion" 
import { FormularioMatrimonio } from "../../components/FormularioMatrimonio"
import { FormularioDefuncion } from "../../components/FormularioDefuncion"

// --- Sidebar ---
const sidebarItems = [
  {
    title: "Inicio",
    href: "/dashboard/secretaria",
    icon: Church,
  }, 
  {
    title: "Gestión de Partidas",
    href: "/dashboard/secretaria/partidas",
    icon: FileText,
  },
  {
    title: "Gestión de Misas",
    href: "/dashboard/secretaria/misas",
    icon: Church,
  },
  {
    title: "Agenda de Misas",
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
interface DocumentType {
  _id: string
  name: string
}
interface UserInfo {
  name: string
  lastName: string
  documentNumber: string
  mail: string
  birthdate: string 
  typeDocument: DocumentType 
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
interface Confirmacion {
  _id: string
  confirmed: UserInfo
  confirmationDate: string
  fatherName: string
  motherName: string
  godfather: string
  baptizedParish?: string
}
interface Matrimonio {
  _id: string
  husband: UserInfo
  wife: UserInfo
  marriageDate: string
  father_husband?: string
  mother_husband?: string
  father_wife?: string
  mother_wife?: string
  godfather1: string
  godfather2: string
  witness1: string
  witness2: string
}
interface Defuncion {
  _id: string
  dead: UserInfo
  deathDate: string
  fatherName: string
  motherName: string
  civilStatus: "soltero" | "casado" | "union libre"
  cemeteryName: string
  funeralDate?: string
}

// --- Componente de Formato de Fecha Seguro ---
function safeFormatDate(dateString: string | undefined | null, formatStr: string = "yyyy-MM-dd") {
  if (!dateString || new Date(dateString).toString() === "Invalid Date") {
    return ""; // Devuelve vacío si la fecha es inválida o nula
  }
  return format(new Date(dateString), formatStr);
}


export default function GestionPartidasSecretaria() {
  // --- Estados para Bautismos ---
  const [bautismoSearchTerm, setBautismoSearchTerm] = useState("")
  const [bautismoSearchResults, setBautismoSearchResults] = useState<Bautismo[]>([])
  const [isBautismoLoading, setIsBautismoLoading] = useState(false)
  const [isBautismoDeleting, setIsBautismoDeleting] = useState(false)
  const [isCreateBautismoModalOpen, setIsCreateBautismoModalOpen] = useState(false)
  const [editingBautismo, setEditingBautismo] = useState<Bautismo | null>(null)

  // --- Estados para Confirmaciones ---
  const [confirmacionSearchTerm, setConfirmacionSearchTerm] = useState("")
  const [confirmacionSearchResults, setConfirmacionSearchResults] = useState<Confirmacion[]>([])
  const [isConfirmacionLoading, setIsConfirmacionLoading] = useState(false)
  const [isConfirmacionDeleting, setIsConfirmacionDeleting] = useState(false)
  const [isCreateConfirmacionModalOpen, setIsCreateConfirmacionModalOpen] = useState(false)
  const [editingConfirmacion, setEditingConfirmacion] = useState<Confirmacion | null>(null)

  // --- Estados para Matrimonios ---
  const [matrimonioSearchTerm, setMatrimonioSearchTerm] = useState("")
  const [matrimonioSearchResults, setMatrimonioSearchResults] = useState<Matrimonio[]>([])
  const [isMatrimonioLoading, setIsMatrimonioLoading] = useState(false)
  const [isMatrimonioDeleting, setIsMatrimonioDeleting] = useState(false)
  const [isCreateMatrimonioModalOpen, setIsCreateMatrimonioModalOpen] = useState(false)
  const [editingMatrimonio, setEditingMatrimonio] = useState<Matrimonio | null>(null)

  // --- Estados para Defunciones ---
  const [defuncionSearchTerm, setDefuncionSearchTerm] = useState("")
  const [defuncionSearchResults, setDefuncionSearchResults] = useState<Defuncion[]>([])
  const [isDefuncionLoading, setIsDefuncionLoading] = useState(false)
  const [isDefuncionDeleting, setIsDefuncionDeleting] = useState(false)
  const [isCreateDefuncionModalOpen, setIsCreateDefuncionModalOpen] = useState(false)
  const [editingDefuncion, setEditingDefuncion] = useState<Defuncion | null>(null)

  // --- Estado para Tipos de Documentos ---
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([])
  
  // --- API Base URL ---
  const API_URL = "https://api-parroquiasagradafamilia-s6qu.onrender.com"
  
  // --- Cargar tipos de documento al montar la página ---
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await fetch(`${API_URL}/documentType/`, {
          method: "GET",
          credentials: "include", 
          headers: { "Content-Type": "application/json" },
        })
        if (!res.ok) throw new Error("Error al cargar tipos de documento")
        const data = await res.json()
        setDocumentTypes(data?.data || [])
      } catch (e) {
        toast.error("No se pudieron cargar los tipos de documento");
        setDocumentTypes([])
      }
    }
    fetchDocs()
  }, []) 

  // --- Lógica de BAUTISMOS ---
  const handleBautismoSearch = async (e?: React.FormEvent) => {
    e?.preventDefault(); if (!bautismoSearchTerm) return;
    setIsBautismoLoading(true); setBautismoSearchResults([]);
    try {
      const res = await fetch(`${API_URL}/baptism/${bautismoSearchTerm}`, { method: 'GET', credentials: 'include' });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || "Bautismo no encontrado"); }
      const data: Bautismo = await res.json();
      setBautismoSearchResults([data]); toast.success("Bautismo encontrado");
    } catch (error: any) { toast.error("Error al buscar bautismo", { description: error.message });
    } finally { setIsBautismoLoading(false); }
  }
  const handleBautismoDelete = async (documentNumber: string) => {
    setIsBautismoDeleting(true);
    try {
      const res = await fetch(`${API_URL}/baptism/${documentNumber}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || "No se pudo eliminar"); }
      toast.success("Bautismo eliminado"); setBautismoSearchResults([]); setBautismoSearchTerm("");
    } catch (error: any) { toast.error("Error al eliminar bautismo", { description: error.message });
    } finally { setIsBautismoDeleting(false); }
  }
  const handleBautismoFormSuccess = () => {
    setIsCreateBautismoModalOpen(false); setEditingBautismo(null);
    if (bautismoSearchTerm) handleBautismoSearch();
  }

  // --- Lógica de CONFIRMACIONES ---
  const handleConfirmacionSearch = async (e?: React.FormEvent) => {
    e?.preventDefault(); if (!confirmacionSearchTerm) return;
    setIsConfirmacionLoading(true); setConfirmacionSearchResults([]);
    try {
      const res = await fetch(`${API_URL}/confirmation/${confirmacionSearchTerm}`, { method: 'GET', credentials: 'include' });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || "Confirmación no encontrada"); }
      const data: Confirmacion = await res.json();
      setConfirmacionSearchResults([data]); toast.success("Confirmación encontrada");
    } catch (error: any) { toast.error("Error al buscar confirmación", { description: error.message });
    } finally { setIsConfirmacionLoading(false); }
  }
  const handleConfirmacionDelete = async (documentNumber: string) => {
    setIsConfirmacionDeleting(true);
    try {
      const res = await fetch(`${API_URL}/confirmation/${documentNumber}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || "No se pudo eliminar"); }
      toast.success("Confirmación eliminada"); setConfirmacionSearchResults([]); setConfirmacionSearchTerm("");
    } catch (error: any) { toast.error("Error al eliminar confirmación", { description: error.message });
    } finally { setIsConfirmacionDeleting(false); }
  }
  const handleConfirmacionFormSuccess = () => {
    setIsCreateConfirmacionModalOpen(false); setEditingConfirmacion(null);
    if (confirmacionSearchTerm) handleConfirmacionSearch();
  }

  // --- Lógica de MATRIMONIOS ---
  const handleMatrimonioSearch = async (e?: React.FormEvent) => {
    e?.preventDefault(); if (!matrimonioSearchTerm) return;
    setIsMatrimonioLoading(true); setMatrimonioSearchResults([]);
    try {
      const res = await fetch(`${API_URL}/marriage/${matrimonioSearchTerm}`, { method: 'GET', credentials: 'include' });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || "Matrimonio no encontrado"); }
      const data: Matrimonio = await res.json();
      setMatrimonioSearchResults([data]); toast.success("Matrimonio encontrado");
    } catch (error: any) { toast.error("Error al buscar matrimonio", { description: error.message });
    } finally { setIsMatrimonioLoading(false); }
  }
  const handleMatrimonioDelete = async (documentNumber: string) => {
    setIsMatrimonioDeleting(true);
    try {
      const res = await fetch(`${API_URL}/marriage/${documentNumber}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || "No se pudo eliminar"); }
      toast.success("Matrimonio eliminado"); setMatrimonioSearchResults([]); setMatrimonioSearchTerm("");
    } catch (error: any) { toast.error("Error al eliminar matrimonio", { description: error.message });
    } finally { setIsMatrimonioDeleting(false); }
  }
  const handleMatrimonioFormSuccess = () => {
    setIsCreateMatrimonioModalOpen(false); setEditingMatrimonio(null);
    if (matrimonioSearchTerm) handleMatrimonioSearch();
  }

  // --- Lógica de DEFUNCIONES ---
  const handleDefuncionSearch = async (e?: React.FormEvent) => {
    e?.preventDefault(); if (!defuncionSearchTerm) return;
    setIsDefuncionLoading(true); setDefuncionSearchResults([]);
    try {
      const res = await fetch(`${API_URL}/death/${defuncionSearchTerm}`, { method: 'GET', credentials: 'include' });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || "Defunción no encontrada"); }
      const data: Defuncion = await res.json();
      setDefuncionSearchResults([data]); toast.success("Defunción encontrada");
    } catch (error: any) { toast.error("Error al buscar defunción", { description: error.message });
    } finally { setIsDefuncionLoading(false); }
  }
  const handleDefuncionDelete = async (documentNumber: string) => {
    setIsDefuncionDeleting(true);
    try {
      const res = await fetch(`${API_URL}/death/${documentNumber}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || "No se pudo eliminar"); }
      toast.success("Defunción eliminada"); setDefuncionSearchResults([]); setDefuncionSearchTerm("");
    } catch (error: any) { toast.error("Error al eliminar defunción", { description: error.message });
    } finally { setIsDefuncionDeleting(false); }
  }
  const handleDefuncionFormSuccess = () => {
    setIsCreateDefuncionModalOpen(false); setEditingDefuncion(null);
    if (defuncionSearchTerm) handleDefuncionSearch();
  }


  return (
    <div className="flex h-screen bg-background">
      <Sidebar items={sidebarItems} userRole="Secretaria" />
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
            {/* === PANEL DE BAUTISMOS === */}
            {/* ================================== */}
            <TabsContent value="bautismo">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Registros de Bautismo</CardTitle>
                      <CardDescription>Busca, crea, edita o elimina registros de bautismo.</CardDescription>
                    </div>
                    <Dialog open={isCreateBautismoModalOpen} onOpenChange={setIsCreateBautismoModalOpen}>
                      <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> Registrar Bautismo</Button></DialogTrigger>
                      <DialogContent className="sm:max-w-3xl"><DialogHeader><DialogTitle>Registrar Nuevo Bautismo</DialogTitle></DialogHeader>
                        <FormularioBautismo onSuccess={handleBautismoFormSuccess} documentTypes={documentTypes} />
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBautismoSearch} className="flex items-center space-x-2 mb-4">
                    <Search className="w-4 h-4 text-muted-foreground" /><Input placeholder="Buscar por Número de Documento..." value={bautismoSearchTerm} onChange={(e) => setBautismoSearchTerm(e.target.value)} className="max-w-sm" />
                    <Button type="submit" disabled={isBautismoLoading}>{isBautismoLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Buscar"}</Button>
                  </form>
                  <Table>
                    <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Documento</TableHead><TableHead>Fecha Bautismo</TableHead><TableHead>Padre</TableHead><TableHead>Madre</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {isBautismoLoading ? (
                        <TableRow><TableCell colSpan={6} className="text-center"><Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Buscando...</TableCell></TableRow>
                      ) : bautismoSearchResults.length > 0 ? (
                        bautismoSearchResults.map((b) => (
                          <TableRow key={b._id}>
                            <TableCell>{b.baptized.name} {b.baptized.lastName}</TableCell>
                            <TableCell>{b.baptized.documentNumber}</TableCell>
                            <TableCell>{safeFormatDate(b.baptismDate, "dd/MM/yyyy")}</TableCell>
                            <TableCell>{b.fatherName}</TableCell>
                            <TableCell>{b.motherName}</TableCell>
                            <TableCell className="text-right space-x-2">
                              <SendEmailDialog recordType="baptism" recordTypeName="Bautismo" documentNumber={b.baptized.documentNumber} recordName={`${b.baptized.name} ${b.baptized.lastName}`} defaultEmail={b.baptized.mail} apiBaseUrl={API_URL} />
                              <Dialog open={editingBautismo?._id === b._id} onOpenChange={(isOpen) => !isOpen && setEditingBautismo(null)}>
                                <DialogTrigger asChild><Button variant="outline" size="sm" onClick={() => setEditingBautismo(b)}><Edit className="w-4 h-4" /></Button></DialogTrigger>
                                <DialogContent className="sm:max-w-3xl">
                                  <DialogHeader><DialogTitle>Editar Registro de Bautismo</DialogTitle></DialogHeader>
                                  {editingBautismo && <FormularioBautismo onSuccess={handleBautismoFormSuccess} documentTypes={documentTypes} 
                                      defaultValues={{ 
                                        documentNumber: editingBautismo.baptized.documentNumber, 
                                        name: editingBautismo.baptized.name, 
                                        lastName: editingBautismo.baptized.lastName, 
                                        mail: editingBautismo.baptized.mail, 
                                        birthdate: safeFormatDate(editingBautismo.baptized.birthdate), // ✨ CORREGIDO
                                        typeDocument: editingBautismo.baptized.typeDocument?._id, 
                                        baptismDate: safeFormatDate(editingBautismo.baptismDate), // ✨ CORREGIDO
                                        placeBirth: editingBautismo.placeBirth, 
                                        fatherName: editingBautismo.fatherName, 
                                        motherName: editingBautismo.motherName, 
                                        godfather1: editingBautismo.godfather1, 
                                        godfather2: editingBautismo.godfather2 || "", 
                                      }} 
                                    />
                                  }
                                </DialogContent>
                              </Dialog>
                              <AlertDialog>
                                <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>Se eliminará el registro de: <strong className="py-2 block">{b.baptized.name} {b.baptized.lastName}</strong>. Esta acción es permanente.</AlertDialogDescription></AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleBautismoDelete(b.baptized.documentNumber)} disabled={isBautismoDeleting}>{isBautismoDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sí, eliminar"}</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow><TableCell colSpan={6} className="text-center">No se encontraron resultados. Realiza una búsqueda.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ======================================= */}
            {/* === PANEL DE CONFIRMACIONES === */}
            {/* ======================================= */}
            <TabsContent value="confirmacion">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div><CardTitle>Registros de Confirmación</CardTitle><CardDescription>Busca, crea, edita o elimina registros de confirmación.</CardDescription></div>
                    <Dialog open={isCreateConfirmacionModalOpen} onOpenChange={setIsCreateConfirmacionModalOpen}>
                      <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> Registrar Confirmación</Button></DialogTrigger>
                      <DialogContent className="sm:max-w-3xl"><DialogHeader><DialogTitle>Registrar Nueva Confirmación</DialogTitle></DialogHeader>
                        <FormularioConfirmacion onSuccess={handleConfirmacionFormSuccess} documentTypes={documentTypes} />
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleConfirmacionSearch} className="flex items-center space-x-2 mb-4">
                    <Search className="w-4 h-4 text-muted-foreground" /><Input placeholder="Buscar por Número de Documento..." value={confirmacionSearchTerm} onChange={(e) => setConfirmacionSearchTerm(e.target.value)} className="max-w-sm" />
                    <Button type="submit" disabled={isConfirmacionLoading}>{isConfirmacionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Buscar"}</Button>
                  </form>
                  <Table>
                    <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Documento</TableHead><TableHead>Fecha</TableHead><TableHead>Padre</TableHead><TableHead>Madre</TableHead><TableHead>Padrino</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {isConfirmacionLoading ? (
                        <TableRow><TableCell colSpan={7} className="text-center"><Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Buscando...</TableCell></TableRow>
                      ) : confirmacionSearchResults.length > 0 ? (
                        confirmacionSearchResults.map((c) => (
                          <TableRow key={c._id}>
                            <TableCell>{c.confirmed.name} {c.confirmed.lastName}</TableCell>
                            <TableCell>{c.confirmed.documentNumber}</TableCell>
                            <TableCell>{safeFormatDate(c.confirmationDate, "dd/MM/yyyy")}</TableCell>
                            <TableCell>{c.fatherName}</TableCell>
                            <TableCell>{c.motherName}</TableCell>
                            <TableCell>{c.godfather}</TableCell>
                            <TableCell className="text-right space-x-2">
                              <SendEmailDialog recordType="confirmation" recordTypeName="Confirmación" documentNumber={c.confirmed.documentNumber} recordName={`${c.confirmed.name} ${c.confirmed.lastName}`} defaultEmail={c.confirmed.mail} apiBaseUrl={API_URL} />
                              <Dialog open={editingConfirmacion?._id === c._id} onOpenChange={(isOpen) => !isOpen && setEditingConfirmacion(null)}>
                                <DialogTrigger asChild><Button variant="outline" size="sm" onClick={() => setEditingConfirmacion(c)}><Edit className="w-4 h-4" /></Button></DialogTrigger>
                                <DialogContent className="sm:max-w-3xl">
                                  <DialogHeader><DialogTitle>Editar Registro de Confirmación</DialogTitle></DialogHeader>
                                  {editingConfirmacion && (
                                    <FormularioConfirmacion 
                                      onSuccess={handleConfirmacionFormSuccess} 
                                      documentTypes={documentTypes} 
                                      defaultValues={{ 
                                        documentNumber: editingConfirmacion.confirmed.documentNumber, 
                                        name: editingConfirmacion.confirmed.name, 
                                        lastName: editingConfirmacion.confirmed.lastName, 
                                        mail: editingConfirmacion.confirmed.mail, 
                                        birthdate: safeFormatDate(editingConfirmacion.confirmed.birthdate), // ✨ CORREGIDO
                                        typeDocument: editingConfirmacion.confirmed.typeDocument?._id,
                                        confirmationDate: safeFormatDate(editingConfirmacion.confirmationDate), // ✨ CORREGIDO
                                        fatherName: editingConfirmacion.fatherName, 
                                        motherName: editingConfirmacion.motherName, 
                                        godfather: editingConfirmacion.godfather, 
                                        baptizedParish: editingConfirmacion.baptizedParish || "", 
                                      }} 
                                    />
                                  )}
                                </DialogContent>
                              </Dialog>
                              <AlertDialog>
                                <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>Se eliminará el registro de: <strong className="py-2 block">{c.confirmed.name} {c.confirmed.lastName}</strong>. Esta acción es permanente.</AlertDialogDescription></AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleConfirmacionDelete(c.confirmed.documentNumber)} disabled={isConfirmacionDeleting}>{isConfirmacionDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sí, eliminar"}</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow><TableCell colSpan={7} className="text-center">No se encontraron resultados. Realiza una búsqueda.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ======================================= */}
            {/* === PANEL DE MATRIMONIOS === */}
            {/* ======================================= */}
            <TabsContent value="matrimonio">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div><CardTitle>Registros de Matrimonio</CardTitle><CardDescription>Busca, crea, edita o elimina registros de matrimonio.</CardDescription></div>
                    <Dialog open={isCreateMatrimonioModalOpen} onOpenChange={setIsCreateMatrimonioModalOpen}>
                      <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> Registrar Matrimonio</Button></DialogTrigger>
                      <DialogContent className="sm:max-w-3xl"><DialogHeader><DialogTitle>Registrar Nuevo Matrimonio</DialogTitle></DialogHeader>
                        <FormularioMatrimonio onSuccess={handleMatrimonioFormSuccess} documentTypes={documentTypes} />
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleMatrimonioSearch} className="flex items-center space-x-2 mb-4">
                    <Search className="w-4 h-4 text-muted-foreground" /><Input placeholder="Buscar por DNI (esposo o esposa)..." value={matrimonioSearchTerm} onChange={(e) => setMatrimonioSearchTerm(e.target.value)} className="max-w-sm" />
                    <Button type="submit" disabled={isMatrimonioLoading}>{isMatrimonioLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Buscar"}</Button>
                  </form>
                  <Table>
                    <TableHeader><TableRow><TableHead>Esposo</TableHead><TableHead>Esposa</TableHead><TableHead>Fecha Matrimonio</TableHead><TableHead>Padrino 1</TableHead><TableHead>Padrino 2</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {isMatrimonioLoading ? (
                        <TableRow><TableCell colSpan={6} className="text-center"><Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Buscando...</TableCell></TableRow>
                      ) : matrimonioSearchResults.length > 0 ? (
                        matrimonioSearchResults.map((m) => (
                          <TableRow key={m._id}>
                            <TableCell>{m.husband.name} {m.husband.lastName}</TableCell>
                            <TableCell>{m.wife.name} {m.wife.lastName}</TableCell>
                            <TableCell>{safeFormatDate(m.marriageDate, "dd/MM/yyyy")}</TableCell>
                            <TableCell>{m.godfather1}</TableCell>
                            <TableCell>{m.godfather2}</TableCell>
                            <TableCell className="text-right space-x-2">
                              <SendEmailDialog recordType="marriage" recordTypeName="Matrimonio" documentNumber={m.husband.documentNumber} recordName={`${m.husband.name} y ${m.wife.name}`} defaultEmail={m.husband.mail || m.wife.mail} apiBaseUrl={API_URL} />
                              <Dialog open={editingMatrimonio?._id === m._id} onOpenChange={(isOpen) => !isOpen && setEditingMatrimonio(null)}>
                                <DialogTrigger asChild><Button variant="outline" size="sm" onClick={() => setEditingMatrimonio(m)}><Edit className="w-4 h-4" /></Button></DialogTrigger>
                                <DialogContent className="sm:max-w-3xl">
                                  <DialogHeader><DialogTitle>Editar Registro de Matrimonio</DialogTitle></DialogHeader>
                                  {editingMatrimonio && (
                                    <FormularioMatrimonio 
                                      onSuccess={handleMatrimonioFormSuccess} 
                                      documentTypes={documentTypes}
                                      // --- ✨ INICIO DE CORRECCIÓN DE FECHAS ---
                                      defaultValues={{ 
                                        husbandDocumentNumber: editingMatrimonio.husband.documentNumber,
                                        husbandName: editingMatrimonio.husband.name,
                                        husbandLastName: editingMatrimonio.husband.lastName,
                                        husbandMail: editingMatrimonio.husband.mail,
                                        husbandBirthdate: safeFormatDate(editingMatrimonio.husband.birthdate), // ✨ CORREGIDO
                                        husbandTypeDocument: editingMatrimonio.husband.typeDocument?._id,
                                        wifeDocumentNumber: editingMatrimonio.wife.documentNumber,
                                        wifeName: editingMatrimonio.wife.name,
                                        wifeLastName: editingMatrimonio.wife.lastName,
                                        wifeMail: editingMatrimonio.wife.mail,
                                        wifeBirthdate: safeFormatDate(editingMatrimonio.wife.birthdate), // ✨ CORREGIDO
                                        wifeTypeDocument: editingMatrimonio.wife.typeDocument?._id,
                                        marriageDate: safeFormatDate(editingMatrimonio.marriageDate), // ✨ CORREGIDO
                                        father_husband: editingMatrimonio.father_husband || "", mother_husband: editingMatrimonio.mother_husband || "", father_wife: editingMatrimonio.father_wife || "", mother_wife: editingMatrimonio.mother_wife || "", 
                                        godfather1: editingMatrimonio.godfather1, godfather2: editingMatrimonio.godfather2, witness1: editingMatrimonio.witness1, witness2: editingMatrimonio.witness2, 
                                      }} 
                                      // --- ✨ FIN DE CORRECCIÓN DE FECHAS ---
                                    />
                                  )}
                                </DialogContent>
                              </Dialog>
                              <AlertDialog>
                                <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>Se eliminará el matrimonio de: <strong className="py-2 block">{m.husband.name} y {m.wife.name}</strong>. Esta acción es permanente.</AlertDialogDescription></AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleMatrimonioDelete(m.husband.documentNumber)} disabled={isMatrimonioDeleting}>{isMatrimonioDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sí, eliminar"}</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow><TableCell colSpan={6} className="text-center">No se encontraron resultados. Realiza una búsqueda.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ======================================= */}
            {/* === PANEL DE DEFUNCIONES === */}
            {/* ======================================= */}
            <TabsContent value="defuncion">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div><CardTitle>Registros de Defunción</CardTitle><CardDescription>Busca, crea, edita o elimina registros de defunción.</CardDescription></div>
                    <Dialog open={isCreateDefuncionModalOpen} onOpenChange={setIsCreateDefuncionModalOpen}>
                      <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> Registrar Defunción</Button></DialogTrigger>
                      <DialogContent className="sm:max-w-3xl"><DialogHeader><DialogTitle>Registrar Nueva Defunción</DialogTitle></DialogHeader>
                        <FormularioDefuncion onSuccess={handleDefuncionFormSuccess} documentTypes={documentTypes} />
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleDefuncionSearch} className="flex items-center space-x-2 mb-4">
                    <Search className="w-4 h-4 text-muted-foreground" /><Input placeholder="Buscar por Número de Documento..." value={defuncionSearchTerm} onChange={(e) => setDefuncionSearchTerm(e.target.value)} className="max-w-sm" />
                    <Button type="submit" disabled={isDefuncionLoading}>{isDefuncionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Buscar"}</Button>
                  </form>
                  <Table>
                    <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Documento</TableHead><TableHead>Fecha Defunción</TableHead><TableHead>Estado Civil</TableHead><TableHead>Cementerio</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {isDefuncionLoading ? (
                        <TableRow><TableCell colSpan={6} className="text-center"><Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Buscando...</TableCell></TableRow>
                      ) : defuncionSearchResults.length > 0 ? (
                        defuncionSearchResults.map((d) => (
                          <TableRow key={d._id}>
                            <TableCell>{d.dead.name} {d.dead.lastName}</TableCell>
                            <TableCell>{d.dead.documentNumber}</TableCell>
                            <TableCell>{safeFormatDate(d.deathDate, "dd/MM/yyyy")}</TableCell>
                            <TableCell>{d.civilStatus}</TableCell>
                            <TableCell>{d.cemeteryName}</TableCell>
                            <TableCell className="text-right space-x-2">
                              <SendEmailDialog recordType="death" recordTypeName="Defunción" documentNumber={d.dead.documentNumber} recordName={`${d.dead.name} ${d.dead.lastName}`} defaultEmail={d.dead.mail} apiBaseUrl={API_URL} />
                              <Dialog open={editingDefuncion?._id === d._id} onOpenChange={(isOpen) => !isOpen && setEditingDefuncion(null)}>
                                <DialogTrigger asChild><Button variant="outline" size="sm" onClick={() => setEditingDefuncion(d)}><Edit className="w-4 h-4" /></Button></DialogTrigger>
                                <DialogContent className="sm:max-w-3xl">
                                  <DialogHeader><DialogTitle>Editar Registro de Defunción</DialogTitle></DialogHeader>
                                  {editingDefuncion && (
                                    <FormularioDefuncion 
                                      onSuccess={handleDefuncionFormSuccess} 
                                      documentTypes={documentTypes} 
                                      // --- ✨ INICIO DE CORRECCIÓN DE FECHAS ---
                                      defaultValues={{ 
                                        documentNumber: editingDefuncion.dead.documentNumber,
                                        name: editingDefuncion.dead.name,
                                        lastName: editingDefuncion.dead.lastName,
                                        mail: editingDefuncion.dead.mail,
                                        birthdate: safeFormatDate(editingDefuncion.dead.birthdate), // ✨ CORREGIDO
                                        typeDocument: editingDefuncion.dead.typeDocument?._id,
                                        deathDate: safeFormatDate(editingDefuncion.deathDate), // ✨ CORREGIDO
                                        fatherName: editingDefuncion.fatherName, 
                                        motherName: editingDefuncion.motherName, 
                                        civilStatus: editingDefuncion.civilStatus, 
                                        cemeteryName: editingDefuncion.cemeteryName, 
                                        funeralDate: safeFormatDate(editingDefuncion.funeralDate), // ✨ CORREGIDO
                                      }}
                                      // --- ✨ FIN DE CORRECCIÓN DE FECHAS ---
                                    />
                                  )}
                                </DialogContent>
                              </Dialog>
                              <AlertDialog>
                                <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>Se eliminará el registro de: <strong className="py-2 block">{d.dead.name} {d.dead.lastName}</strong>. Esta acción es permanente.</AlertDialogDescription></AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDefuncionDelete(d.dead.documentNumber)} disabled={isDefuncionDeleting}>{isDefuncionDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sí, eliminar"}</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow><TableCell colSpan={6} className="text-center">No se encontraron resultados. Realiza una búsqueda.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </div>
      </main>
    </div>
  )
}


// =====================================================================
// === Componente Reutilizable para el Modal de Envío de Correo
// (Este componente se queda igual que en la versión anterior)
// =====================================================================
interface SendEmailDialogProps {
  recordType: 'baptism' | 'confirmation' | 'marriage' | 'death';
  recordTypeName: string;
  documentNumber: string;
  recordName: string;
  defaultEmail: string;
  apiBaseUrl: string;
}

function SendEmailDialog({ recordType, recordTypeName, documentNumber, recordName, defaultEmail, apiBaseUrl }: SendEmailDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState(defaultEmail || "");

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setEmail(defaultEmail || "");
    }
    setIsOpen(open);
  };

  const handleSend = async () => {
    if (!email) {
      toast.error("Correo requerido", { description: "Por favor, ingresa una dirección de correo." });
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/${recordType}/send`, {
        method: 'POST',
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentNumber: documentNumber,
          sendToEmail: email, 
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || `No se pudo enviar la partida de ${recordTypeName}`);
      }
      
      toast.success("Partida enviada exitosamente", {
        description: `El registro de ${recordTypeName} fue enviado a ${email}.`,
      });
      setIsOpen(false); 

    } catch (error: any) {
      toast.error("Error al enviar", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Send className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar Partida de {recordTypeName}</DialogTitle>
          <DialogDescription>
            La partida de D <strong>{recordName}</strong> se enviará al correo que indiques a continuación.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
          <Label htmlFor="email-to-send">Correo Electrónico</Label>
          <Input
            id="email-to-send"
            type="email"
            placeholder="Ingresa el correo del solicitante..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>Cancelar</Button>
          </DialogClose>
          <Button onClick={handleSend} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sí, Enviar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}