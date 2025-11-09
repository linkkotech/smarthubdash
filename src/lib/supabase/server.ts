/**
 * @fileoverview Supabase Client para Operações Administrativas
 * 
 * Cliente Supabase configurado para executar operações administrativas.
 * Como este é um projeto Vite/React (não Next.js), usamos o cliente
 * Supabase padrão com a chave de serviço via variável de ambiente.
 * 
 * ⚠️ IMPORTANTE: SERVICE_ROLE_KEY deve ser mantido SEGURO no backend.
 * Em um ambiente de produção real, isso deveria estar em um servidor Node.js
 * separado, não exposto ao cliente.
 * 
 * Para esta aplicação Admin, é aceitável pois:
 * - Apenas Super Admins têm acesso
 * - RLS policies também protegem
 */

import { createClient } from "@supabase/supabase-js";

// Usar variáveis de ambiente do Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error("Missing VITE_SUPABASE_URL environment variable");
}

if (!supabaseServiceKey) {
  console.error("Missing VITE_SUPABASE_SERVICE_ROLE_KEY environment variable");
}

/**
 * Cliente Supabase com SERVICE_ROLE_KEY
 * 
 * Este cliente contorna RLS e possui acesso administrativo total.
 * Use apenas para operações que requerem privilégios elevados.
 * 
 * ⚠️ Certifique-se de que VITE_SUPABASE_SERVICE_ROLE_KEY está definido
 * em seu arquivo .env.local (não commitar no git!)
 */
export const supabaseServer = createClient(
  supabaseUrl || "",
  supabaseServiceKey || "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export default supabaseServer;
