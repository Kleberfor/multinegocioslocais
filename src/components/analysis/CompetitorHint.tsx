"use client";

import { TrendingUp, TrendingDown, Minus, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface CompetitorHintProps {
  userScore: number;
  segmento?: string;
  cidade?: string;
}

// Médias estimadas por segmento (baseado em dados de mercado)
const SEGMENT_AVERAGES: Record<string, number> = {
  restaurante: 62,
  pizzaria: 58,
  hamburgueria: 55,
  lanchonete: 52,
  padaria: 60,
  cafeteria: 65,
  bar: 48,
  academia: 68,
  salao_beleza: 55,
  barbearia: 52,
  clinica_medica: 72,
  clinica_odontologica: 70,
  clinica_estetica: 63,
  pet_shop: 58,
  veterinario: 65,
  loja_roupas: 50,
  loja_calcados: 48,
  loja_acessorios: 45,
  supermercado: 65,
  mercado: 55,
  farmacia: 70,
  otica: 60,
  imobiliaria: 55,
  escritorio_advocacia: 58,
  escritorio_contabil: 55,
  auto_mecanica: 45,
  auto_eletrica: 42,
  auto_funilaria: 40,
  lava_rapido: 48,
  hotel: 72,
  pousada: 65,
  escola: 68,
  curso_idiomas: 62,
  escola_musica: 55,
  outro: 55,
};

// Média geral do mercado
const MARKET_AVERAGE = 55;

export function CompetitorHint({
  userScore,
  segmento,
  cidade
}: CompetitorHintProps) {
  // Obter média do segmento ou usar média geral
  const segmentAverage = segmento
    ? SEGMENT_AVERAGES[segmento] || MARKET_AVERAGE
    : MARKET_AVERAGE;

  // Calcular diferença
  const difference = userScore - segmentAverage;
  const percentageDiff = Math.abs(Math.round((difference / segmentAverage) * 100));

  // Determinar status
  const isAbove = difference > 5;
  const isBelow = difference < -5;

  // Cores e ícones baseados no status
  const getStatusConfig = () => {
    if (isAbove) {
      return {
        bgColor: "bg-green-50 border-green-200",
        textColor: "text-green-700",
        icon: TrendingUp,
        iconColor: "text-green-600",
        message: `Você está ${percentageDiff}% acima da média`,
        description: cidade
          ? `Seu negócio tem uma presença digital melhor que a maioria dos concorrentes em ${cidade}.`
          : "Seu negócio tem uma presença digital melhor que a maioria dos concorrentes do seu segmento.",
      };
    }
    if (isBelow) {
      return {
        bgColor: "bg-amber-50 border-amber-200",
        textColor: "text-amber-700",
        icon: TrendingDown,
        iconColor: "text-amber-600",
        message: `Você está ${percentageDiff}% abaixo da média`,
        description: cidade
          ? `Negócios similares em ${cidade} têm presença digital mais forte. Há oportunidade de se destacar!`
          : "Negócios do seu segmento têm presença digital mais forte. Há uma grande oportunidade de se destacar!",
      };
    }
    return {
      bgColor: "bg-blue-50 border-blue-200",
      textColor: "text-blue-700",
      icon: Minus,
      iconColor: "text-blue-600",
      message: "Você está na média do mercado",
      description: "Sua presença digital está alinhada com os concorrentes. Melhorias podem te colocar à frente!",
    };
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  // Nome amigável do segmento
  const getSegmentName = (seg?: string) => {
    const names: Record<string, string> = {
      restaurante: "restaurantes",
      pizzaria: "pizzarias",
      hamburgueria: "hamburguerias",
      lanchonete: "lanchonetes",
      padaria: "padarias",
      cafeteria: "cafeterias",
      bar: "bares",
      academia: "academias",
      salao_beleza: "salões de beleza",
      barbearia: "barbearias",
      clinica_medica: "clínicas médicas",
      clinica_odontologica: "clínicas odontológicas",
      clinica_estetica: "clínicas de estética",
      pet_shop: "pet shops",
      veterinario: "clínicas veterinárias",
      loja_roupas: "lojas de roupas",
      supermercado: "supermercados",
      farmacia: "farmácias",
      hotel: "hotéis",
      pousada: "pousadas",
      outro: "negócios locais",
    };
    return seg ? names[seg] || "negócios do seu segmento" : "negócios locais";
  };

  return (
    <Card className={`${config.bgColor} border`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${config.iconColor}`} />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Users className={`w-4 h-4 ${config.textColor}`} />
              <span className={`text-sm font-medium ${config.textColor}`}>
                Comparação com Concorrentes
              </span>
            </div>

            <p className={`font-semibold ${config.textColor}`}>
              {config.message}
            </p>

            <p className={`text-sm mt-1 ${config.textColor} opacity-90`}>
              {config.description}
            </p>

            {/* Barra visual de comparação */}
            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className={config.textColor}>Seu score</span>
                <span className={`font-medium ${config.textColor}`}>{userScore}</span>
              </div>
              <div className="relative h-2 bg-white/50 rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-current rounded-full transition-all"
                  style={{
                    width: `${Math.min(userScore, 100)}%`,
                    color: isAbove ? '#16a34a' : isBelow ? '#d97706' : '#2563eb'
                  }}
                />
                {/* Marcador da média */}
                <div
                  className="absolute top-0 w-0.5 h-full bg-gray-600"
                  style={{ left: `${segmentAverage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className={config.textColor}>
                  Média {getSegmentName(segmento)}
                </span>
                <span className={`font-medium ${config.textColor}`}>{segmentAverage}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
