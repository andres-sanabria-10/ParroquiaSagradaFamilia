"use client"

import { useEffect, useMemo, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, Church, DollarSign, Calendar, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

// --- Config ---
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api-parroquiasagradafamilia-s6qu.onrender.com"

const sidebarItems = [
  { title: "Gestión de Partidas", href: "/dashboard/secretaria/partidas", icon: FileText },
  { title: "Gestión de Misas", href: "/dashboard/secretaria/misas", icon: Church },
  { title: "Agenda de Misas", href: "/dashboard/secretaria/solicitud-misa", icon: Calendar },
  { title: "Contabilidad", href: "/dashboard/secretaria/contabilidad", icon: DollarSign },
]

// --- Tipos ---
interface PayerInfo {
  name: string
  email: string
  documentNumber: string
}

interface Payment {
  _id: string
  userId: { name: string; lastName: string } | null
  serviceType: "mass" | "certificate"
  amount: number
  referenceCode: string
  status: "pending" | "approved" | "rejected" | "failed" | "expired"
  paymentMethod: string
  description: string
  createdAt: string
  payerInfo: PayerInfo
}

// --- Utilidades ---
function safeFormatDate(dateString: string | undefined | null, formatStr = "dd/MM/yyyy h:mm a") {
  if (!dateString) return "N/A"
  const d = new Date(dateString)
  if (Number.isNaN(d.getTime())) return "N/A"
  return format(d, formatStr)
}

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 0,
})

const STATUS_LABEL: Record<Payment["status"], string> = {
  approved: "Aprobado",
  pending: "Pendiente",
  rejected: "Rechazado",
  failed: "Fallido",
  expired: "Expirado",
}

function getStatusBadgeClasses(status: Payment["status"]) {
  switch (status) {
    case "approved":
      return "border-green-300 text-green-700 bg-green-50"
    case "pending":
      return "border-amber-300 text-amber-700 bg-amber-50"
    case "rejected":
    case "failed":
    case "expired":
      return "border-red-300 text-red-700 bg-red-50"
    default:
      return ""
  }
}

function methodLabel(method: string) {
  if (method === "cash_admin") return "Efectivo (Admin)"
  return method
}

// --- Subcomponentes de UI ---
function SummaryStatCard({
  title,
  caption,
  value,
  icon: Icon,
  isLoading,
  emphasize = false,
}: {
  title: string
  caption?: string
  value: string | number | JSX.Element
  icon: React.ComponentType<{ className?: string }>
  isLoading?: boolean
  emphasize?: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={emphasize ? "h-4 w-4 text-green-600" : "h-4 w-4 text-muted-foreground"} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-1/2" />
        ) : (
          <div className={`text-2xl font-bold ${emphasize ? "text-green-600" : ""}`}>{value}</div>
        )}
        {caption && <p className="text-xs text-muted-foreground mt-1">{caption}</p>}
      </CardContent>
    </Card>
  )
}

function PaymentsTable({ payments, isLoading }: { payments: Payment[]; isLoading: boolean }) {
  const sorted = useMemo(
    () =>
      [...payments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [payments]
  )

  const getPayerName = (p: Payment) => {
    if (p.payerInfo?.name) return p.payerInfo.name
    if (p.userId) return `${p.userId.name} ${p.userId.lastName}`
    return "Usuario Anónimo"
  }

  return (
    <div className="rounded-xl border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">Fecha</TableHead>
            <TableHead className="whitespace-nowrap">Solicitante</TableHead>
            <TableHead className="min-w-[240px]">Concepto</TableHead>
            <TableHead className="whitespace-nowrap">Método</TableHead>
            <TableHead className="whitespace-nowrap">Estado</TableHead>
            <TableHead className="text-right whitespace-nowrap">Monto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={`s-${i}`}>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                <TableCell><Skeleton className="h-4 w-60" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
              </TableRow>
            ))
          ) : sorted.length ? (
            sorted.map((p) => (
              <TableRow key={p._id}>
                <TableCell className="whitespace-nowrap">{safeFormatDate(p.createdAt)}</TableCell>
                <TableCell className="whitespace-nowrap">{getPayerName(p)}</TableCell>
                <TableCell className="truncate max-w-[420px]" title={p.description}>{p.description}</TableCell>
                <TableCell className="whitespace-nowrap">
                  <Badge variant="outline" className={p.paymentMethod === "cash_admin" ? "border-blue-400 text-blue-700 bg-blue-50" : ""}>
                    {methodLabel(p.paymentMethod)}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <Badge variant="outline" className={getStatusBadgeClasses(p.status)}>
                    {STATUS_LABEL[p.status]}
                  </Badge>
                </TableCell>
                <TableCell className={`text-right font-medium ${p.status === "approved" ? "text-green-700" : "text-muted-foreground"}`}>
                  {currencyFormatter.format(p.amount)}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No se encontraron pagos registrados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

// --- Componente principal ---
export default function ContabilidadSecretaria() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalTransactions, setTotalTransactions] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPayments = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`${API_URL}/payment/all/history`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        })
        if (!res.ok) throw new Error("Error al cargar el historial de pagos")
        const data = await res.json()

        if (data?.success) {
          setPayments(data.payments ?? [])
          setTotalRevenue(data.totalRevenue ?? 0)
          setTotalTransactions(data.totalTransactions ?? 0)
        } else {
          throw new Error(data?.error || "Error en la respuesta del servidor")
        }
      } catch (e: any) {
        toast.error("Error al cargar pagos", { description: e?.message ?? "Intenta nuevamente" })
        setPayments([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchPayments()
  }, [])

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar items={sidebarItems} userRole="secretaria" />

      <main className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 md:px-8 md:py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Contabilidad</h1>
            <p className="text-muted-foreground">Consulta el histórico de transacciones</p>
          </div>

          {/* Resumen */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-8">
            <SummaryStatCard
              title="Total Ingresos (Aprobados)"
              caption="Suma de todos los pagos aprobados"
              value={currencyFormatter.format(totalRevenue)}
              icon={TrendingUp}
              isLoading={isLoading}
              emphasize
            />
            <SummaryStatCard
              title="Transacciones"
              caption="Total de registros (aprobados o no)"
              value={totalTransactions}
              icon={DollarSign}
              isLoading={isLoading}
            />
          </div>

          {/* Tabla */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Ingresos</CardTitle>
              <CardDescription>Registro de todos los pagos (más recientes primero)</CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentsTable payments={payments} isLoading={isLoading} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
