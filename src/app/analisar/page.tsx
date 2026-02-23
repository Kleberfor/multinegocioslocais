"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, Star, Loader2 } from "lucide-react";

interface PlaceResult {
  placeId: string;
  name: string;
  address: string;
  rating?: number;
  userRatingsTotal?: number;
}

export default function AnalisarPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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

      if (data.results?.length === 0) {
        setError("Nenhum negócio encontrado. Tente outro termo de busca.");
      }
    } catch (err) {
      setError("Erro ao buscar. Tente novamente.");
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectPlace = async (placeId: string) => {
    setIsAnalyzing(true);
    setError("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro na análise");
      }

      // Redirecionar para página de resultado
      router.push(`/resultado/${data.id}`);
    } catch (err) {
      setError("Erro ao analisar. Tente novamente.");
      setIsAnalyzing(false);
      console.error(err);
    }
  };

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
            Analise a presença digital do seu negócio
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Digite o nome do seu negócio como aparece no Google para receber uma
            análise completa com score e recomendações.
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: Pizzaria do João, São Paulo"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background text-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isSearching || isAnalyzing}
              />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={isSearching || isAnalyzing || !query.trim()}
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

        {/* Error */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-destructive/10 text-destructive rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-lg font-semibold mb-4">
              Selecione seu negócio:
            </h2>
            <div className="space-y-3">
              {results.map((place) => (
                <Card
                  key={place.placeId}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleSelectPlace(place.placeId)}
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
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Analisar"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isAnalyzing && (
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
