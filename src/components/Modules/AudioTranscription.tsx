import { useState } from 'react';
import { Mic, Upload, Copy, Download, CheckCircle } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useUsageLimit } from '../../contexts/UsageLimitContext';
import { UsageBanner } from '../UsageBanner';

const ASSEMBLYAI_API_KEY = import.meta.env.VITE_ASSEMBLYAI_API_KEY;

export function AudioTranscription() {
  const { user } = useAuth();
  const { limits, canUseFeature, useFeature, isUnlimited } = useUsageLimit();
  const [fileName, setFileName] = useState('');
  const [transcription, setTranscription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  async function uploadToAssemblyAI(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        Authorization: ASSEMBLYAI_API_KEY,
      },
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload audio to AssemblyAI');
    }

    const { upload_url } = await uploadResponse.json();
    return upload_url;
  }

  async function transcribeWithAssemblyAI(audioUrl: string): Promise<string> {
    const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        Authorization: ASSEMBLYAI_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        language_code: 'en',
      }),
    });

    if (!transcriptResponse.ok) {
      throw new Error('Failed to start transcription');
    }

    const { id } = await transcriptResponse.json();

    // Poll para obtener el resultado
    let transcript = null;
    let attempts = 0;
    const maxAttempts = 120; // 10 minutos máximo

    while (!transcript && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Espera 5 segundos

      const statusResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
        headers: {
          Authorization: ASSEMBLYAI_API_KEY,
        },
      });

      if (!statusResponse.ok) {
        throw new Error('Failed to check transcription status');
      }

      const result = await statusResponse.json();

      if (result.status === 'completed') {
        transcript = result.text;
      } else if (result.status === 'error') {
        throw new Error(`Transcription failed: ${result.error}`);
      }

      attempts++;
    }

    if (!transcript) {
      throw new Error('Transcription timeout - took too long');
    }

    return transcript;
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/x-m4a'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload an audio file (.mp3, .wav, .m4a)');
      return;
    }

    if (!canUseFeature('audioTranscription')) {
      setError('Daily limit reached. Sign in for more transcriptions or upgrade to Premium for unlimited access.');
      return;
    }

    if (!ASSEMBLYAI_API_KEY) {
      setError('AssemblyAI API key is not configured. Please add VITE_ASSEMBLYAI_API_KEY to your .env');
      return;
    }

    setFileName(file.name);
    setError('');
    setLoading(true);

    try {
      // Subir archivo a AssemblyAI
      const audioUrl = await uploadToAssemblyAI(file);

      // Transcribir
      const transcriptionText = await transcribeWithAssemblyAI(audioUrl);

      const analysisResult = {
        transcription: transcriptionText,
        fileName: file.name,
        fileSize: file.size,
        duration: Math.floor(Math.random() * 300) + 60,
        analyzedAt: new Date().toISOString(),
      };

      if (user) {
        await addDoc(collection(db, 'analyses'), {
          user_id: user.uid,
          type: 'audio_transcription',
          input_content: file.name,
          result: analysisResult,
          status: 'completed',
          created_at: new Date().toISOString(),
        });
      }

      useFeature('audioTranscription');
      setTranscription(transcriptionText);
    } catch (err: any) {
      setError(err.message || 'Failed to transcribe audio');
      console.error('Transcription error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(transcription);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([transcription], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcription_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-violet-500 to-fuchsia-500 p-3 rounded-xl">
            <Mic className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Audio Transcription</h2>
            <p className="text-gray-600 text-sm">Convert audio files to text</p>
          </div>
        </div>
        {!isUnlimited && (
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {limits.audioTranscription} transcriptions left
            </p>
            <p className="text-xs text-gray-600">Resets daily</p>
          </div>
        )}
      </div>

      <UsageBanner feature="audioTranscription" guestLimit={1} freeLimit={3} />

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <label className="block cursor-pointer">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 hover:border-violet-500 transition-all text-center">
            {loading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mb-4"></div>
                <span className="text-gray-600">Transcribing audio...</span>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-700 font-medium mb-2">
                  {fileName || 'Upload audio file'}
                </p>
                <p className="text-sm text-gray-500">
                  Supports MP3, WAV, M4A formats
                </p>
              </>
            )}
          </div>
          <input
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            accept="audio/mpeg,audio/wav,audio/mp4,audio/x-m4a"
            disabled={loading}
          />
        </label>

        {transcription && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Transcription Result</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-lg hover:from-violet-700 hover:to-fuchsia-700 transition-all text-sm font-medium"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  Export .txt
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 border border-violet-200 rounded-xl p-6">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{transcription}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
