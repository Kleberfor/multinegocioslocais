# Blueprint V2 - MultiNegócios Locais

## Visão Geral

Reformulação completa da plataforma para aumentar conversão e justificar valores de R$6.000+.

**Problema atual:** A análise gratuita mostra TUDO, permitindo que o cliente corrija sozinho.

**Solução:** Criar jornada de valor com análise em 2 níveis + agente de precificação inteligente.

---

## Arquitetura do Novo Fluxo

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           JORNADA DO USUÁRIO V2                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. LANDING PAGE EDUCATIVA                                                   │
│     └── Conteúdo de valor sobre presença digital                            │
│     └── Estatísticas e cases de sucesso                                     │
│     └── CTA: "Descubra seu Score de Visibilidade"                           │
│                                                                              │
│  2. CAPTURA DE DADOS (LEAD)                                                  │
│     └── Nome, Email, Telefone, WhatsApp                                     │
│     └── Nome do negócio                                                     │
│     └── URL do site (opcional)                                              │
│                                                                              │
│  3. ANÁLISE NÍVEL 1 (GRATUITA)                                              │
│     └── Score geral 0-100                                                   │
│     └── Ranking visual (vermelho/amarelo/verde)                             │
│     └── Comparativo com concorrentes                                        │
│     └── "O que você está perdendo" (sem mostrar COMO corrigir)              │
│                                                                              │
│  4. PROPOSTA PERSONALIZADA                                                   │
│     └── Agente de Precificação calcula valor                                │
│     └── Diagnóstico detalhado                                               │
│     └── Plano de ação com ROI estimado                                      │
│     └── Opções de pagamento                                                 │
│                                                                              │
│  5. CONTRATAÇÃO                                                              │
│     └── Aceite do contrato                                                  │
│     └── Pagamento (PIX/Cartão/Boleto)                                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Fase 1: Agente de Precificação

### 1.1 Inputs do Agente

| Input | Fonte | Peso |
|-------|-------|------|
| Score Google Business (0-100) | API Google Places | 30% |
| Score do Site (0-100) | Análise automática | 30% |
| Segmento do negócio | Cadastro do lead | 15% |
| Número de avaliações | API Google Places | 10% |
| Presença em redes sociais | Verificação manual/API | 10% |
| Concorrência local | API Google Places | 5% |

### 1.2 Lógica de Precificação

```javascript
// Fórmula base
const oportunidade = 100 - scoreGeral; // Quanto pior, maior oportunidade
const ticketMedioSegmento = SEGMENTOS[segmento].ticketMedio;
const fatorConcorrencia = calcularFatorConcorrencia(concorrentes);

// Valor sugerido
const valorBase = 6000; // Mínimo
const valorMaximo = 15000;
const valorSugerido = valorBase + (oportunidade * 90); // R$90 por ponto de oportunidade

// Ajustes
const valorFinal = valorSugerido * fatorConcorrencia * fatorSegmento;

// Retorno
return {
  valorImplantacao: Math.min(Math.max(valorFinal, valorBase), valorMaximo),
  valorMensal: valorFinal * 0.15, // 15% do valor de implantação
  roiEstimado: calcularROI(ticketMedioSegmento, oportunidade),
  justificativa: gerarJustificativa(inputs)
};
```

### 1.3 Segmentos e Ticket Médio

| Segmento | Ticket Médio | Fator |
|----------|--------------|-------|
| Restaurante | R$50 | 1.0 |
| Clínica/Saúde | R$200 | 1.5 |
| Escritório Advocacia | R$500 | 2.0 |
| Imobiliária | R$5.000 | 2.5 |
| Concessionária | R$50.000 | 3.0 |
| Varejo | R$100 | 1.0 |
| Serviços | R$150 | 1.2 |
| Educação | R$300 | 1.3 |

### 1.4 Output do Agente

```typescript
interface PropostaPrecificacao {
  valorImplantacao: number;      // R$6.000 - R$15.000
  valorMensal?: number;          // Opcional: gestão contínua
  parcelamento: {
    parcelas: number;            // 1x, 3x, 6x, 12x
    valorParcela: number;
  }[];
  roiEstimado: {
    clientesAdicionais: number;  // Estimativa de novos clientes/mês
    faturamentoAdicional: number;// Estimativa de faturamento adicional
    retornoMeses: number;        // Em quantos meses recupera investimento
  };
  justificativa: string[];       // Lista de pontos que justificam o valor
  prioridades: {
    item: string;
    impacto: 'alto' | 'medio' | 'baixo';
    descricao: string;
  }[];
}
```

---

## Fase 2: Sistema de Análise Reformulado

### 2.1 Análise Google Business (existente - ajustar)

**Métricas atuais:**
- Avaliações (quantidade e nota)
- Fotos
- Horário de funcionamento
- Informações de contato
- Categorias

**Ajustes necessários:**
- Mostrar apenas SCORE, não detalhes de correção
- Adicionar comparativo com concorrentes
- Calcular "potencial perdido" em clientes

### 2.2 Análise de Site (NOVO)

| Métrica | Peso | Como Medir |
|---------|------|------------|
| Velocidade (Core Web Vitals) | 25% | API PageSpeed Insights |
| Mobile-friendly | 20% | API PageSpeed Insights |
| SSL/HTTPS | 15% | Verificação direta |
| SEO básico (title, meta, h1) | 20% | Scraping |
| Indexação Google | 10% | API Search Console ou site:dominio |
| Responsividade | 10% | API PageSpeed Insights |

**Se não tem site:** Score = 0 (oportunidade máxima)

### 2.3 Níveis de Análise

