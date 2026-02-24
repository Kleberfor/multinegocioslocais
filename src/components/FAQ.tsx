"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "A análise é realmente gratuita?",
    answer: "Sim, a análise é 100% gratuita e sem compromisso. Você recebe seu score de visibilidade digital e um resumo dos principais pontos de melhoria sem pagar nada.",
  },
  {
    question: "Quanto tempo leva para fazer a análise?",
    answer: "A análise é instantânea. Em poucos segundos você recebe seu score e pode ver como está sua presença digital no Google, site e redes sociais.",
  },
  {
    question: "O que é analisado?",
    answer: "Analisamos seu Google Business Profile (imagens, avaliações, informações), seu site (velocidade, SEO, segurança) e sua presença em redes sociais. Tudo isso gera um score de 0 a 100.",
  },
  {
    question: "Como posso melhorar meu score?",
    answer: "Após a análise, oferecemos um serviço de otimização completo. Nossa equipe cuida de tudo: imagens profissionais, respostas a avaliações, otimização de site e muito mais.",
  },
  {
    question: "Preciso ter um site para fazer a análise?",
    answer: "Não é obrigatório. Analisamos seu Google Business Profile mesmo sem site. Porém, ter um site bem otimizado aumenta significativamente sua visibilidade e credibilidade.",
  },
  {
    question: "Quanto custa o serviço de otimização?",
    answer: "O valor varia de acordo com as necessidades do seu negócio. Após a análise gratuita, apresentamos uma proposta personalizada com tudo que está incluído.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Perguntas Frequentes
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Tire suas dúvidas sobre a análise de presença digital
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
              >
                <span className="font-medium pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-4 pb-4 text-muted-foreground">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
