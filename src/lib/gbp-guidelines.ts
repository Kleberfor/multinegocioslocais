// Base de Conhecimento: Diretrizes do Google Business Profile
// Fonte: https://support.google.com/business/answer/7667250

export interface GuidelineCheck {
  id: string;
  category: "info" | "photos" | "engagement" | "content" | "trust";
  title: string;
  description: string;
  importance: "critical" | "high" | "medium" | "low";
  howToFix: string;
  impact: string;
  googleTip?: string;
}

// Diretrizes oficiais do Google para Perfil de Empresa
export const GBP_GUIDELINES: GuidelineCheck[] = [
  // === INFORMAÇÕES BÁSICAS (Críticas) ===
  {
    id: "name_accurate",
    category: "info",
    title: "Nome exato do negócio",
    description: "O nome deve ser idêntico ao usado no mundo real (fachada, documentos)",
    importance: "critical",
    howToFix: "Use apenas o nome real do negócio, sem adicionar palavras-chave, localização ou slogans",
    impact: "Nomes incorretos podem resultar em suspensão do perfil",
    googleTip: "Não inclua informações desnecessárias como 'O melhor de SP' ou '24 horas' no nome",
  },
  {
    id: "address_complete",
    category: "info",
    title: "Endereço completo e preciso",
    description: "Endereço deve incluir rua, número, bairro, cidade e CEP",
    importance: "critical",
    howToFix: "Verifique se o endereço está completo e corresponde à localização real",
    impact: "Clientes não conseguirão encontrar seu negócio",
  },
  {
    id: "phone_local",
    category: "info",
    title: "Telefone local verificável",
    description: "Número de telefone com DDD local, que seja atendido",
    importance: "critical",
    howToFix: "Adicione um número de telefone local que você atenda regularmente",
    impact: "70% dos clientes ligam antes de visitar um negócio local",
  },
  {
    id: "hours_accurate",
    category: "info",
    title: "Horário de funcionamento atualizado",
    description: "Horários devem refletir quando o negócio está realmente aberto",
    importance: "critical",
    howToFix: "Mantenha horários atualizados, incluindo horários especiais para feriados",
    impact: "Clientes frustrados deixam avaliações negativas ao encontrar portas fechadas",
    googleTip: "Configure horários especiais para feriados com antecedência",
  },
  {
    id: "category_primary",
    category: "info",
    title: "Categoria principal correta",
    description: "A categoria principal deve descrever o que seu negócio É, não o que ele faz",
    importance: "critical",
    howToFix: "Escolha a categoria mais específica possível (ex: 'Pizzaria' ao invés de 'Restaurante')",
    impact: "Afeta diretamente em quais buscas você aparece",
  },
  {
    id: "categories_secondary",
    category: "info",
    title: "Categorias secundárias relevantes",
    description: "Adicione categorias que representem outros serviços oferecidos",
    importance: "high",
    howToFix: "Adicione até 9 categorias secundárias relevantes para seus serviços",
    impact: "Aumenta visibilidade em buscas relacionadas",
  },
  {
    id: "website_linked",
    category: "info",
    title: "Website vinculado",
    description: "Link para site oficial do negócio",
    importance: "high",
    howToFix: "Adicione o link do seu site. Se não tiver, considere criar um site simples",
    impact: "Sites aumentam credibilidade e permitem mais informações",
  },
  {
    id: "description_complete",
    category: "info",
    title: "Descrição do negócio completa",
    description: "Descrição de até 750 caracteres explicando o que o negócio oferece",
    importance: "high",
    howToFix: "Escreva uma descrição clara incluindo: o que você faz, diferenciais e área de atuação",
    impact: "Ajuda clientes a entenderem seu negócio antes de visitar",
    googleTip: "Inclua palavras-chave naturalmente, sem exageros",
  },

  // === FOTOS (Alta importância) ===
  {
    id: "photo_logo",
    category: "photos",
    title: "Logo do negócio",
    description: "Logo de alta qualidade que represente a marca",
    importance: "high",
    howToFix: "Adicione seu logo em formato quadrado (250x250px mínimo)",
    impact: "Logo aparece em buscas e aumenta reconhecimento da marca",
  },
  {
    id: "photo_cover",
    category: "photos",
    title: "Foto de capa atraente",
    description: "Foto principal que representa bem o negócio",
    importance: "high",
    howToFix: "Adicione uma foto de capa de alta qualidade (1080x608px recomendado)",
    impact: "Primeira impressão visual do seu negócio",
  },
  {
    id: "photos_exterior",
    category: "photos",
    title: "Fotos da fachada/exterior",
    description: "Fotos que mostrem como encontrar o local",
    importance: "high",
    howToFix: "Adicione 3+ fotos do exterior em diferentes ângulos e horários",
    impact: "Ajuda clientes a reconhecerem o local ao chegar",
    googleTip: "Inclua fotos diurnas e noturnas se aplicável",
  },
  {
    id: "photos_interior",
    category: "photos",
    title: "Fotos do interior/ambiente",
    description: "Fotos que mostrem o ambiente interno do negócio",
    importance: "high",
    howToFix: "Adicione 3+ fotos do interior mostrando o ambiente e estrutura",
    impact: "Clientes querem saber o que esperar antes de visitar",
  },
  {
    id: "photos_products",
    category: "photos",
    title: "Fotos de produtos/serviços",
    description: "Fotos dos principais produtos ou serviços oferecidos",
    importance: "medium",
    howToFix: "Adicione fotos de alta qualidade dos seus melhores produtos",
    impact: "Aumenta interesse e desejo de compra",
  },
  {
    id: "photos_team",
    category: "photos",
    title: "Fotos da equipe",
    description: "Fotos da equipe trabalhando ou posando",
    importance: "medium",
    howToFix: "Adicione fotos da equipe para humanizar o negócio",
    impact: "Aumenta confiança e conexão com clientes",
  },
  {
    id: "photos_quantity",
    category: "photos",
    title: "Quantidade adequada de fotos",
    description: "Perfis com 10+ fotos recebem mais engajamento",
    importance: "medium",
    howToFix: "Adicione pelo menos 10 fotos variadas e de qualidade",
    impact: "Perfis com mais fotos recebem 42% mais solicitações de rota",
    googleTip: "Adicione novas fotos regularmente para manter o perfil atualizado",
  },
  {
    id: "photos_quality",
    category: "photos",
    title: "Qualidade das fotos",
    description: "Fotos devem ter boa iluminação, foco e resolução",
    importance: "high",
    howToFix: "Use fotos com mínimo 720px de largura, bem iluminadas e focadas",
    impact: "Fotos de baixa qualidade passam impressão de descuido",
  },

  // === ENGAJAMENTO E AVALIAÇÕES ===
  {
    id: "reviews_respond",
    category: "engagement",
    title: "Responder avaliações",
    description: "Responda todas as avaliações, positivas e negativas",
    importance: "critical",
    howToFix: "Responda cada avaliação de forma personalizada e profissional",
    impact: "Negócios que respondem avaliações são vistos como mais confiáveis",
    googleTip: "Responda avaliações negativas com empatia e solução",
  },
  {
    id: "reviews_quantity",
    category: "engagement",
    title: "Volume de avaliações",
    description: "Mais avaliações = mais credibilidade e melhor ranking",
    importance: "high",
    howToFix: "Incentive clientes satisfeitos a deixarem avaliações (sem oferecer incentivos)",
    impact: "Negócios com mais avaliações aparecem mais nas buscas",
  },
  {
    id: "reviews_recent",
    category: "engagement",
    title: "Avaliações recentes",
    description: "Avaliações recentes mostram que o negócio está ativo",
    importance: "high",
    howToFix: "Mantenha fluxo constante de novas avaliações pedindo feedback regularmente",
    impact: "Google favorece perfis com atividade recente",
  },
  {
    id: "reviews_rating",
    category: "engagement",
    title: "Nota média alta",
    description: "Média de 4.0+ estrelas é considerada boa",
    importance: "high",
    howToFix: "Foque em proporcionar experiências excelentes para receber boas notas",
    impact: "68% dos consumidores não consideram negócios com menos de 4 estrelas",
  },
  {
    id: "qna_active",
    category: "engagement",
    title: "Perguntas e Respostas ativas",
    description: "Responda perguntas feitas no perfil",
    importance: "medium",
    howToFix: "Monitore e responda perguntas. Adicione perguntas frequentes você mesmo",
    impact: "Reduz dúvidas e aumenta conversões",
  },

  // === CONTEÚDO E ATUALIZAÇÕES ===
  {
    id: "posts_active",
    category: "content",
    title: "Posts regulares",
    description: "Publicar atualizações, ofertas e novidades regularmente",
    importance: "medium",
    howToFix: "Publique pelo menos 1 post por semana (ofertas, eventos, novidades)",
    impact: "Posts aumentam engajamento e mostram que o negócio está ativo",
    googleTip: "Posts expiram após 7 dias, mantenha frequência",
  },
  {
    id: "products_services",
    category: "content",
    title: "Produtos/Serviços cadastrados",
    description: "Listar produtos ou serviços com preços no perfil",
    importance: "medium",
    howToFix: "Adicione seus principais produtos/serviços com descrição e preço",
    impact: "Clientes podem ver ofertas antes de entrar em contato",
  },
  {
    id: "attributes_set",
    category: "content",
    title: "Atributos do negócio",
    description: "Definir atributos como Wi-Fi, acessibilidade, formas de pagamento",
    importance: "medium",
    howToFix: "Configure todos os atributos aplicáveis ao seu negócio",
    impact: "Ajuda em buscas filtradas (ex: 'restaurante com Wi-Fi')",
  },
  {
    id: "menu_booking",
    category: "content",
    title: "Menu/Agendamento online",
    description: "Link para menu (restaurantes) ou agendamento online",
    importance: "medium",
    howToFix: "Adicione link do menu ou sistema de agendamento se aplicável",
    impact: "Facilita conversão diretamente do perfil",
  },

  // === CONFIANÇA E VERIFICAÇÃO ===
  {
    id: "verified",
    category: "trust",
    title: "Perfil verificado",
    description: "Perfil deve ser verificado pelo Google",
    importance: "critical",
    howToFix: "Complete o processo de verificação (cartão postal, telefone ou email)",
    impact: "Perfis não verificados não aparecem em buscas",
  },
  {
    id: "nap_consistency",
    category: "trust",
    title: "Consistência NAP",
    description: "Nome, Endereço e Telefone iguais em todas as plataformas",
    importance: "high",
    howToFix: "Mantenha informações idênticas no site, redes sociais e diretórios",
    impact: "Inconsistências confundem o Google e prejudicam ranking",
  },
];

// Categorias com pesos para cálculo do score
export const CATEGORY_WEIGHTS = {
  info: 30,        // Informações básicas - 30%
  photos: 20,      // Fotos - 20%
  engagement: 25,  // Avaliações e engajamento - 25%
  content: 15,     // Conteúdo e posts - 15%
  trust: 10,       // Confiança e verificação - 10%
};

// Mapeamento de importância para pontos
export const IMPORTANCE_POINTS = {
  critical: 10,
  high: 7,
  medium: 4,
  low: 2,
};

export function getGuidelinesByCategory(category: string): GuidelineCheck[] {
  return GBP_GUIDELINES.filter((g) => g.category === category);
}

export function getCriticalGuidelines(): GuidelineCheck[] {
  return GBP_GUIDELINES.filter((g) => g.importance === "critical");
}
