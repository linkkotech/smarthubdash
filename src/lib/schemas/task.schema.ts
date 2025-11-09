import { z } from "zod";

export const taskPriorityEnum = z.enum(["baixa", "normal", "alta"]);
export const taskStatusEnum = z.enum([
  "a_fazer",
  "em_progresso",
  "em_revisao",
  "concluida",
  "backlog",
]);

export const createTaskSchema = z.object({
  workspace_id: z.string().uuid("ID do workspace inválido"),
  title: z.string().min(1, "Título da tarefa é obrigatório").max(255),
  priority: taskPriorityEnum.default("normal"),
  status: taskStatusEnum.default("a_fazer"),
  due_date: z.string().datetime().optional().or(z.null()),
  description: z.string().max(5000).optional().or(z.null()),
  is_favorite: z.boolean().default(false),
  assignees: z.array(z.string().uuid()).default([]),
  tags: z.array(z.string().uuid()).default([]),
  subtasks: z
    .array(
      z.object({
        title: z
          .string()
          .min(1, "Título da subtarefa é obrigatório")
          .max(255),
      })
    )
    .default([]),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const taskFormSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(255),
  priority: taskPriorityEnum,
  status: taskStatusEnum,
  due_date: z.string().optional().or(z.null()),
  description: z.string().max(5000).optional().or(z.null()),
  is_favorite: z.boolean().default(false),
  assignees: z.array(z.string().uuid()).default([]),
  tags: z.array(z.string().uuid()).default([]),
  subtasks: z
    .array(
      z.object({
        title: z
          .string()
          .min(1, "Título da subtarefa é obrigatório")
          .max(255),
      })
    )
    .default([]),
});

export type TaskFormData = z.infer<typeof taskFormSchema>;