**NÍVEL 1 - Gratuito (após cadastro):**
```
┌─────────────────────────────────────────┐
│  SEU SCORE DE VISIBILIDADE DIGITAL      │
│                                         │
│            ╭───────╮                    │
│            │  47   │  ← Score geral     │
│            │ /100  │                    │
│            ╰───────╯                    │
│                                         │
│  Google Business    ████████░░  78/100  │
│  Site               ██░░░░░░░░  23/100  │
│  Redes Sociais      ████░░░░░░  40/100  │
│                                         │
│  ⚠️ Você está perdendo aproximadamente  │
│     R$12.000/mês em clientes            │
│                                         │
│  [Receber Proposta Personalizada]       │
└─────────────────────────────────────────┘
```

**NÍVEL 2 - Proposta (gerada pelo agente):**
- Diagnóstico completo por área
- Plano de ação detalhado
- Valores e formas de pagamento
- ROI estimado

---

## Fase 3: Landing Page Educativa

### 3.1 Estrutura de Seções

1. **Hero**
   - Headline: "Seu negócio está invisível para 46% dos clientes que buscam você agora"
   - Subheadline: "Descubra em 2 minutos como sua presença digital está afetando suas vendas"
   - CTA: "Fazer Diagnóstico Gratuito"

2. **O Problema** (Dor)
   - Estatística: "97% dos consumidores pesquisam online antes de comprar local"
   - 3 problemas comuns: Perfil desatualizado, Site lento/inexistente, Zero estratégia

3. **A Solução** (3 Pilares)
   - Google Business Profile otimizado
   - Site profissional e rápido
   - Presença integrada em redes sociais
   - *(Visão geral, sem ensinar como fazer)*

4. **Resultados** (Prova Social)
   - Cases de sucesso (antes/depois)
   - Depoimentos
   - Números: "+150% de ligações", "+80% de visitas"

5. **Como Funciona** (Processo)
   - Passo 1: Diagnóstico gratuito
   - Passo 2: Proposta personalizada
   - Passo 3: Implementação por especialistas
   - Passo 4: Resultados em 30 dias

6. **FAQ**
   - Quanto custa?
   - Quanto tempo leva?
   - Preciso de site?
   - Como funciona o suporte?

7. **CTA Final**
   - "Descubra seu Score de Visibilidade"
   - Formulário de captura ou botão

### 3.2 Copywriting - Tom de Voz

- **Autoridade:** Dados e estatísticas reais
- **Urgência:** "Cada dia sem otimização = clientes perdidos"
- **Empatia:** "Sabemos que você está ocupado gerenciando seu negócio"
- **Clareza:** Sem jargões técnicos

---

## Fase 4: Novo Fluxo de Conversão

### 4.1 Páginas a Criar/Modificar

| Página | Status | Descrição |
|--------|--------|-----------|
| `/` | Modificar | Landing Page Educativa |
| `/analisar` | Modificar | Formulário de captura de leads |
| `/resultado/[id]` | Modificar | Análise Nível 1 (apenas scores) |
| `/proposta/[id]` | NOVO | Proposta gerada pelo agente |
| `/contratar/dados` | Manter | Dados para contrato |
| `/contratar/contrato` | Manter | Assinatura |
| `/contratar/checkout` | Manter | Pagamento |

### 4.2 Modelo de Dados - Ajustes

```prisma
// Adicionar ao schema.prisma

model Lead {
  id          String    @id @default(cuid())
  nome        String
  email       String
  telefone    String
  whatsapp    String?
  negocio     String
  siteUrl     String?

  // Análise
  scoreGeral  Int?
  scoreGBP    Int?
  scoreSite   Int?
  scoreRedes  Int?
  analise     Json?

  // Proposta
  proposta    Json?
  valorSugerido Decimal? @db.Decimal(10, 2)

  // Conversão
  convertido  Boolean   @default(false)
  clienteId   String?
  cliente     Cliente?  @relation(fields: [clienteId], references: [id])

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([email])
  @@index([convertido])
}

// Adicionar relação em Cliente
model Cliente {
  // ... campos existentes
  lead        Lead?
}
```

---

## Cronograma de Implementação

### Sprint 1: Agente de Precificação
- [ ] Criar lib/pricing-agent.ts
- [ ] Definir segmentos e fatores
- [ ] Implementar lógica de cálculo
- [ ] Criar API /api/pricing
- [ ] Testes

### Sprint 2: Análise de Sites
- [ ] Integrar PageSpeed Insights API
- [ ] Criar lib/site-analysis.ts
- [ ] Modificar lib/scoring.ts
- [ ] Criar análise combinada (GBP + Site)
- [ ] Testes

### Sprint 3: Landing Page Educativa
- [ ] Criar componentes de seções
- [ ] Implementar design responsivo
- [ ] Adicionar conteúdo e copy
- [ ] Otimizar para conversão
- [ ] Testes A/B (futuro)

### Sprint 4: Novo Fluxo
- [ ] Atualizar modelo de dados (Lead)
- [ ] Modificar página /analisar
- [ ] Criar página /proposta/[id]
- [ ] Modificar /resultado/[id]
- [ ] Integrar fluxo completo
- [ ] Testes E2E

---

## Referências

- [HubLocal](https://hublocal.com.br/) - Modelo SaaS de gestão de presença
- [Zanet](https://zanet.co.uk/) - Consultoria GBP com precificação
- [SEO Genome](https://seogenome.com/prompt-gsc/) - Framework de auditoria
- [Localo Blog](https://localo.com/pt-br/blog/seo-local) - Tendências SEO Local 2026
- [JetLocal](https://jetlocal.com.br/seo-local-e-google-meu-negocio/) - Estratégias GBP

---

*Documento criado em: 2026-02-24*
*Versão: 2.0*
