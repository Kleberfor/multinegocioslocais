import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-20 md:py-32">
      <div className="container relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Descubra como está a{" "}
            <span className="text-primary">presença digital</span> do seu
            negócio
          </h1>

          <p className="mt-6 text-lg text-muted-foreground md:text-xl">
            Análise gratuita e instantânea do seu Google Business Profile.
            Receba um score de 0 a 100 e descubra oportunidades de melhoria para
            atrair mais clientes.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/analisar">
              <Button size="lg" className="text-lg px-8">
                Analisar Meu Negócio Grátis
              </Button>
            </Link>
            <Link href="#como-funciona">
              <Button variant="outline" size="lg" className="text-lg px-8">
                Como Funciona
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Análise 100% gratuita. Sem compromisso.
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
