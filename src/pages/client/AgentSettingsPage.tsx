import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { usePageHeader } from "@/contexts/PageHeaderContext";
import { AgentSettingsSidebar } from "@/components/agents/AgentSettingsSidebar";
import { PersonalityForm } from "@/components/agents/PersonalityForm";
import { ChatSidebar } from "@/components/clients/ChatSidebar";
import { Skeleton } from "@/components/ui/skeleton";

export interface Agent {
  id: string;
  name: string;
  model: string;
  created_at: string;
  updated_at: string;
}

function AgentSettingsSkeleton() {
  return (
    <div className="flex h-full bg-background -m-8">
      <aside className="w-[350px] border-r bg-card h-full overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center space-y-3">
            <Skeleton className="h-20 w-20 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden h-full overflow-y-auto">
        <div className="p-8 space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </main>

      <aside className="w-[300px] border-l bg-card h-full overflow-y-auto">
        <div className="p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-64 w-full" />
        </div>
      </aside>
    </div>
  );
}

export default function AgentSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const { setConfig } = usePageHeader();
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>("personalidade");

  useEffect(() => {
    if (agent) {
      setConfig({
        title: agent.name,
        showSearch: false,
      });
    }
  }, [agent, setConfig]);

  useEffect(() => {
    setTimeout(() => {
      setAgent({
        id: id || "novo",
        name: id ? "Agente SDR" : "Novo Agente",
        model: "gpt-4o-mini",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) {
    return <AgentSettingsSkeleton />;
  }

  if (!agent) {
    return null;
  }

  return (
    <div className="flex h-full bg-background -m-8">
      <aside className="w-[350px] border-r bg-card h-full overflow-y-auto">
        <AgentSettingsSidebar 
          agent={agent}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
      </aside>

      <main className="flex-1 overflow-x-hidden h-full overflow-y-auto">
        {activeSection === "personalidade" && <PersonalityForm agent={agent} />}
        {activeSection === "personalidade-basico" && <PersonalityForm agent={agent} />}
        {activeSection === "personalidade-avancado" && <PersonalityForm agent={agent} />}
        {activeSection === "cargo" && <div className="p-8"><p className="text-muted-foreground">Cargo (Em breve)</p></div>}
        {activeSection === "cerebro" && <div className="p-8"><p className="text-muted-foreground">Cérebro (Em breve)</p></div>}
        {activeSection === "voz" && <div className="p-8"><p className="text-muted-foreground">Voz (Em breve)</p></div>}
        {activeSection === "visual" && <div className="p-8"><p className="text-muted-foreground">Visual (Em breve)</p></div>}
        {activeSection === "integracoes" && <div className="p-8"><p className="text-muted-foreground">Integrações (Em breve)</p></div>}
        {activeSection === "ferramentas" && <div className="p-8"><p className="text-muted-foreground">Ferramentas (Em breve)</p></div>}
      </main>

      <aside className="w-[300px] border-l bg-card h-full overflow-y-auto">
        <ChatSidebar />
      </aside>
    </div>
  );
}
