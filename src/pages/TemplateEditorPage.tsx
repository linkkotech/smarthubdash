import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { usePageHeader } from "@/contexts/PageHeaderContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
  Info
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LinkBlockEditor } from "@/components/templates/blocks/LinkBlockEditor";

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

// Canvas Area Component

function CanvasArea({ 
  mode, 
  blocks, 
  onUpdateBlock, 
  onDeleteBlock, 
  onDuplicateBlock,
  onAddBlock 
}: { 
  mode: "profile" | "block";
  blocks: Block[];
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
        // Modo Perfil: Carrega com bloco Hero
        <Card className="w-full bg-blue-500 text-white p-8 min-h-[300px]">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">Hero Section</h1>
            <p className="text-lg">
              Este é o bloco Hero inicial do Perfil Digital
            </p>
            <Button variant="secondary">Call to Action</Button>
          </div>
        </Card>
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
  const [profileName, setProfileName] = useState("Novo Perfil Digital");
  const [templateName, setTemplateName] = useState("Novo Template");
  const [allowClientEdit, setAllowClientEdit] = useState(false);
  const [profileType, setProfileType] = useState<"personal" | "business">("personal");
  const [profileStatus, setProfileStatus] = useState<"draft" | "published" | "archived">("draft");
  const [profileSlug, setProfileSlug] = useState<string>("");
  const [profilePassword, setProfilePassword] = useState<string | null>(null);
  const [profileNoIndex, setProfileNoIndex] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [shortId, setShortId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<EditorSection>("conteudo");

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

  // Carregar client_id do usuário autenticado
  useEffect(() => {
    async function loadClientId() {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('client_id')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Erro ao carregar client_id:', error);
        toast.error("Não foi possível carregar os dados do usuário.");
        return;
      }
      
      setClientId(data.client_id);
    }
    
    loadClientId();
  }, [user]);

  // Carregar dados existentes quando houver templateId
  useEffect(() => {
    async function loadProfile() {
      if (!templateId || !user?.id) return;
      
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('digital_profiles')
          .select('*')
          .eq('id', templateId)
          .single();
        
        if (error) throw error;
        
        // Validação de segurança: verificar se o usuário tem acesso
        if (data.client_id !== clientId) {
          toast.error("Você não tem permissão para editar este perfil.");
          navigate('/templates-digitais');
          return;
        }
        
        // Carregar dados no editor
        setProfileType(data.type as "personal" | "business");
        setProfileStatus(data.status as "draft" | "published" | "archived");
        setProfileSlug(data.slug || "");
        setProfilePassword(data.password);
        setProfileNoIndex(data.no_index || false);
        setShortId(data.short_id);
        
        // Carregar blocos do content
        if (data.content && typeof data.content === 'object') {
          const content = data.content as any;
          if (content.blocks && Array.isArray(content.blocks)) {
            setBlocks(content.blocks);
          }
          if (content.name) {
            setProfileName(content.name);
          }
          if (content.templateName) {
            setTemplateName(content.templateName);
          }
          if (content.allowClientEdit !== undefined) {
            setAllowClientEdit(content.allowClientEdit);
          }
        }
        
        toast.success("Perfil carregado com sucesso.");
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        toast.error("Não foi possível carregar o perfil digital.");
      } finally {
        setIsLoading(false);
      }
    }
    
    if (clientId) {
      loadProfile();
    }
  }, [templateId, user, clientId, navigate]);

  // Função de salvar
  const handleSave = useCallback(async () => {
    if (!user?.id || !clientId) {
      toast.error("Usuário não autenticado.");
      return;
    }

    // Validação de slug único (INSERT e UPDATE)
    if (profileSlug) {
      let query = supabase
        .from('digital_profiles')
        .select('id')
        .eq('slug', profileSlug);
      
      // Se estamos editando, excluir o registro atual
      if (templateId) {
        query = query.neq('id', templateId);
      }
      
      const { data: existingProfile } = await query.maybeSingle();
      
      if (existingProfile) {
        toast.error("Esta URL amigável já está em uso. Escolha outra.");
        return;
      }
    }
    
    setIsSaving(true);
    
    try {
      // Montar o objeto content
      const content = {
        name: profileName,
        templateName: templateName,
        allowClientEdit: allowClientEdit,
        blocks: blocks,
        design: {
          // Campos de design futuros
        },
      };
      
      if (templateId) {
        // UPDATE: editar perfil existente
        const { error } = await supabase
          .from('digital_profiles')
          .update({
            type: profileType,
            status: profileStatus,
            slug: profileSlug || null,
            password: profilePassword,
            no_index: profileNoIndex,
            content: content as any,
          })
          .eq('id', templateId);
        
        if (error) throw error;
        
        toast.success("Perfil atualizado com sucesso.");
      } else {
        // INSERT: criar novo perfil
        const { data, error } = await supabase
          .from('digital_profiles')
          .insert([{
            client_id: clientId,
            type: profileType,
            status: profileStatus,
            slug: profileSlug || null,
            password: profilePassword,
            no_index: profileNoIndex,
            content: content as any,
          }])
          .select('id')
          .single();
        
        if (error) throw error;
        
        toast.success("Perfil criado com sucesso.");
        
        // Redirecionar para o modo de edição com o novo ID
        navigate(`/templates-digitais/editor?id=${data.id}&mode=${mode}`);
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast.error(error instanceof Error ? error.message : "Ocorreu um erro ao salvar o perfil.");
    } finally {
      setIsSaving(false);
    }
  }, [
    user,
    clientId,
    profileSlug,
    templateId,
    profileType,
    profileStatus,
    profilePassword,
    profileNoIndex,
    profileName,
    templateName,
    allowClientEdit,
    blocks,
    mode,
    navigate,
  ]);

  // Configurar PageHeader
  useEffect(() => {
    // Calcular se está pronto para salvar
    const isReadyToSave = !isLoading && !isSaving && !!user && !!clientId;

    setConfig({
      title: isLoading ? "Carregando..." : (mode === "profile" ? profileName : "Editor de Bloco de Conteúdo"),
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
    });
  }, [setConfig, mode, profileName, isSaving, isLoading, handleSave, user, clientId]);

  // Mostrar loading enquanto carrega
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Carregando perfil...</p>
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
            onUpdateBlock={handleUpdateBlock}
            onDeleteBlock={handleDeleteBlock}
            onDuplicateBlock={handleDuplicateBlock}
            onAddBlock={handleAddBlock}
          />
        )}

        {activeSection === "configuracoes" && (
          <div className="h-full overflow-y-auto">
            <ProfileSettingsForm
              slug={profileSlug}
              shortId={shortId || "carregando..."}
              password={profilePassword}
              noIndex={profileNoIndex}
              templateName={templateName}
              allowClientEdit={allowClientEdit}
              onSlugChange={setProfileSlug}
              onPasswordChange={setProfilePassword}
              onNoIndexChange={setProfileNoIndex}
              onTemplateNameChange={setTemplateName}
              onAllowClientEditChange={setAllowClientEdit}
            />
          </div>
        )}

        {activeSection === "design" && (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">🎨 Seção de Design em desenvolvimento</p>
          </div>
        )}

        {activeSection === "dominio" && (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">🌐 Seção de Domínio em desenvolvimento</p>
          </div>
        )}

        {activeSection === "seo" && (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">🔍 Seção de SEO em desenvolvimento</p>
          </div>
        )}

        {activeSection === "qrcode" && (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">📱 Seção de Código QR em desenvolvimento</p>
          </div>
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
