"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, Filter } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "all", label: "Todos os Status" },
  { value: "NOVO", label: "Novo" },
  { value: "EM_CONTATO", label: "Em Contato" },
  { value: "REUNIAO_AGENDADA", label: "Reunião Agendada" },
  { value: "PROPOSTA_ENVIADA", label: "Proposta Enviada" },
  { value: "NEGOCIANDO", label: "Negociando" },
  { value: "CONTRATO_ENVIADO", label: "Contrato Enviado" },
  { value: "ASSINADO", label: "Assinado" },
  { value: "PAGO", label: "Pago" },
  { value: "PERDIDO", label: "Perdido" },
  { value: "INATIVO", label: "Inativo" },
];

const SCORE_OPTIONS = [
  { value: "all", label: "Todos os Scores" },
  { value: "high", label: "Alto (70+)" },
  { value: "medium", label: "Médio (40-69)" },
  { value: "low", label: "Baixo (0-39)" },
  { value: "none", label: "Sem Score" },
];

interface ProspectsFiltersProps {
  vendedores?: { id: string; name: string | null; email: string }[];
}

export function ProspectsFilters({ vendedores = [] }: ProspectsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [score, setScore] = useState(searchParams.get("score") || "all");
  const [vendedorId, setVendedorId] = useState(
    searchParams.get("vendedorId") || "all"
  );

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (status !== "all") params.set("status", status);
    if (score !== "all") params.set("score", score);
    if (vendedorId !== "all") params.set("vendedorId", vendedorId);

    const queryString = params.toString();
    router.push(`/admin/prospects${queryString ? `?${queryString}` : ""}`);
  }, [search, status, score, vendedorId, router]);

  const clearFilters = useCallback(() => {
    setSearch("");
    setStatus("all");
    setScore("all");
    setVendedorId("all");
    router.push("/admin/prospects");
  }, [router]);

  const hasActiveFilters =
    search || status !== "all" || score !== "all" || vendedorId !== "all";

  return (
    <div className="bg-muted/30 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filtros</span>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="ml-auto h-7 px-2 text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Busca por texto */}
        <div className="lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, negócio, telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              className="pl-9"
            />
          </div>
        </div>

        {/* Status */}
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Score */}
        <Select value={score} onValueChange={setScore}>
          <SelectTrigger>
            <SelectValue placeholder="Score" />
          </SelectTrigger>
          <SelectContent>
            {SCORE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Vendedor (se houver) */}
        {vendedores.length > 0 ? (
          <Select value={vendedorId} onValueChange={setVendedorId}>
            <SelectTrigger>
              <SelectValue placeholder="Vendedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Vendedores</SelectItem>
              {vendedores.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name || v.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Button onClick={applyFilters} className="w-full">
            <Search className="w-4 h-4 mr-2" />
            Buscar
          </Button>
        )}
      </div>

      {vendedores.length > 0 && (
        <div className="mt-3 flex justify-end">
          <Button onClick={applyFilters}>
            <Search className="w-4 h-4 mr-2" />
            Aplicar Filtros
          </Button>
        </div>
      )}
    </div>
  );
}
