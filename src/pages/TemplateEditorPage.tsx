import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { usePageHeader } from "@/contexts/PageHeaderContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { EditorSidebar, EditorSection } from "@/components/templates/EditorSidebar";
import { ProfileSettingsForm } from "@/components/templates/ProfileSettingsForm";
import { Button } from "@/components/ui/button";
import { 
  Save, 
  Eye, 
  Settings, 
  Image as ImageIcon, 
  Type, 
  Layout,
  ChevronLeft,
  Plus,
  Link,
  Video,
  User,
  Calendar,
  Users,
  FileText,
  Image,
  Info,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LinkBlockEditor } from "@/components/templates/blocks/LinkBlockEditor";
import { HeroBlockEditor, type HeroBlockData } from "@/components/templates/blocks/HeroBlockEditor";
import { FooterBlockEditor, type FooterBlockData } from "@/components/templates/blocks/FooterBlockEditor";
import { AdvancedSettings } from "@/components/templates/AdvancedSettings";

// Interface para representar um bloco
interface Block {
  id: string;
  type: StandardBlockType;
  data: Record<string, any>;
  order: number;
}

// Tipos de blocos padrão disponíveis
type StandardBlockType =
  | "links"
  | "video_embed"
  | "about_me"
  | "calendly_button"
  | "social_icons"
  | "files"
  | "photo_gallery";

interface StandardBlock {
  id: StandardBlockType;
  title: string;
  description: string;
  icon: React.ElementType;
}

// Definição dos blocos padrão
const STANDARD_BLOCKS: StandardBlock[] = [
  {
    id: "links",
    title: "Links",
    description: "Customize how you share URLs on your page.",
    icon: Link,
  },
  {
    id: "video_embed",
    title: "Video Embed",
    description: "Embed a YouTube or Vimeo video on your page.",
    icon: Video,
  },
  {
    id: "about_me",
    title: "About Me",
    description: "Write about yourself, or something that matters to you.",
    icon: User,
  },
  {
    id: "calendly_button",
    title: "Calendly Button",
    description: "Directly link to your Calendly from your page.",
    icon: Calendar,
  },
  {
    id: "social_icons",
    title: "Social Icons",
    description: "Choose from up to 20 social media icons to add to your page",
    icon: Users,
  },
  {
    id: "files",
    title: "Files",
    description: "Upload files to your page for others to view and/or download.",
    icon: FileText,
  },
  {
    id: "photo_gallery",
    title: "Photo Gallery",
    description: "Create a grid of photos and/or graphics.",
    icon: Image,
  },
];

// Dados padrão para cada tipo de bloco
function getDefaultDataForBlockType(type: StandardBlockType): Record<string, any> {
  switch (type) {
    case 'links':
      return {
        destinationUrl: '',
        openInNewTab: false,
        name: 'Novo Link',
        imageThumbnail: null,
        icon: 'fas fa-link',
        textColor: '#000000',
        backgroundColor: '#ffffff',
        textAlignment: 'center',
        animation: 'none',
        sensitiveContent: false,
        columns: '1',
        borderConfig: {},
        shadowConfig: {},
        displayConfig: {},
      };
    default:
      return {};
  }
}

interface ContentBlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBlockSelect: (blockId: StandardBlockType) => void;
}

