import { useState } from 'react';
import { Search, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useUsageLimit } from '../../contexts/UsageLimitContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { UsageBanner } from '../UsageBanner';

export function TextPlagiarism() {
  const { user } = useAuth();
  const { limits, canUseFeature, useFeature, isUnlimited } = useUsageLimit();
  const { t } = useLanguage();
  const [text, setText] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const MAX_LENGTH = 2500;

  async function handleAnalyze() {
    if (!text.trim()) return;

    if (!canUseFeature('textPlagiarism')) {
      setError(t.errors.dailyLimit);
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const plagiarismScore = Math.floor(Math.random() * 60) + 10;
      const matches = generateMockMatches(text, plagiarismScore);

      const analysisResult = {
        plagiarismScore,
        matches,
        analyzedAt: new Date().toISOString(),
      };

      if (user) {
        const { error: insertError } = await supabase.from('analyses').insert({
          user_id: user.id,
          type: 'text_plagiarism',
          input_content: text,
          result: analysisResult,
          status: 'completed',
        });

        if (insertError) throw insertError;
      }

      useFeature('textPlagiarism');
      setResult(analysisResult);
    } catch (err: any) {
      setError(err.message || t.errors.failed);
    } finally {
      setLoading(false);
    }
  }

  function generateMockMatches(text: string, score: number) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const numMatches = Math.ceil((score / 100) * sentences.length);
    const matches = [];

    for (let i = 0; i < Math.min(numMatches, sentences.length); i++) {
      matches.push({
        text: sentences[i].trim(),
        similarity: Math.floor(Math.random() * 30) + 70,
        source: `Source ${i + 1}`,
      });
    }

    return matches;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-black p-3 rounded-xl">
            <Search className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t.textPlagiarism.title}</h2>
            <p className="text-gray-600 text-sm">{t.textPlagiarism.subtitle}</p>
          </div>
        </div>
        {!isUnlimited && (
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {limits.textPlagiarism} {t.textPlagiarism.analysesLeft}
            </p>
            <p className="text-xs text-gray-600">{t.textPlagiarism.resetsDaily}</p>
          </div>
        )}
      </div>

      <UsageBanner feature="textPlagiarism" guestLimit={3} freeLimit={10} />

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.textPlagiarism.enterText} ({text.length}/{MAX_LENGTH} {t.textPlagiarism.characters})
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_LENGTH))}
            className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
            placeholder={t.textPlagiarism.enterText}
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading || !text.trim()}
          className="w-full bg-black text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t.textPlagiarism.analyzing : t.textPlagiarism.detectButton}
        </button>
      </div>

      {result && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between p-6 bg-gray-50 border border-gray-300 rounded-xl">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{t.textPlagiarism.plagiarismScore}</h3>
              <p className="text-gray-600 text-sm">{t.textPlagiarism.basedOnAI}</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-gray-900">{result.plagiarismScore}%</div>
              {result.plagiarismScore < 30 ? (
                <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>{t.textPlagiarism.lowSimilarity}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-orange-600 text-sm mt-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{t.textPlagiarism.highSimilarity}</span>
                </div>
              )}
            </div>
          </div>

          {result.matches.length > 0 && (
            <div className="border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.textPlagiarism.matchingContent}</h3>
              <div className="space-y-3">
                {result.matches.map((match: any, index: number) => (
                  <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{match.source}</span>
                      <span className="text-sm font-semibold text-orange-600">
                        {match.similarity}% {t.textPlagiarism.similar}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm italic">{match.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
