import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Database, HardDrive } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

const awsRegions = [
  { value: "us-east-1", label: "US East (N. Virginia)" },
  { value: "us-east-2", label: "US East (Ohio)" },
  { value: "us-west-1", label: "US West (N. California)" },
  { value: "us-west-2", label: "US West (Oregon)" },
  { value: "sa-east-1", label: "South America (São Paulo)" },
  { value: "eu-west-1", label: "Europe (Ireland)" },
  { value: "eu-central-1", label: "Europe (Frankfurt)" },
  { value: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
  { value: "ap-northeast-1", label: "Asia Pacific (Tokyo)" },
  { value: "ap-south-1", label: "Asia Pacific (Mumbai)" },
];

const storageFormSchema = z.object({
  provider: z.enum(["local", "s3"], {
    required_error: "Selecione um provedor de armazenamento",
  }),
  awsAccessKeyId: z.string().optional(),
  awsSecretAccessKey: z.string().optional(),
  awsRegion: z.string().optional(),
  bucketName: z.string().optional(),
}).refine(
  (data) => {
    if (data.provider === "s3") {
      return (
        !!data.awsAccessKeyId &&
        !!data.awsSecretAccessKey &&
        !!data.awsRegion &&
        !!data.bucketName
      );
    }
    return true;
  },
  {
    message: "Todos os campos AWS S3 são obrigatórios quando S3 está selecionado",
    path: ["provider"],
  }
).refine(
  (data) => {
    if (data.provider === "s3" && data.awsAccessKeyId) {
      return data.awsAccessKeyId.length >= 16 && data.awsAccessKeyId.length <= 128;
    }
    return true;
  },
  {
    message: "AWS Access Key ID deve ter entre 16 e 128 caracteres",
    path: ["awsAccessKeyId"],
  }
).refine(
  (data) => {
    if (data.provider === "s3" && data.awsSecretAccessKey) {
      return data.awsSecretAccessKey.length >= 40;
    }
    return true;
  },
  {
    message: "AWS Secret Access Key deve ter pelo menos 40 caracteres",
    path: ["awsSecretAccessKey"],
  }
).refine(
  (data) => {
    if (data.provider === "s3" && data.bucketName) {
      const bucketNameRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
      return (
        data.bucketName.length >= 3 &&
        data.bucketName.length <= 63 &&
        bucketNameRegex.test(data.bucketName)
      );
    }
    return true;
  },
  {
    message: "Nome do bucket inválido (3-63 caracteres, minúsculas, hífens permitidos)",
    path: ["bucketName"],
  }
);

type StorageFormValues = z.infer<typeof storageFormSchema>;

export default function StorageSettings() {
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  const form = useForm<StorageFormValues>({
    resolver: zodResolver(storageFormSchema),
    defaultValues: {
      provider: "local",
      awsAccessKeyId: "",
      awsSecretAccessKey: "",
      awsRegion: "",
      bucketName: "",
    },
  });

  const selectedProvider = form.watch("provider");

  const onSubmit = async (data: StorageFormValues) => {
    setIsSaving(true);

    try {
      // TODO: Conectar com backend
      console.log("Configurações de storage:", data);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Configurações salvas com sucesso!",
        description: `Provedor configurado: ${
          data.provider === "local" ? "Local" : "AWS S3"
        }`,
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

  const handleTestConnection = async () => {
    const isValid = await form.trigger([
      "awsAccessKeyId",
      "awsSecretAccessKey",
      "awsRegion",
      "bucketName",
    ]);

    if (!isValid) {
      toast({
        title: "Configurações incompletas",
        description: "Preencha todos os campos AWS S3 antes de testar.",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);

    try {
      const formData = form.getValues();
      console.log("Testando conexão S3:", {
        region: formData.awsRegion,
        bucket: formData.bucketName,
      });

      // TODO: Chamar backend para testar conexão real
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: "Conexão S3 bem-sucedida!",
        description: `Bucket "${formData.bucketName}" está acessível.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao conectar com S3",
        description: "Verifique suas credenciais e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Armazenamento</h1>
        <p className="text-muted-foreground">
          Gerencie configurações de armazenamento de arquivos
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Configurações de Storage</CardTitle>
              <CardDescription>
                Configure o provedor de armazenamento para gerenciar arquivos da plataforma
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <Alert>
                <HardDrive className="h-4 w-4" />
                <AlertDescription>
                  Configure o provedor de armazenamento para gerenciar uploads de 
                  arquivos, imagens e documentos da plataforma. O armazenamento local 
                  é adequado para desenvolvimento, enquanto o S3 é recomendado para 
                  produção.
                </AlertDescription>
              </Alert>

              <FormField
                control={form.control}
                name="provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provedor de Armazenamento</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o provedor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="local">
                          <div className="flex items-center gap-2">
                            <HardDrive className="h-4 w-4" />
                            <span>Local (servidor)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="s3">
                          <div className="flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            <span>AWS S3</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {field.value === "local" 
                        ? "Arquivos serão armazenados no servidor local"
                        : "Arquivos serão armazenados no Amazon S3"
                      }
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedProvider === "local" && (
                <Alert>
                  <HardDrive className="h-4 w-4" />
                  <AlertDescription>
                    Modo de armazenamento local ativado. Arquivos serão salvos no 
                    diretório do servidor. Para ambientes de produção, considere usar AWS S3.
                  </AlertDescription>
                </Alert>
              )}

              {selectedProvider === "s3" && (
                <div className="space-y-4 animate-in fade-in-50 duration-300">
                  <FormField
                    control={form.control}
                    name="awsAccessKeyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AWS Access Key ID</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="AKIAIOSFODNN7EXAMPLE" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Sua chave de acesso AWS (16-128 caracteres)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="awsSecretAccessKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AWS Secret Access Key</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showSecretKey ? "text" : "password"}
                              placeholder="Digite sua AWS Secret Access Key"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setShowSecretKey(!showSecretKey)}
                            >
                              {showSecretKey ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Sua chave secreta AWS (mínimo 40 caracteres)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="awsRegion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>AWS S3 Region</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a região" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {awsRegions.map((region) => (
                                <SelectItem key={region.value} value={region.value}>
                                  {region.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bucketName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Bucket</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="meu-bucket-s3" 
                              {...field}
                              onChange={(e) => {
                                field.onChange(e.target.value.toLowerCase());
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            3-63 caracteres, minúsculas
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex items-center justify-end gap-2 border-t pt-6">
              {selectedProvider === "s3" && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isTesting}
                  onClick={handleTestConnection}
                >
                  <Database className="h-4 w-4 mr-2" />
                  {isTesting ? "Testando..." : "Testar Conexão S3"}
                </Button>
              )}

              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
