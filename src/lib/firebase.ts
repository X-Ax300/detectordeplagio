import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBqyYIYQSPeX51JKznltMVlWnnNNgSArHs",
  authDomain: "plagdetect-b5e56.firebaseapp.com",
  projectId: "plagdetect-b5e56",
  storageBucket: "plagdetect-b5e56.firebasestorage.app",
  messagingSenderId: "857773321077",
  appId: "1:857773321077:web:11f336d5667bb8d76f413c",
  measurementId: "G-JNGWKBFDDV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

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
