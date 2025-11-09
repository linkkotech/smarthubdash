import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import {
  createTaskSchema,
  type TaskFormData,
  taskFormSchema,
} from "@/lib/schemas/task.schema";
import { useCreateTask } from "@/hooks/useCreateTask";
import { TaskFormFields } from "./TaskFormFields";
import { AssigneesCombobox } from "./AssigneesCombobox";
import { TagsCombobox } from "./TagsCombobox";
import { SubtasksInput } from "./SubtasksInput";
import { FavoriteToggle } from "./FavoriteToggle";
import { AttachmentsUpload } from "./AttachmentsUpload";

interface User {
  id: string;
  full_name: string;
  email: string;
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  users: User[];
  tags: Tag[];
  isLoadingUsers?: boolean;
  isLoadingTags?: boolean;
  onCreateTag?: (tagName: string) => Promise<Tag>;
}

interface AttachedFile {
  file: File;
  id: string;
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  workspaceId,
  users,
  tags,
  isLoadingUsers = false,
  isLoadingTags = false,
  onCreateTag,
}: CreateTaskDialogProps) {
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const { mutate: createTask, isPending } = useCreateTask();

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      priority: "normal",
      status: "a_fazer",
      due_date: undefined,
      description: "",
      is_favorite: false,
      assignees: [],
      tags: [],
      subtasks: [],
    },
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset();
      setAttachments([]);
    }
  }, [open, form]);

  const onSubmit = async (data: TaskFormData) => {
    // TODO: Upload attachments to Supabase Storage first
    // For now, we'll just submit the task data

    createTask(
      {
        ...data,
        workspace_id: workspaceId,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const handleAddFiles = (files: File[]) => {
    const newAttachments = files.map((file) => ({
      file,
      id: `${Date.now()}-${Math.random()}`,
    }));
    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const handleRemoveFile = (fileId: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== fileId));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Criar Nova Tarefa</DialogTitle>
          <DialogDescription>
            Preencha os detalhes da nova tarefa. Os campos marcados com * são
            obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 px-4"
            >
              <Tabs defaultValue="basico" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basico">Básico</TabsTrigger>
                  <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
                  <TabsTrigger value="anexos">Anexos</TabsTrigger>
                </TabsList>

                {/* Aba: Básico */}
                <TabsContent value="basico" className="space-y-4 mt-4">
                  <TaskFormFields control={form.control} />
                </TabsContent>

                {/* Aba: Detalhes */}
                <TabsContent value="detalhes" className="space-y-4 mt-4">
                  <AssigneesCombobox
                    control={form.control}
                    users={users}
                    isLoading={isLoadingUsers}
                  />
                  <TagsCombobox
                    control={form.control}
                    tags={tags}
                    isLoading={isLoadingTags}
                    onCreateTag={onCreateTag}
                  />
                  <SubtasksInput control={form.control} />
                  <FavoriteToggle control={form.control} />
                </TabsContent>

                {/* Aba: Anexos */}
                <TabsContent value="anexos" className="space-y-4 mt-4">
                  <AttachmentsUpload
                    attachments={attachments}
                    onFilesAdded={handleAddFiles}
                    onFileRemoved={handleRemoveFile}
                    isLoading={isPending}
                  />
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter className="border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Criando..." : "Criar Tarefa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
