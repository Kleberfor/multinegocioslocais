import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Carlos Silva",
    business: "Restaurante Sabor da Casa",
    segment: "Restaurante",
    text: "Depois de otimizar meu Google Business, as ligações aumentaram muito. Clientes novos dizem que me encontraram no Google.",
    rating: 5,
  },
  {
    name: "Ana Paula",
    business: "Studio Beauty AP",
    segment: "Salao de Beleza",
    text: "Nao sabia que meu perfil estava tao incompleto. Com as melhorias, minhas avaliacoes subiram de 3.8 para 4.7 em 2 meses.",
    rating: 5,
  },
  {
    name: "Roberto Mendes",
    business: "Clinica Odonto Plus",
    segment: "Dentista",
    text: "A analise mostrou problemas no meu site que eu nem imaginava. Depois de corrigir, o agendamento online triplicou.",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            O que dizem nossos clientes
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Negocios que transformaram sua presenca digital e viram resultados reais
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-md">
              <CardContent className="pt-6">
                <Quote className="w-8 h-8 text-primary/30 mb-4" />

                <p className="text-muted-foreground mb-4 italic">
                  "{testimonial.text}"
                </p>

                <div className="flex items-center gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.business}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
