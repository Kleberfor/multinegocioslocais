"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  ChevronRight,
  Loader2,
  Music,
} from "lucide-react";

interface Props {
  onProximo: (dados: Record<string, any>) => Promise<void>;
  onPular: () => void;
  isSaving: boolean;
  onboarding?: any;
}

const REDES = [
  {
    id: "instagram",
    nome: "Instagram",
    icone: Instagram,
    placeholder: "https://instagram.com/seunegocio",
    cor: "from-pink-500 to-purple-600",
  },
  {
    id: "facebook",
    nome: "Facebook",
    icone: Facebook,
    placeholder: "https://facebook.com/seunegocio",
    cor: "from-blue-600 to-blue-700",
  },
  {
    id: "linkedin",
    nome: "LinkedIn",
    icone: Linkedin,
    placeholder: "https://linkedin.com/company/seunegocio",
    cor: "from-blue-700 to-blue-800",
  },
  {
    id: "tiktok",
    nome: "TikTok",
    icone: Music,
    placeholder: "https://tiktok.com/@seunegocio",
    cor: "from-black to-gray-800",
  },
  {
    id: "youtube",
    nome: "YouTube",
    icone: Youtube,
    placeholder: "https://youtube.com/@seunegocio",
    cor: "from-red-600 to-red-700",
  },
  {
    id: "twitter",
    nome: "X (Twitter)",
    icone: Twitter,
    placeholder: "https://twitter.com/seunegocio",
    cor: "from-gray-800 to-black",
  },
];

export default function EtapaRedesSociais({
  onProximo,
  onPular,
  isSaving,
  onboarding,
}: Props) {
  const [redes, setRedes] = useState<Record<string, string>>({
    instagram: onboarding?.instagram || "",
    facebook: onboarding?.facebook || "",
    linkedin: onboarding?.linkedin || "",
    tiktok: onboarding?.tiktok || "",
    youtube: onboarding?.youtube || "",
    twitter: onboarding?.twitter || "",
  });

  const handleChange = (rede: string, valor: string) => {
    setRedes((prev) => ({ ...prev, [rede]: valor }));
  };

  const handleContinuar = async () => {
    await onProximo({
      etapa3Completa: true,
      ...redes,
    });
  };

  const redesPreenchidas = Object.values(redes).filter((v) => v.trim()).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center mx-auto">
          <Instagram className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold">Redes Sociais</h1>
        <p className="text-muted-foreground">
          Conecte seus perfis para centralizarmos sua presença digital
        </p>
      </div>

      {/* Informativo */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">💡</div>
            <div>
              <p className="font-medium mb-1">Por que isso é importante?</p>
              <p className="text-sm text-muted-foreground">
                Com seus perfis conectados, podemos:
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• Monitorar menções e avaliações</li>
                <li>• Sugerir conteúdos para engajamento</li>
                <li>• Centralizar mensagens em um só lugar</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campos de Redes Sociais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Seus Perfis</span>
            {redesPreenchidas > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                {redesPreenchidas} de {REDES.length} conectadas
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {REDES.map((rede) => {
            const Icone = rede.icone;
            return (
              <div key={rede.id} className="space-y-2">
                <Label htmlFor={rede.id} className="flex items-center space-x-2">
                  <div
                    className={`w-8 h-8 rounded-lg bg-gradient-to-br ${rede.cor} flex items-center justify-center`}
                  >
                    <Icone className="w-4 h-4 text-white" />
                  </div>
                  <span>{rede.nome}</span>
                  {redes[rede.id] && (
                    <span className="text-xs text-green-600">✓ Conectado</span>
                  )}
                </Label>
                <Input
                  id={rede.id}
                  type="url"
                  placeholder={rede.placeholder}
                  value={redes[rede.id]}
                  onChange={(e) => handleChange(rede.id, e.target.value)}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Nota */}
      <p className="text-sm text-center text-muted-foreground">
        Não tem alguma rede? Sem problemas! Você pode pular e adicionar depois.
      </p>

      {/* Botões */}
      <div className="flex justify-between items-center pt-4 pb-16 md:pb-4">
        <Button variant="ghost" onClick={onPular} disabled={isSaving}>
          Pular esta etapa
        </Button>

        <Button onClick={handleContinuar} disabled={isSaving} size="lg">
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              Continuar
              <ChevronRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
