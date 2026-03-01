"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  FileText,
  Search,
  LogOut,
  CreditCard,
  UserPlus,
  Calendar,
  Shield,
  UsersRound,
} from "lucide-react";

interface AdminSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
  role?: "admin" | "vendedor";
}

// Menu para admin (acesso total)
const adminMenuItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Leads",
    href: "/admin/leads",
    icon: UserPlus,
  },
  {
    label: "Follow-ups",
    href: "/admin/followup",
    icon: Calendar,
  },
  {
    label: "Prospects",
    href: "/admin/prospects",
    icon: Search,
  },
  {
    label: "Clientes",
    href: "/admin/clientes",
    icon: Users,
  },
  {
    label: "Contratos",
    href: "/admin/contratos",
    icon: FileText,
  },
  {
    label: "Pagamentos",
    href: "/admin/pagamentos",
    icon: CreditCard,
  },
  {
    label: "Vendedores",
    href: "/admin/vendedores",
    icon: UsersRound,
  },
];

// Menu para vendedor (acesso restrito)
const vendedorMenuItems = [
  {
    label: "Meu Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Meus Prospects",
    href: "/admin/prospects",
    icon: Search,
  },
  {
    label: "Meus Leads",
    href: "/admin/leads",
    icon: UserPlus,
  },
  {
    label: "Meus Clientes",
    href: "/admin/clientes",
    icon: Users,
  },
];

export function AdminSidebar({ user, role = "vendedor" }: AdminSidebarProps) {
  const pathname = usePathname();
  const menuItems = role === "admin" ? adminMenuItems : vendedorMenuItems;

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <Link href="/admin/dashboard">
          <Image
            src="/logo-white.png"
            alt="MultiNegócios Locais"
            width={150}
            height={32}
            className="h-8 w-auto"
          />
        </Link>
      </div>

      {/* Role Badge */}
      <div className="px-4 py-2">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
            role === "admin"
              ? "bg-purple-500/20 text-purple-300"
              : "bg-blue-500/20 text-blue-300"
          }`}
        >
          <Shield className="w-3 h-3" />
          {role === "admin" ? "Administrador" : "Vendedor"}
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User info & Logout */}
      <div className="p-4 border-t border-slate-700">
        <div className="mb-4">
          <p className="text-sm text-slate-400">Logado como</p>
          <p className="font-medium truncate">{user.name || user.email}</p>
        </div>
        <Button
          variant="outline"
          className="w-full bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
