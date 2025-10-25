import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Building2, 
  Settings,
  LogOut,
  UserCog,
  Sparkles,
  Grid3x3,
  ChevronRight,
  Star,
  Folder,
  MoreHorizontal,
  Plus,
  HelpCircle,
  HardDrive,
  CreditCard
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

// Shadcn Sidebar Components
import {
  Sidebar as SidebarRoot,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";

// UI Components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Clientes", href: "/clientes", icon: Building2 },
  { name: "Planos", href: "/planos", icon: Package },
  { name: "Equipe", href: "/equipe", icon: Users },
  { name: "Usuários de Clientes", href: "/usuarios-clientes", icon: UserCog },
  { name: "Configurações", href: "/configuracoes", icon: Settings },
];

export function Sidebar() {
  const { signOut, user } = useAuth();

  return (
    <SidebarRoot collapsible="icon" className="border-r">
      {/* ========== SEÇÃO 1: HEADER - BRANDING + WORKSPACE SELECTOR ========== */}
      <SidebarHeader className="border-b">
        <div className="flex items-center justify-between gap-2 px-2 py-2">
          {/* Branding */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-bold">SmartHub</span>
              <span className="text-xs text-muted-foreground">AI Studio</span>
            </div>
          </div>

          {/* Toggle Button */}
          <SidebarTrigger className="ml-auto" />
        </div>

        {/* Workspace Selector */}
          <div className="px-2 pb-2 group-data-[collapsible=icon]:hidden">
            <Select defaultValue="main">
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder="Selecione um workspace" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main">
                  <div className="flex items-center gap-2">
                    <Grid3x3 className="h-4 w-4" />
                    Workspace Principal
                  </div>
                </SelectItem>
                <SelectItem value="dev">
                  <div className="flex items-center gap-2">
                    <Grid3x3 className="h-4 w-4" />
                    Desenvolvimento
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
      </SidebarHeader>

      {/* ========== SEÇÃO 2 e 3: CONTENT - NAVEGAÇÃO + SEÇÕES DINÂMICAS ========== */}
      <SidebarContent className="flex-1 overflow-y-auto">
        {/* Navegação Principal */}
        <SidebarGroup>
          <SidebarMenu>
            {navigation.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild tooltip={item.name}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2 transition-colors",
                        "group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10",
                        "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:bg-muted",
                        "group-data-[collapsible=icon]:rounded-md group-data-[collapsible=icon]:hover:bg-accent",
                        isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
                        isActive && "group-data-[collapsible=icon]:bg-sidebar-accent"
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
        </SidebarGroup>

        <SidebarSeparator className="group-data-[collapsible=icon]:hidden" />

        {/* Seção Favoritos */}
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <div className="flex items-center justify-between px-2 py-1">
            <SidebarGroupLabel className="flex items-center gap-2 text-xs">
              <Star className="h-4 w-4 fill-blue-500 text-blue-500" />
              Favoritos
            </SidebarGroupLabel>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <SidebarGroupContent>
            {/* Conteúdo placeholder - implementar futuramente */}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Seção Projetos */}
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <div className="flex items-center justify-between px-2 py-1">
            <SidebarGroupLabel className="flex items-center gap-2 text-xs">
              <Folder className="h-4 w-4 fill-orange-500 text-orange-500" />
              Projetos
            </SidebarGroupLabel>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <SidebarGroupContent>
            {/* Conteúdo placeholder - implementar futuramente */}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ========== SEÇÃO 4 e 5: FOOTER - LINKS + CARD + PERFIL ========== */}
      <SidebarFooter className="border-t mt-auto">
        {/* Links de Rodapé */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Configurações">
              <a 
                href="/configuracoes" 
                className={cn(
                  "flex items-center gap-2 transition-colors",
                  "group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10",
                  "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:bg-muted",
                  "group-data-[collapsible=icon]:rounded-md group-data-[collapsible=icon]:hover:bg-accent"
                )}
              >
                <Settings className="h-4 w-4 shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden">Configurações</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-data-[collapsible=icon]:hidden ml-auto" />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Suporte">
              <a 
                href="/suporte" 
                className={cn(
                  "flex items-center gap-2 transition-colors",
                  "group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10",
                  "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:bg-muted",
                  "group-data-[collapsible=icon]:rounded-md group-data-[collapsible=icon]:hover:bg-accent"
                )}
              >
                <HelpCircle className="h-4 w-4 shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden">Suporte</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-data-[collapsible=icon]:hidden ml-auto" />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Card de Uso de Armazenamento */}
        <Card className="mx-2 mb-2 group-data-[collapsible=icon]:hidden">
          <CardContent className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium">Armazenamento</span>
              </div>
              <span className="text-xs font-bold">85%</span>
            </div>
            
            <Progress value={85} className="h-2" />
            
            <p className="text-xs text-muted-foreground">
              1.8 GB de 2 GB usados
            </p>
            
            <Button variant="link" size="sm" className="h-auto p-0 text-xs">
              Upgrade
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Perfil do Usuário com Dropdown */}
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
                    {user?.email?.split('@')[0]}
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
              <Settings className="mr-2 h-4 w-4" />
              Configurações do Perfil
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CreditCard className="mr-2 h-4 w-4" />
              Plano e Faturamento
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </SidebarRoot>
  );
}
