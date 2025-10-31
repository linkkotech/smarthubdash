# PLANO DE AÇÃO - BUG: TypeError - teamMembers is undefined

## PROBLEMA
- Erro: `Uncaught TypeError: can't access property "map", teamMembers is undefined`
- Causa: `useQuery` retorna `data: undefined` durante carregamento
- Impacto: `<DataTable />` tenta fazer `.map()` em `undefined` → CRASH

---

## SOLUÇÃO: 2 ETAPAS

### ETAPA 1: Revisar Lógica de Carregamento
**Arquivo:** `src/pages/client/Equipe.tsx`

**O que fazer:**
1. Localizar o `useQuery` que busca team members (aprox. linhas 95-110)
2. Verificar se há estados:
   - `isLoadingTeam` (ou `isLoading`)
   - `isErrorTeam` (ou `isError`)
   - `error`
3. Localizar o bloco de renderização condicional (aprox. linhas 115-130)
4. **Validação:** Deve haver um `if (isLoadingProfile || isLoadingTeam) { return <Skeleton /> }`

**Código esperado:**
```tsx
// ESTADO DE CARREGAMENTO
if (isLoadingProfile || isLoadingTeam) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

// ESTADO DE ERRO
if (isErrorProfile || isErrorTeam) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-destructive">
          {errorProfile?.message || errorTeam?.message || "Erro ao buscar dados"}
        </div>
      </CardContent>
    </Card>
  );
}
```

**Por quê:** Garante que `<DataTable />` NUNCA recebe `undefined` durante carregamento/erro

---

### ETAPA 2: Prover Fallback Seguro no JSX
**Arquivo:** `src/pages/client/Equipe.tsx`

**O que fazer:**
1. Localizar a linha onde `<DataTable />` é renderizada (aprox. linhas 155-160)
2. **Ação:** Mudar `data={teamMembers}` para `data={teamMembers || []}`

**Código esperado:**

ANTES:
```tsx
<DataTable columns={columns} data={teamMembers} searchKey="email" />
```

DEPOIS:
```tsx
<DataTable columns={columns} data={teamMembers || []} searchKey="email" />
```

**Por quê:** Se por algum motivo `teamMembers` for `undefined`, passamos `[]` (array vazio e seguro)

---

## RESUMO EXECUTIVO

| Etapa | Arquivo | Verificação | Mudança |
|-------|---------|-------------|---------|
| 1 | Equipe.tsx | Linha ~115-130 | ✅ Verificar if(isLoading) existe |
| 2 | Equipe.tsx | Linha ~157 | ✅ Mudar `data={teamMembers}` → `data={teamMembers \|\| []}` |

---

## FLUXO DE RENDERIZAÇÃO CORRETO

```
1. useQuery em execução?
   ├─ SIM: isLoadingTeam = true
   │   └─ Renderiza <Skeleton />
   │   └─ NUNCA tenta renderizar <DataTable />
   └─ NÃO: Continua

2. Houve erro na query?
   ├─ SIM: isErrorTeam = true
   │   └─ Renderiza mensagem de erro
   │   └─ NUNCA tenta renderizar <DataTable />
   └─ NÃO: Continua

3. Renderiza <DataTable />
   └─ data={teamMembers || []}
   └─ Seguro contra undefined
   └─ Se vazio, mostra tabela vazia
   └─ Se com dados, renderiza linhas
```

---

## ESPERADO APÓS IMPLEMENTAÇÃO

✅ Durante carregamento → Mostra Skeleton (sem crash)
✅ Se erro → Mostra mensagem de erro (sem crash)
✅ Se sucesso com dados → DataTable renderiza linhas
✅ Se sucesso vazio → DataTable renderiza vazio (sem crash)
✅ Console → SEM erros de undefined

---

## PRÓXIMO PASSO

Após aprovação deste plano, vou:
1. Implementar as 2 mudanças no arquivo Equipe.tsx
2. Compilar com `npm run build`
3. Validar que há 0 erros TypeScript
4. Pronto para teste

