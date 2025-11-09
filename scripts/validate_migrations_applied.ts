import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

interface ValidationResult {
  name: string;
  status: "✅" | "❌";
  message: string;
}

const results: ValidationResult[] = [];
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function validateMigrationFile(
  filename: string,
  shouldContain: string[],
  label: string
): void {
  try {
    const filepath = path.join(
      __dirname,
      "..",
      "supabase",
      "migrations",
      filename
    );

    if (!fs.existsSync(filepath)) {
      results.push({
        name: label,
        status: "❌",
        message: `Arquivo de migration não encontrado: ${filename}`,
      });
      return;
    }

    const content = fs.readFileSync(filepath, "utf-8");
    const allFound = shouldContain.every((str) => content.includes(str));

    if (allFound) {
      results.push({
        name: label,
        status: "✅",
        message: "Migration validada com sucesso",
      });
    } else {
      const missing = shouldContain.filter((str) => !content.includes(str));
      results.push({
        name: label,
        status: "❌",
        message: `Conteúdo ausente: ${missing.join(", ")}`,
      });
    }
  } catch (e) {
    results.push({
      name: label,
      status: "❌",
      message: `Erro ao validar: ${String(e)}`,
    });
  }
}

async function main(): Promise<void> {
  console.log(
    "\n╔════════════════════════════════════════════════════════════════╗"
  );
  console.log("║  VALIDAÇÃO DE MIGRATIONS - SmartHubDash                        ║");
  console.log(
    "╚════════════════════════════════════════════════════════════════╝\n"
  );

  // Validar Migration 01
  validateMigrationFile("20251023232715_c5ab5bcc-960f-438b-84e5-19a83c903d29.sql", [
    "CREATE TABLE IF NOT EXISTS public.profiles",
    "CREATE TABLE IF NOT EXISTS public.clients",
    "CREATE TABLE IF NOT EXISTS public.contracts",
    "CREATE TABLE IF NOT EXISTS public.user_roles",
    "ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY",
  ], "Migration 01 - Schema Inicial");

  // Validar Migration 02
  validateMigrationFile(
    "20251024003233_18f17aaf-cc46-4e28-a6e8-f0b6005d8085.sql",
    [
      "CREATE OR REPLACE FUNCTION",
      "assign_first_user_as_admin",
      "CREATE TRIGGER",
    ],
    "Migration 02 - Primeiro Usuário Admin"
  );

  // Validar Migration 03 (com sintaxe corrigida)
  validateMigrationFile(
    "20251024030651_09eccf51-d8ec-4b51-85a4-4c746b3c2d8a.sql",
    [
      "client_id uuid REFERENCES public.clients",
      "CREATE OR REPLACE FUNCTION public.get_user_client_id",
      "CREATE OR REPLACE FUNCTION public.is_platform_admin",
      "Multi-tenant: SELECT clients",
      "Multi-tenant: INSERT clients",
    ],
    "Migration 03 - Multi-tenant RLS"
  );

  // Validar Migration 06
  validateMigrationFile(
    "20251106000006_fix_workspace_members_rls_recursion.sql",
    [
      "CREATE OR REPLACE FUNCTION public.user_is_workspace_member",
      "CREATE OR REPLACE FUNCTION public.user_can_manage_workspace",
      "CREATE POLICY",
      "SECURITY DEFINER",
    ],
    "Migration 06 - Fix RLS Recursion"
  );

  console.log(
    "\n╔════════════════════════════════════════════════════════════════╗"
  );
  console.log("║  RESULTADOS                                                    ║");
  console.log(
    "╚════════════════════════════════════════════════════════════════╝\n"
  );

  results.forEach((result) => {
    console.log(`${result.status} ${result.name}`);
    console.log(`   └─ ${result.message}\n`);
  });

  const allPassed = results.every((r) => r.status === "✅");

  if (allPassed) {
    console.log("✅ Todas as migrations estão com a estrutura correta!");
    console.log("\n📝 Próximo passo: Aguardar aplicação via 'supabase db push --linked'");
  } else {
    console.log("❌ Algumas migrations têm problemas de estrutura.");
    console.log("   Revise os arquivos indicados acima.");
  }

  process.exit(allPassed ? 0 : 1);
}

main().catch(console.error);