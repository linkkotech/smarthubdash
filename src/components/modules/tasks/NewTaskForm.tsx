'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

/**
 * Schema Zod para validação de nova tarefa
 */
const newTaskSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(255, 'Título muito longo'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  dueDate: z.string().optional(),
  assignee: z.string().optional(),
});

type NewTaskFormData = z.infer<typeof newTaskSchema>;

interface NewTaskFormProps {
  onSuccess?: () => void;
  workspaceId?: string;
}

/**
 * NewTaskForm - Formulário para criar uma nova tarefa
 * 
 * Campos:
 * - Título (obrigatório)
 * - Descrição (opcional)
 * - Prioridade (low/medium/high/urgent)
 * - Data de Vencimento (opcional)
 * - Responsável (opcional)
 */
export function NewTaskForm({ onSuccess, workspaceId }: NewTaskFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<NewTaskFormData>({
    resolver: zodResolver(newTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      assignee: '',
    },
  });

  const onSubmit = async (data: NewTaskFormData) => {
    try {
      setIsLoading(true);

      // TODO: Integrar com API real para criar tarefa
      console.log('[NewTaskForm] Criando nova tarefa:', data);

      // Simular delay de rede
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: 'Sucesso',
        description: 'Tarefa criada com sucesso!',
        variant: 'default',
      });

      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('[NewTaskForm] Erro ao criar tarefa:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao criar tarefa. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b">
        <h2 className="text-xl font-semibold">Nova Tarefa</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Preencha os detalhes para criar uma nova tarefa
        </p>
      </div>

      {/* Formulário */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-y-auto flex flex-col">
          <div className="flex-1 px-6 py-4 space-y-6">
            {/* Título */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Implementar autenticação"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descrição */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Adicione detalhes sobre a tarefa..."
                      className="resize-none h-24"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Descrição adicional da tarefa
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Prioridade */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prioridade</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Data de Vencimento */}
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Vencimento</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Data limite para conclusão da tarefa
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Responsável */}
            <FormField
              control={form.control}
              name="assignee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsável</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o responsável" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="james">James</SelectItem>
                      <SelectItem value="rachel">Rachel Lee</SelectItem>
                      <SelectItem value="kate">Kate Smith</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Botões de Ação */}
          <div className="px-6 py-4 border-t space-y-2">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Criando...' : 'Criar Tarefa'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
