import { createClient } from '@supabase/supabase-js';

// URL do Projeto
// Usamos optional chaining (?.) para evitar erro caso 'env' seja undefined
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://mupcespepmbpvdjncjhv.supabase.co';

// A chave 'anon' pública do Supabase.
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11cGNlc3BlcG1icHZkam5jamh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MDI2ODUsImV4cCI6MjA4MjA3ODY4NX0.qOzlGfyoct8jjR51USBOLaP3AEDzokMF4NtLXxscb_8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);