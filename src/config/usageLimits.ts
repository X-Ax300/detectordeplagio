export const USAGE_LIMITS = {
  guest: {
    textPlagiarism: 3,
    codePlagiarism: 2,
    audioTranscription: 1,
    textSummary: 5,
  },
  free: {
    textPlagiarism: 10,
    codePlagiarism: 5,
    audioTranscription: 3,
    textSummary: 15,
  },
  premium: {
    unlimited: true,
  },
};

export const API_ENDPOINTS = {
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
  },
  groq: {
    baseUrl: 'https://api.groq.com/openai/v1',
    model: 'llama-3.1-8b-instant',
  },
  assemblyai: {
    baseUrl: 'https://api.assemblyai.com/v2',
  },
};

export const FEATURES = {
  textPlagiarism: true,
  codePlagiarism: true,
  audioTranscription: true,
  textSummary: true,
};
