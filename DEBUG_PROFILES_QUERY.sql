-- Query de debug para verificar o profile do owner do workspace Ana Maria

-- 1. Verificar workspace_members da Ana Maria
SELECT 
  wm.id,
  wm.workspace_id,
  wm.profile_id,
  wm.role,
  w.name as workspace_name
FROM workspace_members wm
LEFT JOIN workspaces w ON w.id = wm.workspace_id
WHERE w.name = 'Ana Maria';

-- 2. Verificar o profile associado
SELECT 
  p.id,
  p.full_name,
  p.email,
  p.client_id
FROM profiles p
WHERE p.id = '0ac3b610-22ed-4b39-bd0c-c1955492f3bc';

-- 3. Testar a query completa que o frontend está fazendo
SELECT 
  w.id,
  w.name,
  w.client_type,
  wm.role,
  p.full_name,
  p.email,
  p.client_id
FROM workspaces w
LEFT JOIN workspace_members wm ON wm.workspace_id = w.id AND wm.role = 'owner'
LEFT JOIN profiles p ON p.id = wm.profile_id
WHERE w.name = 'Ana Maria';
