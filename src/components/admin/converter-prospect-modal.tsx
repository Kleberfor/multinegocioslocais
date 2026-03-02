"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus, Loader2, CheckCircle } from "lucide-react";

interface ConverterProspectModalProps {
  prospectId: string;
  prospectNome: string;
  valorEstimado?: number;
}

export function ConverterProspectModal({
  prospectId,
  prospectNome,
  valorEstimado,
}: ConverterProspectModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [valorContrato, setValorContrato] = useState(valorEstimado?.toString() || "2000");
  const [parcelas, setParcelas] = useState("1");
  const [valorGestaoMensal, setValorGestaoMensal] = useState("300");
  const [incluirGestao, setIncluirGestao] = useState(false);

  // Endereco
  const [cep, setCep] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  const formatCpfCnpj = (value: string) => {
    const clean = value.replace(/\D/g, "");
    if (clean.length <= 11) {
      return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else {
      return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    }
  };

  const handleCepBlur = async () => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setLogradouro(data.logradouro);
        setBairro(data.bairro);
        setCidade(data.localidade);
        setEstado(data.uf);
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cpfCnpj || cpfCnpj.replace(/\D/g, "").length < 11) {
      alert("CPF/CNPJ inválido");
      return;
    }

    if (!valorContrato || Number(valorContrato) <= 0) {
      alert("Valor do contrato é obrigatório");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/prospects/${prospectId}/converter-cliente`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cpfCnpj,
          valorContrato: Number(valorContrato),
          parcelas: Number(parcelas),
          valorGestaoMensal: incluirGestao ? Number(valorGestaoMensal) : 0,
          incluiGestaoMensal: incluirGestao,
          endereco: {
            cep,
            logradouro,
            numero,
            bairro,
            cidade,
            estado,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.details
          ? `${data.error}: ${data.details}`
          : data.error || "Erro ao converter prospect";
        throw new Error(errorMsg);
      }

      setOpen(false);
      router.push(`/admin/clientes/${data.clienteId}`);
      router.refresh();
    } catch (error) {
      console.error("Erro:", error);
      alert(error instanceof Error ? error.message : "Erro ao converter prospect");
    } finally {
      setIsLoading(false);
    }
  };

  const valorParcela = Number(valorContrato) / Number(parcelas);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-green-600 hover:bg-green-700">
          <UserPlus className="w-4 h-4 mr-2" />
          Converter em Cliente
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Converter Prospect em Cliente</DialogTitle>
          <DialogDescription>
            Preencha os dados para converter <strong>{prospectNome}</strong> em cliente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* CPF/CNPJ */}
          <div>
            <Label htmlFor="cpfCnpj">CPF ou CNPJ *</Label>
            <Input
              id="cpfCnpj"
              value={cpfCnpj}
              onChange={(e) => setCpfCnpj(formatCpfCnpj(e.target.value))}
              placeholder="000.000.000-00"
              maxLength={18}
            />
          </div>

          {/* Valor do Contrato */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="valorContrato">Valor do Contrato *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                <Input
                  id="valorContrato"
                  type="number"
                  value={valorContrato}
                  onChange={(e) => setValorContrato(e.target.value)}
                  className="pl-10"
                  min="0"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="parcelas">Parcelas</Label>
              <select
                id="parcelas"
                value={parcelas}
                onChange={(e) => setParcelas(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="1">1x (À Vista)</option>
                <option value="2">2x</option>
                <option value="3">3x</option>
                <option value="6">6x</option>
                <option value="12">12x</option>
              </select>
            </div>
          </div>

          {Number(parcelas) > 1 && (
            <p className="text-sm text-muted-foreground">
              {parcelas}x de R$ {valorParcela.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          )}

          {/* Gestao Mensal */}
          <div className="p-4 border rounded-lg">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={incluirGestao}
                onChange={(e) => setIncluirGestao(e.target.checked)}
                className="mt-1 w-5 h-5 rounded"
              />
              <div className="flex-1">
                <p className="font-medium">Incluir Gestao Mensal</p>
                <p className="text-sm text-muted-foreground">
                  Cobranca mensal a partir do 2o mes
                </p>
              </div>
            </label>
            {incluirGestao && (
              <div className="mt-3">
                <Label htmlFor="valorGestaoMensal">Valor Mensal</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                  <Input
                    id="valorGestaoMensal"
                    type="number"
                    value={valorGestaoMensal}
                    onChange={(e) => setValorGestaoMensal(e.target.value)}
                    className="pl-10"
                    min="0"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Endereco */}
          <div>
            <h4 className="font-medium mb-3">Endereco (opcional)</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={cep}
                  onChange={(e) => setCep(e.target.value.replace(/\D/g, "").replace(/(\d{5})(\d{3})/, "$1-$2"))}
                  onBlur={handleCepBlur}
                  placeholder="00000-000"
                  maxLength={9}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="logradouro">Logradouro</Label>
                <Input
                  id="logradouro"
                  value={logradouro}
                  onChange={(e) => setLogradouro(e.target.value)}
                  placeholder="Rua, Avenida..."
                />
              </div>
              <div>
                <Label htmlFor="numero">Numero</Label>
                <Input
                  id="numero"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  placeholder="123"
                />
              </div>
              <div>
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="estado">UF</Label>
                <Input
                  id="estado"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value.toUpperCase())}
                  maxLength={2}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Convertendo...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Converter em Cliente
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
