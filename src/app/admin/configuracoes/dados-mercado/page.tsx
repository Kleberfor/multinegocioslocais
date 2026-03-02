import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/get-current-user";
import { SEGMENTOS_LIST } from "@/lib/segmentos";
import { DadosMercadoForm } from "@/components/admin/dados-mercado-form";
import { Database, TrendingUp, Info } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getDadosMercado() {
  const dados = await prisma.dadosMercado.findMany({
    where: { regiao: null }, // Apenas dados base (sem região)
    orderBy: { segmento: "asc" },
  });

  // Criar mapa
  const dadosMap = new Map<string, typeof dados[0]>();
  dados.forEach((d) => dadosMap.set(d.segmento, d));

  // Mesclar com segmentos
  return SEGMENTOS_LIST.map((seg) => {
    const dado = dadosMap.get(seg.value);
    return {
      segmento: seg.value,
      nome: seg.label,
      ticketMedio: dado ? Number(dado.ticketMedio) : null,
      clientesPotenciaisMes: dado?.clientesPotenciaisMes || null,
      fatorMultiplicador: dado ? Number(dado.fatorMultiplicador) : 1.0,
      fonteTicket: dado?.fonteTicket || null,
      fonteBuscas: dado?.fonteBuscas || null,
      observacoes: dado?.observacoes || null,
      atualizadoEm: dado?.updatedAt || null,
      atualizadoPor: dado?.atualizadoPor || null,
    };
  });
}

export default async function DadosMercadoPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/admin/login");
  }

  if (user.role !== "admin") {
    redirect("/admin/dashboard");
  }

  const dados = await getDadosMercado();

  const configurados = dados.filter((d) => d.ticketMedio !== null).length;
  const pendentes = dados.length - configurados;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="w-8 h-8" />
            Dados de Mercado
          </h1>
          <p className="text-muted-foreground">
            Configure os valores de referência para cálculo de propostas
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Segmentos</p>
                <p className="text-2xl font-bold">{dados.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Configurados</p>
                <p className="text-2xl font-bold text-green-600">{configurados}</p>
              </div>
              <Database className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Usando Padrão</p>
                <p className="text-2xl font-bold text-yellow-600">{pendentes}</p>
              </div>
              <Info className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instruções */}
      <Card className="mb-6 bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 text-lg">
            Como usar os dados de mercado
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-700 space-y-2">
          <p>
            <strong>Ticket Médio:</strong> Valor médio de compra por cliente no segmento.
            Use dados do SEBRAE ou pesquisa com negócios locais.
          </p>
          <p>
            <strong>Clientes Potenciais/Mês:</strong> Estimativa de pessoas que buscam
            online por serviços desse segmento na região. Use Google Keyword Planner.
          </p>
          <p>
            <strong>Fator Multiplicador:</strong> Ajuste de complexidade (1.0 = padrão).
            Segmentos mais complexos como advocacia podem ter fator 1.3-1.5.
          </p>
          <p className="pt-2 border-t border-blue-200">
            Segmentos não configurados usam valores padrão do sistema.
          </p>
        </CardContent>
      </Card>

      {/* Lista de Segmentos */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração por Segmento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dados.map((dado) => (
              <DadosMercadoForm key={dado.segmento} dado={dado} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
