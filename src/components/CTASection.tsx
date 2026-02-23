import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Pronto para descobrir seu score?
          </h2>

          <p className="mt-4 text-lg opacity-90">
            Análise gratuita e sem compromisso. Veja agora mesmo como está a
            presença digital do seu negócio e receba recomendações
            personalizadas.
          </p>

          <div className="mt-8">
            <Link href="/analisar">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 font-semibold"
              >
                Analisar Meu Negócio Agora
              </Button>
            </Link>
          </div>

          <p className="mt-4 text-sm opacity-75">
            Mais de 500 negócios já analisaram sua presença digital
          </p>
        </div>
      </div>
    </section>
  );
}
