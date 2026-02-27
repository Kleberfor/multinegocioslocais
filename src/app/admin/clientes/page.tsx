import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone } from "lucide-react";
import { Decimal } from "@prisma/client/runtime/library";

type ClienteWithContratos = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpfCnpj: string;
  negocio: string;
  contratos: {
    id: string;
    valor: Decimal;
    status: string;
  }[];
};

async function getClientes(): Promise<ClienteWithContratos[]> {
  const clientes = await prisma.cliente.findMany({
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

export default async function ClientesPage() {
  const session = await auth();

  if (!session) {
    redirect("/admin/login");
  }

  const clientes = await getClientes();

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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <p className="text-muted-foreground">
          {clientes.length} clientes cadastrados
        </p>
      </div>

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
                </tr>
              </thead>
              <tbody>
                {clientes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      Nenhum cliente cadastrado
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
                              href={`tel:${cliente.telefone}`}
                              className="flex items-center text-sm text-muted-foreground hover:text-primary"
                            >
                              <Phone className="w-3 h-3 mr-1" />
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
                            <p className="font-medium">
                              R$ {Number(contrato.valor).toLocaleString("pt-BR")}
                            </p>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
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
