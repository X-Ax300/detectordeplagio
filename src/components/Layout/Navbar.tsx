import { LogOut, Shield, LogIn, Crown, Languages } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUsageLimit } from '../../contexts/UsageLimitContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface NavbarProps {
  onShowAuth: () => void;
}

export function Navbar({ onShowAuth }: NavbarProps) {
  const { user, profile, signOut } = useAuth();
  const { isUnlimited } = useUsageLimit();
  const { language, setLanguage, t } = useLanguage();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="bg-black p-2 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">PlagDetect</h1>
              <p className="text-xs text-gray-600">AI-Powered Analysis Suite</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all text-sm font-medium"
              title="Change language"
            >
              <Languages className="w-4 h-4" />
              <span className="uppercase font-semibold">{language}</span>
            </button>
            {user ? (
              <>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{profile?.display_name}</p>
                  <p className="text-xs text-gray-600">{profile?.email}</p>
                </div>

                {isUnlimited ? (
                  <div className="flex items-center gap-1 px-3 py-1 bg-black text-white text-xs font-semibold rounded-full">
                    <Crown className="w-3 h-3" />
                    {t.nav.premium}
                  </div>
                ) : (
                  <div className="px-3 py-1 bg-gray-800 text-white text-xs font-semibold rounded-full">
                    {t.nav.free}
                  </div>
                )}

                <button
                  onClick={() => signOut()}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                  title="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{t.nav.guestMode}</p>
                  <p className="text-xs text-gray-600">{t.nav.limitedUsage}</p>
                </div>

                <button
                  onClick={onShowAuth}
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all text-sm font-medium"
                >
                  <LogIn className="w-4 h-4" />
                  {t.nav.signIn}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
