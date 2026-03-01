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
import { Search, X, Filter, Download } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "all", label: "Todos os Status" },
  { value: "novo", label: "Novo" },
  { value: "em_contato", label: "Em Contato" },
  { value: "qualificado", label: "Qualificado" },
  { value: "proposta", label: "Proposta Enviada" },
  { value: "negociacao", label: "Negociação" },
  { value: "fechado", label: "Fechado" },
  { value: "perdido", label: "Perdido" },
];

const SCORE_OPTIONS = [
  { value: "all", label: "Todos os Scores" },
  { value: "high", label: "Alto (70+)" },
  { value: "medium", label: "Médio (40-69)" },
  { value: "low", label: "Baixo (0-39)" },
];

const SEGMENTO_OPTIONS = [
  { value: "all", label: "Todos os Segmentos" },
  { value: "Restaurante", label: "Restaurante" },
  { value: "Loja de Roupas", label: "Loja de Roupas" },
  { value: "Salão de Beleza", label: "Salão de Beleza" },
  { value: "Oficina Mecânica", label: "Oficina Mecânica" },
  { value: "Clínica Médica", label: "Clínica Médica" },
  { value: "Clínica Odontológica", label: "Clínica Odontológica" },
  { value: "Academia", label: "Academia" },
  { value: "Pet Shop", label: "Pet Shop" },
  { value: "Imobiliária", label: "Imobiliária" },
  { value: "Outro", label: "Outro" },
];

export function LeadsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [score, setScore] = useState(searchParams.get("score") || "all");
  const [segmento, setSegmento] = useState(searchParams.get("segmento") || "all");

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (status !== "all") params.set("status", status);
    if (score !== "all") params.set("score", score);
    if (segmento !== "all") params.set("segmento", segmento);

    const queryString = params.toString();
    router.push(`/admin/leads${queryString ? `?${queryString}` : ""}`);
  }, [search, status, score, segmento, router]);

  const clearFilters = useCallback(() => {
    setSearch("");
    setStatus("all");
    setScore("all");
    setSegmento("all");
    router.push("/admin/leads");
  }, [router]);

  const handleExport = async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status !== "all") params.set("status", status);
    if (score !== "all") params.set("score", score);
    if (segmento !== "all") params.set("segmento", segmento);

    const queryString = params.toString();
    window.open(`/api/leads/export${queryString ? `?${queryString}` : ""}`, "_blank");
  };

  const hasActiveFilters =
    search || status !== "all" || score !== "all" || segmento !== "all";

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

        {/* Segmento */}
        <Select value={segmento} onValueChange={setSegmento}>
          <SelectTrigger>
            <SelectValue placeholder="Segmento" />
          </SelectTrigger>
          <SelectContent>
            {SEGMENTO_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-3 flex justify-between">
        <Button variant="outline" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
        <Button onClick={applyFilters}>
          <Search className="w-4 h-4 mr-2" />
          Aplicar Filtros
        </Button>
      </div>
    </div>
  );
}
