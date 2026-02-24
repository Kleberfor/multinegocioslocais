import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Criar usuário admin padrão
  const adminEmail = "admin@multinegocioslocais.com.br";
  const adminPassword = "admin123"; // Trocar em produção!

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Administrador",
        password: hashedPassword,
        role: "admin",
      },
    });

    console.log("Admin user created:");
    console.log(`  Email: ${adminEmail}`);
    console.log(`  Password: ${adminPassword}`);
  } else {
    console.log("Admin user already exists");
  }

  // Criar planos padrão
  const planos = [
    {
      id: "plano-6-meses",
      nome: "Plano 6 Meses",
      descricao: "Ideal para começar",
      implantacao: 3000,
      mensalidade: 500,
      parcelas: 6,
    },
    {
      id: "plano-12-meses",
      nome: "Plano 12 Meses",
      descricao: "Melhor custo-benefício",
      implantacao: 3000,
      mensalidade: 500,
      parcelas: 12,
    },
  ];

  for (const plano of planos) {
    const existing = await prisma.plano.findUnique({
      where: { id: plano.id },
    });

    if (!existing) {
      await prisma.plano.create({
        data: plano,
      });
      console.log(`Plano created: ${plano.nome}`);
    }
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
