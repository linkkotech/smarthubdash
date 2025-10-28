import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  GripVertical,
  Menu,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Edit,
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

// Schema de validação
const footerBlockSchema = z.object({
  buttons: z.array(z.object({
    icon: z.string().nullable().default(null),
    text: z.string().default(""),
    url: z.string().default(""),
  })).length(4),
});

export type FooterBlockData = z.infer<typeof footerBlockSchema>;

interface FooterBlockEditorProps {
  id: string;
  data: FooterBlockData;
  onUpdate: (data: FooterBlockData) => void;
}

export function FooterBlockEditor({
  id,
  data,
  onUpdate,
}: FooterBlockEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const form = useForm<FooterBlockData>({
    resolver: zodResolver(footerBlockSchema),
    defaultValues: data,
  });

  const onSubmit = (formData: FooterBlockData) => {
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

            {/* Ícone Menu e Informações */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center">
                <Menu className="h-5 w-5 text-blue-500" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-white">Menu Mobile</h4>
                <p className="text-xs text-white/80">
                  Este é o bloco de Menu Mobile do seu Perfil Digital.
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
            <div className="mb-6">
              <h3 className="text-lg font-semibold">Configurar Menu Mobile</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Configure os 4 botões que aparecerão no menu inferior
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Botão 1 */}
                <div className="space-y-4 border rounded-lg p-4">
                  <h4 className="font-medium text-sm">Botão 1</h4>
                  
                  {/* Ícone */}
                  <FormField
                    control={form.control}
                    name="buttons.0.icon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ícone do Botão</FormLabel>
                        <div className="flex items-center gap-4">
                          <Button type="button" variant="outline">
                            Procurar...
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            {field.value || "Nenhum ícone selecionado"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          svg, png permitido. 512x512px recomendado.
                        </p>
                      </FormItem>
                    )}
                  />
                  
                  {/* Texto */}
                  <FormField
                    control={form.control}
                    name="buttons.0.text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Texto do Botão</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: WhatsApp" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  {/* URL */}
                  <FormField
                    control={form.control}
                    name="buttons.0.url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL do Botão</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Botão 2 */}
                <div className="space-y-4 border rounded-lg p-4">
                  <h4 className="font-medium text-sm">Botão 2</h4>
                  
                  {/* Ícone */}
                  <FormField
                    control={form.control}
                    name="buttons.1.icon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ícone do Botão</FormLabel>
                        <div className="flex items-center gap-4">
                          <Button type="button" variant="outline">
                            Procurar...
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            {field.value || "Nenhum ícone selecionado"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          svg, png permitido. 512x512px recomendado.
                        </p>
                      </FormItem>
                    )}
                  />
                  
                  {/* Texto */}
                  <FormField
                    control={form.control}
                    name="buttons.1.text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Texto do Botão</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Instagram" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  {/* URL */}
                  <FormField
                    control={form.control}
                    name="buttons.1.url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL do Botão</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Botão 3 */}
                <div className="space-y-4 border rounded-lg p-4">
                  <h4 className="font-medium text-sm">Botão 3</h4>
                  
                  {/* Ícone */}
                  <FormField
                    control={form.control}
                    name="buttons.2.icon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ícone do Botão</FormLabel>
                        <div className="flex items-center gap-4">
                          <Button type="button" variant="outline">
                            Procurar...
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            {field.value || "Nenhum ícone selecionado"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          svg, png permitido. 512x512px recomendado.
                        </p>
                      </FormItem>
                    )}
                  />
                  
                  {/* Texto */}
                  <FormField
                    control={form.control}
                    name="buttons.2.text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Texto do Botão</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: E-mail" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  {/* URL */}
                  <FormField
                    control={form.control}
                    name="buttons.2.url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL do Botão</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Botão 4 */}
                <div className="space-y-4 border rounded-lg p-4">
                  <h4 className="font-medium text-sm">Botão 4</h4>
                  
                  {/* Ícone */}
                  <FormField
                    control={form.control}
                    name="buttons.3.icon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ícone do Botão</FormLabel>
                        <div className="flex items-center gap-4">
                          <Button type="button" variant="outline">
                            Procurar...
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            {field.value || "Nenhum ícone selecionado"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          svg, png permitido. 512x512px recomendado.
                        </p>
                      </FormItem>
                    )}
                  />
                  
                  {/* Texto */}
                  <FormField
                    control={form.control}
                    name="buttons.3.text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Texto do Botão</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Site" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  {/* URL */}
                  <FormField
                    control={form.control}
                    name="buttons.3.url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL do Botão</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full" size="lg">
                  Atualizar Menu Mobile
                </Button>
              </form>
            </Form>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
