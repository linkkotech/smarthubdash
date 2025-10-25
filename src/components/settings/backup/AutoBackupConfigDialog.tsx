import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const autoBackupSchema = z.object({
  enabled: z.boolean(),
  frequency: z.enum(["daily", "weekly"]),
  time: z.string().regex(/^\d{2}:00$/, "Formato inválido"),
  retention: z.coerce
    .number()
    .min(1, "Deve manter pelo menos 1 backup")
    .max(365, "Máximo de 365 backups"),
});

type AutoBackupFormValues = z.infer<typeof autoBackupSchema>;

interface AutoBackupConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialConfig?: AutoBackupFormValues;
}

export function AutoBackupConfigDialog({
  open,
  onOpenChange,
  initialConfig,
}: AutoBackupConfigDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const form = useForm<AutoBackupFormValues>({
    resolver: zodResolver(autoBackupSchema),
    defaultValues: initialConfig || {
      enabled: false,
      frequency: "daily",
      time: "02:00",
      retention: 7,
    },
  });

  const onSubmit = async (data: AutoBackupFormValues) => {
    setIsSaving(true);
    try {
      // TODO: Conectar com backend
      console.log("Configuração de backup automático:", data);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Configuração salva com sucesso!",
        description: data.enabled
          ? `Backups automáticos ${
              data.frequency === "daily" ? "diários" : "semanais"
            } às ${data.time}`
          : "Backup automático desabilitado",
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao salvar configuração",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Gerar opções de horário (00:00 a 23:00)
  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0");
    return { value: `${hour}:00`, label: `${hour}:00` };
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configurar Backup Automático</DialogTitle>
          <DialogDescription>
            Configure a rotina de backup automático do banco de dados
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Switch: Habilitar Backup Automático */}
            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Habilitar Backup Automático
                    </FormLabel>
                    <FormDescription>
                      Ativar rotina de backup agendado
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

            {/* Campos condicionais (só aparecem se enabled = true) */}
            {form.watch("enabled") && (
              <div className="space-y-4 animate-in fade-in-50 duration-300">
                {/* Frequência */}
                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequência</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a frequência" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Diariamente</SelectItem>
                          <SelectItem value="weekly">Semanalmente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Horário */}
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o horário" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[200px]">
                          {timeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Horário preferencial para execução do backup
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Política de Retenção */}
                <FormField
                  control={form.control}
                  name="retention"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Política de Retenção</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            Manter os últimos
                          </span>
                          <Input
                            type="number"
                            min={1}
                            max={365}
                            className="w-20"
                            {...field}
                          />
                          <span className="text-sm text-muted-foreground">
                            backups
                          </span>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Backups mais antigos serão excluídos automaticamente
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Salvando..." : "Salvar Configuração"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
