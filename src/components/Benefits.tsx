import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart3,
  Search,
  TrendingUp,
  Zap,
  Target,
  DollarSign,
} from "lucide-react";

const benefits = [
  {
    icon: BarChart3,
    title: "Score de Presença Digital",
    description:
      "Receba uma nota de 0 a 100 baseada em fotos, avaliações, informações e atividade do seu perfil.",
  },
  {
    icon: Search,
    title: "Análise Detalhada",
    description:
      "Veja exatamente o que está funcionando e o que precisa melhorar na sua presença online.",
  },
  {
    icon: TrendingUp,
    title: "Oportunidades de Melhoria",
    description:
      "Lista personalizada de ações que você pode tomar para atrair mais clientes.",
  },
  {
    icon: Zap,
    title: "Resultado Instantâneo",
    description:
      "Análise em segundos. Sem espera, sem cadastro complicado, sem compromisso.",
  },
  {
    icon: Target,
    title: "Foco em Negócios Locais",
    description:
      "Especializado em restaurantes, lojas, clínicas, salões e outros negócios da sua região.",
  },
  {
    icon: DollarSign,
    title: "Aumente seu Faturamento",
    description:
      "Negócios com boa presença digital recebem até 70% mais clientes do Google.",
  },
];

export function Benefits() {
  return (
    <section id="beneficios" className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Por que analisar sua presença digital?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Seus clientes estão no Google procurando por negócios como o seu.
            Descubra se eles estão te encontrando.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card key={index} className="border-0 shadow-md">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
