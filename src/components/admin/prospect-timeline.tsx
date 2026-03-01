"use client";

import {
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  FileText,
  ArrowRight,
} from "lucide-react";

interface Interacao {
  id: string;
  tipo: string;
  descricao: string;
  criadoPor: string;
  metadata?: unknown;
  createdAt: Date;
}

interface ProspectTimelineProps {
  interacoes: Interacao[];
}

const TIPO_ICONS: Record<string, React.ReactNode> = {
  LIGACAO: <Phone className="w-4 h-4" />,
  EMAIL: <Mail className="w-4 h-4" />,
  WHATSAPP: <MessageSquare className="w-4 h-4 text-green-600" />,
  REUNIAO: <Calendar className="w-4 h-4 text-purple-600" />,
  NOTA: <FileText className="w-4 h-4 text-gray-600" />,
  STATUS_CHANGE: <ArrowRight className="w-4 h-4 text-blue-600" />,
};

const TIPO_LABELS: Record<string, string> = {
  LIGACAO: "Ligação",
  EMAIL: "Email",
  WHATSAPP: "WhatsApp",
  REUNIAO: "Reunião",
  NOTA: "Nota",
  STATUS_CHANGE: "Mudança de Status",
};

const TIPO_COLORS: Record<string, string> = {
  LIGACAO: "bg-orange-100 border-orange-300",
  EMAIL: "bg-blue-100 border-blue-300",
  WHATSAPP: "bg-green-100 border-green-300",
  REUNIAO: "bg-purple-100 border-purple-300",
  NOTA: "bg-gray-100 border-gray-300",
  STATUS_CHANGE: "bg-blue-50 border-blue-300",
};

export function ProspectTimeline({ interacoes }: ProspectTimelineProps) {
  if (interacoes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhuma interação registrada ainda.
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Linha vertical */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />

      <div className="space-y-4">
        {interacoes.map((interacao) => (
          <div key={interacao.id} className="relative pl-10">
            {/* Ícone */}
            <div
              className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                TIPO_COLORS[interacao.tipo] || "bg-gray-100 border-gray-300"
              }`}
            >
              {TIPO_ICONS[interacao.tipo] || <FileText className="w-4 h-4" />}
            </div>

            {/* Conteúdo */}
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  {TIPO_LABELS[interacao.tipo] || interacao.tipo}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(interacao.createdAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "America/Sao_Paulo",
                  })}
                </span>
              </div>

              <p className="text-sm whitespace-pre-wrap">{interacao.descricao}</p>

              <p className="text-xs text-muted-foreground mt-2">
                Por: {interacao.criadoPor}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
