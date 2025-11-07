import { useState } from 'react';
import { FileText, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useUsageLimit } from '../../contexts/UsageLimitContext';
import { UsageBanner } from '../UsageBanner';

type SummaryLength = 'short' | 'medium' | 'long';

export function TextSummarizer() {
  const { user } = useAuth();
  const { limits, canUseFeature, useFeature, isUnlimited } = useUsageLimit();
  const [text, setText] = useState('');
  const [summaryLength, setSummaryLength] = useState<SummaryLength>('medium');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSummarize() {
    if (!text.trim()) return;

    if (!canUseFeature('textSummary')) {
      setError('Daily limit reached. Sign in for more summaries or upgrade to Premium for unlimited access.');
      return;
    }

    setLoading(true);
    setError('');
    setSummary('');

    try {
      const generatedSummary = generateMockSummary(text, summaryLength);

      const analysisResult = {
        summary: generatedSummary,
        originalLength: text.length,
        summaryLength: generatedSummary.length,
        compressionRatio: ((1 - generatedSummary.length / text.length) * 100).toFixed(1),
        level: summaryLength,
        analyzedAt: new Date().toISOString(),
      };

      if (user) {
        const { error: insertError } = await supabase.from('analyses').insert({
          user_id: user.id,
          type: 'text_summary',
          input_content: text,
          result: analysisResult,
          status: 'completed',
        });

        if (insertError) throw insertError;
      }

      useFeature('textSummary');
      setSummary(generatedSummary);
    } catch (err: any) {
      setError(err.message || 'Failed to generate summary');
    } finally {
      setLoading(false);
    }
  }

  function generateMockSummary(text: string, level: SummaryLength): string {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let targetSentences: number;

    switch (level) {
      case 'short':
        targetSentences = Math.ceil(sentences.length * 0.2);
        break;
      case 'medium':
        targetSentences = Math.ceil(sentences.length * 0.4);
        break;
      case 'long':
        targetSentences = Math.ceil(sentences.length * 0.6);
        break;
    }

    const selectedSentences = sentences.slice(0, Math.max(1, targetSentences));
    return selectedSentences.join('. ') + '.';
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
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
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
          />
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
            'Generating...'
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
            <div className="flex gap-4 text-sm text-gray-600 pt-4 border-t border-orange-200">
              <span>Original: {text.length} characters</span>
              <span>Summary: {summary.length} characters</span>
              <span>Compression: {((1 - summary.length / text.length) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
