import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Shield, Info, Key } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const securityFormSchema = z.object({
  // 2FA Configuration
  twoFactorEnabled: z.boolean().default(false),

  // reCAPTCHA Configuration
  recaptchaEnabled: z.boolean().default(false),
  recaptchaSiteKey: z.string().optional(),
  recaptchaSecretKey: z.string().optional(),
});

type SecurityFormValues = z.infer<typeof securityFormSchema>;

export default function SecuritySettings() {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const form = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      twoFactorEnabled: false,
      recaptchaEnabled: false,
      recaptchaSiteKey: "",
      recaptchaSecretKey: "",
    },
  });

  // Watch para mostrar/ocultar campos condicionalmente
  const recaptchaEnabled = form.watch("recaptchaEnabled");

  const onSubmit = async (data: SecurityFormValues) => {
    // Validação condicional para reCAPTCHA
    if (data.recaptchaEnabled) {
      if (!data.recaptchaSiteKey || data.recaptchaSiteKey.trim() === "") {
        toast({
          title: "Campo obrigatório",
          description: "A Chave do Site (Site Key) é obrigatória quando reCAPTCHA está habilitado.",
          variant: "destructive",
        });
        return;
      }

      if (!data.recaptchaSecretKey || data.recaptchaSecretKey.trim() === "") {
        toast({
          title: "Campo obrigatório",
          description: "A Chave Secreta (Secret Key) é obrigatória quando reCAPTCHA está habilitado.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsSaving(true);

    try {
      // TODO: Conectar com backend/Supabase
      console.log("Configurações de segurança:", data);

      // Simular delay de salvamento
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Configurações salvas com sucesso!",
        description: "As políticas de segurança foram atualizadas.",
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

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Página */}
      <div>
        <h1 className="text-3xl font-bold">Segurança</h1>
        <p className="text-muted-foreground">
          Configure políticas de segurança e autenticação
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Card 1: Autenticação de Dois Fatores (2FA) */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Autenticação de Dois Fatores (2FA)
              </CardTitle>
              <CardDescription>
                Aumente a segurança exigindo um segundo passo de verificação para o login da equipe administrativa.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="twoFactorEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Habilitar 2FA para a equipe (Admin)
                      </FormLabel>
                      <FormDescription>
                        Usuários administrativos precisarão de um código de verificação adicional ao fazer login.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Como funciona o 2FA?</AlertTitle>
                <AlertDescription>
                  Após habilitar, os usuários administrativos precisarão configurar um aplicativo autenticador (como Google Authenticator ou Authy) 
                  em seus dispositivos. A cada login, será solicitado um código de 6 dígitos gerado pelo app.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Card 2: Google reCAPTCHA */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Google reCAPTCHA
              </CardTitle>
              <CardDescription>
                Proteja formulários públicos contra spam e bots.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="recaptchaEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Habilitar reCAPTCHA
                      </FormLabel>
                      <FormDescription>
                        Adiciona proteção contra bots em formulários de contato e registro.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Campos Condicionais: Aparecem APENAS se reCAPTCHA estiver habilitado */}
              {recaptchaEnabled && (
                <div className="space-y-4 pt-2">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Obtenha suas chaves gratuitamente no{" "}
                      <a
                        href="https://www.google.com/recaptcha/admin"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-primary"
                      >
                        Google reCAPTCHA Admin Console
                      </a>
                      . Escolha a versão reCAPTCHA v2 (checkbox) ou v3 (invisível).
                    </AlertDescription>
                  </Alert>

                  <FormField
                    control={form.control}
                    name="recaptchaSiteKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chave do Site (Site Key)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="6Lc..."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Chave pública usada no frontend dos formulários.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="recaptchaSecretKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chave Secreta (Secret Key)</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="6Lc..."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Chave privada usada para validação no backend. Nunca compartilhe publicamente.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botão de Salvar */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
