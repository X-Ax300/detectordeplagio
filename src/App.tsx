import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UsageLimitProvider } from './contexts/UsageLimitContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { LoginForm } from './components/Auth/LoginForm';
import { SignUpForm } from './components/Auth/SignUpForm';
import { Navbar } from './components/Layout/Navbar';
import { Sidebar } from './components/Layout/Sidebar';
import { Dashboard } from './components/Dashboard/Dashboard';
import { TextPlagiarism } from './components/Modules/TextPlagiarism';
import { CodePlagiarism } from './components/Modules/CodePlagiarism';
import { AudioTranscription } from './components/Modules/AudioTranscription';
import { TextSummarizer } from './components/Modules/TextSummarizer';

function MainApp() {
  const [activeTab, setActiveTab] = useState('text-plagiarism');
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const { user, signIn, signUp } = useAuth();
  const { t } = useLanguage();

  if (showAuth) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        {isLogin ? (
          <LoginForm
            onSubmit={async (email, password) => {
              await signIn(email, password);
              setShowAuth(false);
            }}
            onSwitchToSignUp={() => setIsLogin(false)}
          />
        ) : (
          <SignUpForm
            onSubmit={async (email, password, displayName) => {
              await signUp(email, password, displayName);
              setShowAuth(false);
            }}
            onSwitchToLogin={() => setIsLogin(true)}
          />
        )}
        <button
          onClick={() => setShowAuth(false)}
          className="absolute top-4 right-4 px-4 py-2 text-gray-900 hover:text-gray-700 font-medium"
        >
          {t.auth.continueAsGuest}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onShowAuth={() => setShowAuth(true)} />
      <div className="flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'dashboard' && user && <Dashboard />}
            {activeTab === 'text-plagiarism' && <TextPlagiarism />}
            {activeTab === 'code-plagiarism' && <CodePlagiarism />}
            {activeTab === 'audio-transcription' && <AudioTranscription />}
            {activeTab === 'text-summary' && <TextSummarizer />}
          </div>
        </main>
      </div>
    </div>
  );
}

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading PlagDetect...</p>
        </div>
      </div>
    );
  }

  return <MainApp />;
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <UsageLimitProvider>
          <AppContent />
        </UsageLimitProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
