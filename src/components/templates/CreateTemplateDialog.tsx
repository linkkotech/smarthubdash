import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTemplateDialog({ open, onOpenChange }: CreateTemplateDialogProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateType, setTemplateType] = useState<"profile_template" | "content_block">("profile_template");
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = () => {
    setTemplateName("");
    setTemplateDescription("");
    setTemplateType("profile_template");
  };

  const handleSaveAndContinue = async () => {
    // Validação
    const trimmedName = templateName.trim();
    if (!trimmedName) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, preencha o nome do template.",
        variant: "destructive",
      });
      return;
    }

    if (trimmedName.length > 100) {
      toast({
        title: "Nome muito longo",
        description: "O nome deve ter no máximo 100 caracteres.",
        variant: "destructive",
      });
      return;
    }

    const trimmedDescription = templateDescription.trim();
    if (trimmedDescription.length > 500) {
      toast({
        title: "Descrição muito longa",
        description: "A descrição deve ter no máximo 500 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Obter usuário autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para criar um template.",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      // Executar INSERT
      const { data, error } = await supabase
        .from('digital_templates')
        .insert({
          name: trimmedName,
          description: trimmedDescription || null,
          type: templateType,
          content: { blocks: [], design: {}, settings: {} },
          created_by: user.id,
        })
        .select('id, type')
        .single();

      if (error) {
        console.error('Erro ao criar template:', error);
        toast({
          title: "Erro ao criar template",
          description: error.message,
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      // Determinar mode baseado no type
      const mode = data.type === 'profile_template' ? 'profile' : 'block';

      // Sucesso
      toast({
        title: "Template criado",
        description: "Redirecionando para o editor...",
      });

      // Fechar modal e resetar
      onOpenChange(false);
      resetForm();

      // Redirecionar
      navigate(`/templates-digitais/editor?id=${data.id}&mode=${mode}`);
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Não foi possível criar o template.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSaving) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Item</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nome do Template */}
          <div className="space-y-2">
            <Label htmlFor="template-name">
              Nome do Template <span className="text-destructive">*</span>
            </Label>
            <Input
              id="template-name"
              placeholder="Ex: Perfil de Advogado"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              disabled={isSaving}
              maxLength={100}
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="template-description">
              Descrição (opcional)
            </Label>
            <Textarea
              id="template-description"
              placeholder="Descreva brevemente o propósito deste template..."
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              disabled={isSaving}
              maxLength={500}
              rows={3}
            />
          </div>

          {/* Tipo de Template */}
          <div className="space-y-2">
            <Label htmlFor="template-type">
              Tipo de Template <span className="text-destructive">*</span>
            </Label>
            <Select
              value={templateType}
              onValueChange={(value) => setTemplateType(value as "profile_template" | "content_block")}
              disabled={isSaving}
            >
              <SelectTrigger id="template-type">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="profile_template">
                  Template de Perfil Completo
                </SelectItem>
                <SelectItem value="content_block">
                  Bloco de Conteúdo
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSaveAndContinue}
            disabled={isSaving || !templateName.trim()}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              "Salvar e Continuar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
