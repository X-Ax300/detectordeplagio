import { useState } from 'react';
import { FileText, Sparkles, AlertCircle } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useUsageLimit } from '../../contexts/UsageLimitContext';
import { UsageBanner } from '../UsageBanner';

type SummaryLength = 'short' | 'medium' | 'long';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export function TextSummarizer() {
  const { user } = useAuth();
  const { limits, canUseFeature, useFeature, isUnlimited } = useUsageLimit();
  const [text, setText] = useState('');
  const [summaryLength, setSummaryLength] = useState<SummaryLength>('medium');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function summarizeWithGroq(textContent: string, length: SummaryLength): Promise<string> {
    if (!GROQ_API_KEY) {
      throw new Error('Groq API key is not configured. Add VITE_GROQ_API_KEY to .env');
    }

    const lengthInstructions = {
      short: 'Generate a very brief summary (2-3 sentences, maximum 100 words)',
      medium: 'Generate a balanced summary (4-6 sentences, maximum 250 words)',
      long: 'Generate a detailed summary (7-10 sentences, maximum 400 words)',
    };

    const prompt = `You are an expert text summarizer. Summarize the following text concisely and accurately.

${lengthInstructions[length]}

Text to summarize:
"${textContent}"

Provide only the summary, no additional commentary or explanations.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.5,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Groq API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const summaryText = data.choices[0].message.content.trim();

    return summaryText;
  }

  async function handleSummarize() {
    if (!text.trim()) return;

    if (!canUseFeature('textSummary')) {
      setError('Daily limit reached. Sign in for more summaries or upgrade to Premium for unlimited access.');
      return;
    }

    if (!GROQ_API_KEY) {
      setError('Groq API key is not configured. Please add VITE_GROQ_API_KEY to your .env file');
      return;
    }

    setLoading(true);
    setError('');
    setSummary('');

    try {
      const generatedSummary = await summarizeWithGroq(text, summaryLength);

      const analysisResult = {
        summary: generatedSummary,
        originalLength: text.length,
        summaryLength: generatedSummary.length,
        compressionRatio: ((1 - generatedSummary.length / text.length) * 100).toFixed(1),
        level: summaryLength,
        analyzedAt: new Date().toISOString(),
      };

      if (user) {
        await addDoc(collection(db, 'analyses'), {
          user_id: user.uid,
          type: 'text_summary',
          input_content: text,
          result: analysisResult,
          status: 'completed',
          created_at: new Date().toISOString(),
        });
      }

      useFeature('textSummary');
      setSummary(generatedSummary);
    } catch (err: any) {
      setError(err.message || 'Failed to generate summary');
      console.error('Summary error:', err);
    } finally {
      setLoading(false);
    }
  }

  const lengthOptions = [
    { value: 'short' as SummaryLength, label: 'Short', description: 'Quick overview' },
    { value: 'medium' as SummaryLength, label: 'Medium', description: 'Balanced summary' },
    { value: 'long' as SummaryLength, label: 'Long', description: 'Detailed summary' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-3 rounded-xl">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Text Summarizer</h2>
            <p className="text-gray-600 text-sm">Generate AI-powered summaries</p>
          </div>
        </div>
        {!isUnlimited && (
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {limits.textSummary} summaries left
            </p>
            <p className="text-xs text-gray-600">Resets daily</p>
          </div>
        )}
      </div>

      <UsageBanner feature="textSummary" guestLimit={5} freeLimit={15} />

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Text to summarize
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            placeholder="Paste your article, essay, or notes here..."
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">{text.length} characters</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Summary length
          </label>
          <div className="grid grid-cols-3 gap-3">
            {lengthOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSummaryLength(option.value)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  summaryLength === option.value
                    ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50'
                    : 'border-gray-200 hover:border-orange-300'
                }`}
                disabled={loading}
              >
                <div className="font-semibold text-gray-900 mb-1">{option.label}</div>
                <div className="text-xs text-gray-600">{option.description}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSummarize}
          disabled={loading || !text.trim()}
          className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-orange-700 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Generating with Groq...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Summary
            </>
          )}
        </button>
      </div>

      {summary && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Summary Result</h3>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-6">
            <p className="text-gray-800 leading-relaxed mb-4">{summary}</p>
            <div className="flex gap-4 text-sm text-gray-600 pt-4 border-t border-orange-200 flex-wrap">
              <span>📄 Original: <strong>{text.length}</strong> characters</span>
              <span>✂️ Summary: <strong>{summary.length}</strong> characters</span>
              <span>📊 Compression: <strong>{((1 - summary.length / text.length) * 100).toFixed(1)}%</strong></span>
              <span>📌 Level: <strong>{summaryLength.charAt(0).toUpperCase() + summaryLength.slice(1)}</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
