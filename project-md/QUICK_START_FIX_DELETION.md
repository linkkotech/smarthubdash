# 🚀 QUICK START: Aplicar Migration de Correção

## O Erro
```
Cannot remove or downgrade the last owner of the workspace. Please assign another owner first.
```

## Arquivos Criados/Modificados

| Arquivo | Status | Descrição |
|---------|--------|-----------|
| `supabase/migrations/20251106000015_allow_cascade_delete_workspace.sql` | ✅ NOVO | Migration com RPC e triggers |
| `src/lib/actions/workspace.actions.ts` | ✅ ATUALIZADO | Agora usa RPC em vez de DELETE direto |

## Passo 1: Aplicar Migration no Supabase

1. Abra **Supabase Dashboard** → **SQL Editor**
2. Cole o conteúdo de: `supabase/migrations/20251106000015_allow_cascade_delete_workspace.sql`
3. Execute (botão "Run")
4. Você deve ver sucesso sem erros

## Passo 2: Registrar na Tabela schema_migrations (Opcional mas Recomendado)

No mesmo SQL Editor, execute:

```sql
INSERT INTO schema_migrations (version, name, statements, checksum, execution_time, success, installed_on)
VALUES (
  '20251106000015',
  'allow_cascade_delete_workspace',
  1,
  'checksum_value',
  0,
  TRUE,
  NOW()
);
```

## Passo 3: Reiniciar Dev Server

```powershell
npm run dev
```

## Passo 4: Testar Deleção

1. Login como **Super Admin**
2. Vá para página `/clientes`
3. Clique no ícone "⋯" (três pontos) de qualquer workspace
4. Clique em **"🗑️ Excluir"**
5. Confirme no diálogo de alerta
6. Resultado esperado: ✅ Toast de sucesso "Workspace excluído com sucesso"

## Solução de Problemas

### Erro: "Function delete_workspace_safely does not exist"
- Migration não foi executada
- **Solução:** Execute a migration no Supabase Dashboard

### Erro: "Permission denied"
- SERVICE_ROLE_KEY inválido ou não configurado
- **Solução:** Verifique `.env.local`:
  ```
  VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi... (deve estar correto)
  ```

### Erro: "Cannot remove or downgrade the last owner..." ainda aparece
- Uma das migrations anteriores (`20251106000013`, `20251106000014`) pode estar desatualizada
- **Solução:** Verifique se ambas foram executadas antes de `20251106000015`

## 📝 O Que Mudou no Banco de Dados

```sql
-- 3 Novos Objetos Criados:

1. prevent_last_owner_downgrade() - ATUALIZADO
   ├─ Agora verifica contexto 'app.deleting_workspace'
   └─ Permite deletar durante cascata de workspace

2. set_workspace_cascade_delete_context() - NOVO
   └─ Define contexto antes de deletar workspace

3. delete_workspace_safely(workspace_id) - NOVO (RPC)
   ├─ Define contexto
   ├─ Deleta workspace_members
   ├─ Deleta workspaces
   └─ Retorna JSON com sucesso/erro

4. Trigger set_workspace_cascade_delete_context_trigger - NOVO
   └─ Executa antes de DELETE em workspaces
```

## 🔒 Segurança

- ✅ RLS policies continuam bloqueando acesso não-autorizado
- ✅ SERVICE_ROLE_KEY ainda necessário
- ✅ Apenas Super Admins podem deletar (via RLS)
- ✅ Trigger `prevent_last_owner_downgrade` ainda ativo para edições manuais

## 📞 Dúvidas?

Veja a documentação completa em: `FIX_LAST_OWNER_DELETION_ERROR.md`
