import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const users = await prisma.user.count();
    console.log('Users:', users);

    const prospects = await prisma.prospect.count();
    console.log('Prospects:', prospects);

    const leads = await prisma.lead.count();
    console.log('Leads:', leads);

    const clientes = await prisma.cliente.count();
    console.log('Clientes:', clientes);

    const contratos = await prisma.contrato.count();
    console.log('Contratos:', contratos);

    const interacoes = await prisma.interacao.count();
    console.log('Interações:', interacoes);

    console.log('\n=== Banco de dados limpo e pronto para testes! ===');

    if (users > 0) {
      const allUsers = await prisma.user.findMany({ select: { email: true, name: true, role: true } });
      console.log('\nUsuários existentes:');
      allUsers.forEach(u => console.log(' -', u.email, '(' + u.role + ')'));
    }
  } catch (error) {
    console.error('Erro:', error);
  }
}

main().finally(() => prisma.$disconnect());
