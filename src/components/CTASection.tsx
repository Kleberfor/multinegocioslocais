import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/logo-white.png"
              alt="MultiNegócios Locais"
              width={200}
              height={45}
              className="h-12 w-auto"
            />
          </div>

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Cada dia sem otimização = clientes perdidos
          </h2>

          <p className="mt-4 text-lg opacity-90 max-w-xl mx-auto">
            Enquanto você espera, seus concorrentes estão capturando os clientes
            que deveriam ser seus. Descubra seu score em 2 minutos e veja exatamente
            o que está perdendo.
          </p>

          <div className="mt-8">
            <Link href="/analisar">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 h-14 font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Descobrir Meu Score Agora
              </Button>
            </Link>
          </div>

          <p className="mt-4 text-sm opacity-75 flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            2 minutos para descobrir quanto você está perdendo
          </p>
        </div>
      </div>
    </section>
  );
}
