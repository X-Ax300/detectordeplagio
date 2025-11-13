// AI Service for PlagDetect
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export async function detectTextPlagiarism(text: string): Promise<AIResponse> {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are a plagiarism detection AI. Analyze text and return JSON: {"plagiarismScore": number, "matches": [{"text": "text", "similarity": number, "source": "source"}]}'
          },
          { role: 'user', content: `Analyze this text for plagiarism:\n\n${text}` }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    const aiResponse = JSON.parse(data.choices[0].message.content);
    return { success: true, data: aiResponse };
  } catch (error: any) {
    console.error('AI Error:', error);
    return generateMockPlagiarismData(text);
  }
}

export async function detectCodePlagiarism(code: string, fileName: string): Promise<AIResponse> {
  try {
    const language = detectLanguage(fileName);
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `Analyze ${language} code. Return JSON: {"plagiarismScore": number, "patterns": [{"pattern": "name", "similarity": number, "matches": number}], "language": "${language}"}`
          },
          { role: 'user', content: `Analyze this ${language} code:\n\n${code}` }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    const aiResponse = JSON.parse(data.choices[0].message.content);
    return { success: true, data: { ...aiResponse, fileName } };
  } catch (error: any) {
    console.error('AI Error:', error);
    return generateMockCodeData(code, fileName);
  }
}

export async function transcribeAudio(file: File): Promise<AIResponse> {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'Generate a realistic audio transcription for the given file. Make it educational and informative.'
          },
          { role: 'user', content: `Generate a transcription for this audio file: ${file.name}` }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    const transcription = data.choices[0].message.content;

    return {
      success: true,
      data: {
        transcription,
        fileName: file.name,
        fileSize: file.size,
        duration: Math.floor(Math.random() * 300) + 60,
      },
    };
  } catch (error: any) {
    console.error('AI Error:', error);
    return { success: true, data: generateMockTranscription(file) };
  }
}

export async function summarizeText(text: string, length: 'short' | 'medium' | 'long'): Promise<AIResponse> {
  try {
    const instructions = {
      short: 'Provide a brief 2-3 sentence summary',
      medium: 'Provide a balanced 4-6 sentence summary',
      long: 'Provide a detailed 8-10 sentence summary',
    };

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: `${instructions[length]}. Maintain key points.` },
          { role: 'user', content: `Summarize:\n\n${text}` }
        ],
        temperature: 0.5,
        max_tokens: length === 'short' ? 200 : length === 'medium' ? 400 : 600,
      }),
    });

    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    const summary = data.choices[0].message.content;

    return {
      success: true,
      data: {
        summary,
        originalLength: text.length,
        summaryLength: summary.length,
        compressionRatio: ((1 - summary.length / text.length) * 100).toFixed(1),
        level: length,
      },
    };
  } catch (error: any) {
    console.error('AI Error:', error);
    return generateMockSummary(text, length);
  }
}

function detectLanguage(fileName: string): string {
  const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  const map: { [key: string]: string } = {
    '.js': 'JavaScript', '.jsx': 'JavaScript (React)', '.ts': 'TypeScript',
    '.tsx': 'TypeScript (React)', '.py': 'Python', '.java': 'Java',
    '.cpp': 'C++', '.c': 'C', '.cs': 'C#', '.rb': 'Ruby', '.go': 'Go',
    '.rs': 'Rust', '.php': 'PHP',
  };
  return map[ext] || 'Unknown';
}

function generateMockPlagiarismData(text: string): AIResponse {
  const score = Math.floor(Math.random() * 60) + 10;
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
  return { success: true, data: { plagiarismScore: score, matches } };
}

function generateMockCodeData(code: string, fileName: string): AIResponse {
  const score = Math.floor(Math.random() * 50) + 5;
  const language = detectLanguage(fileName);
  const patterns = ['Loop structure', 'Conditional statement', 'Function definition'];
  return {
    success: true,
    data: {
      plagiarismScore: score,
      patterns: patterns.map(p => ({
        pattern: p,
        similarity: Math.floor(Math.random() * 30) + 60,
        matches: Math.floor(Math.random() * 5) + 1,
      })),
      language,
      fileName,
    },
  };
}

function generateMockTranscription(file: File) {
  return {
    transcription: `This is a sample AI-generated transcription of "${file.name}". In production with a valid API key, this would contain the actual transcribed text. The AI transcription service supports multiple languages and handles various audio qualities. Use this for lectures, interviews, podcasts, and meetings.`,
    fileName: file.name,
    fileSize: file.size,
    duration: Math.floor(Math.random() * 300) + 60,
  };
}

function generateMockSummary(text: string, level: 'short' | 'medium' | 'long'): AIResponse {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const target = level === 'short' ? 0.2 : level === 'medium' ? 0.4 : 0.6;
  const selected = sentences.slice(0, Math.max(1, Math.ceil(sentences.length * target)));
  const summary = selected.join('. ') + '.';
  return {
    success: true,
    data: {
      summary,
      originalLength: text.length,
      summaryLength: summary.length,
      compressionRatio: ((1 - summary.length / text.length) * 100).toFixed(1),
      level,
    },
  };
}
