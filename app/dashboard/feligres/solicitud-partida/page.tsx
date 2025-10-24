"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ClipboardList, Calendar, History, Loader2, BookOpen, Heart, Cross } from "lucide-react"

// --- Sidebar Items (sin cambios) ---
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

// 1. Datos para las tarjetas. Fácil de modificar o añadir más en el futuro.
const partidaTypes = [
  {
    title: "Bautismo",
    description: "Solicita una copia de tu partida de Bautismo.",
    type: "Baptism", // Este es el valor que espera tu API
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
  // 2. Estado para manejar la carga de cada botón individualmente.
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  // 3. La función clave que se comunica con tu backend.
  const handleRequestDeparture = async (departureType: string) => {
    console.log("Botón presionado. Solicitando partida:", departureType);

  
    // Activa el estado de carga para el botón específico que fue presionado
    setLoadingStates((prev) => ({ ...prev, [departureType]: true }))

    const token = localStorage.getItem("tokenSession")

    if (!token) {
      toast.error("Error de autenticación.", {
        description: "Por favor, inicia sesión de nuevo para continuar.",
      })
      setLoadingStates((prev) => ({ ...prev, [departureType]: false }))
      return
    }

    try {
      const response = await fetch("https://api-parroquia.onrender.com/requestDeparture/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ departureType: departureType }), // Enviamos solo el tipo de partida
      })

      if (!response.ok) {
        const errorData = await response.json()
        // El error "No se encontró una partida para este usuario" es común, lo personalizamos.
        if (errorData.error.includes("No se encontró una partida")) {
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
      // Desactiva el estado de carga para el botón, ya sea que la petición haya sido exitosa o fallida.
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

        {/* 4. Contenedor para las tarjetas, usando una grilla responsive */}
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