/**
 * @fileoverview Tipos TypeScript para Workspaces
 * 
 * Define as interfaces e tipos para o sistema de workspaces multi-tenant.
 * Workspaces são os novos "clientes" do sistema, suportando tanto
 * Pessoa Jurídica (CNPJ) quanto Pessoa Física (CPF).
 */

/**
 * Tipo de cliente do workspace
 * 
 * @typedef {('pessoa_juridica' | 'pessoa_fisica')} ClientType
 * 
 * - `pessoa_juridica`: Empresas que possuem CNPJ
 * - `pessoa_fisica`: Indivíduos que possuem CPF
 */
export type ClientType = 'pessoa_juridica' | 'pessoa_fisica';

/**
 * Role de membro de um workspace
 * 
 * @typedef {('work_owner' | 'work_manager' | 'work_user')} WorkspaceRole
 * 
 * - `work_owner`: Controle total (deletar workspace, gerenciar membros, etc)
 * - `work_manager`: Gerenciar membros e conteúdo, mas não pode deletar workspace
 * - `work_user`: Acesso básico ao workspace
 */
export type WorkspaceRole = 'work_owner' | 'work_manager' | 'work_user';

/**
 * Interface do Workspace (tabela workspaces)
 * 
 * Representa um workspace no sistema. Um workspace é uma entidade isolada
 * (multi-tenant) que agrupa usuários, dados e recursos.
 * 
 * @interface Workspace
 * 
 * @property {string} id - UUID único do workspace
 * @property {string} name - Nome do workspace (ex: "Acme Corporation")
 * @property {string} slug - Identificador único em formato slug (ex: "acme-corp")
 * @property {ClientType} client_type - Tipo de cliente (PJ ou PF)
 * @property {string} document - CNPJ ou CPF com máscara (ex: "12.345.678/0001-90" ou "123.456.789-01")
 * @property {string} created_at - Timestamp ISO 8601 de criação
 * @property {string} updated_at - Timestamp ISO 8601 da última atualização
 * 
 * @example
 * // Workspace Pessoa Jurídica
 * const workspacePJ: Workspace = {
 *   id: "123e4567-e89b-12d3-a456-426614174000",
 *   name: "Acme Corp",
 *   slug: "acme-corp",
 *   client_type: "pessoa_juridica",
 *   document: "12.345.678/0001-90",
 *   created_at: "2025-11-04T10:00:00Z",
 *   updated_at: "2025-11-04T10:00:00Z"
 * };
 * 
 * @example
 * // Workspace Pessoa Física
 * const workspacePF: Workspace = {
 *   id: "123e4567-e89b-12d3-a456-426614174001",
 *   name: "João Silva",
 *   slug: "joao-silva",
 *   client_type: "pessoa_fisica",
 *   document: "123.456.789-01",
 *   created_at: "2025-11-04T11:00:00Z",
 *   updated_at: "2025-11-04T11:00:00Z"
 * };
 */
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  client_type: ClientType;
  document: string;
  created_at: string;
  updated_at: string;
}

/**
 * Interface de Membro de Workspace (tabela workspace_members)
 * 
 * Relaciona usuários (profiles) com workspaces, definindo o role de cada um.
 * 
 * @interface WorkspaceMember
 * 
 * @property {string} id - UUID único do registro de membership
 * @property {string} workspace_id - UUID do workspace
 * @property {string} profile_id - UUID do usuário/profile
 * @property {WorkspaceRole} role - Role do usuário no workspace
 * @property {string} joined_at - Timestamp de quando o usuário entrou
 * @property {string} updated_at - Timestamp da última atualização
 */
export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  profile_id: string;
  role: WorkspaceRole;
  joined_at: string;
  updated_at: string;
}

/**
 * Payload para criação de workspace
 * 
 * Contém todos os dados necessários para criar um novo workspace,
 * incluindo informações do primeiro administrador (owner).
 * 
 * @interface CreateWorkspacePayload
 * 
 * @property {string} name - Nome do workspace (mínimo 3 caracteres)
 * @property {string} slug - Slug único (será validado no backend)
 * @property {ClientType} client_type - Tipo de cliente (pessoa_juridica ou pessoa_fisica)
 * @property {string} document - CNPJ ou CPF com máscara aplicada
 * @property {string} admin_email - Email do primeiro administrador/owner
 * @property {string} admin_name - Nome completo do administrador
 * 
 * @example
 * // Criar workspace PJ
 * const payloadPJ: CreateWorkspacePayload = {
 *   name: "Acme Corp",
 *   slug: "acme-corp",
 *   client_type: "pessoa_juridica",
 *   document: "12.345.678/0001-90",
 *   admin_email: "admin@acme.com",
 *   admin_name: "João Silva"
 * };
 * 
 * @example
 * // Criar workspace PF
 * const payloadPF: CreateWorkspacePayload = {
 *   name: "João Silva",
 *   slug: "joao-silva",
 *   client_type: "pessoa_fisica",
 *   document: "123.456.789-01",
 *   admin_email: "joao@email.com",
 *   admin_name: "João Silva"
 * };
 */
export interface CreateWorkspacePayload {
  name: string;
  slug: string;
  client_type: ClientType;
  document: string;
  admin_email: string;
  admin_name: string;
}

/**
 * Payload para atualização de workspace
 * 
 * Todos os campos são opcionais (partial update).
 * 
 * @interface UpdateWorkspacePayload
 */
export interface UpdateWorkspacePayload {
  name?: string;
  slug?: string;
  client_type?: ClientType;
  document?: string;
}

/**
 * Payload para adicionar membro ao workspace
 * 
 * @interface AddWorkspaceMemberPayload
 * 
 * @property {string} workspace_id - UUID do workspace
 * @property {string} profile_id - UUID do usuário a ser adicionado
 * @property {WorkspaceRole} role - Role inicial do usuário
 */
export interface AddWorkspaceMemberPayload {
  workspace_id: string;
  profile_id: string;
  role: WorkspaceRole;
}

/**
 * Payload para atualizar role de membro
 * 
 * @interface UpdateMemberRolePayload
 * 
 * @property {string} member_id - UUID do registro de membership
 * @property {WorkspaceRole} new_role - Novo role a ser atribuído
 */
export interface UpdateMemberRolePayload {
  member_id: string;
  new_role: WorkspaceRole;
}
