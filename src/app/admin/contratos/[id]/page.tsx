import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Download,
  FileText,
  Calendar,
  DollarSign,
  User,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { getCurrentUser } from "@/lib/get-current-user";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ContratoDetalhePage({ params }: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { id } = await params;

  const contrato = await prisma.contrato.findUnique({
    where: { id },
    include: {
      cliente: true,
      pagamentos: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!contrato) {
    notFound();
  }

  const statusColors: Record<string, { bg: string; icon: React.ElementType }> = {
    PENDENTE: { bg: "bg-yellow-100 text-yellow-700", icon: Clock },
    ASSINADO: { bg: "bg-blue-100 text-blue-700", icon: FileText },
    PAGO: { bg: "bg-green-100 text-green-700", icon: CheckCircle },
    CANCELADO: { bg: "bg-red-100 text-red-700", icon: XCircle },
  };

  const statusConfig = statusColors[contrato.status] || statusColors.PENDENTE;
  const StatusIcon = statusConfig.icon;

  const valorParcela = Number(contrato.valor) / contrato.parcelas;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/contratos">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">
                Contrato #{contrato.id.substring(0, 8).toUpperCase()}
              </h1>
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg}`}
              >
                <StatusIcon className="w-4 h-4" />
                {contrato.status}
              </span>
            </div>
            <p className="text-muted-foreground">
              {contrato.cliente.nome} - {contrato.cliente.negocio}
            </p>
          </div>
        </div>
        <Link href={`/api/contratos/${contrato.id}/pdf`} target="_blank">
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            Baixar PDF
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Coluna Principal */}
        <div className="md:col-span-2 space-y-6">
          {/* Dados do Contrato */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Detalhes do Contrato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {Number(contrato.valor).toLocaleString("pt-BR")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Parcelas</p>
                  <p className="text-xl font-medium">
                    {contrato.parcelas}x de R${" "}
                    {valorParcela.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Criação</p>
                    <p className="font-medium">
                      {new Date(contrato.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        timeZone: "America/Sao_Paulo",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Última Atualização</p>
                    <p className="font-medium">
                      {new Date(contrato.updatedAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        timeZone: "America/Sao_Paulo",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pagamentos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Histórico de Pagamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contrato.pagamentos.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum pagamento registrado
                </p>
              ) : (
                <div className="space-y-3">
                  {contrato.pagamentos.map((pagamento) => (
                    <div
                      key={pagamento.id}
                      className="flex justify-between items-center p-3 border rounded-lg"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              pagamento.status === "PAGO"
                                ? "bg-green-100 text-green-700"
                                : pagamento.status === "PENDENTE"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {pagamento.status}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            Parcela {pagamento.parcela}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(pagamento.createdAt).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            timeZone: "America/Sao_Paulo",
                          })}
                        </p>
                      </div>
                      <p className="font-bold">
                        R$ {Number(pagamento.valor).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Coluna Lateral */}
        <div className="space-y-6">
          {/* Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{contrato.cliente.nome}</p>
                <p className="text-sm text-muted-foreground">
                  {contrato.cliente.negocio}
                </p>
              </div>
              <div className="text-sm space-y-1">
                <p>{contrato.cliente.email}</p>
                <a
                  href={`https://wa.me/55${contrato.cliente.telefone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline"
                >
                  {contrato.cliente.telefone}
                </a>
              </div>
              <Link href={`/admin/clientes/${contrato.cliente.id}`}>
                <Button variant="outline" className="w-full mt-2">
                  Ver Cliente
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Ações */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link
                href={`/api/contratos/${contrato.id}/pdf`}
                target="_blank"
                className="block"
              >
                <Button variant="outline" className="w-full gap-2">
                  <Download className="w-4 h-4" />
                  Baixar PDF
                </Button>
              </Link>
              <a
                href={`mailto:${contrato.cliente.email}?subject=Contrato ${contrato.id.substring(0, 8).toUpperCase()}`}
                className="block"
              >
                <Button variant="outline" className="w-full gap-2">
                  <DollarSign className="w-4 h-4" />
                  Enviar por Email
                </Button>
              </a>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                  <div>
                    <p className="text-sm font-medium">Contrato Criado</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(contrato.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        timeZone: "America/Sao_Paulo",
                      })}
                    </p>
                  </div>
                </div>
                {contrato.status === "PAGO" && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                    <div>
                      <p className="text-sm font-medium">Pagamento Confirmado</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(contrato.updatedAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          timeZone: "America/Sao_Paulo",
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
