import { BarChart3, Search, Code2, Mic, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { user } = useAuth();
  const { t } = useLanguage();

  const tabs = [
    { id: 'dashboard', label: t.sidebar.dashboard, icon: BarChart3, requiresAuth: true },
    { id: 'text-plagiarism', label: t.sidebar.textPlagiarism, icon: Search, requiresAuth: false },
    { id: 'code-plagiarism', label: t.sidebar.codeAnalysis, icon: Code2, requiresAuth: false },
    { id: 'audio-transcription', label: t.sidebar.audioTranscription, icon: Mic, requiresAuth: false },
    { id: 'text-summary', label: t.sidebar.textSummarizer, icon: FileText, requiresAuth: false },
  ];

  const visibleTabs = tabs.filter(tab => !tab.requiresAuth || user);

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)]">
      <nav className="p-4 space-y-2">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-black text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            <span className="font-medium text-sm">{tab.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
