import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  GitBranch,
  Users,
  Settings,
  LogOut,
  Sparkles,
  ChevronRight,
  Star,
  FolderKanban,
  MoreHorizontal,
  Plus,
  HelpCircle,
  CreditCard,
  User,
  Bot,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

// Shadcn Sidebar Components
import {
  Sidebar as SidebarRoot,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarGroupAction,
  SidebarSeparator,
  SidebarMenuAction,
} from "@/components/ui/sidebar";

// UI Components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const navigation = [
  { name: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
  { name: "Pipeline", href: "/app/pipeline", icon: GitBranch },
  { name: "Contatos", href: "/app/contatos", icon: Users },
  { name: "Workflows", href: "/app/workflows", icon: Bot },
  { name: "Configurações", href: "/app/configuracoes", icon: Settings },
];

const favoritos = [
  { name: "Leads Quentes", href: "/app/leads-quentes", icon: Star },
  { name: "Propostas Enviadas", href: "/app/propostas", icon: FolderKanban },
];

const projetos = [
  { name: "Campanha Q1", href: "/app/projetos/campanha-q1", icon: FolderKanban },
  { name: "Onboarding 2024", href: "/app/projetos/onboarding", icon: FolderKanban },
];

export function ClientSidebar() {
  const { signOut, user } = useAuth();
  const [workspace, setWorkspace] = useState("principal");

  return (
    <SidebarRoot collapsible="icon" className="border-r">
      {/* ========== HEADER - BRANDING + WORKSPACE SELECTOR ========== */}
      <SidebarHeader className="border-b">
        <div className="flex items-center justify-between gap-2 px-2 py-2">
          {/* Branding */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-bold">SmartHub</span>
              <span className="text-xs text-muted-foreground">Cliente</span>
            </div>
          </div>

          {/* Toggle Button */}
          <SidebarTrigger className="ml-auto" />
        </div>

        {/* Workspace Selector */}
        <div className="px-2 pb-2 group-data-[collapsible=icon]:hidden">
          <Select value={workspace} onValueChange={setWorkspace}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="principal">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>Workspace Principal</span>
                </div>
              </SelectItem>
              <SelectItem value="vendas">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span>Vendas</span>
                </div>
              </SelectItem>
              <SelectItem value="suporte">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span>Suporte</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </SidebarHeader>

      {/* ========== CONTENT - NAVEGAÇÃO + FAVORITOS + PROJETOS ========== */}
      <SidebarContent className="flex-1 overflow-y-auto">
        {/* Navegação Principal */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild tooltip={item.name}>
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-2 transition-colors",
                          isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        )
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="group-data-[collapsible=icon]:hidden">{item.name}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-2" />

        {/* Seção Favoritos */}
        <SidebarGroup>
          <SidebarGroupLabel>Favoritos</SidebarGroupLabel>
          <SidebarGroupAction title="More">
            <MoreHorizontal className="h-4 w-4" />
          </SidebarGroupAction>
          <SidebarGroupAction title="Add Favorite">
            <Plus className="h-4 w-4" />
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {favoritos.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild tooltip={item.name}>
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-2 transition-colors",
                          isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        )
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="group-data-[collapsible=icon]:hidden">{item.name}</span>
                    </NavLink>
                  </SidebarMenuButton>
                  <SidebarMenuAction>
                    <MoreHorizontal className="h-4 w-4" />
                  </SidebarMenuAction>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Seção Projetos */}
        <SidebarGroup>
          <SidebarGroupLabel>Projetos</SidebarGroupLabel>
          <SidebarGroupAction title="More">
            <MoreHorizontal className="h-4 w-4" />
          </SidebarGroupAction>
          <SidebarGroupAction title="Add Project">
            <Plus className="h-4 w-4" />
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {projetos.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild tooltip={item.name}>
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-2 transition-colors",
                          isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        )
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="group-data-[collapsible=icon]:hidden">{item.name}</span>
                    </NavLink>
                  </SidebarMenuButton>
                  <SidebarMenuAction>
                    <MoreHorizontal className="h-4 w-4" />
                  </SidebarMenuAction>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ========== FOOTER - LINKS + STORAGE + PERFIL ========== */}
      <SidebarFooter className="border-t mt-auto">
        {/* Links de Configurações e Suporte */}
        <div className="px-2 py-2 space-y-1 group-data-[collapsible=icon]:hidden">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            asChild
          >
            <NavLink to="/app/configuracoes">
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </NavLink>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            Suporte
          </Button>
        </div>

        {/* Card de Armazenamento */}
        <div className="px-2 pb-2 group-data-[collapsible=icon]:hidden">
          <Card className="bg-muted/50">
            <CardContent className="p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Armazenamento</span>
                <span className="font-medium">2.3 GB / 10 GB</span>
              </div>
              <Progress value={23} className="h-1" />
              <Button size="sm" variant="outline" className="w-full">
                Upgrade
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Perfil do Usuário */}
        <div className="px-2 pb-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-2 h-auto"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={user?.email} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left group-data-[collapsible=icon]:hidden">
                    <span className="text-sm font-medium">
                      {user?.email?.split("@")[0]}
                    </span>
                    <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                      {user?.email}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Meu Perfil
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="mr-2 h-4 w-4" />
                Meu Plano
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </SidebarRoot>
  );
}
