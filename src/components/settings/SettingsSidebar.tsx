import { NavLink } from "react-router-dom";
import { Building2, Settings, Shield, Users, MailCheck, HardDrive, Grid, CreditCard, ListPlus, Timer, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const settingsNavigation = [
  { name: "Empresa", href: "/configuracoes/empresa", icon: Building2 },
  { name: "Geral", href: "/configuracoes/geral", icon: Settings },
  { name: "Segurança", href: "/configuracoes/seguranca", icon: Shield },
  { name: "Roles & Permissions", href: "/configuracoes/roles", icon: Users },
  { name: "Autenticação e E-mail", href: "/configuracoes/autenticacao", icon: MailCheck },
  { name: "Storage e Uploads", href: "/configuracoes/storage", icon: HardDrive },
  { name: "Módulos e Integrações", href: "/configuracoes/modulos", icon: Grid },
  { name: "Credenciais de Pagamento", href: "/configuracoes/pagamento", icon: CreditCard },
  { name: "Custom Fields", href: "/configuracoes/campos", icon: ListPlus },
  { name: "Agendamentos (Cron Job)", href: "/configuracoes/cron", icon: Timer },
  { name: "Logs e Auditoria", href: "/configuracoes/logs", icon: FileText },
];

export function SettingsSidebar() {
  return (
    <aside className="w-[280px] flex-shrink-0 border-r bg-card h-full overflow-y-auto">
      <div className="p-6 space-y-2">
        <h2 className="text-lg font-semibold mb-4">Configurações</h2>
        <nav className="space-y-1">
          {settingsNavigation.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