function ContentBlockDialog({ open, onOpenChange, onBlockSelect }: ContentBlockDialogProps) {
  const [selectedCustomBlock, setSelectedCustomBlock] = useState<string>("");

  const handleStandardBlockSelect = (blockId: StandardBlockType) => {
    onBlockSelect(blockId);
    onOpenChange(false);
  };

  const handleCustomBlockSelect = (blockId: string) => {
    console.log(`Bloco personalizado '${blockId}' selecionado`);
    onOpenChange(false);
    // TODO: Adicionar bloco personalizado ao canvas
  };

  // Dados mockados para blocos personalizados
  const customBlocks = [
    { id: "hero-abc", name: "Bloco Hero - Cliente ABC" },
    { id: "cta-promo", name: "Bloco de CTA - Promo 2024" },
    { id: "testimonial-1", name: "Bloco de Depoimentos - V1" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tipos de Conteúdo</DialogTitle>
        </DialogHeader>

        {/* Alert Informativo */}
        <Alert variant="default" className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm">
            Escolha o tipo de conteúdo que você gostaria de adicionar à sua página.
            Você pode editar, reordenar e remover o conteúdo a qualquer momento.
          </AlertDescription>
        </Alert>

        {/* Seção 1: Blocos Padrão */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Blocos Padrão</h3>
          
          <div className="grid gap-3">
            {STANDARD_BLOCKS.map((block) => {
              const Icon = block.icon;
              return (
                <button
                  key={block.id}
                  onClick={() => handleStandardBlockSelect(block.id)}
                  className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent hover:border-primary transition-colors text-left w-full"
                >
                  {/* Ícone com fundo azul */}
                  <div className="shrink-0 w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  
                  {/* Título e Descrição */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-blue-600 mb-1">
                      {block.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {block.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Seção 2: Blocos Personalizados */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Blocos de Conteúdo Personalizados</h3>
          
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              Selecionar um bloco de conteúdo existente
            </label>
            
            <Select
              value={selectedCustomBlock}
              onValueChange={(value) => {
                setSelectedCustomBlock(value);
                handleCustomBlockSelect(value);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Escolha um bloco personalizado..." />
              </SelectTrigger>
              <SelectContent>
                {customBlocks.map((block) => (
                  <SelectItem key={block.id} value={block.id}>
                    {block.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="sm:justify-start">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Componente para controle de status do perfil
interface StatusDropdownProps {
  currentStatus: "draft" | "published" | "archived";
  onStatusChange: (status: "draft" | "published" | "archived") => void;
}

function StatusDropdown({ currentStatus, onStatusChange }: StatusDropdownProps) {
  // Mapeamento de status para labels em português
  const statusLabels = {
    draft: "Rascunho",
    published: "Publicado",
    archived: "Arquivado",
  };

  // Mapeamento de status para variantes de estilo
  const statusVariants = {
    draft: "secondary", // Cinza
    published: "default", // Verde (customizado)
    archived: "destructive", // Vermelho
  };

  // Classe customizada para status "published" (verde)
  const getStatusClasses = (status: "draft" | "published" | "archived") => {
    if (status === "published") {
      return "bg-green-500 hover:bg-green-600 text-white";
    }
    return ""; // Usar variante padrão para outros status
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={currentStatus === "published" ? undefined : statusVariants[currentStatus] as any}
          size="sm"
          className={cn(
            "gap-2 min-w-[140px]",
            getStatusClasses(currentStatus)
          )}
        >
          {statusLabels[currentStatus]}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px]">
        <DropdownMenuItem
          onClick={() => onStatusChange("draft")}
          className="flex items-center justify-between"
        >
          <span>Rascunho</span>
          {currentStatus === "draft" && <CheckCircle2 className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onStatusChange("published")}
          className="flex items-center justify-between"
        >
          <span>Publicado</span>
          {currentStatus === "published" && <CheckCircle2 className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onStatusChange("archived")}
          className="flex items-center justify-between"
        >
          <span>Arquivado</span>
          {currentStatus === "archived" && <CheckCircle2 className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Canvas Area Component

function CanvasArea({ 
  mode, 
  blocks,
  heroData,
  footerData,
  onUpdateHeroBlock,
  onUpdateFooterBlock,
  onUpdateBlock, 
  onDeleteBlock, 
  onDuplicateBlock,
  onAddBlock 
}: { 
  mode: "profile" | "block";
  blocks: Block[];
  heroData: HeroBlockData;
  footerData: FooterBlockData;
  onUpdateHeroBlock: (data: HeroBlockData) => void;
  onUpdateFooterBlock: (data: FooterBlockData) => void;
  onUpdateBlock: (id: string, data: Record<string, any>) => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
  onAddBlock: (blockId: StandardBlockType) => void;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="h-full overflow-y-auto p-8 flex flex-col items-start gap-6">
      {/* Sempre alinhado ao topo (items-start no flex) */}
      
      {mode === "profile" && (
        // Modo Perfil: Hero Block Editável
        <HeroBlockEditor
          id="hero-fixed"
          data={heroData}
          onUpdate={onUpdateHeroBlock}
        />
      )}

      {/* Renderizar blocos dinâmicos */}
      {blocks.map((block) => {
        if (block.type === 'links') {
          return (
            <LinkBlockEditor
              key={block.id}
              id={block.id}
              data={block.data}
              onUpdate={(data) => onUpdateBlock(block.id, data)}
              onDelete={() => onDeleteBlock(block.id)}
              onDuplicate={() => onDuplicateBlock(block.id)}
            />
          );
        }
        return null;
      })}

      {/* Botão para adicionar blocos */}
      <Button 
        onClick={() => setIsDialogOpen(true)}
        variant="outline"
        className="w-full border-dashed border-2 h-16 text-muted-foreground hover:text-foreground hover:border-primary"
      >
        <Plus className="h-5 w-5 mr-2" />
        Adicionar Bloco de Conteúdo
      </Button>

      {/* Footer Block (Fixo na Parte Inferior) */}
      {mode === "profile" && (
        <FooterBlockEditor
          id="footer-fixed"
          data={footerData}
          onUpdate={onUpdateFooterBlock}
        />
      )}

      {/* Modal de seleção de blocos */}
      <ContentBlockDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        onBlockSelect={onAddBlock}
      />
    </div>
  );
}

function PreviewArea({ mode }: { mode: "profile" | "block" }) {
  if (mode === "profile") {
    // Modo Perfil: Mockup de Smartphone
    return (
      <div className="p-6 flex items-start justify-center">
        <div className="relative w-[280px] h-[580px] bg-gray-900 rounded-[40px] border-8 border-gray-800 shadow-2xl">
          {/* Notch do smartphone */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-10"></div>
          
          {/* Tela do smartphone */}
          <div className="w-full h-full bg-white rounded-[32px] overflow-hidden">
            <div className="p-4 space-y-3">
              <div className="w-full h-24 bg-blue-500 rounded-lg"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          </div>
          
          {/* Botão home */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-gray-700 rounded-full"></div>
        </div>
      </div>
    );
  } else {
    // Modo Bloco: Canvas pontilhado com conteúdo centralizado
    return (
      <div className="p-6 h-full">
        <div className="w-full h-full border-2 border-dashed border-muted-foreground/50 rounded-lg flex items-center justify-center">
          {/* Conteúdo do preview é centralizado verticalmente (items-center no flex) */}
          <div className="text-center space-y-2">
            <p className="text-sm font-medium">Preview do Bloco</p>
            <p className="text-xs text-muted-foreground">
              O conteúdo aparecerá aqui
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default function TemplateEditorPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setConfig } = usePageHeader();
  const { user } = useAuth();
  
  const mode = (searchParams.get("mode") || "profile") as "profile" | "block";
  const templateId = searchParams.get("id");
  
  // Estados do editor
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [templateName, setTemplateName] = useState("Novo Template");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateType, setTemplateType] = useState<"profile_template" | "content_block">("profile_template");
  const [profileStatus, setProfileStatus] = useState<"draft" | "published" | "archived">("draft");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<EditorSection>("conteudo");
  
  // Estado do Hero Block
  const [heroData, setHeroData] = useState<HeroBlockData>({
    showHeaderLogo: false,
    profileImage: null,
    name: "",
    position: "",
    company: "",
    phone: "",
    email: "",
    emailMode: "mailto",
    whatsapp: "",
    showCTA: false,
  });
  const [linkedProfilesCount, setLinkedProfilesCount] = useState(0);
  
  // Estado do Footer Block
  const [footerData, setFooterData] = useState<FooterBlockData>({
    buttons: [
      { icon: null, text: "Botão 1", url: "" },
      { icon: null, text: "Botão 2", url: "" },
      { icon: null, text: "Botão 3", url: "" },
      { icon: null, text: "Botão 4", url: "" },
    ],
  });

  // Atualizar dados de um bloco
  const handleUpdateBlock = (id: string, data: Record<string, any>) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, data } : block
    ));
  };

  // Deletar um bloco
  const handleDeleteBlock = (id: string) => {
    setBlocks(blocks.filter(block => block.id !== id));
  };

  // Duplicar um bloco
  const handleDuplicateBlock = (id: string) => {
    const blockToDuplicate = blocks.find(block => block.id === id);
    if (!blockToDuplicate) return;

    const newBlock: Block = {
      ...blockToDuplicate,
      id: crypto.randomUUID(),
      order: blocks.length,
      data: { ...blockToDuplicate.data, name: `${blockToDuplicate.data.name} (Cópia)` }
    };

    setBlocks([...blocks, newBlock]);
  };

  // Adicionar novo bloco
  const handleAddBlock = (blockId: StandardBlockType) => {
    const newBlock: Block = {
      id: crypto.randomUUID(),
      type: blockId,
      data: getDefaultDataForBlockType(blockId),
      order: blocks.length,
    };
    
    setBlocks([...blocks, newBlock]);
  };

  // Handler para atualizar Hero
  const handleUpdateHeroBlock = useCallback((data: HeroBlockData) => {
    setHeroData(data);
    // TODO: Futuramente adicionar bloco CTA se showCTA === true
    if (data.showCTA) {
      console.log("🚀 TODO: Adicionar bloco CTA abaixo do Hero");
    }
  }, []);

  // Handler para atualizar Footer
  const handleUpdateFooterBlock = useCallback((data: FooterBlockData) => {
    setFooterData(data);
    console.log("✅ Footer atualizado:", data);
  }, []);

  // Handler para excluir template
  const handleDeleteTemplate = async () => {
    if (!templateId) {
      toast.error("Nenhum template para excluir");
      return;
    }

    try {
      const { error } = await supabase
        .from('digital_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      toast.success("Template excluído com sucesso");
      navigate("/templates-digitais");
    } catch (error: any) {
      console.error("Erro ao excluir template:", error);
      toast.error("Erro ao excluir template: " + error.message);
    }
  };

  // Função auxiliar para verificar se o usuário é admin da plataforma
  async function checkIfUserIsPlatformAdmin(userId: string): Promise<boolean> {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .in('role', ['super_admin', 'admin', 'manager']);
    
    return (data && data.length > 0) || false;
  }

  // Carregar dados existentes quando houver templateId
  useEffect(() => {
    async function loadTemplate() {
      if (!templateId || !user?.id) return;
      
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('digital_templates')
          .select('*')
          .eq('id', templateId)
          .maybeSingle();
        
        if (error) throw error;
        
        if (!data) {
          toast.error("Template não encontrado.");
          navigate('/templates-digitais');
          return;
        }
        
        // Validação de segurança: verificar se o usuário é o criador ou admin da plataforma
        const isCreator = data.created_by === user.id;
        const isPlatformAdmin = await checkIfUserIsPlatformAdmin(user.id);
        
        if (!isCreator && !isPlatformAdmin) {
          toast.error("Você não tem permissão para editar este template.");
          navigate('/templates-digitais');
          return;
        }
        
        // Carregar dados no editor
        setTemplateName(data.name);
        setTemplateDescription(data.description || "");
        setTemplateType(data.type);
        
        // Carregar status com validação de tipo
        const validStatuses = ["draft", "published", "archived"] as const;
        const loadedStatus = data.status && validStatuses.includes(data.status as any) 
          ? (data.status as "draft" | "published" | "archived")
          : "draft";
        setProfileStatus(loadedStatus);
        
        // Carregar blocos e Hero do content
        if (data.content && typeof data.content === 'object') {
          const content = data.content as any;
          
          // Carregar Hero
          if (content.hero && typeof content.hero === 'object') {
            setHeroData(content.hero as HeroBlockData);
          }
          
          // Carregar Footer
          if (content.footer && typeof content.footer === 'object') {
            setFooterData(content.footer as FooterBlockData);
          }
          
          // TODO: Buscar contagem de perfis vinculados
          // const { count } = await supabase
          //   .from('digital_profiles')
          //   .select('*', { count: 'exact', head: true })
          //   .eq('template_id', templateId);
          // setLinkedProfilesCount(count || 0);
          
          // Carregar blocos
          if (content.blocks && Array.isArray(content.blocks)) {
            setBlocks(content.blocks);
          }
        }
        
        toast.success("Template carregado com sucesso.");
      } catch (error) {
        console.error('Erro ao carregar template:', error);
        toast.error("Não foi possível carregar o template.");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadTemplate();
  }, [templateId, user?.id, navigate]);

  // Função de salvar
  const handleSave = useCallback(async () => {
    if (!user?.id) {
      toast.error("Usuário não autenticado.");
      return;
    }

    // Validação: nome do template é obrigatório
    if (!templateName.trim()) {
      toast.error("O nome do template é obrigatório.");
      return;
    }

    setIsSaving(true);
    
    try {
      // Montar o objeto content (JSONB)
      const content = {
        hero: heroData,
        footer: footerData,
        blocks: blocks,
        design: {
          // Campos de design futuros (cores, fontes, etc.)
        },
        settings: {
          // Configurações adicionais futuras
        },
      };
      
      if (templateId) {
        // ========================================
        // UPDATE: Editar template existente
        // ========================================
        const { error } = await supabase
          .from('digital_templates')
          .update({
            name: templateName.trim(),
            description: templateDescription.trim() || null,
            type: templateType,
            status: profileStatus,
            content: content as any,
            updated_at: new Date().toISOString(),
          })
          .eq('id', templateId);
        
        if (error) throw error;
        
        toast.success("Template atualizado com sucesso! ✅");
      } else {
        // ========================================
        // INSERT: Criar novo template
        // ========================================
        const { data, error } = await supabase
          .from('digital_templates')
          .insert([{
            name: templateName.trim(),
            description: templateDescription.trim() || null,
            type: templateType,
            status: profileStatus,
            content: content as any,
            created_by: user.id,
          }])
          .select('id')
          .single();
        
        if (error) throw error;
        
        toast.success("Template criado com sucesso! ✅");
        
        // Redirecionar para o modo de edição com o novo ID
        navigate(`/templates-digitais/editor?id=${data.id}&mode=${mode}`);
      }
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      
      // Mensagens de erro mais amigáveis
      if (error instanceof Error) {
        if (error.message.includes('violates row-level security')) {
          toast.error("Você não tem permissão para realizar esta ação.");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error("Ocorreu um erro ao salvar o template.");
      }
    } finally {
      setIsSaving(false);
    }
  }, [
    user?.id,
    templateId,
    templateName,
    templateDescription,
    templateType,
    profileStatus,
    heroData,
    footerData,
    blocks,
    mode,
    navigate,
  ]);

  // Configurar PageHeader
  useEffect(() => {
    // Calcular se está pronto para salvar
    const isReadyToSave = !isLoading && !isSaving && !!user && !!templateName.trim();

    setConfig({
      title: isLoading 
        ? "Carregando..." 
        : (mode === "profile" ? templateName : "Editor de Bloco de Conteúdo"),
      showSearch: false,
      showNotifications: false,
      primaryAction: {
        label: isSaving ? "Salvando..." : "Salvar",
        icon: <Save className="h-4 w-4" />,
        onClick: handleSave,
        disabled: !isReadyToSave,
      },
      secondaryAction: {
        label: "Preview",
        icon: <Eye className="h-4 w-4" />,
        onClick: () => {
          console.log("Abrir preview em tela cheia");
          // TODO: Implementar preview
        },
      },
      customRightContent: (
        <StatusDropdown
          currentStatus={profileStatus}
          onStatusChange={setProfileStatus}
        />
      ),
    });
  }, [setConfig, mode, templateName, isSaving, isLoading, handleSave, user, profileStatus]);

  // Mostrar loading enquanto carrega
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Carregando template...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-background -m-8">
      {/* Coluna 1: Sidebar de Navegação */}
      <aside className="w-[300px] border-r bg-card h-full overflow-y-auto">
        <EditorSidebar 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
      </aside>

      {/* Coluna 2: Conteúdo Central (Renderização Condicional) */}
      <main className="flex-1 overflow-x-hidden h-full bg-muted/20">
        {activeSection === "conteudo" && (
          <CanvasArea 
            mode={mode}
            blocks={blocks}
            heroData={heroData}
            footerData={footerData}
            onUpdateHeroBlock={handleUpdateHeroBlock}
            onUpdateFooterBlock={handleUpdateFooterBlock}
            onUpdateBlock={handleUpdateBlock}
            onDeleteBlock={handleDeleteBlock}
            onDuplicateBlock={handleDuplicateBlock}
            onAddBlock={handleAddBlock}
          />
        )}

        {activeSection === "configuracoes" && (
          <div className="h-full overflow-y-auto">
            <ProfileSettingsForm
              templateName={templateName}
              templateDescription={templateDescription}
              templateType={templateType}
              isCreatingNew={!templateId}
              onTemplateNameChange={setTemplateName}
              onTemplateDescriptionChange={setTemplateDescription}
              onTemplateTypeChange={setTemplateType}
            />
          </div>
        )}

        {activeSection === "design" && (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">🎨 Seção de Design em desenvolvimento</p>
          </div>
        )}

        {activeSection === "avancado" && (
          <AdvancedSettings
            templateId={templateId}
            linkedProfilesCount={linkedProfilesCount}
            onDeleteTemplate={handleDeleteTemplate}
          />
        )}
      </main>

      {/* Coluna 3: Preview Direita */}
      <aside className="w-[360px] border-l bg-card h-full overflow-y-auto">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Preview</h3>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <PreviewArea mode={mode} />
      </aside>
    </div>
  );
}
