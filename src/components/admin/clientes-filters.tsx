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
  { value: "PAGO", label: "Pago" },
  { value: "ASSINADO", label: "Assinado" },
  { value: "PENDENTE", label: "Pendente" },
];

export function ClientesFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "all");

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (status !== "all") params.set("status", status);

    const queryString = params.toString();
    router.push(`/admin/clientes${queryString ? `?${queryString}` : ""}`);
  }, [search, status, router]);

  const clearFilters = useCallback(() => {
    setSearch("");
    setStatus("all");
    router.push("/admin/clientes");
  }, [router]);

  const hasActiveFilters = search || status !== "all";

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Busca por texto */}
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, negócio, email, CPF/CNPJ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              className="pl-9"
            />
          </div>
        </div>

        {/* Status do Contrato */}
        <div className="flex gap-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="flex-1">
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
          <Button onClick={applyFilters}>
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
