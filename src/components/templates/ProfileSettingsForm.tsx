import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Info, Copy, Eye, EyeOff, Lock, Building2, CheckCircle2 } from "lucide-react";
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
    <div className="space-y-6">
      {/* Card 1: Nome do Template */}
      <Card>
        <CardHeader>
          <CardTitle>Nome do Template</CardTitle>
          <CardDescription>
            Identifique este perfil digital com um nome descritivo para facilitar a organização.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="templateName">Nome do Template</Label>
            <Input
              id="templateName"
              value={templateName}
              onChange={(e) => onTemplateNameChange(e.target.value)}
              placeholder="Ex: Perfil Executivo Premium"
            />
            <p className="text-xs text-muted-foreground">
              Este nome é apenas para uso interno e não será visível publicamente.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allowClientEdit">Permitir Edição pelo Cliente</Label>
              <p className="text-xs text-muted-foreground">
                Permite que o cliente edite este perfil diretamente
              </p>
            </div>
            <Switch
              id="allowClientEdit"
              checked={allowClientEdit}
              onCheckedChange={onAllowClientEditChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Cliente Associado (apenas no modo criação) */}
      {isCreatingNew && onClientChange && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Cliente Associado
            </CardTitle>
            <CardDescription>
              Escolha o cliente que será o proprietário deste perfil digital, ou selecione 
              "Linkko Tech" para criar um template mestre da plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client">Cliente</Label>
              <Select onValueChange={onClientChange} value={selectedClientId || 'platform'}>
                <SelectTrigger id="client">
                  <SelectValue placeholder="Selecione um cliente..." />
                </SelectTrigger>
                <SelectContent>
                  {/* Opção Mestre: Template da Plataforma */}
                  <SelectItem value="platform">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span className="font-medium">Linkko Tech (Template da Plataforma)</span>
                    </div>
                  </SelectItem>
                  
                  <SelectSeparator />
                  
                  {/* Lista de Clientes */}
                  {isLoadingClients ? (
                    <SelectItem value="loading" disabled>
                      Carregando clientes...
                    </SelectItem>
                  ) : clients.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      Nenhum cliente cadastrado
                    </SelectItem>
                  ) : (
                    clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Escolha o cliente que será o proprietário deste perfil digital, ou selecione 
                "Linkko Tech" para criar um template mestre da plataforma.
              </p>
            </div>

            {selectedClientId === null && (
              <Alert variant="destructive" className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  É necessário selecionar um cliente ou criar um template da plataforma antes de salvar.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Card 3: URLs do Perfil */}
      <Card>
        <CardHeader>
          <CardTitle>URLs do Perfil</CardTitle>
          <CardDescription>
            Gerencie as URLs de acesso ao perfil digital. Use a URL curta para compartilhamento rápido
            ou personalize com um slug amigável.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* URL Curta */}
          <div className="space-y-2">
            <Label htmlFor="shortUrl">URL Curta</Label>
            <div className="flex gap-2">
              <Input
                id="shortUrl"
                value={shortUrl}
                readOnly
                className="bg-muted"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleCopyUrl(shortUrl, "URL curta")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              URL curta gerada automaticamente. Ideal para compartilhamento rápido.
            </p>
          </div>

          <Separator />

          {/* URL Personalizada */}
          <div className="space-y-2">
            <Label htmlFor="customSlug">URL Personalizada (Opcional)</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="inline-flex items-center px-3 h-10 rounded-l-md border border-r-0 border-input bg-muted text-sm text-muted-foreground">
                    seudominio.com/
                  </span>
                  <Input
                    id="customSlug"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="meu-perfil-personalizado"
                    className="rounded-l-none"
                  />
                </div>
              </div>
              {customUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopyUrl(customUrl, "URL personalizada")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Crie uma URL amigável e memorável. Use apenas letras minúsculas, números e hífens.
            </p>
            
            {slug && customUrl && (
              <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-900 dark:text-green-100">URL Válida!</AlertTitle>
                <AlertDescription className="text-xs text-green-800 dark:text-green-200">
                  Seu perfil estará disponível em: <span className="font-medium">{customUrl}</span>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Card 4: Privacidade e Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Privacidade e Segurança
          </CardTitle>
          <CardDescription>
            Configure opções de privacidade e proteção por senha para controlar o acesso ao perfil.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Proteção por Senha */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="passwordProtection">Proteção por Senha</Label>
                <p className="text-xs text-muted-foreground">
                  Requer senha para acessar o perfil
                </p>
              </div>
              <Switch
                id="passwordProtection"
                checked={passwordEnabled}
                onCheckedChange={handlePasswordToggle}
              />
            </div>

            {passwordEnabled && (
              <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                <Label htmlFor="password">Senha de Acesso</Label>
                <div className="flex gap-2">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password || ''}
                    onChange={(e) => onPasswordChange(e.target.value)}
                    placeholder="Digite uma senha segura"
                  />
                  <Button
                    type="button"
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
                  Esta senha será solicitada ao acessar o perfil pela primeira vez.
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* NoIndex SEO */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="noIndex">Ocultar dos Mecanismos de Busca</Label>
              <p className="text-xs text-muted-foreground">
                Adiciona meta tag noindex para evitar indexação pelo Google
              </p>
            </div>
            <Switch
              id="noIndex"
              checked={noIndex}
              onCheckedChange={onNoIndexChange}
            />
          </div>

          <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-xs text-blue-900 dark:text-blue-100">
              Quando ativado, o perfil não aparecerá nos resultados de busca do Google e outros 
              motores de busca. Ideal para perfis privados ou em desenvolvimento.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
