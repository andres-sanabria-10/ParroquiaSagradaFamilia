"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ClipboardList, Calendar, History, Loader2, BookOpen, Heart, Cross } from "lucide-react"
import { useRouter } from "next/navigation"

const sidebarItems = [
  {
    title: "Solicitud de Partida",
    href: "/dashboard/feligres/solicitud-partida",
    icon: ClipboardList,
  },
  {
    title: "Solicitud de Misas",
    href: "/dashboard/feligres/solicitud-misas",
    icon: Calendar,
  },
  {
    title: "Historial",
    href: "/dashboard/feligres/historial",
    icon: History,
  },
]

const partidaTypes = [
  {
    title: "Bautismo",
    description: "Solicita una copia de tu partida de Bautismo.",
    type: "Baptism",
    icon: BookOpen,
  },
  {
    title: "Confirmación",
    description: "Solicita una copia de tu partida de Confirmación.",
    type: "Confirmation",
    icon: Cross,
  },
  {
    title: "Matrimonio",
    description: "Solicita una copia de tu partida de Matrimonio.",
    type: "Marriage",
    icon: Heart,
  },
]

export default function SolicitudPartidaFeligres() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const router = useRouter()

  // ✅ ACTUALIZADO: Usa cookies automáticamente
  const handleRequestDeparture = async (departureType: string) => {
    console.log("Botón presionado. Solicitando partida:", departureType)

    setLoadingStates((prev) => ({ ...prev, [departureType]: true }))
    console.log("🔐 Cookies del frontend:", document.cookie)
    try {
      const response = await fetch("https://api-parroquiasagradafamilia.onrender.com/requestDeparture/", {
        method: "POST",
        credentials: 'include', 
        headers: {
          "Content-Type": "application/json",
        },
        
        body: JSON.stringify({ departureType: departureType }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        
        // Si el usuario no está autenticado
        if (response.status === 401) {
          toast.error("Sesión expirada", {
            description: "Por favor, inicia sesión de nuevo.",
          })
          router.push("/login")
          return
        }

        // Error de partida no encontrada
        if (errorData.error?.includes("No se encontró una partida")) {
          throw new Error(`No tienes una partida de ${departureType.toLowerCase()} registrada en el sistema.`)
        }
        
        throw new Error(errorData.error || "Ocurrió un error en el servidor.")
      }

      await response.json()

      toast.success(`Solicitud de ${departureType.toLowerCase()} enviada.`, {
        description: "Recibirás el documento en tu correo una vez sea procesado.",
        duration: 6000,
      })
    } catch (error: any) {
      console.error("Error en la solicitud:", error)
      toast.error("No se pudo enviar la solicitud", {
        description: error.message,
      })
    } finally {
      setLoadingStates((prev) => ({ ...prev, [departureType]: false }))
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar items={sidebarItems} userRole="feligrés" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Solicitud de Partidas</h1>
          <p className="text-muted-foreground">Selecciona el tipo de partida sacramental que deseas solicitar.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partidaTypes.map((partida) => {
            const isLoading = loadingStates[partida.type] || false
            return (
              <Card key={partida.type} className="flex flex-col">
                <CardHeader className="flex-row items-center gap-4">
                  <partida.icon className="h-10 w-10 text-primary" />
                  <div>
                    <CardTitle>{partida.title}</CardTitle>
                    <CardDescription>{partida.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    <p>
                      Al solicitar, se buscará tu partida registrada en nuestro sistema y se generará una solicitud para
                      enviarte una copia digital.
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => handleRequestDeparture(partida.type)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      "Solicitar Partida"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}