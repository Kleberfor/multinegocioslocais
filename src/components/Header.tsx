"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="MultiNegócios Locais"
            width={180}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="#beneficios"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Benefícios
          </Link>
          <Link
            href="#como-funciona"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Como Funciona
          </Link>
          <Link href="/analisar">
            <Button>Analisar Meu Negócio</Button>
          </Link>
        </nav>

        <div className="md:hidden">
          <Link href="/analisar">
            <Button size="sm">Analisar</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
