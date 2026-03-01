import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User } from "lucide-react";
import { getCurrentUser } from "@/lib/get-current-user";
import { EditVendedorForm } from "@/components/admin/edit-vendedor-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarVendedorPage({ params }: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/admin/login");
  }

  if (user.role !== "admin") {
    redirect("/admin/dashboard");
  }

  const { id } = await params;

  const vendedor = await prisma.user.findUnique({
    where: { id, role: "vendedor" },
    select: {
      id: true,
      name: true,
      email: true,
      cpf: true,
      rg: true,
      comissao: true,
      ativo: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!vendedor) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/admin/vendedores/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold text-xl">
              {vendedor.name?.charAt(0).toUpperCase() || "V"}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Editar Vendedor</h1>
            <p className="text-muted-foreground">{vendedor.name}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5" />
            Dados do Vendedor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EditVendedorForm vendedor={vendedor} />
        </CardContent>
      </Card>
    </div>
  );
}
