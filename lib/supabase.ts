
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mupcespepmbpvdjncjhv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_t3kW3Zqh2VGZTzdAohtcpw_S2-hn_3m';

/**
 * ==============================================================================
 * SOLUÇÃO DEFINITIVA PARA ERRO DE DELEÇÃO (Rodar no SQL Editor do Supabase)
 * ==============================================================================
 * 
 * Como seu app não usa autenticação nativa do Supabase (signIn), o banco vê 
 * o usuário como "Anônimo". A maneira mais fácil de resolver é desativar o RLS 
 * para a tabela de escalas.
 * 
 * 1. DESATIVAR TRAVA DE SEGURANÇA (Opção Recomendada para este caso):
 * -----------------------------------------------------------------------
 * ALTER TABLE schedules DISABLE ROW LEVEL SECURITY;
 * 
 * (Execute a linha acima e tente deletar no app novamente. Deve funcionar na hora).
 * 
 * 
 * 2. COMANDOS PARA DELEÇÃO MANUAL (SQL Direto):
 * -----------------------------------------------------------------------
 * -- Caso o botão ainda não funcione, use estes comandos aqui no editor:
 * 
 * -- DELETAR TUDO (Limpa a tabela schedules inteira):
 * DELETE FROM schedules;
 * 
 * -- DELETAR UMA DATA ESPECÍFICA (Ex: 24 de Dezembro de 2024):
 * DELETE FROM schedules 
 * WHERE date::text LIKE '2024-12-24%';
 * 
 * -- DELETAR PELO ID (Copie o ID do console do navegador se precisar):
 * DELETE FROM schedules WHERE id = 'uuid-do-item-aqui';
 * 
 * ==============================================================================
 */

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
