"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Eye, EyeOff, Percent } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

const editVendedorSchema = z
  .object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    email: z.string().email("Email inválido"),
    cpf: z.string().min(11, "CPF inválido").max(14, "CPF inválido"),
    rg: z.string().optional(),
    comissao: z.string().optional(),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.password && data.password.length > 0) {
        return data.password.length >= 6;
      }
      return true;
    },
    {
      message: "Senha deve ter pelo menos 6 caracteres",
      path: ["password"],
    }
  )
  .refine(
    (data) => {
      if (data.password && data.password.length > 0) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "As senhas não coincidem",
      path: ["confirmPassword"],
    }
  );

type EditVendedorFormData = z.infer<typeof editVendedorSchema>;

interface EditVendedorFormProps {
  vendedor: {
    id: string;
    name: string | null;
    email: string;
    cpf: string | null;
    rg: string | null;
    comissao: Prisma.Decimal | null;
  };
}

// Função para formatar CPF
function formatCPF(value: string) {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9)
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
}

export function EditVendedorForm({ vendedor }: EditVendedorFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EditVendedorFormData>({
    resolver: zodResolver(editVendedorSchema),
    defaultValues: {
      name: vendedor.name || "",
      email: vendedor.email,
      cpf: vendedor.cpf ? formatCPF(vendedor.cpf) : "",
      rg: vendedor.rg || "",
      comissao: vendedor.comissao ? String(vendedor.comissao) : "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setValue("cpf", formatted);
  };

  const onSubmit = async (data: EditVendedorFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const updateData: {
        name: string;
        email: string;
        cpf: string;
        rg?: string | null;
        comissao?: number | null;
        password?: string;
      } = {
        name: data.name,
        email: data.email,
        cpf: data.cpf.replace(/\D/g, ""),
      };

      updateData.rg = data.rg || null;
      updateData.comissao = data.comissao ? parseFloat(data.comissao) : null;

      if (data.password && data.password.length > 0) {
        updateData.password = data.password;
      }

      const response = await fetch(`/api/vendedores/${vendedor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao atualizar vendedor");
      }

      setSuccess(true);
      router.refresh();

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar vendedor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm">
          Vendedor atualizado com sucesso!
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nome Completo</Label>
        <Input id="name" placeholder="João da Silva" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="joao@empresa.com.br"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            placeholder="000.000.000-00"
            maxLength={14}
            {...register("cpf")}
            onChange={handleCPFChange}
          />
          {errors.cpf && (
            <p className="text-sm text-red-500">{errors.cpf.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="rg">RG</Label>
          <Input id="rg" placeholder="00.000.000-0" {...register("rg")} />
          {errors.rg && (
            <p className="text-sm text-red-500">{errors.rg.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="comissao">Comissionamento (%)</Label>
        <div className="relative">
          <Input
            id="comissao"
            type="number"
            step="0.5"
            min="0"
            max="100"
            placeholder="10"
            className="pr-10"
            {...register("comissao")}
          />
          <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
        <p className="text-xs text-muted-foreground">
          Porcentagem que o vendedor receberá por negócio fechado
        </p>
        {errors.comissao && (
          <p className="text-sm text-red-500">{errors.comissao.message}</p>
        )}
      </div>

      <div className="border-t pt-4">
        <p className="text-sm text-muted-foreground mb-4">
          Deixe os campos de senha em branco para manter a senha atual.
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nova Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Repita a senha"
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Salvar Alterações
          </>
        )}
      </Button>
    </form>
  );
}
