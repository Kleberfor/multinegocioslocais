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
  Settings,
  LogOut,
  CreditCard,
  UserPlus,
  Calendar,
} from "lucide-react";

interface AdminSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

const menuItems = [
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
];

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();

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
