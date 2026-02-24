"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "A analise e realmente gratuita?",
    answer: "Sim, a analise e 100% gratuita e sem compromisso. Voce recebe seu score de visibilidade digital e um resumo dos principais pontos de melhoria sem pagar nada.",
  },
  {
    question: "Quanto tempo leva para fazer a analise?",
    answer: "A analise e instantanea. Em poucos segundos voce recebe seu score e pode ver como esta sua presenca digital no Google, site e redes sociais.",
  },
  {
    question: "O que e analisado?",
    answer: "Analisamos seu Google Business Profile (fotos, avaliacoes, informacoes), seu site (velocidade, SEO, seguranca) e sua presenca em redes sociais. Tudo isso gera um score de 0 a 100.",
  },
  {
    question: "Como posso melhorar meu score?",
    answer: "Apos a analise, oferecemos um servico de otimizacao completo. Nossa equipe cuida de tudo: fotos profissionais, respostas a avaliacoes, otimizacao de site e muito mais.",
  },
  {
    question: "Preciso ter um site para fazer a analise?",
    answer: "Nao e obrigatorio. Analisamos seu Google Business Profile mesmo sem site. Porem, ter um site bem otimizado aumenta significativamente sua visibilidade e credibilidade.",
  },
  {
    question: "Quanto custa o servico de otimizacao?",
    answer: "O valor varia de acordo com as necessidades do seu negocio. Apos a analise gratuita, apresentamos uma proposta personalizada com tudo que esta incluido.",
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
            Tire suas duvidas sobre a analise de presenca digital
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
