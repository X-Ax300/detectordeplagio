/*
  # PlagDetect Database Schema

  ## Overview
  This migration creates the complete database structure for PlagDetect, an AI-powered 
  plagiarism detection and content analysis platform.

  ## 1. New Tables

  ### `profiles`
  Stores user profile information and subscription status
  - `id` (uuid, primary key) - References auth.users
  - `email` (text) - User email address
  - `display_name` (text) - User's display name
  - `has_subscription` (boolean) - Whether user has active subscription
  - `subscription_expires_at` (timestamptz) - When subscription expires
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last profile update

  ### `analyses`
  Stores all analysis records (text, code, audio, summary)
  - `id` (uuid, primary key) - Unique analysis identifier
  - `user_id` (uuid, foreign key) - References profiles
  - `type` (text) - Analysis type: 'text_plagiarism', 'code_plagiarism', 'audio_transcription', 'text_summary'
  - `input_content` (text) - Original content submitted
  - `result` (jsonb) - Analysis results in JSON format
  - `status` (text) - Status: 'pending', 'completed', 'failed'
  - `created_at` (timestamptz) - When analysis was created

  ### `reports`
  Stores generated reports from analyses
  - `id` (uuid, primary key) - Unique report identifier
  - `analysis_id` (uuid, foreign key) - References analyses
  - `user_id` (uuid, foreign key) - References profiles
  - `report_data` (jsonb) - Report content in JSON format
  - `created_at` (timestamptz) - When report was generated

  ## 2. Security
  - Enable RLS on all tables
  - Users can only access their own data
  - Authenticated users required for all operations
  - Secure read/write policies for each table

  ## 3. Important Notes
  - All timestamps use timestamptz for timezone awareness
  - JSONB used for flexible result storage
  - Cascading deletes maintain referential integrity
  - Indexes added for performance on frequently queried columns
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  display_name text DEFAULT '',
  has_subscription boolean DEFAULT false,
  subscription_expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create analyses table
CREATE TABLE IF NOT EXISTS analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('text_plagiarism', 'code_plagiarism', 'audio_transcription', 'text_summary')),
  input_content text NOT NULL,
  result jsonb,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at timestamptz DEFAULT now()
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  report_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_type ON analyses(type);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_analysis_id ON reports(analysis_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Analyses policies
CREATE POLICY "Users can view own analyses"
  ON analyses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own analyses"
  ON analyses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses"
  ON analyses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses"
  ON analyses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Reports policies
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports"
  ON reports FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();