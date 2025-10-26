import { Agent } from "@/pages/client/AgentSettingsPage";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Briefcase, 
  Brain, 
  Mic, 
  Eye, 
  Plug, 
  Wrench,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AgentSettingsSidebarProps {
  agent: Agent;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  subItems?: { id: string; label: string }[];
}

export function AgentSettingsSidebar({ 
  agent, 
  activeSection, 
  onSectionChange 
}: AgentSettingsSidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>(["personalidade"]);

  const menuItems: MenuItem[] = [
    {
      id: "personalidade",
      label: "Personalidade",
      icon: <Settings className="h-4 w-4" />,
      subItems: [
        { id: "personalidade-basico", label: "Básico" },
        { id: "personalidade-avancado", label: "Avançado" },
      ],
    },
    {
      id: "cargo",
      label: "Cargo",
      icon: <Briefcase className="h-4 w-4" />,
    },
    {
      id: "cerebro",
      label: "Cérebro",
      icon: <Brain className="h-4 w-4" />,
    },
    {
      id: "voz",
      label: "Voz",
      icon: <Mic className="h-4 w-4" />,
    },
    {
      id: "visual",
      label: "Visual",
      icon: <Eye className="h-4 w-4" />,
    },
    {
      id: "integracoes",
      label: "Integrações",
      icon: <Plug className="h-4 w-4" />,
    },
    {
      id: "ferramentas",
      label: "Ferramentas",
      icon: <Wrench className="h-4 w-4" />,
    },
  ];

  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col items-center text-center space-y-3">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
            {agent.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-semibold">{agent.name}</h2>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Modelo</label>
        <Select defaultValue={agent.model}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione o modelo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
            <SelectItem value="gpt-4o">GPT-4o</SelectItem>
            <SelectItem value="claude-3-5-sonnet">Claude 3.5 Sonnet</SelectItem>
            <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <nav className="space-y-1">
        {menuItems.map((item) => (
          <div key={item.id}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-between h-auto py-2",
                activeSection === item.id && "bg-muted"
              )}
              onClick={() => {
                if (item.subItems) {
                  toggleExpand(item.id);
                } else {
                  onSectionChange(item.id);
                }
              }}
            >
              <div className="flex items-center gap-2">
                {item.icon}
                <span className="text-sm">{item.label}</span>
              </div>
              {item.subItems && (
                expandedItems.includes(item.id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )
              )}
            </Button>

            {item.subItems && expandedItems.includes(item.id) && (
              <div className="ml-6 mt-1 space-y-1">
                {item.subItems.map((subItem) => (
                  <Button
                    key={subItem.id}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start text-sm",
                      activeSection === subItem.id && "bg-muted"
                    )}
                    onClick={() => onSectionChange(subItem.id)}
                  >
                    • {subItem.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
