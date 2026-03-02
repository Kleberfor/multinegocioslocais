import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building,
  FileText,
  Calendar,
  DollarSign,
  Download,
  MessageSquare,
  Pencil,
} from "lucide-react";
import { getCurrentUser } from "@/lib/get-current-user";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClienteDetalhePage({ params }: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { id } = await params;

  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: {
      contratos: {
        orderBy: { createdAt: "desc" },
        include: {
          pagamentos: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
      lead: {
        select: {
          id: true,
          scoreGeral: true,
          pesquisaEm: true,
        },
      },
      plano: true,
    },
  });

  if (!cliente) {
    notFound();
  }

  const formatCpfCnpj = (value: string) => {
    const clean = value.replace(/\D/g, "");
    if (clean.length === 11) {
      return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else if (clean.length === 14) {
      return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    }
    return value;
  };

  const endereco = cliente.endereco as {
    rua?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
  } | null;

  const statusColors: Record<string, string> = {
    PENDENTE: "bg-yellow-100 text-yellow-700",
    ASSINADO: "bg-blue-100 text-blue-700",
    PAGO: "bg-green-100 text-green-700",
    CANCELADO: "bg-red-100 text-red-700",
  };

  const totalContratos = cliente.contratos.reduce(
    (acc, c) => acc + Number(c.valor),
    0
  );

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/clientes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{cliente.nome}</h1>
            <p className="text-muted-foreground">{cliente.negocio}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {cliente.telefone && (
            <a
              href={`https://wa.me/55${cliente.telefone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="gap-2">
                <MessageSquare className="w-4 h-4 text-green-600" />
                WhatsApp
              </Button>
            </a>
          )}
          <a href={`mailto:${cliente.email}`}>
            <Button variant="outline" className="gap-2">
              <Mail className="w-4 h-4" />
              Email
            </Button>
          </a>
          <Link href={`/admin/clientes/${id}/editar`}>
            <Button variant="outline" className="gap-2">
              <Pencil className="w-4 h-4" />
              Editar
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Coluna Principal */}
        <div className="md:col-span-2 space-y-6">
          {/* Dados do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações do Cliente</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{cliente.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <a
                    href={`https://wa.me/55${cliente.telefone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-green-600 hover:underline"
                  >
                    {cliente.telefone}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CPF/CNPJ</p>
                  <p className="font-medium font-mono">
                    {formatCpfCnpj(cliente.cpfCnpj)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Negócio</p>
                  <p className="font-medium">{cliente.negocio}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cliente desde</p>
                  <p className="font-medium">
                    {new Date(cliente.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      timeZone: "America/Sao_Paulo",
                    })}
                  </p>
                </div>
              </div>

              {cliente.plano && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-purple-700 font-bold text-sm">P</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Plano</p>
                    <p className="font-medium">{cliente.plano.nome}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Endereço */}
          {endereco && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Endereço</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  {endereco.rua}
                  {endereco.numero && `, ${endereco.numero}`}
                  {endereco.complemento && ` - ${endereco.complemento}`}
                </p>
                <p className="text-muted-foreground">
                  {endereco.bairro && `${endereco.bairro} - `}
                  {endereco.cidade}/{endereco.estado}
                  {endereco.cep && ` - CEP: ${endereco.cep}`}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Contratos */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Contratos</CardTitle>
              <span className="text-sm text-muted-foreground">
                {cliente.contratos.length} contrato(s)
              </span>
            </CardHeader>
            <CardContent>
              {cliente.contratos.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum contrato encontrado
                </p>
              ) : (
                <div className="space-y-4">
                  {cliente.contratos.map((contrato) => (
                    <div
                      key={contrato.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            #{contrato.id.substring(0, 8)}
                          </code>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              statusColors[contrato.status] || statusColors.PENDENTE
                            }`}
                          >
                            {contrato.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(contrato.createdAt).toLocaleDateString("pt-BR", {
                            timeZone: "America/Sao_Paulo",
                          })}{" "}
                          • {contrato.parcelas}x de R${" "}
                          {(Number(contrato.valor) / contrato.parcelas).toLocaleString(
                            "pt-BR",
                            { minimumFractionDigits: 2 }
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-bold text-green-600">
                          R$ {Number(contrato.valor).toLocaleString("pt-BR")}
                        </p>
                        <div className="flex gap-2">
                          <Link href={`/admin/contratos/${contrato.id}`}>
                            <Button variant="outline" size="sm">
                              Ver
                            </Button>
                          </Link>
                          <Link
                            href={`/api/contratos/${contrato.id}/pdf`}
                            target="_blank"
                          >
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Coluna Lateral */}
        <div className="space-y-6">
          {/* Resumo Financeiro */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Resumo Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total em Contratos</span>
                <span className="font-bold text-green-600">
                  R$ {totalContratos.toLocaleString("pt-BR")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Contratos</span>
                <span className="font-medium">{cliente.contratos.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Pagos</span>
                <span className="font-medium text-green-600">
                  {cliente.contratos.filter((c) => c.status === "PAGO").length}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Lead de Origem */}
          {cliente.lead && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lead de Origem</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Score</span>
                    <span
                      className={`font-bold ${
                        (cliente.lead.scoreGeral || 0) >= 70
                          ? "text-green-600"
                          : (cliente.lead.scoreGeral || 0) >= 40
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {cliente.lead.scoreGeral}/100
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data da Pesquisa</span>
                    <span className="text-sm">
                      {new Date(cliente.lead.pesquisaEm).toLocaleDateString("pt-BR", {
                        timeZone: "America/Sao_Paulo",
                      })}
                    </span>
                  </div>
                </div>
                <Link href={`/admin/leads/${cliente.lead.id}`} className="block mt-4">
                  <Button variant="outline" className="w-full">
                    Ver Lead Original
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
