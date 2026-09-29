// Supabase Dashboard > Project Settings > API 에서 확인하세요.
// 절대로 service_role key를 넣지 마세요.
const SUPABASE_URL = "https://gliucdeawhbkpobbgavj.supabase.co/rest/v1/";
const SUPABASE_ANON_KEY = "sb_publishable_d6ghSQAyYurVKwS5gdhbJw_6az6rC4k";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
