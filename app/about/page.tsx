import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Church, ArrowLeft, MapPin, Phone, Mail, Clock } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <Church className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Sagrada Familia</h1>
                <p className="text-sm text-muted-foreground">Parroquia</p>
              </div>
            </Link>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">Acerca de Nosotros</h2>
            <p className="text-lg text-muted-foreground">
              Conoce más sobre nuestra historia, misión y la comunidad de la Parroquia Sagrada Familia
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <div>
              <img
                src="/beautiful-catholic-church-interior-with-stained-gl.jpg"
                alt="Interior de la Parroquia"
                className="w-full h-64 object-cover rounded-lg shadow-lg"
              />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-foreground">Nuestra Historia</h3>
              <p className="text-muted-foreground">
                La Parroquia Sagrada Familia fue fundada en 1952 con el propósito de servir a la comunidad local y
                proporcionar un lugar de encuentro espiritual para todas las familias del sector.
              </p>
              <p className="text-muted-foreground">
                Durante más de 70 años, hemos sido testigos del crecimiento de nuestra comunidad y hemos acompañado a
                miles de familias en sus momentos más importantes: bautismos, primeras comuniones, confirmaciones,
                matrimonios y despedidas.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="p-6">
              <h3 className="text-xl font-bold text-foreground mb-4">Nuestra Misión</h3>
              <p className="text-muted-foreground">
                Ser una comunidad de fe que acoge, acompaña y forma a las personas en su encuentro con Cristo,
                promoviendo valores cristianos y el servicio a los más necesitados.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-bold text-foreground mb-4">Nuestra Visión</h3>
              <p className="text-muted-foreground">
                Ser una parroquia misionera que irradie el amor de Cristo en la comunidad, siendo signo de esperanza y
                transformación social a través del Evangelio.
              </p>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="text-center p-6">
              <MapPin className="w-8 h-8 text-primary mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Dirección</h4>
              <p className="text-sm text-muted-foreground">
                Calle Principal #123
                <br />
                Barrio Centro
                <br />
                Ciudad, País
              </p>
            </Card>
            <Card className="text-center p-6">
              <Phone className="w-8 h-8 text-primary mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Teléfono</h4>
              <p className="text-sm text-muted-foreground">
                +57 (1) 234-5678
                <br />
                +57 (1) 234-5679
              </p>
            </Card>
            <Card className="text-center p-6">
              <Mail className="w-8 h-8 text-primary mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Email</h4>
              <p className="text-sm text-muted-foreground">
                info@sagradafamilia.org
                <br />
                parroco@sagradafamilia.org
              </p>
            </Card>
            <Card className="text-center p-6">
              <Clock className="w-8 h-8 text-primary mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Horarios</h4>
              <p className="text-sm text-muted-foreground">
                Lun-Vie: 8:00-18:00
                <br />
                Sáb-Dom: 7:00-20:00
              </p>
            </Card>
          </div>

          <Card className="p-8 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">Horarios de Misas</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Entre Semana</h4>
                <p className="text-muted-foreground">
                  Lunes a Viernes: 7:00 AM y 6:00 PM
                  <br />
                  Sábado: 7:00 AM y 6:00 PM
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Domingos y Festivos</h4>
                <p className="text-muted-foreground">8:00 AM, 10:00 AM, 12:00 PM y 6:00 PM</p>
              </div>
            </div>
          </Card>
        </div>
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
        </div>
      </footer>
    </div>
  )
}
