import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

/**
 * Seed de DadosMercado
 * Preenche a tabela com estimativas de ticket médio e clientes potenciais
 * por segmento, baseado nos valores configurados em pricing-agent.ts.
 *
 * Fonte dos valores-base: SEBRAE 2024, Google Keyword Planner (médias nacionais)
 */
const DADOS_MERCADO = [
  // Alimentação
  {
    segmento: "restaurante",
    regiao: null,
    ticketMedio: 50,
    clientesPotenciaisMes: 500,
    fatorMultiplicador: 1.0,
    fonteTicket: "SEBRAE 2024 - Ticket médio alimentação fora do lar",
    fonteBuscas: "Google Keyword Planner - Volume médio de buscas por restaurantes",
    observacoes: "Dados base nacionais. Ajustar por região para maior precisão.",
  },
  {
    segmento: "bar",
    regiao: null,
    ticketMedio: 80,
    clientesPotenciaisMes: 400,
    fatorMultiplicador: 1.0,
    fonteTicket: "SEBRAE 2024 - Ticket médio bares e pubs",
    fonteBuscas: "Google Keyword Planner - Volume médio de buscas por bares",
    observacoes: "Dados base nacionais.",
  },
  // Saúde
  {
    segmento: "clinica-saude",
    regiao: null,
    ticketMedio: 200,
    clientesPotenciaisMes: 200,
    fatorMultiplicador: 1.2,
    fonteTicket: "ANS 2024 - Ticket médio consultas particulares",
    fonteBuscas: "Google Keyword Planner - Volume médio de buscas por clínicas",
    observacoes: "Ticket varia conforme especialidade. Valor médio de consulta particular.",
  },
  {
    segmento: "clinica-estetica",
    regiao: null,
    ticketMedio: 300,
    clientesPotenciaisMes: 150,
    fatorMultiplicador: 1.3,
    fonteTicket: "ABIHPEC 2024 - Ticket médio procedimentos estéticos",
    fonteBuscas: "Google Keyword Planner - Volume médio de buscas por estética",
    observacoes: "Segmento com alta margem e ticket elevado.",
  },
  {
    segmento: "dentista",
    regiao: null,
    ticketMedio: 250,
    clientesPotenciaisMes: 180,
    fatorMultiplicador: 1.2,
    fonteTicket: "CFO 2024 - Ticket médio consultas odontológicas",
    fonteBuscas: "Google Keyword Planner - Volume médio de buscas por dentistas",
    observacoes: "Ticket médio considerando consultas e procedimentos básicos.",
  },
  {
    segmento: "farmacia",
    regiao: null,
    ticketMedio: 60,
    clientesPotenciaisMes: 350,
    fatorMultiplicador: 1.1,
    fonteTicket: "ABRAFARMA 2024 - Ticket médio farmácias",
    fonteBuscas: "Google Keyword Planner - Volume médio de buscas por farmácias",
    observacoes: "Alta rotatividade, ticket baixo. Volume de buscas concentrado em plantão.",
  },
  // Serviços Profissionais
  {
    segmento: "advocacia",
    regiao: null,
    ticketMedio: 500,
    clientesPotenciaisMes: 100,
    fatorMultiplicador: 1.4,
    fonteTicket: "OAB 2024 - Honorários médios por consulta",
    fonteBuscas: "Google Keyword Planner - Volume médio de buscas por advogados",
    observacoes: "Ticket elevado mas volume de busca menor. Alta concorrência em centros urbanos.",
  },
  {
    segmento: "contabilidade",
    regiao: null,
    ticketMedio: 350,
    clientesPotenciaisMes: 80,
    fatorMultiplicador: 1.3,
    fonteTicket: "CFC 2024 - Honorários médios contábeis",
    fonteBuscas: "Google Keyword Planner - Volume médio de buscas por contadores",
    observacoes: "Segmento com clientes recorrentes e baixa rotatividade.",
  },
  // Varejo
  {
    segmento: "varejo",
    regiao: null,
    ticketMedio: 100,
    clientesPotenciaisMes: 600,
    fatorMultiplicador: 1.0,
    fonteTicket: "SBVC 2024 - Ticket médio varejo brasileiro",
    fonteBuscas: "Google Keyword Planner - Volume médio de buscas por lojas",
    observacoes: "Volume alto de buscas. Ticket varia por nicho específico.",
  },
  // Imobiliário
  {
    segmento: "imobiliaria",
    regiao: null,
    ticketMedio: 5000,
    clientesPotenciaisMes: 60,
    fatorMultiplicador: 1.8,
    fonteTicket: "CRECI 2024 - Comissão média imobiliária",
    fonteBuscas: "Google Keyword Planner - Volume médio de buscas por imóveis",
    observacoes: "Ticket altíssimo mas volume de transações menor. ROI por cliente é o maior entre os segmentos.",
  },
  // Automotivo
  {
    segmento: "concessionaria",
    regiao: null,
    ticketMedio: 50000,
    clientesPotenciaisMes: 30,
    fatorMultiplicador: 2.0,
    fonteTicket: "FENABRAVE 2024 - Ticket médio veículos",
    fonteBuscas: "Google Keyword Planner - Volume médio de buscas por carros",
    observacoes: "Maior ticket entre todos os segmentos. Ciclo de venda mais longo.",
  },
  // Educação
  {
    segmento: "educacao",
    regiao: null,
    ticketMedio: 300,
    clientesPotenciaisMes: 120,
    fatorMultiplicador: 1.3,
    fonteTicket: "INEP 2024 - Mensalidade média ensino superior",
    fonteBuscas: "Google Keyword Planner - Volume médio de buscas por cursos",
    observacoes: "Ticket médio considerando mensalidades. Sazonalidade alta (início de semestre).",
  },
  // Serviços Gerais
  {
    segmento: "servicos",
    regiao: null,
    ticketMedio: 150,
    clientesPotenciaisMes: 250,
    fatorMultiplicador: 1.2,
    fonteTicket: "SEBRAE 2024 - Ticket médio prestação de serviços",
    fonteBuscas: "Google Keyword Planner - Volume médio de buscas por serviços",
    observacoes: "Categoria ampla. Ajustar conforme nicho específico do cliente.",
  },
  // Outro (fallback)
  {
    segmento: "outro",
    regiao: null,
    ticketMedio: 120,
    clientesPotenciaisMes: 200,
    fatorMultiplicador: 1.0,
    fonteTicket: "Estimativa baseada na média de todos os segmentos",
    fonteBuscas: "Estimativa conservadora para segmentos não catalogados",
    observacoes: "Valores genéricos para segmentos não mapeados. Refinar quando houver dados específicos.",
  },
];

async function main() {
  console.log("🌱 Iniciando seed de DadosMercado...\n");

  let criados = 0;
  let atualizados = 0;

  for (const dados of DADOS_MERCADO) {
    const existing = await prisma.dadosMercado.findFirst({
      where: {
        segmento: dados.segmento,
        regiao: dados.regiao ?? null,
      },
    });

    if (existing) {
      await prisma.dadosMercado.update({
        where: { id: existing.id },
        data: dados,
      });
      atualizados++;
      console.log(`  🔄 ${dados.segmento}: atualizado`);
    } else {
      await prisma.dadosMercado.create({
        data: dados,
      });
      criados++;
      console.log(`  ✅ ${dados.segmento}: criado`);
    }
  }

  console.log(`\n📊 Resultado: ${criados} criados, ${atualizados} atualizados`);
  console.log(`📈 Total de registros: ${await prisma.dadosMercado.count()}`);
  console.log("✅ Seed de DadosMercado concluído!");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
