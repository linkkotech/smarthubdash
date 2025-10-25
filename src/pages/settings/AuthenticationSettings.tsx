import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Mail, Send } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const smtpFormSchema = z.object({
  host: z
    .string()
    .min(1, "Host do servidor é obrigatório")
    .max(255, "Host deve ter no máximo 255 caracteres"),

  port: z.coerce
    .number()
    .min(1, "Porta deve ser maior que 0")
    .max(65535, "Porta deve ser menor que 65535")
    .default(587),

  encryption: z.enum(["none", "ssl", "tls"], {
    required_error: "Selecione um tipo de criptografia",
  }),

  username: z
    .string()
    .min(1, "Nome de usuário / Chave de API é obrigatório")
    .max(255, "Deve ter no máximo 255 caracteres"),

  password: z
    .string()
    .min(1, "Senha / Valor da chave de API é obrigatório")
    .max(500, "Deve ter no máximo 500 caracteres"),

  senderName: z
    .string()
    .min(1, "Nome do remetente é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres"),

  senderEmail: z
    .string()
    .email("Digite um email válido")
    .min(1, "Email do remetente é obrigatório")
    .max(255, "Email deve ter no máximo 255 caracteres"),
});

type SmtpFormValues = z.infer<typeof smtpFormSchema>;

export default function AuthenticationSettings() {
  const [showPassword, setShowPassword] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  const form = useForm<SmtpFormValues>({
    resolver: zodResolver(smtpFormSchema),
    defaultValues: {
      host: "",
      port: 587,
      encryption: "tls",
      username: "",
      password: "",
      senderName: "",
      senderEmail: "",
    },
  });

  const onSubmit = async (data: SmtpFormValues) => {
    setIsSaving(true);

    try {
      // TODO: Conectar com backend
      console.log("Dados do formulário:", data);

      // Simular delay de salvamento
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Configurações salvas com sucesso!",
        description: "As configurações SMTP foram atualizadas.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar configurações",
        description: "Ocorreu um erro ao salvar. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: "Email necessário",
        description: "Digite um endereço de email para o teste.",
        variant: "destructive",
      });
      return;
    }

    // Validar se o formulário está preenchido
    const isValid = await form.trigger();
    if (!isValid) {
      toast({
        title: "Configurações incompletas",
        description: "Preencha todos os campos antes de testar.",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);

    try {
      // TODO: Conectar com backend para enviar email de teste
      const formData = form.getValues();
      console.log("Enviando email de teste para:", testEmail);
      console.log("Com configurações:", formData);

      // Simular delay de envio
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: "Email de teste enviado!",
        description: `Um email foi enviado para ${testEmail}`,
      });
    } catch (error) {
      toast({
        title: "Erro ao enviar email de teste",
        description: "Verifique as configurações e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Autenticação e E-mail</h1>
        <p className="text-muted-foreground">
          Configure métodos de login, SMTP e notificações por e-mail
        </p>
      </div>

      <Tabs defaultValue="smtp" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="smtp">Servidor SMTP</TabsTrigger>
          <TabsTrigger value="auth">Métodos de Login</TabsTrigger>
        </TabsList>

        <TabsContent value="smtp" className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Servidor SMTP</CardTitle>
                  <CardDescription>
                    Configure credenciais e parâmetros de envio de email
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <Alert>
                    <Mail className="h-4 w-4" />
                    <AlertDescription>
                      Configure seu servidor SMTP para habilitar o envio de emails
                      transacionais como notificações, redefinição de senha e
                      convites de usuários.
                    </AlertDescription>
                  </Alert>

                  <FormField
                    control={form.control}
                    name="host"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Host do Servidor</FormLabel>
                        <FormControl>
                          <Input placeholder="smtp.gmail.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          Exemplo: smtp.gmail.com, smtp.sendgrid.net
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="port"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Porta</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="587" {...field} />
                          </FormControl>
                          <FormDescription>
                            TLS: 587, SSL: 465, Nenhuma: 25
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="encryption"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Criptografia</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a criptografia" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">Nenhuma</SelectItem>
                              <SelectItem value="ssl">SSL</SelectItem>
                              <SelectItem value="tls">TLS</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome de Usuário / Chave de API</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="seu-usuario@exemplo.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha / Valor da Chave de API</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Digite sua senha ou chave de API"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="senderName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Remetente</FormLabel>
                        <FormControl>
                          <Input placeholder="SmartHub Studio" {...field} />
                        </FormControl>
                        <FormDescription>
                          Nome que aparecerá nos emails enviados
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="senderEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email do Remetente</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="noreply@smarthubstudio.com"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Endereço de email que será usado como remetente
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>

                <CardFooter className="flex flex-col items-stretch gap-4 border-t pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Mail className="h-4 w-4" />
                      <span>Testar Configurações</span>
                    </div>

                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="Digite um email para teste"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        disabled={!testEmail || isTesting}
                        onClick={handleTestEmail}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {isTesting ? "Enviando..." : "Enviar Teste"}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSaving}>
                    {isSaving ? "Salvando..." : "Salvar Configurações"}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="auth" className="space-y-4">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Métodos de Autenticação</CardTitle>
              <CardDescription>
                Login social, 2FA, SSO, etc.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Configurações disponíveis em breve...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
