"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Church, Users, Heart, BookOpen } from "lucide-react"
import Link from "next/link"

const carouselItems = [
  {
    title: "Campamentos",
    description: "Únete a nuestros campamentos de verano llenos de fe, diversión y aprendizaje.",
    icon: Users,
    image: "/children-camping-with-crosses-and-nature.jpg",
  },
  {
    title: "Cursos de Bautismo",
    description: "Prepárate para recibir el sacramento del bautismo con nuestros cursos especializados.",
    icon: Heart,
    image: "/baptism-ceremony-with-water-and-dove.jpg",
  },
  {
    title: "Cursos Prematrimoniales",
    description: "Fortalece tu relación y prepárate para el matrimonio cristiano.",
    icon: BookOpen,
    image: "/couple-praying-together-in-church.jpg",
  },
]

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselItems.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <Church className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Sagrada Familia</h1>
                <p className="text-sm text-muted-foreground">Parroquia</p>
              </div>
            </div>
            <nav className="flex space-x-4">
              <Link href="/login">
                <Button variant="outline">Iniciar Sesión</Button>
              </Link>
              <Link href="/register">
                <Button>Crear Cuenta</Button>
              </Link>
              <Link href="/about">
                <Button variant="ghost">Acerca de</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Welcome Image */}
          <div className="order-2 lg:order-1">
            <img
              src="/beautiful-catholic-church-interior-with-stained-gl.jpg"
              alt="Interior de la Parroquia Sagrada Familia"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>

          {/* Right Side - Carousel */}
          <div className="order-1 lg:order-2">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-foreground mb-2">Bienvenidos a nuestra comunidad</h2>
              <p className="text-muted-foreground">Descubre nuestros programas y actividades</p>
            </div>

            <Card className="relative overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-80">
                  <img
                    src={carouselItems[currentSlide].image || "/placeholder.svg"}
                    alt={carouselItems[currentSlide].title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-end">
                    <div className="p-6 text-white">
                      <div className="flex items-center space-x-2 mb-2">
                        {(() => {
                          const Icon = carouselItems[currentSlide].icon
                          return <Icon className="w-6 h-6" />
                        })()}
                        <h3 className="text-xl font-bold">{carouselItems[currentSlide].title}</h3>
                      </div>
                      <p className="text-sm opacity-90">{carouselItems[currentSlide].description}</p>
                    </div>
                  </div>
                </div>
              </CardContent>

              {/* Carousel Controls */}
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                onClick={prevSlide}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                onClick={nextSlide}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>

              {/* Carousel Indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {carouselItems.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentSlide ? "bg-white" : "bg-white/50"
                    }`}
                    onClick={() => setCurrentSlide(index)}
                  />
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Additional Info Section */}
        <section className="mt-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-2">Nuestra Misión</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Somos una comunidad de fe comprometida con el crecimiento espiritual y el servicio a nuestros hermanos,
              siguiendo las enseñanzas de Cristo.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center p-6">
              <Church className="w-12 h-12 text-primary mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">Celebraciones</h4>
              <p className="text-sm text-muted-foreground">
                Misas diarias y celebraciones especiales para toda la familia
              </p>
            </Card>
            <Card className="text-center p-6">
              <Users className="w-12 h-12 text-primary mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">Comunidad</h4>
              <p className="text-sm text-muted-foreground">
                Grupos de oración, catequesis y actividades para todas las edades
              </p>
            </Card>
            <Card className="text-center p-6">
              <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">Servicio</h4>
              <p className="text-sm text-muted-foreground">Obras de caridad y apoyo a las familias más necesitadas</p>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Church className="w-6 h-6 text-primary" />
            <span className="text-lg font-semibold">Parroquia Sagrada Familia</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 Parroquia Sagrada Familia. Todos los derechos reservados.
          </p>
          <p className="text-xs text-muted-foreground mt-2">Con amor y fe al servicio de nuestra comunidad</p>
        </div>
      </footer>
    </div>
  )
}
