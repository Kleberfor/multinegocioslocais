import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Eye, MessageSquare } from "lucide-react";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { ClientesFilters } from "@/components/admin/clientes-filters";
import { getCurrentUser } from "@/lib/get-current-user";

type ClienteWithContratos = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpfCnpj: string;
  negocio: string;
  createdAt: Date;
  contratos: {
    id: string;
    valor: Prisma.Decimal;
    status: string;
  }[];
};

interface SearchParams {
  search?: string;
  status?: string;
}

async function getClientes(filters: SearchParams): Promise<ClienteWithContratos[]> {
  const where: Prisma.ClienteWhereInput = {};

  // Filtro de busca por texto
  if (filters.search) {
    where.OR = [
      { nome: { contains: filters.search, mode: "insensitive" } },
      { negocio: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
      { cpfCnpj: { contains: filters.search } },
    ];
  }

  // Filtro de status do contrato
  if (filters.status && filters.status !== "all") {
    where.contratos = {
      some: { status: filters.status },
    };
  }

  const clientes = await prisma.cliente.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      contratos: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
  return clientes as ClienteWithContratos[];
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function ClientesPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/admin/login");
  }

  const params = await searchParams;
  const clientes = await getClientes(params);

  const hasFilters = params.search || params.status;

  const formatCpfCnpj = (value: string) => {
    const clean = value.replace(/\D/g, "");
    if (clean.length === 11) {
      return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else if (clean.length === 14) {
      return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    }
    return value;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">
            {clientes.length} clientes {hasFilters ? "encontrados" : "cadastrados"}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <ClientesFilters />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium">Cliente</th>
                  <th className="text-left p-4 font-medium">Negócio</th>
                  <th className="text-left p-4 font-medium">CPF/CNPJ</th>
                  <th className="text-left p-4 font-medium">Contato</th>
                  <th className="text-left p-4 font-medium">Contrato</th>
                  <th className="text-left p-4 font-medium">Valor</th>
                  <th className="text-left p-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {clientes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      {hasFilters
                        ? "Nenhum cliente encontrado com os filtros aplicados."
                        : "Nenhum cliente cadastrado"}
                    </td>
                  </tr>
                ) : (
                  clientes.map((cliente) => {
                    const contrato = cliente.contratos[0];
                    return (
                      <tr key={cliente.id} className="border-b hover:bg-muted/30">
                        <td className="p-4">
                          <p className="font-medium">{cliente.nome}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-muted-foreground">{cliente.negocio}</p>
                        </td>
                        <td className="p-4 font-mono text-sm">
                          {formatCpfCnpj(cliente.cpfCnpj)}
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <a
                              href={`mailto:${cliente.email}`}
                              className="flex items-center text-sm text-muted-foreground hover:text-primary"
                            >
                              <Mail className="w-3 h-3 mr-1" />
                              {cliente.email}
                            </a>
                            <a
                              href={`https://wa.me/55${cliente.telefone.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-sm text-green-600 hover:underline"
                            >
                              <MessageSquare className="w-3 h-3 mr-1" />
                              {cliente.telefone}
                            </a>
                          </div>
                        </td>
                        <td className="p-4">
                          {contrato ? (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                contrato.status === "PAGO"
                                  ? "bg-green-100 text-green-700"
                                  : contrato.status === "ASSINADO"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {contrato.status}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          {contrato ? (
                            <p className="font-medium text-green-600">
                              R$ {Number(contrato.valor).toLocaleString("pt-BR")}
                            </p>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Link href={`/admin/clientes/${cliente.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                Ver
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
