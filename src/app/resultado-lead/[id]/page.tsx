import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * /resultado-lead/[id] — Redireciona para /resultado/[id]
 *
 * O componente /resultado/[id] já trata tanto Leads quanto Prospects,
 * então esta rota é mantida apenas como alias para compatibilidade
 * com links existentes no fluxo de leads.
 */
export default async function ResultadoLeadPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/resultado/${id}`);
}
