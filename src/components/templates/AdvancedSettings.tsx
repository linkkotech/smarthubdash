import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface AdvancedSettingsProps {
  templateId: string | null;
  linkedProfilesCount: number;
  onDeleteTemplate: () => void;
}

export function AdvancedSettings({ 
  templateId, 
  linkedProfilesCount,
  onDeleteTemplate 
}: AdvancedSettingsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Cabeçalho */}
        <div>
          <h1 className="text-2xl font-bold">Configurações Avançadas</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie ações críticas e irreversíveis
          </p>
        </div>

        {/* Card: Zona de Perigo */}
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
            </div>
            <CardDescription>
              Ações irreversíveis que afetam este template
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Alert Informativo */}
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Este template tem <strong>{linkedProfilesCount} perfis vinculados</strong>. 
                Se você excluir o template, os perfis associados não serão removidos, 
                mas precisarão de um novo template.
              </AlertDescription>
            </Alert>

            {/* Botão de Exclusão */}
            <div className="flex items-start justify-between pt-2">
              <div>
                <h4 className="font-medium text-sm">Excluir Template</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Esta ação não pode ser desfeita. O template será removido permanentemente.
                </p>
              </div>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={!templateId}
              >
                Excluir Template
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Confirmação */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a excluir este template permanentemente. 
              Esta ação não pode ser desfeita.
              {linkedProfilesCount > 0 && (
                <span className="block mt-2 text-destructive font-medium">
                  ⚠️ {linkedProfilesCount} perfis estão usando este template e precisarão 
                  ser reassociados manualmente.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDeleteTemplate}
              className="bg-destructive hover:bg-destructive/90"
            >
              Sim, Excluir Template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
