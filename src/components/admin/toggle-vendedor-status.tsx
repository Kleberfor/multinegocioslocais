"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, UserCheck, UserX } from "lucide-react";

interface ToggleVendedorStatusProps {
  vendedorId: string;
  ativo: boolean;
}

export function ToggleVendedorStatus({
  vendedorId,
  ativo,
}: ToggleVendedorStatusProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/vendedores/${vendedorId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo: !ativo }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Erro ao alterar status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={ativo ? "destructive" : "default"}
      size="sm"
      onClick={handleToggle}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : ativo ? (
        <>
          <UserX className="w-4 h-4 mr-1" />
          Desativar
        </>
      ) : (
        <>
          <UserCheck className="w-4 h-4 mr-1" />
          Ativar
        </>
      )}
    </Button>
  );
}
