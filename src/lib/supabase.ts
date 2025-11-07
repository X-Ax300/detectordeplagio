import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  display_name: string;
  has_subscription: boolean;
  subscription_expires_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Analysis = {
  id: string;
  user_id: string;
  type: 'text_plagiarism' | 'code_plagiarism' | 'audio_transcription' | 'text_summary';
  input_content: string;
  result: any;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
};

export type Report = {
  id: string;
  analysis_id: string;
  user_id: string;
  report_data: any;
  created_at: string;
};
