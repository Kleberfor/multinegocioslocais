"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, MapPin, Star, Loader2, User, Mail, Phone, Building2, ArrowLeft } from "lucide-react";
import { SEGMENTOS_LIST } from "@/lib/segmentos";

interface PlaceResult {
  placeId: string;
  name: string;
  address: string;
  rating?: number;
  userRatingsTotal?: number;
}

type Step = "search" | "select" | "form" | "analyzing";

export default function AnalisarPage() {
  const router = useRouter();

  // Estado do fluxo
  const [step, setStep] = useState<Step>("search");

  // Busca
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);

  // Formulário de lead
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    whatsapp: "",
    siteUrl: "",
    segmento: "",
  });

  // Estados de loading e erro
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setError("");
    setResults([]);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro na busca");
      }

      setResults(data.results || []);

      if (data.results?.length > 0) {
        setStep("select");
      } else {
        setError("Nenhum negócio encontrado. Tente outro termo de busca.");
      }
    } catch (err) {
      setError("Erro ao buscar. Tente novamente.");
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectPlace = (place: PlaceResult) => {
    setSelectedPlace(place);
    setFormData(prev => ({ ...prev, nome: "" })); // Limpar nome para o usuário preencher
    setStep("form");
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPlace) return;
    if (!formData.nome || !formData.email || !formData.telefone || !formData.segmento) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setStep("analyzing");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone,
          whatsapp: formData.whatsapp || formData.telefone,
          negocio: selectedPlace.name,
          siteUrl: formData.siteUrl || null,
          segmento: formData.segmento,
          placeId: selectedPlace.placeId,
          origem: "organico",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao processar análise");
      }

      // Redirecionar para página de resultado simplificado
      router.push(`/resultado/${data.id}`);
    } catch (err) {
      setError("Erro ao processar. Tente novamente.");
      setStep("form");
      setIsSubmitting(false);
      console.error(err);
    }
  };

  const handleBack = () => {
    if (step === "form") {
      setStep("select");
      setSelectedPlace(null);
    } else if (step === "select") {
      setStep("search");
      setResults([]);
    }
  };

  // Lista de segmentos para o select
  const segmentosList = SEGMENTOS_LIST;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="container py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Image
            src="/logo.png"
            alt="MultiNegócios Locais"
            width={200}
            height={45}
            className="h-12 w-auto mx-auto mb-6"
          />
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            {step === "form"
              ? "Complete seus dados para receber a análise"
              : "Analise a presença digital do seu negócio"
            }
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {step === "form"
              ? "Preencha as informações abaixo para receber seu diagnóstico gratuito."
              : "Digite o nome do seu negócio como aparece no Google para receber uma análise gratuita."
            }
          </p>
        </div>

        {/* Botão Voltar */}
        {(step === "select" || step === "form") && (
          <div className="max-w-2xl mx-auto mb-6">
            <Button variant="ghost" onClick={handleBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-destructive/10 text-destructive rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Step 1: Busca */}
        {step === "search" && (
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ex: Pizzaria do João, São Paulo"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background text-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isSearching}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={isSearching || !query.trim()}
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  "Buscar"
                )}
              </Button>
            </form>
          </div>
        )}

        {/* Step 2: Selecionar negócio */}
        {step === "select" && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-lg font-semibold mb-4">
              Selecione seu negócio:
            </h2>
            <div className="space-y-3">
              {results.map((place) => (
                <Card
                  key={place.placeId}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleSelectPlace(place)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{place.name}</h3>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          {place.address}
                        </div>
                        {place.rating && (
                          <div className="flex items-center text-sm mt-2">
                            <Star className="w-4 h-4 mr-1 text-yellow-500 fill-yellow-500" />
                            <span className="font-medium">{place.rating}</span>
                            <span className="text-muted-foreground ml-1">
                              ({place.userRatingsTotal || 0} avaliações)
                            </span>
                          </div>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        Selecionar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Formulário de dados */}
        {step === "form" && selectedPlace && (
          <div className="max-w-xl mx-auto">
            {/* Negócio selecionado */}
            <Card className="mb-6 bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Building2 className="w-8 h-8 text-primary" />
                  <div>
                    <p className="font-semibold">{selectedPlace.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedPlace.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Formulário */}
            <Card>
              <CardHeader>
                <CardTitle>Seus dados</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitForm} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Seu nome completo *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        name="nome"
                        value={formData.nome}
                        onChange={handleFormChange}
                        placeholder="João Silva"
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      E-mail *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleFormChange}
                        placeholder="joao@email.com"
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Telefone / WhatsApp *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="tel"
                        name="telefone"
                        value={formData.telefone}
                        onChange={handleFormChange}
                        placeholder="(11) 99999-9999"
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Segmento do negócio *
                    </label>
                    <select
                      name="segmento"
                      value={formData.segmento}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option value="">Selecione...</option>
                      {segmentosList.map((seg) => (
                        <option key={seg.value} value={seg.value}>
                          {seg.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Site (opcional)
                    </label>
                    <input
                      type="url"
                      name="siteUrl"
                      value={formData.siteUrl}
                      onChange={handleFormChange}
                      placeholder="https://www.seusite.com.br"
                      className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analisando...
                        </>
                      ) : (
                        "Receber Minha Análise Gratuita"
                      )}
                    </Button>
                  </div>

                  <p className="text-xs text-center text-muted-foreground">
                    Seus dados estão seguros e não serão compartilhados.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Analisando */}
        {step === "analyzing" && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-lg font-medium">Analisando seu negócio...</p>
              <p className="text-muted-foreground">Isso pode levar alguns segundos</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
