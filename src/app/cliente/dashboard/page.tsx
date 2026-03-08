"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  TrendingUp,
  Users,
  Star,
  MapPin,
  Phone,
  Mail,
  Settings,
  BarChart3,
} from "lucide-react";

interface ClienteData {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  negocio: string;
  onboarding?: {
    completado: boolean;
  };
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const clienteId = searchParams.get("cliente");

  const [cliente, setCliente] = useState<ClienteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (clienteId) {
      loadCliente();
    }
  }, [clienteId]);

  const loadCliente = async () => {
    try {
      const response = await fetch(`/api/cliente/${clienteId}`);
      const data = await response.json();

      if (response.ok) {
        setCliente(data);
      }
    } catch (error) {
      console.error("Erro ao carregar cliente:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Cliente não encontrado
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container max-w-7xl py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="MultiNegócios Locais"
                width={140}
                height={30}
                className="h-8 w-auto"
              />
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Olá, <strong>{cliente.nome}</strong>
              </span>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-7xl py-8">
        {/* Welcome Banner */}
        <Card className="bg-gradient-to-r from-primary to-blue-600 text-white mb-8">
          <CardContent className="pt-6">
            <h1 className="text-2xl font-bold mb-2">
              Bem-vindo ao seu Dashboard!
            </h1>
            <p className="text-blue-100">
              Acompanhe o crescimento do <strong>{cliente.negocio}</strong> em tempo real
            </p>
          </CardContent>
        </Card>

        {/* Métricas */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Visualizações</p>
                  <p className="text-2xl font-bold">Em breve</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Novos Clientes</p>
                  <p className="text-2xl font-bold">Em breve</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avaliações</p>
                  <p className="text-2xl font-bold">Em breve</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Score Google</p>
                  <p className="text-2xl font-bold">Em breve</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Coluna Principal */}
          <div className="md:col-span-2 space-y-6">
            {/* Implementação em Andamento */}
            <Card>
              <CardHeader>
                <CardTitle>Status da Implementação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Análise Completa Iniciada</p>
                        <p className="text-sm text-muted-foreground">
                          Nossa equipe está analisando sua presença digital
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full">
                      Em andamento
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-600">Primeira Consultoria</p>
                        <p className="text-sm text-muted-foreground">
                          Aguardando agendamento
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                      Pendente
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-600">Otimização Google Business</p>
                        <p className="text-sm text-muted-foreground">
                          Será iniciada após consultoria
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                      Pendente
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informações */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Seus Dados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{cliente.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{cliente.telefone}</span>
                </div>
              </CardContent>
            </Card>

            {/* Suporte */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-base">Precisa de Ajuda?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Nossa equipe está pronta para atender você
                </p>
                <Button className="w-full" size="sm">
                  Falar no WhatsApp
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClienteDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
