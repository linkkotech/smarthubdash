import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface CreateProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  clientId: string;
}

interface AvailableUser {
  id: string;
  full_name: string;
  email: string;
  client_user_role: string | null;
}

interface AvailableTemplate {
  id: string;
  name: string;
  description: string | null;
  type: string;
}

export function CreateProfileModal({ open, onOpenChange, onSuccess, clientId }: CreateProfileModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [availableTemplates, setAvailableTemplates] = useState<AvailableTemplate[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [allowEdit, setAllowEdit] = useState(false);
  const [sendInvite, setSendInvite] = useState(false);

  // Log detalhado para depuração
  useEffect(() => {
    const timestamp = new Date().toISOString();
    console.log(`🟣 [${timestamp}] CreateProfileModal - prop 'open' mudou para:`, open);
    
    if (!open) {
      console.trace("⚠️ Modal fechado - stack trace:");
    }
  }, [open]);

  // Fetch available users (users without digital profiles)
  const fetchAvailableUsers = async () => {
    try {
      // 1. Buscar todos os usuários do client_id
      const { data: allUsers, error: usersError } = await supabase
        .from("profiles")
        .select("id, full_name, email, client_user_role")
        .eq("client_id", clientId);

      if (usersError) throw usersError;

      // 2. Buscar todos os perfis existentes
      const { data: existingProfiles, error: profilesError } = await supabase
        .from("digital_profiles")
        .select("content")
        .eq("client_id", clientId);

      if (profilesError) throw profilesError;

      // 3. Extrair profile_user_id do campo content (JSONB)
      const existingUserIds = existingProfiles
        .map((profile) => {
          const content = profile.content as any;
          return content?.profile_user_id;
        })
        .filter(Boolean);

      // 4. Filtrar usuários que não possuem perfil
      const usersWithoutProfiles = allUsers?.filter(
        (user) => !existingUserIds.includes(user.id)
      ) || [];

      setAvailableUsers(usersWithoutProfiles);
    } catch (error: any) {
      console.error("Error fetching available users:", error);
      toast({
        title: "Erro ao carregar usuários",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Fetch available templates
  const fetchAvailableTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("digital_templates")
        .select("id, name, description, type")
        .eq("type", "profile_template")
        .eq("status", "published");

      if (error) throw error;
      setAvailableTemplates(data || []);
    } catch (error: any) {
      console.error("Error fetching templates:", error);
      toast({
        title: "Erro ao carregar templates",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (open && clientId) {
      fetchAvailableUsers();
      fetchAvailableTemplates();
    }
  }, [open, clientId]);

  // Generate slug from user name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/[^a-z0-9]+/g, "-") // Substitui caracteres especiais por hífen
      .replace(/^-+|-+$/g, ""); // Remove hífens no início/fim
  };

  // Get initials for avatar
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSubmit = async () => {
    // Validação
    if (!selectedUserId || !selectedTemplateId) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, selecione um usuário e um template.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Buscar dados completos do usuário e template selecionados
      const selectedUser = availableUsers.find((u) => u.id === selectedUserId);
      const selectedTemplate = availableTemplates.find((t) => t.id === selectedTemplateId);

      if (!selectedUser || !selectedTemplate) {
        throw new Error("Usuário ou template não encontrado");
      }

      // Gerar slug
      const slug = generateSlug(selectedUser.full_name);

      // Construir o content (JSONB)
      const content = {
        profile_user_id: selectedUser.id,
        name: selectedUser.full_name,
        position: selectedUser.client_user_role || "Membro da equipe",
        company: "", // Pode ser preenchido futuramente
        email: selectedUser.email,
        avatar_url: null,
        plan_badge: selectedTemplate.name,
        allow_edit: allowEdit,
      };

      // Inserir novo perfil digital
      const { data: newProfile, error: insertError } = await supabase
        .from("digital_profiles")
        .insert({
          client_id: clientId,
          active_template_id: selectedTemplateId,
          type: "business_card",
          status: "draft",
          slug: slug,
          content: content,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Se sendInvite estiver ativo, chamar Edge Function (implementar posteriormente)
      if (sendInvite) {
        // TODO: Implementar chamada para Edge Function de envio de e-mail
        console.log("Enviar convite para:", selectedUser.email);
      }

      toast({
        title: "Perfil criado com sucesso!",
        description: `O perfil de ${selectedUser.full_name} foi criado.`,
      });

      // Reset form
      setSelectedUserId("");
      setSelectedTemplateId("");
      setAllowEdit(false);
      setSendInvite(false);

      // Close modal and refresh list
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error creating profile:", error);
      toast({
        title: "Erro ao criar perfil",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedUser = availableUsers.find((u) => u.id === selectedUserId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Perfil Digital</DialogTitle>
          <DialogDescription>
            Crie um novo perfil digital para um usuário da sua equipe.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Campo: Usuário */}
          <div className="space-y-2">
            <Label htmlFor="user">Selecione um Usuário *</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger id="user">
                <SelectValue placeholder="Escolha um usuário" />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    Todos os usuários já possuem perfil digital
                  </div>
                ) : (
                  availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name} - {user.email}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Preview do Usuário Selecionado */}
          {selectedUser && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(selectedUser.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{selectedUser.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedUser.client_user_role || "Membro da equipe"}
                    </p>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Campo: Template */}
          <div className="space-y-2">
            <Label htmlFor="template">Escolha o Template *</Label>
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger id="template">
                <SelectValue placeholder="Escolha um template" />
              </SelectTrigger>
              <SelectContent>
                {availableTemplates.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    Nenhum template disponível
                  </div>
                ) : (
                  availableTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div>
                        <div className="font-medium">{template.name}</div>
                        {template.description && (
                          <div className="text-xs text-muted-foreground">
                            {template.description}
                          </div>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Switch: Permitir Edição */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-edit">Permitir que o usuário edite este perfil</Label>
              <p className="text-sm text-muted-foreground">
                O usuário poderá atualizar suas informações
              </p>
            </div>
            <Switch
              id="allow-edit"
              checked={allowEdit}
              onCheckedChange={setAllowEdit}
            />
          </div>

          {/* Switch: Enviar Convite */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="send-invite">Enviar e-mail de convite para o usuário</Label>
              <p className="text-sm text-muted-foreground">
                O usuário receberá um e-mail com o link do perfil
              </p>
            </div>
            <Switch
              id="send-invite"
              checked={sendInvite}
              onCheckedChange={setSendInvite}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !selectedUserId || !selectedTemplateId}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Criar Perfil
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
