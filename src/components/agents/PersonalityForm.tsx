import { Agent } from "@/pages/client/AgentSettingsPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Save } from "lucide-react";

interface PersonalityFormProps {
  agent: Agent;
}

const personalitySchema = z.object({
  behavior: z.string().min(10, "O comportamento deve ter pelo menos 10 caracteres"),
  companyName: z.string().min(2, "Nome da empresa é obrigatório"),
  companySector: z.string().min(2, "Setor da empresa é obrigatório"),
  companyWebsite: z.string().url("URL inválida").optional().or(z.literal("")),
  companyDescription: z.string().min(20, "Descrição deve ter pelo menos 20 caracteres"),
});

type PersonalityFormValues = z.infer<typeof personalitySchema>;

export function PersonalityForm({ agent }: PersonalityFormProps) {
  const form = useForm<PersonalityFormValues>({
    resolver: zodResolver(personalitySchema),
    defaultValues: {
      behavior: "",
      companyName: "",
      companySector: "",
      companyWebsite: "",
      companyDescription: "",
    },
  });

  const onSubmit = (data: PersonalityFormValues) => {
    console.log("Dados do formulário:", data);
    toast.success("Personalidade atualizada com sucesso!");
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Personalidade do Agente</h1>
        <p className="text-muted-foreground mt-2">
          Configure o comportamento e as informações da empresa que o agente representa
        </p>
      </div>

      <Tabs defaultValue="basico" className="w-full">
        <TabsList>
          <TabsTrigger value="basico">Básico</TabsTrigger>
          <TabsTrigger value="avancado">Avançado</TabsTrigger>
        </TabsList>

        <TabsContent value="basico" className="mt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Comportamento do Agente</CardTitle>
                  <CardDescription>
                    Descreva como o agente deve se comportar e interagir com os usuários
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="behavior"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prompt de Comportamento</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ex: Você é um assistente prestativo que responde de forma clara e objetiva..."
                            className="min-h-[150px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Este prompt define o tom, estilo e regras que o agente deve seguir
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Informações da Empresa</CardTitle>
                  <CardDescription>
                    Dados sobre a empresa que o agente representa
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Empresa</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: SmartHub Tecnologia" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companySector"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Setor da Empresa</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Tecnologia, SaaS, Consultoria..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companyWebsite"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site da Empresa</FormLabel>
                        <FormControl>
                          <Input placeholder="https://exemplo.com.br" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companyDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fale sobre a sua empresa</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva a missão, valores, produtos e diferenciais da empresa..."
                            className="min-h-[120px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          O agente usará estas informações para contextualizar suas respostas
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button type="submit" size="lg">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="avancado" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Avançadas</CardTitle>
              <CardDescription>
                Opções adicionais para personalização do comportamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configurações avançadas em breve (Temperatura, Top-P, Max Tokens, etc.)
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
