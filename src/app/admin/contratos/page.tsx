import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Decimal } from "@prisma/client/runtime/library";

type ContratoWithCliente = {
  id: string;
  valor: Decimal;
  parcelas: number;
  status: string;
  createdAt: Date;
  cliente: {
    nome: string;
    negocio: string;
  };
};

async function getContratos(): Promise<ContratoWithCliente[]> {
  const contratos = await prisma.contrato.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      cliente: true,
      pagamentos: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
  return contratos as ContratoWithCliente[];
}

export default async function ContratosPage() {
  const session = await auth();

  if (!session) {
    redirect("/admin/login");
  }

  const contratos = await getContratos();

  const statusColors: Record<string, string> = {
    PENDENTE: "bg-yellow-100 text-yellow-700",
    ASSINADO: "bg-blue-100 text-blue-700",
    PAGO: "bg-green-100 text-green-700",
    CANCELADO: "bg-red-100 text-red-700",
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Contratos</h1>
        <p className="text-muted-foreground">
          {contratos.length} contratos
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium">ID</th>
                  <th className="text-left p-4 font-medium">Cliente</th>
                  <th className="text-left p-4 font-medium">Negócio</th>
                  <th className="text-left p-4 font-medium">Valor</th>
                  <th className="text-left p-4 font-medium">Parcelas</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {contratos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      Nenhum contrato encontrado
                    </td>
                  </tr>
                ) : (
                  contratos.map((contrato) => (
                    <tr key={contrato.id} className="border-b hover:bg-muted/30">
                      <td className="p-4">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {contrato.id.substring(0, 8)}
                        </code>
                      </td>
                      <td className="p-4">
                        <p className="font-medium">{contrato.cliente.nome}</p>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {contrato.cliente.negocio}
                      </td>
                      <td className="p-4 font-medium">
                        R$ {Number(contrato.valor).toLocaleString("pt-BR")}
                      </td>
                      <td className="p-4">
                        {contrato.parcelas}x
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            statusColors[contrato.status] || statusColors.PENDENTE
                          }`}
                        >
                          {contrato.status}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(contrato.createdAt).toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
