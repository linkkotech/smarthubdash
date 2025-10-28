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

  // 🧪 VERSÃO DE DEPURAÇÃO
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">🧪 Teste do Formulário de Configurações</h1>
      <p className="mt-4 text-muted-foreground">
        Se você está vendo esta mensagem, o componente renderizou com sucesso.
      </p>
      <div className="mt-4 p-4 bg-green-100 dark:bg-green-900 rounded">
        <p className="text-sm">✅ Props recebidas:</p>
        <ul className="text-xs mt-2 space-y-1">
          <li>templateName: {templateName}</li>
          <li>shortId: {shortId}</li>
          <li>slug: {slug}</li>
          <li>isCreatingNew: {String(isCreatingNew)}</li>
          <li>selectedClientId: {String(selectedClientId)}</li>
        </ul>
      </div>
    </div>
  );
}
