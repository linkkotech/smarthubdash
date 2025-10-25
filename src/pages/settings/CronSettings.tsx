import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Database, Plus, Settings as SettingsIcon, Bell, RefreshCw, Info } from "lucide-react";
import { AutoBackupConfigDialog } from "@/components/settings/backup/AutoBackupConfigDialog";
import { createBackupColumns, Backup } from "@/components/settings/backup/BackupColumns";
import { useToast } from "@/hooks/use-toast";

export default function CronSettings() {
  const [backups, setBackups] = useState<Backup[]>([
    {
      id: "1",
      filename: "backup_2025_01_15_02_00.sql",
      size: 15728640,
      created_at: "2025-01-15T02:00:00Z",
      status: "completed",
    },
    {
      id: "2",
      filename: "backup_2025_01_14_02_00.sql",
      size: 14680064,
      created_at: "2025-01-14T02:00:00Z",
      status: "completed",
    },
  ]);

  const [isAutoBackupDialogOpen, setIsAutoBackupDialogOpen] = useState(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const { toast } = useToast();

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    try {
      console.log("Criando backup manual...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      toast({
        title: "Backup iniciado!",
        description: "O backup está sendo processado em segundo plano.",
      });
    } catch (error) {
      toast({
        title: "Erro ao criar backup",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleDownloadBackup = (backup: Backup) => {
    console.log("Baixando backup:", backup.filename);
    toast({
      title: "Download iniciado",
      description: `Baixando ${backup.filename}`,
    });
  };

  const handleDeleteBackup = (backup: Backup) => {
    console.log("Deletando backup:", backup.id);
    setBackups((prev) => prev.filter((b) => b.id !== backup.id));
    toast({
      title: "Backup excluído",
      description: `${backup.filename} foi removido com sucesso.`,
    });
  };

  const columns = createBackupColumns({
    onDownload: handleDownloadBackup,
    onDelete: handleDeleteBackup,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Agendamentos (Cron Jobs)</h1>
        <p className="text-muted-foreground">
          Configure tarefas automáticas e agendadas
        </p>
      </div>

      <Tabs defaultValue="backup" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Backup
          </TabsTrigger>
          <TabsTrigger value="notificacoes" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="sincronizacoes" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Sincronizações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="backup" className="space-y-4 mt-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Os backups são armazenados no módulo de <strong>Storage</strong>.
              Configure o storage em{" "}
              <a
                href="/configuracoes/storage"
                className="underline hover:text-primary"
              >
                Configurações → Storage e Uploads
              </a>
              .
            </AlertDescription>
          </Alert>

          <Card className="w-full">
            <CardHeader>
              <CardTitle>Gerenciar Backups</CardTitle>
              <CardDescription>
                Crie backups manuais ou configure rotinas automáticas
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button
                onClick={handleCreateBackup}
                disabled={isCreatingBackup}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {isCreatingBackup ? "Criando..." : "Criar Backup Agora"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsAutoBackupDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <SettingsIcon className="h-4 w-4" />
                Configurar Backup Automático
              </Button>
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardHeader>
              <CardTitle>Histórico de Backups</CardTitle>
              <CardDescription>
                Lista de backups criados e seu status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={backups}
                searchKey="filename"
                searchPlaceholder="Buscar por nome do arquivo..."
              />
            </CardContent>
          </Card>

          <AutoBackupConfigDialog
            open={isAutoBackupDialogOpen}
            onOpenChange={setIsAutoBackupDialogOpen}
            initialConfig={{
              enabled: false,
              frequency: "daily",
              time: "02:00",
              retention: 7,
            }}
          />
        </TabsContent>

        <TabsContent value="notificacoes" className="space-y-4 mt-6">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Notificações Agendadas</CardTitle>
              <CardDescription>
                Configure envios automáticos de e-mails e alertas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Configurações disponíveis em breve...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sincronizacoes" className="space-y-4 mt-6">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Sincronizações Automáticas</CardTitle>
              <CardDescription>
                Integrações com APIs externas e sincronização de dados
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
