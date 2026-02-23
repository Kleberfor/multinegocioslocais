import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-primary">
                MultiNegócios<span className="text-foreground">Locais</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-md">
              Ajudamos negócios locais a melhorar sua presença digital e atrair
              mais clientes através do Google e outras plataformas.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/analisar" className="hover:text-foreground">
                  Analisar Negócio
                </Link>
              </li>
              <li>
                <Link href="#beneficios" className="hover:text-foreground">
                  Benefícios
                </Link>
              </li>
              <li>
                <Link href="#como-funciona" className="hover:text-foreground">
                  Como Funciona
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contato</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>contato@multinegocioslocais.com.br</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} MultiNegócios Locais. Todos os
            direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
