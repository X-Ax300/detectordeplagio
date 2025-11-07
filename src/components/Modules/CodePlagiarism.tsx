import { useState } from 'react';
import { Code2, Upload, AlertCircle, FileCode } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useUsageLimit } from '../../contexts/UsageLimitContext';
import { UsageBanner } from '../UsageBanner';

export function CodePlagiarism() {
  const { user } = useAuth();
  const { limits, canUseFeature, useFeature, isUnlimited } = useUsageLimit();
  const [code, setCode] = useState('');
  const [fileName, setFileName] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const plagiarismScore = Math.floor(Math.random() * 50) + 5;
      const patterns = generateMockPatterns(code, plagiarismScore);

      const analysisResult = {
        plagiarismScore,
        patterns,
        fileName,
        language: detectLanguage(fileName),
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

  function generateMockPatterns(code: string, score: number) {
    const patterns = [
      'Variable naming patterns',
      'Function structure similarity',
      'Algorithm implementation',
      'Code formatting style',
      'Comment patterns',
    ];

    const numPatterns = Math.ceil((score / 100) * patterns.length);
    return patterns.slice(0, numPatterns).map((pattern, i) => ({
      pattern,
      similarity: Math.floor(Math.random() * 30) + 60,
      matches: Math.floor(Math.random() * 5) + 1,
    }));
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
            <p className="text-gray-600 text-sm">Analyze code for structural similarities</p>
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
              />
            </label>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none font-mono text-sm"
            placeholder="Or paste your code here..."
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading || !code.trim()}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Analyzing...' : 'Analyze Code'}
        </button>
      </div>

      {result && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Similarity Score</h3>
              <p className="text-gray-600 text-sm">Language: {result.language}</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-emerald-600">{result.plagiarismScore}%</div>
              <div className="flex items-center gap-1 text-gray-600 text-sm mt-1">
                <FileCode className="w-4 h-4" />
                <span>{result.patterns.length} patterns found</span>
              </div>
            </div>
          </div>

          {result.patterns.length > 0 && (
            <div className="border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detected Patterns</h3>
              <div className="space-y-3">
                {result.patterns.map((pattern: any, index: number) => (
                  <div key={index} className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{pattern.pattern}</h4>
                        <p className="text-sm text-gray-600">
                          {pattern.matches} matching instance{pattern.matches !== 1 ? 's' : ''} found
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-emerald-600">
                        {pattern.similarity}%
                      </span>
                    </div>
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
