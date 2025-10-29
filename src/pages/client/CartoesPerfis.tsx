import { useState, useEffect } from "react";
import { usePageHeader } from "@/contexts/PageHeaderContext";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CartoesPerfis() {
  const { setConfig } = usePageHeader();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    console.log("🔧 Configurando PageHeader com primaryAction");
    
    setConfig({
      title: "Perfis Digitais",
      primaryAction: {
        label: "Criar Perfil",
        icon: <Plus className="h-4 w-4" />,
        onClick: () => {
          console.log("🟢 primaryAction.onClick chamado - abrindo modal");
          setIsCreateModalOpen(true);
        },
      },
    });
    
    return () => {
      console.log("🧹 Limpando configuração do PageHeader");
      setConfig({ title: "" });
    };
  }, [setConfig]);

  // Log para monitorar mudanças no estado do modal
  useEffect(() => {
    console.log("🟡 Estado isCreateModalOpen mudou para:", isCreateModalOpen);
  }, [isCreateModalOpen]);

  return (
    <>
      {/* Placeholder para conteúdo futuro */}
      <div className="p-8">
        <div className="text-center text-muted-foreground">
          <p className="text-lg">Conteúdo da página de Perfis Digitais</p>
          <p className="text-sm mt-2">
            Clique no botão "+ Criar Perfil" no header acima para testar o modal
          </p>
        </div>
      </div>

      {/* Modal de Teste "Lov Free" */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lov Free - Modal Funcionando! 🎉</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-sm text-muted-foreground">
              Se você está vendo este modal, significa que o botão do PageHeader
              está funcionando corretamente via contexto!
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
