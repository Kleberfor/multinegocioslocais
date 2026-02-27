import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, CheckCircle, Clock, XCircle } from "lucide-react";
import { Decimal } from "@prisma/client/runtime/library";

type PagamentoWithContrato = {
  id: string;
  valor: Decimal;
  parcela: number;
  status: string;
  mpId: string | null;
  paidAt: Date | null;
  createdAt: Date;
  contrato: {
    id: string;
    parcelas: number;
    cliente: {
      nome: string;
      negocio: string;
    };
  };
};

async function getPagamentos(): Promise<PagamentoWithContrato[]> {
  const pagamentos = await prisma.pagamento.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      contrato: {
        include: {
          cliente: true,
        },
      },
    },
  });
  return pagamentos as PagamentoWithContrato[];
}

export default async function PagamentosPage() {
  const session = await auth();

  if (!session) {
    redirect("/admin/login");
  }

  const pagamentos = await getPagamentos();

  const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
    PENDENTE: { color: "bg-yellow-100 text-yellow-700", icon: Clock },
    PROCESSANDO: { color: "bg-blue-100 text-blue-700", icon: Clock },
    PAGO: { color: "bg-green-100 text-green-700", icon: CheckCircle },
    FALHOU: { color: "bg-red-100 text-red-700", icon: XCircle },
    CANCELADO: { color: "bg-gray-100 text-gray-700", icon: XCircle },
  };

  const totalPago = pagamentos
    .filter((p) => p.status === "PAGO")
    .reduce((acc, p) => acc + Number(p.valor), 0);

  const totalPendente = pagamentos
    .filter((p) => p.status === "PENDENTE" || p.status === "PROCESSANDO")
    .reduce((acc, p) => acc + Number(p.valor), 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Pagamentos</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Recebido</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {totalPago.toLocaleString("pt-BR")}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendente</p>
                <p className="text-2xl font-bold text-yellow-600">
                  R$ {totalPendente.toLocaleString("pt-BR")}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Transações</p>
                <p className="text-2xl font-bold">{pagamentos.length}</p>
              </div>
              <CreditCard className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium">ID MP</th>
                  <th className="text-left p-4 font-medium">Cliente</th>
                  <th className="text-left p-4 font-medium">Valor</th>
                  <th className="text-left p-4 font-medium">Parcela</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Data</th>
                  <th className="text-left p-4 font-medium">Pago em</th>
                </tr>
              </thead>
              <tbody>
                {pagamentos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      Nenhum pagamento encontrado
                    </td>
                  </tr>
                ) : (
                  pagamentos.map((pagamento) => {
                    const config = statusConfig[pagamento.status] || statusConfig.PENDENTE;
                    const StatusIcon = config.icon;

                    return (
                      <tr key={pagamento.id} className="border-b hover:bg-muted/30">
                        <td className="p-4">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {pagamento.mpId || "-"}
                          </code>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium">
                              {pagamento.contrato.cliente.nome}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {pagamento.contrato.cliente.negocio}
                            </p>
                          </div>
                        </td>
                        <td className="p-4 font-medium">
                          R$ {Number(pagamento.valor).toLocaleString("pt-BR")}
                        </td>
                        <td className="p-4">
                          {pagamento.parcela}/{pagamento.contrato.parcelas}
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}
                          >
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {pagamento.status}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(pagamento.createdAt).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {pagamento.paidAt
                            ? new Date(pagamento.paidAt).toLocaleDateString("pt-BR")
                            : "-"}
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
