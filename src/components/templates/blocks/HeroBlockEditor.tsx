import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  GripVertical,
  Zap,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Edit,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

// Schema de validação
const heroBlockSchema = z.object({
  showHeaderLogo: z.boolean().default(false),
  profileImage: z.string().nullable().default(null),
  name: z.string().min(1, "Nome é obrigatório"),
  position: z.string().default(""),
  company: z.string().default(""),
  phone: z.string().default(""),
  email: z.string().email("E-mail inválido").or(z.string().length(0)),
  emailMode: z.enum(["mailto", "form"]).default("mailto"),
  whatsapp: z.string().default(""),
  showCTA: z.boolean().default(false),
});

export type HeroBlockData = z.infer<typeof heroBlockSchema>;

interface HeroBlockEditorProps {
  id: string;
  data: HeroBlockData;
  onUpdate: (data: HeroBlockData) => void;
}

// Função helper para aplicar máscara de telefone
const formatPhoneNumber = (value: string): string => {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, "");
  
  // Aplica a máscara: 55 00 00000-0000
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 4) return `${numbers.slice(0, 2)} ${numbers.slice(2)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 2)} ${numbers.slice(2, 4)} ${numbers.slice(4)}`;
  return `${numbers.slice(0, 2)} ${numbers.slice(2, 4)} ${numbers.slice(4, 9)}-${numbers.slice(9, 13)}`;
};

export function HeroBlockEditor({
  id,
  data,
  onUpdate,
}: HeroBlockEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const form = useForm<HeroBlockData>({
    resolver: zodResolver(heroBlockSchema),
    defaultValues: data,
  });

  const onSubmit = (formData: HeroBlockData) => {
    onUpdate(formData);
    setIsExpanded(false);
  };

  const showCTAValue = form.watch("showCTA");
  const showHeaderLogoValue = form.watch("showHeaderLogo");

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={setIsExpanded}
      className="w-full"
    >
      <div className={cn(
        "border rounded-lg bg-blue-500 transition-all",
        isExpanded && "shadow-lg"
      )}>
        {/* VISÃO COLAPSADA (Header) */}
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-blue-600 transition-colors">
            {/* Drag Handle - DESABILITADO */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 cursor-not-allowed opacity-30" 
              type="button"
              disabled
            >
              <GripVertical className="h-4 w-4 text-white" />
            </Button>

            {/* Ícone Hero e Informações */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center">
                <Zap className="h-5 w-5 text-blue-500" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-white">Hero Section</h4>
                <p className="text-xs text-white/80">
                  Este é o bloco Hero inicial do Perfil Digital.
                </p>
              </div>
            </div>

            {/* Actions (Direita) */}
            <div className="flex items-center gap-2">
              {/* Dropdown de Ações - Apenas Editar */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-blue-600">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(true);
                  }}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Bloco
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Ícone de Expandir/Colapsar */}
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-white" />
              ) : (
                <ChevronDown className="h-4 w-4 text-white" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>

        {/* VISÃO EXPANDIDA (Formulário) */}
        <CollapsibleContent>
          <div className="border-t border-white/20 p-6 bg-white rounded-b-lg">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* 1. Cabeçalho com Logomarca */}
                <FormField
                  control={form.control}
                  name="showHeaderLogo"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="!mt-0 cursor-pointer">
                          Exibir logomarca no cabeçalho?
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                {showHeaderLogoValue && (
                  <Alert variant="default" className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-900">
                      Se sim, adicione sua logomarca na aba 'Design'
                    </AlertDescription>
                  </Alert>
                )}

                {/* 2. Imagem de Perfil */}
                <FormField
                  control={form.control}
                  name="profileImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Imagem de Perfil</FormLabel>
                      <div className="flex items-center gap-4">
                        <Button type="button" variant="outline">
                          Procurar...
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          {field.value || "Nenhum arquivo selecionado."}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        jpg, jpeg, png, svg, webp permitido. 2 MB máximo.
                      </p>
                    </FormItem>
                  )}
                />

                {/* 3. Nome */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome *</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 4. Cargo/Função */}
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cargo/Função</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Designer Gráfico" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* 5. Empresa */}
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empresa</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: SmartHub AI Studio" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* 6. Telefone */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="55 00 00000-0000"
                          type="tel"
                          {...field}
                          onChange={(e) => {
                            const formatted = formatPhoneNumber(e.target.value);
                            field.onChange(formatted);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 7. E-mail */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input placeholder="seu@email.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 8. Modo de Envio de E-mail */}
                <FormField
                  control={form.control}
                  name="emailMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modo de Envio de E-mail</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="mailto">Envio direto (mailto:)</SelectItem>
                          <SelectItem value="form">Formulário de contato</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                {/* 9. WhatsApp */}
                <FormField
                  control={form.control}
                  name="whatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="55 00 00000-0000"
                          type="tel"
                          {...field}
                          onChange={(e) => {
                            const formatted = formatPhoneNumber(e.target.value);
                            field.onChange(formatted);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 10. Botão CTA */}
                <FormField
                  control={form.control}
                  name="showCTA"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="!mt-0 cursor-pointer">
                          Adicionar botão Call to Action?
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                {showCTAValue && (
                  <Alert variant="default" className="bg-yellow-50 border-yellow-200">
                    <Info className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-900">
                      Um bloco CTA será adicionado abaixo do Hero (em breve)
                    </AlertDescription>
                  </Alert>
                )}

                {/* Submit Button */}
                <Button type="submit" className="w-full" size="lg">
                  Atualizar Hero
                </Button>
              </form>
            </Form>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
