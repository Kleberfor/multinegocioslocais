import { AlertTriangle, CheckCircle2 } from "lucide-react";

const problems = [
  "Clientes procuram seu serviço mas encontram o concorrente",
  "Poucas avaliações fazem parecer que você é novo no mercado",
  "Perfil incompleto passa impressão de negócio abandonado",
  "Site lento faz 53% dos visitantes desistirem",
  "Você não sabe quantos clientes está perdendo por dia",
];

const solutions = [
  "Apareça no topo quando clientes buscarem seu serviço",
  "Mais avaliações positivas geram confiança instantânea",
  "Perfil completo converte 7x mais visitantes em clientes",
  "Site rápido e otimizado para celular",
  "Dashboard com métricas reais de performance",
];

export function ProblemSolution() {
  return (
    <section className="py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            97% dos consumidores pesquisam online antes de comprar local
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Enquanto você lê isso, clientes estão buscando seu serviço no Google.
            A pergunta é: eles estão encontrando você ou seu concorrente?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Problemas */}
          <div className="bg-red-50 border border-red-100 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="text-xl font-semibold text-red-900">O Problema</h3>
            </div>
            <ul className="space-y-3">
              {problems.map((problem, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-700 text-xs font-bold">!</span>
                  </div>
                  <span className="text-red-800">{problem}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Soluções */}
          <div className="bg-green-50 border border-green-100 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-semibold text-green-900">A Solução</h3>
            </div>
            <ul className="space-y-3">
              {solutions.map((solution, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-green-800">{solution}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
