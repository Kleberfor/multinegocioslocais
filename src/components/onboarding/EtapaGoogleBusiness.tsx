"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  MapPin,
  ChevronRight,
  Loader2,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";

interface Props {
  onProximo: (dados: Record<string, any>) => Promise<void>;
  onPular: () => void;
  isSaving: boolean;
  onboarding?: any;
}

export default function EtapaGoogleBusiness({
  onProximo,
  onPular,
  isSaving,
  onboarding,
}: Props) {
  const [gbpStatus, setGbpStatus] = useState(
    onboarding?.gbpStatus || "NAO_TEM"
  );
  const [gbpUrl, setGbpUrl] = useState(onboarding?.gbpUrl || "");

  const handleContinuar = async () => {
    await onProximo({
      etapa4Completa: true,
      gbpStatus,
      gbpUrl: gbpUrl || null,
      gbpConectado: gbpStatus === "TEM_GERENCIADO" && gbpUrl.trim() !== "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-yellow-500 flex items-center justify-center mx-auto">
          <MapPin className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold">Google Business Profile</h1>
        <p className="text-muted-foreground">
          A chave para aparecer nas buscas locais do Google
        </p>
      </div>

      {/* Por que é importante */}
      <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-2">Por que o Google Business Profile?</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>70% dos clientes</strong> encontram negócios locais pelo Google</li>
                <li>• Apareça no <strong>Google Maps</strong> quando buscarem por você</li>
                <li>• Mostre avaliações, fotos e informações atualizadas</li>
                <li>• <strong>100% gratuito</strong> e essencial para negócios locais</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status do GBP */}
      <Card>
        <CardHeader>
          <CardTitle>Você já tem um Perfil no Google?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={gbpStatus} onValueChange={setGbpStatus}>
            <div className="flex items-start space-x-3 p-4 rounded-lg border-2 hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="NAO_TEM" id="nao-tem" className="mt-1" />
              <Label htmlFor="nao-tem" className="flex-1 cursor-pointer">
                <p className="font-medium">Não tenho ainda</p>
                <p className="text-sm text-muted-foreground">
                  Vamos criar um para você durante a consultoria
                </p>
              </Label>
            </div>

            <div className="flex items-start space-x-3 p-4 rounded-lg border-2 hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="TEM_NAO_GERENCIADO" id="nao-gerenciado" className="mt-1" />
              <Label htmlFor="nao-gerenciado" className="flex-1 cursor-pointer">
                <p className="font-medium">Tenho, mas não gerencio</p>
                <p className="text-sm text-muted-foreground">
                  Vamos ajudar você a reivindicar e otimizar
                </p>
              </Label>
            </div>

            <div className="flex items-start space-x-3 p-4 rounded-lg border-2 hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="TEM_GERENCIADO" id="gerenciado" className="mt-1" />
              <Label htmlFor="gerenciado" className="flex-1 cursor-pointer">
                <p className="font-medium">Tenho e gerencio</p>
                <p className="text-sm text-muted-foreground">
                  Ótimo! Vamos otimizar ainda mais
                </p>
              </Label>
            </div>
          </RadioGroup>

          {gbpStatus === "TEM_GERENCIADO" && (
            <div className="space-y-2 pt-2">
              <Label htmlFor="gbp-url">Link do seu Perfil no Google</Label>
              <Input
                id="gbp-url"
                type="url"
                placeholder="https://g.page/seunegocio"
                value={gbpUrl}
                onChange={(e) => setGbpUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Cole o link do seu perfil para facilitar nossa análise
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Como encontrar */}
      {gbpStatus === "TEM_GERENCIADO" && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm font-medium mb-2">Como encontrar meu link?</p>
            <ol className="text-sm text-muted-foreground space-y-1">
              <li>1. Acesse <a href="https://business.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center">Google Business <ExternalLink className="w-3 h-3 ml-1" /></a></li>
              <li>2. Faça login e selecione seu negócio</li>
              <li>3. Clique em "Compartilhar perfil" e copie o link</li>
            </ol>
          </CardContent>
        </Card>
      )}

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
