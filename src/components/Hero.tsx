import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-20 md:py-32">
      <div className="container relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-block px-4 py-1 mb-4 text-sm font-medium text-primary bg-primary/10 rounded-full">
            Diagnóstico Gratuito em 2 Minutos
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Seu negócio está{" "}
            <span className="text-primary">invisível</span> para{" "}
            <span className="text-red-500">46%</span> dos clientes que buscam você agora
          </h1>

          <p className="mt-6 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
            Descubra em 2 minutos como sua presença digital está afetando suas vendas.
            Receba um score de visibilidade e saiba exatamente o que fazer para
            atrair mais clientes.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/analisar">
              <Button size="lg" className="text-lg px-8 h-14 shadow-lg hover:shadow-xl transition-shadow">
                Descobrir Meu Score de Visibilidade
              </Button>
            </Link>
            <Link href="#como-funciona">
              <Button variant="outline" size="lg" className="text-lg px-8 h-14">
                Como Funciona
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-sm text-muted-foreground flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Mais de 500 negócios já analisaram sua presença digital
          </p>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
      </div>
    </section>
  );
}
