import { useState } from 'react';
import { Search, AlertCircle, CheckCircle } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useUsageLimit } from '../../contexts/UsageLimitContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { UsageBanner } from '../UsageBanner';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export function TextPlagiarism() {
  const { user } = useAuth();
  const { limits, canUseFeature, useFeature, isUnlimited } = useUsageLimit();
  const { t } = useLanguage();
  const [text, setText] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const MAX_LENGTH = 2500;

  async function analyzeWithGroq(textContent: string): Promise<any> {
    if (!GROQ_API_KEY) {
      throw new Error('Groq API key is not configured. Add VITE_GROQ_API_KEY to .env');
    }

    const prompt = `You are a plagiarism detection expert. Analyze the following text for potential plagiarism indicators, copied content patterns, and potential sources of similar content.

Text to analyze:
"${textContent}"

Please provide a JSON response with the following structure:
{
  "plagiarismScore": <number between 0-100>,
  "overallAssessment": "<brief overall assessment>",
  "matches": [
    {
      "text": "<suspicious text segment>",
      "similarity": <0-100>,
      "source": "<potential source or type of content>",
      "reason": "<why this is suspicious>"
    }
  ],
  "patterns": [
    "<potential plagiarism pattern or indicator>"
  ],
  "recommendations": [
    "<recommendation 1>",
    "<recommendation 2>"
  ]
}

Focus on:
1. Unusual writing style shifts
2. Out-of-place technical jargon
3. Verbatim passages or near-verbatim passages
4. Paraphrasing patterns
5. Citation gaps where needed
6. Structural inconsistencies

Be thorough but realistic - a score of 0% means original content, 100% means completely copied.`;

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
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Groq API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const responseText = data.choices[0].message.content;

    // Extraer JSON de la respuesta
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse Groq response');
    }

    const analysisResult = JSON.parse(jsonMatch[0]);
    return analysisResult;
  }

  async function handleAnalyze() {
    if (!text.trim()) return;

    if (!canUseFeature('textPlagiarism')) {
      setError(t.errors.dailyLimit);
      return;
    }

    if (!GROQ_API_KEY) {
      setError('Groq API key is not configured. Please add VITE_GROQ_API_KEY to your .env file');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const analysisData = await analyzeWithGroq(text);

      const analysisResult = {
        plagiarismScore: analysisData.plagiarismScore,
        overallAssessment: analysisData.overallAssessment,
        matches: analysisData.matches || [],
        patterns: analysisData.patterns || [],
        recommendations: analysisData.recommendations || [],
        analyzedAt: new Date().toISOString(),
        textLength: text.length,
      };

      if (user) {
        await addDoc(collection(db, 'analyses'), {
          user_id: user.uid,
          type: 'text_plagiarism',
          input_content: text,
          result: analysisResult,
          status: 'completed',
          created_at: new Date().toISOString(),
        });
      }

      useFeature('textPlagiarism');
      setResult(analysisResult);
    } catch (err: any) {
      setError(err.message || t.errors.failed);
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  }

  function getScoreColor(score: number): string {
    if (score < 20) return 'text-green-600';
    if (score < 50) return 'text-yellow-600';
    if (score < 80) return 'text-orange-600';
    return 'text-red-600';
  }

  function getScoreBgColor(score: number): string {
    if (score < 20) return 'from-green-50 to-emerald-50 border-green-200';
    if (score < 50) return 'from-yellow-50 to-amber-50 border-yellow-200';
    if (score < 80) return 'from-orange-50 to-red-50 border-orange-200';
    return 'from-red-50 to-pink-50 border-red-200';
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
            disabled={loading}
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading || !text.trim()}
          className="w-full bg-black text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Analyzing with Groq...
            </div>
          ) : (
            t.textPlagiarism.detectButton
          )}
        </button>
      </div>

      {result && (
        <div className="mt-8 space-y-4">
          <div className={`flex items-center justify-between p-6 bg-gradient-to-br ${getScoreBgColor(result.plagiarismScore)} rounded-xl border`}>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{t.textPlagiarism.plagiarismScore}</h3>
              <p className="text-gray-600 text-sm">{result.overallAssessment}</p>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${getScoreColor(result.plagiarismScore)}`}>
                {result.plagiarismScore}%
              </div>
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

          {result.overallAssessment && (
            <div className="border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Analysis</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{result.overallAssessment}</p>
            </div>
          )}

          {result.matches && result.matches.length > 0 && (
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
                    <p className="text-gray-700 text-sm italic mb-2">"{match.text}"</p>
                    <p className="text-gray-600 text-xs">{match.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.patterns && result.patterns.length > 0 && (
            <div className="border border-blue-200 rounded-xl p-6 bg-blue-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Detected Patterns</h3>
              <ul className="space-y-2">
                {result.patterns.map((pattern: string, index: number) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs mt-0.5">
                      {index + 1}
                    </span>
                    <span>{pattern}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.recommendations && result.recommendations.length > 0 && (
            <div className="border border-purple-200 rounded-xl p-6 bg-purple-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h3>
              <ul className="space-y-2">
                {result.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs mt-0.5">
                      ✓
                    </span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
