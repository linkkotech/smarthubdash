import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Info } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProfileSettingsFormProps {
  templateName: string;
  templateDescription: string;
  templateType: "profile_template" | "content_block";
  isCreatingNew: boolean;
  onTemplateNameChange: (value: string) => void;
  onTemplateDescriptionChange: (value: string) => void;
  onTemplateTypeChange: (value: "profile_template" | "content_block") => void;
}

export function ProfileSettingsForm({
  templateName,
  templateDescription,
  templateType,
  isCreatingNew,
  onTemplateNameChange,
  onTemplateDescriptionChange,
  onTemplateTypeChange,
}: ProfileSettingsFormProps) {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Configurações do Template</h2>
        <p className="text-muted-foreground">
          Configure as informações básicas do template que você está criando.
        </p>
      </div>

      {/* Card: Informações Básicas */}
      <Card className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Informações Básicas</h3>
        </div>

        {/* Campo 1: Nome do Template */}
        <div className="space-y-2">
          <Label htmlFor="templateName">
            Nome do Template <span className="text-destructive">*</span>
          </Label>
          <Input
            id="templateName"
            value={templateName}
            onChange={(e) => onTemplateNameChange(e.target.value)}
            placeholder="Ex: Template Executivo Moderno"
            maxLength={100}
          />
          <p className="text-xs text-muted-foreground">
            Escolha um nome descritivo para identificar este template. Máximo 100 caracteres.
          </p>
        </div>

        <Separator />

        {/* Campo 2: Descrição (Opcional) */}
        <div className="space-y-2">
          <Label htmlFor="templateDescription">Descrição (Opcional)</Label>
          <Textarea
            id="templateDescription"
            value={templateDescription}
            onChange={(e) => onTemplateDescriptionChange(e.target.value)}
            placeholder="Descreva o propósito e características deste template..."
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground">
            Uma descrição ajuda a entender o uso recomendado deste template. Máximo 500 caracteres.
          </p>
        </div>

        <Separator />

        {/* Campo 3: Tipo de Template (Somente no Modo Criação) */}
        {isCreatingNew ? (
          <div className="space-y-2">
            <Label htmlFor="templateType">
              Tipo de Template <span className="text-destructive">*</span>
            </Label>
            <Select
              value={templateType}
              onValueChange={(value) => onTemplateTypeChange(value as "profile_template" | "content_block")}
            >
              <SelectTrigger id="templateType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="profile_template">
                  Template de Perfil Completo
                </SelectItem>
                <SelectItem value="content_block">
                  Bloco de Conteúdo Reutilizável
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              <strong>Perfil Completo:</strong> Um template com todos os blocos e design para uma página completa.
              <br />
              <strong>Bloco de Conteúdo:</strong> Um componente reutilizável (ex: Hero, Rodapé).
            </p>
          </div>
        ) : (
          <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-xs text-blue-900 dark:text-blue-100">
              Tipo de template: <strong>{templateType === 'profile_template' ? 'Perfil Completo' : 'Bloco de Conteúdo'}</strong>
              <br />
              O tipo não pode ser alterado após a criação.
            </AlertDescription>
          </Alert>
        )}
      </Card>
    </div>
  );
}
