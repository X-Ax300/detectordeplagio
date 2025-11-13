import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

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
