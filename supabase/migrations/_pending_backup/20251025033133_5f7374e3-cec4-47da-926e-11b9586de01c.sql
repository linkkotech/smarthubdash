-- ETAPA 1: Criar função is_platform_admin
CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = _user_id
    AND role IN ('super_admin', 'admin', 'manager')
  )
$$;

-- ETAPA 2: Criar função helper user_has_platform_role
CREATE OR REPLACE FUNCTION public.user_has_platform_role(_user_id uuid, _roles text[])
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = _user_id
    AND role::text = ANY(_roles)
  )
$$;

-- ETAPA 3: Corrigir políticas RLS da tabela clients
DROP POLICY IF EXISTS "Usuários autenticados podem ler clientes" ON clients;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir clientes" ON clients;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar clientes" ON clients;

-- Admins veem tudo, usuários de cliente veem apenas seu cliente
CREATE POLICY "admins_can_read_all_clients" ON clients
  FOR SELECT
  TO authenticated
  USING (
    user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager'])
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.client_id = clients.id
    )
  );

-- Apenas admins podem criar clientes
CREATE POLICY "admins_can_insert_clients" ON clients
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager'])
  );

-- Apenas admins podem atualizar clientes
CREATE POLICY "admins_can_update_clients" ON clients
  FOR UPDATE
  TO authenticated
  USING (
    user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager'])
  )
  WITH CHECK (
    user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager'])
  );

-- Apenas super_admin pode deletar
CREATE POLICY "super_admins_can_delete_clients" ON clients
  FOR DELETE
  TO authenticated
  USING (
    user_has_platform_role(auth.uid(), ARRAY['super_admin'])
  );

-- ETAPA 4: Corrigir políticas RLS da tabela contracts
DROP POLICY IF EXISTS "Usuários autenticados podem ler contratos" ON contracts;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir contratos" ON contracts;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar contratos" ON contracts;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar contratos" ON contracts;

-- Admins veem tudo, usuários de cliente veem apenas contratos do seu cliente
CREATE POLICY "read_contracts_policy" ON contracts
  FOR SELECT
  TO authenticated
  USING (
    user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager'])
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.client_id = contracts.client_id
    )
  );

-- Apenas admins podem inserir contratos
CREATE POLICY "insert_contracts_policy" ON contracts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager'])
  );

-- Apenas admins podem atualizar contratos
CREATE POLICY "update_contracts_policy" ON contracts
  FOR UPDATE
  TO authenticated
  USING (
    user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager'])
  )
  WITH CHECK (
    user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin', 'manager'])
  );

-- Apenas super_admin pode deletar contratos
CREATE POLICY "delete_contracts_policy" ON contracts
  FOR DELETE
  TO authenticated
  USING (
    user_has_platform_role(auth.uid(), ARRAY['super_admin'])
  );

-- ETAPA 5: Corrigir políticas RLS da tabela plans
DROP POLICY IF EXISTS "Administradores podem inserir planos" ON plans;
DROP POLICY IF EXISTS "Administradores podem atualizar planos" ON plans;
DROP POLICY IF EXISTS "Administradores podem deletar planos" ON plans;

-- Apenas admins podem inserir planos
CREATE POLICY "insert_plans_policy" ON plans
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin'])
  );

-- Apenas admins podem atualizar planos
CREATE POLICY "update_plans_policy" ON plans
  FOR UPDATE
  TO authenticated
  USING (
    user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin'])
  )
  WITH CHECK (
    user_has_platform_role(auth.uid(), ARRAY['super_admin', 'admin'])
  );

-- Apenas super_admin pode deletar planos
CREATE POLICY "delete_plans_policy" ON plans
  FOR DELETE
  TO authenticated
  USING (
    user_has_platform_role(auth.uid(), ARRAY['super_admin'])
  );