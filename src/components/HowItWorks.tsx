const steps = [
  {
    number: "1",
    title: "Digite o nome do seu negócio",
    description:
      "Basta informar o nome da sua empresa como aparece no Google. Nós encontramos automaticamente.",
  },
  {
    number: "2",
    title: "Receba sua análise instantânea",
    description:
      "Em segundos, você recebe um relatório completo com score, pontos fortes e oportunidades de melhoria.",
  },
  {
    number: "3",
    title: "Melhore sua presença digital",
    description:
      "Use as recomendações para otimizar seu perfil ou contrate nossa equipe para fazer isso por você.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Como funciona
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Processo simples e rápido. Em menos de 1 minuto você tem seu
            diagnóstico completo.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative text-center">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-primary/20" />
              )}

              {/* Step number */}
              <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">
                {step.number}
              </div>

              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
