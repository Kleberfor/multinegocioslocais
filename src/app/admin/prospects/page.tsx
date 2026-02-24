import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ExternalLink, TrendingUp, TrendingDown } from "lucide-react";

async function getProspects() {
  return prisma.prospect.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export default async function ProspectsPage() {
  const session = await auth();

  if (!session) {
    redirect("/admin/login");
  }

  const prospects = await getProspects();

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Prospects</h1>
        <p className="text-muted-foreground">
          {prospects.length} negócios analisados
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium">Negócio</th>
                  <th className="text-left p-4 font-medium">Score</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Data</th>
                  <th className="text-left p-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {prospects.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      Nenhum prospect encontrado
                    </td>
                  </tr>
                ) : (
                  prospects.map((prospect) => (
                    <tr key={prospect.id} className="border-b hover:bg-muted/30">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{prospect.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            {prospect.email || "Sem email"}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                              prospect.score >= 70
                                ? "bg-green-500"
                                : prospect.score >= 40
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                          >
                            {prospect.score}
                          </div>
                          <div className="ml-3">
                            {prospect.score >= 70 ? (
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            prospect.score >= 70
                              ? "bg-green-100 text-green-700"
                              : prospect.score >= 40
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {prospect.score >= 70
                            ? "Bom"
                            : prospect.score >= 40
                            ? "Oportunidade"
                            : "Crítico"}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(prospect.createdAt).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="p-4">
                        <Link href={`/resultado/${prospect.id}`} target="_blank">
                          <Button variant="outline" size="sm">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Ver Resultado
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
