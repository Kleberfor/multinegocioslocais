import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    const contrato = await prisma.contrato.findUnique({
      where: { id },
      include: {
        cliente: true,
      },
    });

    if (!contrato) {
      return NextResponse.json(
        { error: "Contrato não encontrado" },
        { status: 404 }
      );
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

    const valorParcela = Number(contrato.valor) / contrato.parcelas;
    const dataContrato = new Date(contrato.createdAt).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "America/Sao_Paulo",
    });

    // Gerar HTML do contrato para conversão em PDF
    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contrato #${contrato.id.substring(0, 8).toUpperCase()}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: #333;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #2563eb;
            font-size: 24px;
            margin-bottom: 5px;
          }
          .header p {
            color: #666;
            font-size: 12px;
          }
          .contract-id {
            background: #f3f4f6;
            padding: 10px 20px;
            border-radius: 8px;
            display: inline-block;
            margin-top: 15px;
          }
          .contract-id code {
            font-size: 16px;
            font-weight: bold;
            color: #1f2937;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 8px;
            margin-bottom: 15px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }
          .info-item {
            background: #f9fafb;
            padding: 12px;
            border-radius: 6px;
          }
          .info-label {
            font-size: 11px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .info-value {
            font-size: 14px;
            font-weight: 500;
            color: #1f2937;
            margin-top: 4px;
          }
          .valor-destaque {
            background: #ecfdf5;
            border: 1px solid #a7f3d0;
          }
          .valor-destaque .info-value {
            font-size: 20px;
            color: #059669;
          }
          .servicos-list {
            background: #f9fafb;
            border-radius: 8px;
            overflow: hidden;
          }
          .servico-item {
            display: flex;
            justify-content: space-between;
            padding: 12px 15px;
            border-bottom: 1px solid #e5e7eb;
          }
          .servico-item:last-child {
            border-bottom: none;
          }
          .servico-nome {
            font-weight: 500;
          }
          .servico-valor {
            color: #059669;
            font-weight: 600;
          }
          .footer {
            margin-top: 50px;
            padding-top: 30px;
            border-top: 1px solid #e5e7eb;
          }
          .assinatura-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-top: 60px;
          }
          .assinatura-box {
            text-align: center;
          }
          .assinatura-linha {
            border-top: 1px solid #333;
            padding-top: 10px;
            margin-top: 50px;
          }
          .assinatura-nome {
            font-weight: 500;
          }
          .assinatura-doc {
            font-size: 12px;
            color: #666;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
          }
          .status-pago { background: #dcfce7; color: #166534; }
          .status-assinado { background: #dbeafe; color: #1e40af; }
          .status-pendente { background: #fef3c7; color: #92400e; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>MULTINEGÓCIOS LOCAIS</h1>
          <p>Transformando negócios locais através da presença digital</p>
          <div class="contract-id">
            <code>CONTRATO #${contrato.id.substring(0, 8).toUpperCase()}</code>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">Dados do Contratante</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Nome / Razão Social</div>
              <div class="info-value">${contrato.cliente.nome}</div>
            </div>
            <div class="info-item">
              <div class="info-label">CPF / CNPJ</div>
              <div class="info-value">${formatCpfCnpj(contrato.cliente.cpfCnpj)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">E-mail</div>
              <div class="info-value">${contrato.cliente.email}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Telefone</div>
              <div class="info-value">${contrato.cliente.telefone}</div>
            </div>
            <div class="info-item" style="grid-column: span 2;">
              <div class="info-label">Negócio</div>
              <div class="info-value">${contrato.cliente.negocio}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">Detalhes do Contrato</h2>
          <div class="info-grid">
            <div class="info-item valor-destaque">
              <div class="info-label">Valor Total</div>
              <div class="info-value">R$ ${Number(contrato.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Condição de Pagamento</div>
              <div class="info-value">${contrato.parcelas}x de R$ ${valorParcela.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Data do Contrato</div>
              <div class="info-value">${dataContrato}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Status</div>
              <div class="info-value">
                <span class="status-badge status-${contrato.status.toLowerCase()}">${contrato.status}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">Termos e Condições</h2>
          <p style="text-align: justify; margin-bottom: 10px;">
            O presente contrato tem por objeto a prestação de serviços de marketing digital e
            otimização de presença online para o estabelecimento do CONTRATANTE, conforme
            especificações detalhadas nos serviços contratados.
          </p>
          <p style="text-align: justify; margin-bottom: 10px;">
            O CONTRATANTE declara estar ciente e de acordo com todas as condições estabelecidas
            neste instrumento, comprometendo-se a fornecer as informações necessárias para a
            execução dos serviços.
          </p>
          <p style="text-align: justify;">
            O prazo para início dos trabalhos é de até 5 (cinco) dias úteis após a confirmação
            do pagamento, e o prazo de entrega será acordado conforme complexidade dos serviços.
          </p>
        </div>

        <div class="footer">
          <div class="assinatura-grid">
            <div class="assinatura-box">
              <div class="assinatura-linha">
                <div class="assinatura-nome">MultiNegócios Locais</div>
                <div class="assinatura-doc">CONTRATADA</div>
              </div>
            </div>
            <div class="assinatura-box">
              <div class="assinatura-linha">
                <div class="assinatura-nome">${contrato.cliente.nome}</div>
                <div class="assinatura-doc">${formatCpfCnpj(contrato.cliente.cpfCnpj)}</div>
              </div>
            </div>
          </div>
          <p style="text-align: center; margin-top: 40px; font-size: 12px; color: #666;">
            Documento gerado eletronicamente em ${new Date().toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "America/Sao_Paulo",
            })}
          </p>
        </div>
      </body>
      </html>
    `;

    // Retornar HTML com headers para download/impressão
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="contrato-${contrato.id.substring(0, 8)}.html"`,
      },
    });
  } catch (error) {
    console.error("Erro ao gerar PDF do contrato:", error);
    return NextResponse.json(
      { error: "Erro ao gerar PDF" },
      { status: 500 }
    );
  }
}
