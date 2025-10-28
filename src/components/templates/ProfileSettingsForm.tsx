import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Info, Copy, Eye, EyeOff, Lock, Building2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "@/components/ui/select";

interface ProfileSettingsFormProps {
  slug: string;
  shortId: string;
  password: string | null;
  noIndex: boolean;
  templateName: string;
  allowClientEdit: boolean;
  isCreatingNew?: boolean;
  selectedClientId?: string | null;
  clients?: Array<{ id: string; name: string }>;
  isLoadingClients?: boolean;
  onSlugChange: (slug: string) => void;
  onPasswordChange: (password: string | null) => void;
  onNoIndexChange: (noIndex: boolean) => void;
  onTemplateNameChange: (name: string) => void;
  onAllowClientEditChange: (allowed: boolean) => void;
  onClientChange?: (clientId: string) => void;
}

export function ProfileSettingsForm({
  slug,
  shortId,
  password,
  noIndex,
  templateName,
  allowClientEdit,
  isCreatingNew = false,
  selectedClientId = null,
  clients = [],
  isLoadingClients = false,
  onSlugChange,
  onPasswordChange,
  onNoIndexChange,
  onTemplateNameChange,
  onAllowClientEditChange,
  onClientChange,
}: ProfileSettingsFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordEnabled, setPasswordEnabled] = useState(!!password);

  const shortUrl = `https://seudominio.com/p/${shortId}`;
  const customUrl = slug ? `https://seudominio.com/${slug}` : "";

  const handleCopyUrl = (url: string, type: string) => {
    navigator.clipboard.writeText(url);
    toast.success(`${type} copiada para a área de transferência.`);
  };

  const handleSlugChange = (value: string) => {
    const sanitized = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    onSlugChange(sanitized);
  };

  const handlePasswordToggle = (enabled: boolean) => {
    setPasswordEnabled(enabled);
    if (!enabled) {
      onPasswordChange(null);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* Seção: Nome do Template */}
      <Card>
        <CardHeader>
          <CardTitle>Nome do Template</CardTitle>
          <CardDescription>
            Defina como este template será identificado internamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Campo: Nome do Template */}
          <div className="space-y-2">
            <Label htmlFor="template-name">Nome do Template</Label>
            <Input
              id="template-name"
              value={templateName}
              onChange={(e) => onTemplateNameChange(e.target.value)}
              placeholder="Ex: Perfil Corporativo - João Silva"
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              Este nome é usado para identificação interna e não é exibido publicamente.
            </p>
          </div>

          {/* Seletor de Cliente (apenas no modo criação) */}
          {isCreatingNew && (
            <>
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="client-select" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  Cliente Associado
                </Label>
                
                <Select
                  value={selectedClientId || ""}
                  onValueChange={(value) => onClientChange?.(value)}
                  disabled={isLoadingClients}
                >
                  <SelectTrigger id="client-select">
                    <SelectValue 
                      placeholder={isLoadingClients ? "Carregando clientes..." : "Selecione um cliente"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Opção Mestre: Template da Plataforma */}
                    <SelectItem value="">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        <span className="font-medium">Linkko Tech (Template da Plataforma)</span>
                      </div>
                    </SelectItem>
                    
                    <SelectSeparator />
                    
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <p className="text-xs text-muted-foreground">
                  Escolha o cliente que será o proprietário deste perfil digital, ou selecione 
                  "Linkko Tech" para criar um template mestre da plataforma.
                </p>
                
                {selectedClientId === null && (
                  <Alert variant="destructive" className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      É necessário selecionar um cliente ou criar um template da plataforma antes de salvar.
                    </AlertDescription>
                  </Alert>
                )}
                
                <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-xs text-blue-800 dark:text-blue-200">
                    <strong>Importante:</strong> Após criar o perfil, o cliente associado não poderá ser alterado.
                  </AlertDescription>
                </Alert>
              </div>
            </>
          )}

          <Separator />

          {/* Switch: Permitir Edição pelo Cliente */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="allow-client-edit" className="font-medium">
                Permitir edição pelo cliente
              </Label>
              <p className="text-xs text-muted-foreground">
                Permite que o cliente final edite este template diretamente
              </p>
            </div>
            <Switch
              id="allow-client-edit"
              checked={allowClientEdit}
              onCheckedChange={onAllowClientEditChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Seção: URLs */}
      <Card>
        <CardHeader>
          <CardTitle>URLs do Perfil</CardTitle>
          <CardDescription>
            Gerencie como seu perfil pode ser acessado na web
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* URL Curta (Short ID) - Read-only */}
          <div className="space-y-2">
            <Label htmlFor="short-id">ID do Perfil (Imutável)</Label>
            <div className="flex gap-2">
              <Input 
                id="short-id"
                value={shortUrl}
                disabled
                className="font-mono text-sm"
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handleCopyUrl(shortUrl, "URL curta")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Esta é sua URL permanente. Ela nunca muda, mesmo se você alterar a URL amigável.
            </p>
          </div>

          <Separator />

          {/* URL Amigável (Slug) - Editável */}
          <div className="space-y-2">
            <Label htmlFor="slug">URL Amigável (Opcional)</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-sm bg-muted border border-r-0 rounded-l-md text-muted-foreground">
                    seudominio.com/
                  </span>
                  <Input 
                    id="slug"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="meu-perfil"
                    className="rounded-l-none font-mono"
                  />
                </div>
              </div>
              {customUrl && (
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleCopyUrl(customUrl, "URL personalizada")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Crie uma URL personalizada fácil de lembrar. Apenas letras, números e hífens.
            </p>
            
            {slug && (
              <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                <Info className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-xs text-green-800 dark:text-green-200">
                  Seu perfil estará disponível em: <strong>{customUrl}</strong>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Seção: Privacidade */}
      <Card>
        <CardHeader>
          <CardTitle>Privacidade e Segurança</CardTitle>
          <CardDescription>
            Configure quem pode acessar seu perfil
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Proteção por Senha */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="password-toggle" className="font-medium">
                  Proteger com senha
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Exigir senha para visualizar o perfil
              </p>
            </div>
            <Switch
              id="password-toggle"
              checked={passwordEnabled}
              onCheckedChange={handlePasswordToggle}
            />
          </div>

          {passwordEnabled && (
            <div className="space-y-2 pl-6">
              <Label htmlFor="password">Senha de acesso</Label>
              <div className="flex gap-2">
                <Input 
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password || ""}
                  onChange={(e) => onPasswordChange(e.target.value || null)}
                  placeholder="Digite uma senha"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Os visitantes precisarão desta senha para acessar seu perfil.
              </p>
            </div>
          )}

          <Separator />

          {/* Opção No-Index */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="no-index" className="font-medium">
                Ocultar de mecanismos de busca
              </Label>
              <p className="text-xs text-muted-foreground">
                Impedir que o Google e outros buscadores indexem este perfil
              </p>
            </div>
            <Switch
              id="no-index"
              checked={noIndex}
              onCheckedChange={onNoIndexChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Informações Adicionais */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-xs">
          <strong>Dica:</strong> Alterações nas configurações são salvas automaticamente 
          ao clicar no botão "Salvar" no topo da página.
        </AlertDescription>
      </Alert>
    </div>
  );
}
