-- Query para verificar se Ana tem roles na tabela user_roles
SELECT 
  p.id,
  p.full_name,
  p.email,
  ur.role as user_role,
  wm.role as workspace_role
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id
LEFT JOIN workspace_members wm ON p.id = wm.profile_id
WHERE p.full_name ILIKE '%ana%'
ORDER BY p.full_name;
