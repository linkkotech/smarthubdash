/**
 * Tipos TypeScript para a estrutura de Workspaces
 */

/**
 * Workspace básico (tabela workspaces)
 */
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  client_type: 'pessoa_juridica' | 'pessoa_fisica';
  document: string;
  created_at: string;
  updated_at: string;
}

/**
 * Workspace Member (tabela workspace_members)
 */
export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  profile_id: string;
  role: 'owner' | 'manager' | 'member';
  created_at: string;
  profiles?: {
    id: string;
    full_name: string;
    email: string;
  };
}

/**
 * Workspace com informações do Owner (para exibição na tabela)
 * 
 * @property {string} id - UUID do workspace
 * @property {string} name - Nome do workspace
 * @property {string} client_type - Tipo do cliente (pessoa_juridica ou pessoa_fisica)
 * @property {string} document - CPF (11 dígitos) ou CNPJ (14 dígitos) sem máscara
 * @property {string} created_at - Data de criação ISO 8601
 * @property {string} owner_name - Nome completo do owner (obtido via join com profiles)
 * @property {string} owner_email - Email do owner
 */
export interface WorkspaceWithOwner {
  id: string;
  name: string;
  slug: string;
  client_type: 'pessoa_juridica' | 'pessoa_fisica';
  document: string;
  created_at: string;
  updated_at: string;
  workspace_members: Array<{
    profiles: {
      id: string;
      full_name: string;
      email: string;
    };
  }>;
}

/**
 * Workspace formatado para exibição na tabela
 */
export interface WorkspaceTableRow {
  id: string;
  name: string;
  owner_name: string;
  owner_email: string;
  client_type_display: 'PJ' | 'PF';
  client_type: 'pessoa_juridica' | 'pessoa_fisica';
  document: string;
  created_at: string;
  created_at_formatted: string;
}
