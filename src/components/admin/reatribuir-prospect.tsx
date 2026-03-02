"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, UserCog } from "lucide-react";

interface Vendedor {
  id: string;
  name: string | null;
  email: string;
  role?: string;
}

interface ReatribuirProspectProps {
  prospectId: string;
  vendedorAtualId: string | null;
}

export function ReatribuirProspect({ prospectId, vendedorAtualId }: ReatribuirProspectProps) {
  const router = useRouter();
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [selectedVendedor, setSelectedVendedor] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingVendedores, setIsLoadingVendedores] = useState(true);

  useEffect(() => {
    fetch("/api/vendedores")
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data)) {
          setVendedores(data.filter((v: Vendedor & { ativo: boolean }) => v.ativo));
        }
      })
      .catch((err) => console.error("Erro ao carregar vendedores:", err))
      .finally(() => setIsLoadingVendedores(false));
  }, []);

  const handleReatribuir = async () => {
    if (!selectedVendedor) {
      alert("Selecione um vendedor");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/prospects/${prospectId}/vendedor`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ novoVendedorId: selectedVendedor }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao reatribuir");
      }

      alert(data.message);
      router.refresh();
    } catch (error) {
      console.error("Erro:", error);
      alert(error instanceof Error ? error.message : "Erro ao reatribuir");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingVendedores) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const vendedoresDisponiveis = vendedores.filter((v) => v.id !== vendedorAtualId);

  if (vendedoresDisponiveis.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Nenhum outro vendedor disponivel</p>
    );
  }

  return (
    <div className="space-y-3">
      <select
        value={selectedVendedor}
        onChange={(e) => setSelectedVendedor(e.target.value)}
        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
      >
        <option value="">Selecione um vendedor...</option>
        {vendedoresDisponiveis.map((vendedor) => (
          <option key={vendedor.id} value={vendedor.id}>
            {vendedor.name || vendedor.email}
            {vendedor.role === "admin" ? " (Admin)" : ""}
          </option>
        ))}
      </select>

      <Button
        onClick={handleReatribuir}
        disabled={isLoading || !selectedVendedor}
        variant="outline"
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Reatribuindo...
          </>
        ) : (
          <>
            <UserCog className="w-4 h-4 mr-2" />
            Reatribuir
          </>
        )}
      </Button>
    </div>
  );
}
