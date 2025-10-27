import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  GripVertical,
  Link as LinkIcon,
  Copy,
  Trash2,
  MoreVertical,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

const linkBlockSchema = z.object({
  destinationUrl: z.string().url({ message: "URL inválida" }).or(z.string().length(0)),
  openInNewTab: z.boolean().default(false),
  name: z.string().min(1, { message: "Nome é obrigatório" }),
  imageThumbnail: z.string().nullable(),
  icon: z.string().default("fas fa-link"),
  textColor: z.string().regex(/^#[0-9A-F]{6}$/i, { message: "Cor inválida" }),
  backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i, { message: "Cor inválida" }),
  textAlignment: z.enum(["center", "justify", "left", "right"]).default("center"),
  animation: z.string().default("none"),
  sensitiveContent: z.boolean().default(false),
  columns: z.enum(["1", "2"]).default("1"),
  borderConfig: z.record(z.any()).optional(),
  shadowConfig: z.record(z.any()).optional(),
  displayConfig: z.record(z.any()).optional(),
});

type LinkBlockData = z.infer<typeof linkBlockSchema>;

interface LinkBlockEditorProps {
  id: string;
  data: LinkBlockData;
  onUpdate: (data: LinkBlockData) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export function LinkBlockEditor({
  id,
  data,
  onUpdate,
  onDelete,
  onDuplicate,
}: LinkBlockEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const form = useForm<LinkBlockData>({
    resolver: zodResolver(linkBlockSchema),
    defaultValues: data,
  });

  const onSubmit = (formData: LinkBlockData) => {
    onUpdate(formData);
    setIsExpanded(false);
  };

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={setIsExpanded}
      className="w-full"
    >
      <div className={cn(
        "border rounded-lg bg-card transition-all",
        isExpanded && "shadow-lg"
      )}>
        {/* VISÃO COLAPSADA (Header) */}
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-accent/50 transition-colors">
            {/* Drag Handle */}
            <Button variant="ghost" size="icon" className="h-8 w-8 cursor-grab" type="button">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </Button>

            {/* Ícone e Informações */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="shrink-0 w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                <LinkIcon className="h-5 w-5 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{data.name}</h4>
                <p className="text-xs text-muted-foreground truncate">
                  {data.destinationUrl || "Nenhuma URL definida"}
                </p>
              </div>
            </div>

            {/* Actions (Direita) */}
            <div className="flex items-center gap-2">
              {/* Badge de Cliques */}
              <Badge variant="secondary" className="gap-1">
                <LinkIcon className="h-3 w-3" />
                0
              </Badge>

              {/* Switch Ativo/Inativo */}
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
                onClick={(e) => e.stopPropagation()}
              />

              {/* Dropdown de Ações */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate();
                  }}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Ícone de Expandir/Colapsar */}
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>

        {/* VISÃO EXPANDIDA (Formulário) */}
        <CollapsibleContent>
          <div className="border-t p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Destination URL */}
                <FormField
                  control={form.control}
                  name="destinationUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4" />
                        Destination URL
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="https://linqcard.app/link/105" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Open in new tab */}
                <FormField
                  control={form.control}
                  name="openInNewTab"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0 cursor-pointer">
                        Open in new tab
                      </FormLabel>
                    </FormItem>
                  )}
                />

                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Teste de Link" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Image thumbnail */}
                <FormField
                  control={form.control}
                  name="imageThumbnail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image thumbnail</FormLabel>
                      <div className="flex items-center gap-4">
                        <Button type="button" variant="outline">
                          Procurar...
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          Nenhum arquivo selecionado.
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        jpg, jpeg, png, svg, gif, webp, avif permitido. 2 MB máximo.
                      </p>
                    </FormItem>
                  )}
                />

                {/* Ícone */}
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ícone</FormLabel>
                      <FormControl>
                        <Input placeholder="fas fa-bolt" {...field} />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Classe de ícone <strong>FontAwesome</strong>
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Text Color */}
                <FormField
                  control={form.control}
                  name="textColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Text color</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input type="color" {...field} className="w-20 h-10" />
                          <Input {...field} placeholder="#000000" className="flex-1" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Text Alignment */}
                <FormField
                  control={form.control}
                  name="textAlignment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Text alignment</FormLabel>
                      <div className="grid grid-cols-4 gap-2">
                        {(["center", "justify", "left", "right"] as const).map((align) => (
                          <Button
                            key={align}
                            type="button"
                            variant={field.value === align ? "default" : "outline"}
                            onClick={() => field.onChange(align)}
                            className="capitalize"
                          >
                            {align}
                          </Button>
                        ))}
                      </div>
                    </FormItem>
                  )}
                />

                {/* Background Color */}
                <FormField
                  control={form.control}
                  name="backgroundColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Background color</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input type="color" {...field} className="w-20 h-10" />
                          <Input {...field} placeholder="#ffffff" className="flex-1" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Animation */}
                <FormField
                  control={form.control}
                  name="animation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Animation</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Nenhum" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          <SelectItem value="fade">Fade</SelectItem>
                          <SelectItem value="slide">Slide</SelectItem>
                          <SelectItem value="bounce">Bounce</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                {/* Sensitive Content Warning */}
                <FormField
                  control={form.control}
                  name="sensitiveContent"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="!mt-0 cursor-pointer">
                          Aviso de conteúdo sensível
                        </FormLabel>
                      </div>
                      {field.value && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Exija que os usuários confirmem que desejam acessar seu link e informe-os de que o link pode ser sensível.
                        </p>
                      )}
                    </FormItem>
                  )}
                />

                {/* Columns */}
                <FormField
                  control={form.control}
                  name="columns"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Columns</FormLabel>
                      <div className="grid grid-cols-2 gap-2">
                        {(["1", "2"] as const).map((col) => (
                          <Button
                            key={col}
                            type="button"
                            variant={field.value === col ? "default" : "outline"}
                            onClick={() => field.onChange(col)}
                          >
                            {col}
                          </Button>
                        ))}
                      </div>
                    </FormItem>
                  )}
                />

                {/* Advanced Settings Buttons */}
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                  >
                    Configurações de borda
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                  >
                    Configurações de sombra da borda
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                  >
                    Configurações de exibição
                  </Button>
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full" size="lg">
                  Atualizar
                </Button>
              </form>
            </Form>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
