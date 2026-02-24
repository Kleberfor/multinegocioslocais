// Geração de Contrato
// S-3.2: Template e geração de contrato

// Dados da empresa contratada (via variáveis de ambiente)
const EMPRESA = {
  razaoSocial: process.env.EMPRESA_RAZAO_SOCIAL || "MultiNegócios Locais Ltda",
  cnpj: process.env.EMPRESA_CNPJ || "00.000.000/0001-00",
  endereco: process.env.EMPRESA_ENDERECO || "São Paulo/SP",
};

export interface ContractData {
  // Contratante
  clienteNome: string;
  clienteCpfCnpj: string;
  clienteEndereco: string;
  clienteEmail: string;
  clienteTelefone: string;

  // Negócio
  negocioNome: string;

  // Valores
  valorImplantacao: number;
  valorMensalidade: number;
  parcelas: number;
  valorTotal: number;

  // Datas
  dataContrato: string;
  dataVencimentoPrimeiraParcela: string;

  // IDs
  contratoId: string;
}

export function generateContractHTML(data: ContractData): string {
  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Contrato de Prestação de Serviços - ${data.contratoId}</title>
  <style>
    body {
      font-family: 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
    }
    h1 {
      text-align: center;
      font-size: 16pt;
      margin-bottom: 30px;
    }
    h2 {
      font-size: 14pt;
      margin-top: 25px;
      margin-bottom: 10px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .header img {
      max-width: 200px;
    }
    .contract-number {
      text-align: right;
      font-size: 10pt;
      color: #666;
    }
    .parties {
      margin: 20px 0;
    }
    .clause {
      margin: 15px 0;
      text-align: justify;
    }
    .signatures {
      margin-top: 60px;
      display: flex;
      justify-content: space-between;
    }
    .signature-box {
      width: 45%;
      text-align: center;
    }
    .signature-line {
      border-top: 1px solid #333;
      margin-top: 60px;
      padding-top: 10px;
    }
    .footer {
      margin-top: 40px;
      font-size: 10pt;
      color: #666;
      text-align: center;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #f5f5f5;
    }
  </style>
</head>
<body>
  <div class="contract-number">
    Contrato Nº ${data.contratoId}
  </div>

  <h1>CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE<br>MARKETING DIGITAL E GESTÃO DE PRESENÇA ONLINE</h1>

  <div class="parties">
    <p><strong>CONTRATADA:</strong> ${EMPRESA.razaoSocial.toUpperCase()}, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº ${EMPRESA.cnpj}, com sede em ${EMPRESA.endereco}, neste ato representada por seu representante legal, doravante denominada simplesmente <strong>CONTRATADA</strong>.</p>

    <p><strong>CONTRATANTE:</strong> ${data.clienteNome}, inscrito(a) no CPF/CNPJ sob o nº ${data.clienteCpfCnpj}, residente/estabelecido(a) em ${data.clienteEndereco}, e-mail ${data.clienteEmail}, telefone ${data.clienteTelefone}, proprietário(a) do estabelecimento comercial denominado "${data.negocioNome}", doravante denominado(a) simplesmente <strong>CONTRATANTE</strong>.</p>
  </div>

  <p class="clause">As partes acima qualificadas têm entre si justo e contratado o presente instrumento particular de prestação de serviços, que se regerá pelas cláusulas e condições seguintes:</p>

  <h2>CLÁUSULA PRIMEIRA - DO OBJETO</h2>
  <p class="clause">1.1. O presente contrato tem por objeto a prestação de serviços de marketing digital e gestão de presença online para o estabelecimento comercial do CONTRATANTE, incluindo:</p>
  <p class="clause">a) Otimização e gestão do Perfil de Empresa no Google (Google Business Profile);</p>
  <p class="clause">b) Análise e monitoramento de presença digital;</p>
  <p class="clause">c) Gestão de avaliações e reputação online;</p>
  <p class="clause">d) Relatórios mensais de desempenho;</p>
  <p class="clause">e) Suporte técnico via e-mail e WhatsApp.</p>

  <h2>CLÁUSULA SEGUNDA - DO PREÇO E FORMA DE PAGAMENTO</h2>
  <p class="clause">2.1. Pelos serviços prestados, o CONTRATANTE pagará à CONTRATADA os seguintes valores:</p>

  <table>
    <tr>
      <th>Descrição</th>
      <th>Valor</th>
    </tr>
    <tr>
      <td>Taxa de Implantação (única)</td>
      <td>${formatCurrency(data.valorImplantacao)}</td>
    </tr>
    <tr>
      <td>Mensalidade (${data.parcelas} parcelas)</td>
      <td>${formatCurrency(data.valorMensalidade)}/mês</td>
    </tr>
    <tr>
      <td><strong>Valor Total do Contrato</strong></td>
      <td><strong>${formatCurrency(data.valorTotal)}</strong></td>
    </tr>
  </table>

  <p class="clause">2.2. O pagamento da taxa de implantação deverá ser realizado no ato da assinatura deste contrato.</p>
  <p class="clause">2.3. As mensalidades serão pagas até o dia 10 de cada mês, com vencimento da primeira parcela em ${formatDate(data.dataVencimentoPrimeiraParcela)}.</p>
  <p class="clause">2.4. O não pagamento de qualquer parcela no prazo estipulado acarretará multa de 2% (dois por cento) e juros de mora de 1% (um por cento) ao mês.</p>

  <h2>CLÁUSULA TERCEIRA - DO PRAZO</h2>
  <p class="clause">3.1. O presente contrato terá vigência de ${data.parcelas} (${data.parcelas === 6 ? "seis" : "doze"}) meses, contados a partir da data de sua assinatura.</p>
  <p class="clause">3.2. Findo o prazo inicial, o contrato será automaticamente renovado por períodos iguais e sucessivos, salvo manifestação em contrário de qualquer das partes, com antecedência mínima de 30 (trinta) dias.</p>

  <h2>CLÁUSULA QUARTA - DAS OBRIGAÇÕES DA CONTRATADA</h2>
  <p class="clause">4.1. Prestar os serviços descritos na Cláusula Primeira com zelo e profissionalismo.</p>
  <p class="clause">4.2. Manter sigilo sobre todas as informações do CONTRATANTE.</p>
  <p class="clause">4.3. Fornecer relatórios mensais de desempenho.</p>
  <p class="clause">4.4. Disponibilizar suporte técnico em horário comercial.</p>

  <h2>CLÁUSULA QUINTA - DAS OBRIGAÇÕES DO CONTRATANTE</h2>
  <p class="clause">5.1. Efetuar os pagamentos nas datas estipuladas.</p>
  <p class="clause">5.2. Fornecer as informações e acessos necessários para execução dos serviços.</p>
  <p class="clause">5.3. Comunicar à CONTRATADA qualquer alteração em seus dados cadastrais.</p>

  <h2>CLÁUSULA SEXTA - DA RESCISÃO</h2>
  <p class="clause">6.1. O presente contrato poderá ser rescindido por qualquer das partes, mediante aviso prévio de 30 (trinta) dias.</p>
  <p class="clause">6.2. Em caso de rescisão antecipada pelo CONTRATANTE, será devida multa de 20% (vinte por cento) sobre o valor restante do contrato.</p>

  <h2>CLÁUSULA SÉTIMA - DO FORO</h2>
  <p class="clause">7.1. Fica eleito o Foro da Comarca de São Paulo/SP para dirimir quaisquer dúvidas oriundas do presente contrato.</p>

  <p class="clause">E por estarem assim justos e contratados, as partes assinam o presente instrumento em 2 (duas) vias de igual teor e forma.</p>

  <p class="clause" style="text-align: center;">São Paulo, ${formatDate(data.dataContrato)}.</p>

  <div class="signatures">
    <div class="signature-box">
      <div class="signature-line">
        <strong>CONTRATADA</strong><br>
        ${EMPRESA.razaoSocial}
      </div>
    </div>
    <div class="signature-box">
      <div class="signature-line">
        <strong>CONTRATANTE</strong><br>
        ${data.clienteNome}
      </div>
    </div>
  </div>

  <div class="footer">
    <p>Documento gerado eletronicamente em ${formatDate(data.dataContrato)}</p>
    <p>MultiNegócios Locais - www.multinegocioslocais.com.br</p>
  </div>
</body>
</html>
`;
}
