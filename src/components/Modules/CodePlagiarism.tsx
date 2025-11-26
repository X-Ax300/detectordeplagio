import { useState } from 'react';
import { Code2, Upload, AlertCircle, FileCode } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useUsageLimit } from '../../contexts/UsageLimitContext';
import { UsageBanner } from '../UsageBanner';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export function CodePlagiarism() {
  const { user } = useAuth();
  const { limits, canUseFeature, useFeature, isUnlimited } = useUsageLimit();
  const [code, setCode] = useState('');
  const [fileName, setFileName] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function analyzeCodeWithGroq(codeContent: string, language: string): Promise<any> {
    if (!GROQ_API_KEY) {
      throw new Error('Groq API key is not configured. Add VITE_GROQ_API_KEY to .env');
    }

    const prompt = `You are a code plagiarism detection expert. Analyze the following ${language} code for potential plagiarism indicators and structural patterns that might indicate copied code.

Code to analyze:
\`\`\`
${codeContent}
\`\`\`

Please provide a JSON response with the following structure:
{
  "plagiarismScore": <number between 0-100>,
  "patterns": [
    {
      "pattern": "<pattern name>",
      "similarity": <0-100>,
      "matches": <number>,
      "description": "<brief description>"
    }
  ],
  "analysis": "<detailed analysis>",
  "recommendations": ["<recommendation 1>", "<recommendation 2>"]
}

Focus on:
1. Variable naming patterns (camelCase, snake_case, etc.)
2. Function structure and algorithm implementation
3. Comment and documentation style
4. Code formatting and indentation
5. Common library usage patterns
6. Error handling patterns`;

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
        max_tokens: 1024,
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

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExtensions = ['.py', '.js', '.java', '.cpp', '.c', '.ts', '.jsx', '.tsx'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!allowedExtensions.includes(fileExt)) {
      setError('Invalid file type. Please upload a code file (.py, .js, .java, etc.)');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setCode(event.target?.result as string);
    };
    reader.readAsText(file);
  }

  async function handleAnalyze() {
    if (!code.trim()) return;

    if (!canUseFeature('codePlagiarism')) {
      setError('Daily limit reached. Sign in for more analyses or upgrade to Premium for unlimited access.');
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
      const language = detectLanguage(fileName);
      const analysisData = await analyzeCodeWithGroq(code, language);

      const analysisResult = {
        plagiarismScore: analysisData.plagiarismScore,
        patterns: analysisData.patterns,
        analysis: analysisData.analysis,
        recommendations: analysisData.recommendations,
        fileName,
        language,
        codeLength: code.length,
        analyzedAt: new Date().toISOString(),
      };

      if (user) {
        await addDoc(collection(db, 'analyses'), {
          user_id: user.uid,
          type: 'code_plagiarism',
          input_content: code,
          result: analysisResult,
          status: 'completed',
          created_at: new Date().toISOString(),
        });
      }

      useFeature('codePlagiarism');
      setResult(analysisResult);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze code');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  }

  function detectLanguage(filename: string): string {
    const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
    const langMap: Record<string, string> = {
      '.py': 'Python',
      '.js': 'JavaScript',
      '.ts': 'TypeScript',
      '.java': 'Java',
      '.cpp': 'C++',
      '.c': 'C',
      '.jsx': 'React JSX',
      '.tsx': 'React TSX',
    };
    return langMap[ext] || 'Unknown';
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
          <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-3 rounded-xl">
            <Code2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Code Plagiarism Detection</h2>
            <p className="text-gray-600 text-sm">Analyze code for structural similarities using AI</p>
          </div>
        </div>
        {!isUnlimited && (
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {limits.codePlagiarism} analyses left
            </p>
            <p className="text-xs text-gray-600">Resets daily</p>
          </div>
        )}
      </div>

      <UsageBanner feature="codePlagiarism" guestLimit={2} freeLimit={5} />

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload code file or paste code
          </label>
          <div className="flex gap-3 mb-3">
            <label className="flex-1 cursor-pointer">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-emerald-500 transition-all text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <span className="text-sm text-gray-600">
                  {fileName || 'Click to upload code file'}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  Supports .py, .js, .java, .cpp, .ts, etc.
                </p>
              </div>
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept=".py,.js,.java,.cpp,.c,.ts,.jsx,.tsx"
                disabled={loading}
              />
            </label>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none font-mono text-sm"
            placeholder="Or paste your code here..."
            disabled={loading}
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading || !code.trim()}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Analyzing with Groq AI...
            </div>
          ) : (
            'Analyze Code'
          )}
        </button>
      </div>

      {result && (
        <div className="mt-8 space-y-4">
          <div className={`flex items-center justify-between p-6 bg-gradient-to-br ${getScoreBgColor(result.plagiarismScore)} rounded-xl border`}>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Plagiarism Score</h3>
              <p className="text-gray-600 text-sm">Language: {result.language} | Size: {result.codeLength} bytes</p>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${getScoreColor(result.plagiarismScore)}`}>
                {result.plagiarismScore}%
              </div>
              <div className="flex items-center gap-1 text-gray-600 text-sm mt-1">
                <FileCode className="w-4 h-4" />
                <span>{result.patterns.length} patterns found</span>
              </div>
            </div>
          </div>

          {result.analysis && (
            <div className="border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Analysis</h3>
              <p className="text-gray-700 leading-relaxed text-sm">{result.analysis}</p>
            </div>
          )}

          {result.patterns.length > 0 && (
            <div className="border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detected Patterns</h3>
              <div className="space-y-3">
                {result.patterns.map((pattern: any, index: number) => (
                  <div key={index} className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{pattern.pattern}</h4>
                      <span className="text-sm font-semibold text-emerald-600">
                        {pattern.similarity}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{pattern.description}</p>
                    <p className="text-xs text-gray-500">
                      {pattern.matches} matching instance{pattern.matches !== 1 ? 's' : ''} found
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.recommendations && result.recommendations.length > 0 && (
            <div className="border border-blue-200 rounded-xl p-6 bg-blue-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h3>
              <ul className="space-y-2">
                {result.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs mt-0.5">
                      {index + 1}
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
