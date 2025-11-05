-- Verificar se Ana está em workspace_members
SELECT 
  wm.id,
  wm.workspace_id,
  wm.profile_id,
  wm.role,
  p.full_name,
  p.email,
  w.name as workspace_name
FROM workspace_members wm
JOIN profiles p ON wm.profile_id = p.id
JOIN workspaces w ON wm.workspace_id = w.id
WHERE p.full_name ILIKE '%ana%'
ORDER BY wm.joined_at DESC;
