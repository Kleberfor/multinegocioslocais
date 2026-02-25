import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Carlos Silva",
    business: "Restaurante Sabor da Casa",
    segment: "Restaurante",
    location: "Santo André, SP",
    text: "Em 45 dias as ligações aumentaram 150%. Antes recebia 3-4 por dia, agora são mais de 10. O investimento se pagou no primeiro mês.",
    rating: 5,
    results: "+150% ligações",
  },
  {
    name: "Ana Paula Ferreira",
    business: "Studio Beauty AP",
    segment: "Salão de Beleza",
    location: "São Bernardo, SP",
    text: "Minhas avaliações subiram de 3.8 para 4.9 em 60 dias. Clientes novos chegam dizendo que me encontraram no Google. Lotei minha agenda!",
    rating: 5,
    results: "De 3.8 para 4.9",
  },
  {
    name: "Dr. Roberto Mendes",
    business: "Clínica Odonto Plus",
    segment: "Dentista",
    location: "São Caetano, SP",
    text: "O agendamento online triplicou após as otimizações. Descobri que meu site demorava 12 segundos para carregar - clientes desistiam!",
    rating: 5,
    results: "3x agendamentos",
  },
];

export function Testimonials() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Resultados Reais de Negócios Locais
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Veja como negócios como o seu transformaram sua presença digital
            e aumentaram o faturamento
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-md relative overflow-hidden">
              {/* Badge de resultado */}
              <div className="absolute top-4 right-4 bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">
                {testimonial.results}
              </div>

              <CardContent className="pt-6">
                <Quote className="w-8 h-8 text-primary/30 mb-4" />

                <p className="text-muted-foreground mb-4 italic">
                  &quot;{testimonial.text}&quot;
                </p>

                <div className="flex items-center gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.business}</div>
                  <div className="text-xs text-muted-foreground">{testimonial.location}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
