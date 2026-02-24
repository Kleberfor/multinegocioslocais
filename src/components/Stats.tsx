import { TrendingUp, Users, Star, Clock } from "lucide-react";

const stats = [
  {
    icon: TrendingUp,
    value: "46%",
    label: "das buscas no Google são locais",
    description: "Pessoas procurando negócios perto delas",
  },
  {
    icon: Users,
    value: "76%",
    label: "visitam em 24 horas",
    description: "Quem busca local vai até o estabelecimento",
  },
  {
    icon: Star,
    value: "4.5+",
    label: "é a nota mínima esperada",
    description: "Clientes preferem negócios bem avaliados",
  },
  {
    icon: Clock,
    value: "3 seg",
    label: "para perder um cliente",
    description: "Sites lentos afastam visitantes",
  },
];

export function Stats() {
  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Você sabia?
          </h2>
          <p className="mt-2 opacity-90">
            Dados que mostram a importância da presença digital para negócios locais
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7" />
                </div>
                <div className="text-4xl font-bold mb-1">{stat.value}</div>
                <div className="font-medium mb-1">{stat.label}</div>
                <div className="text-sm opacity-75">{stat.description}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
