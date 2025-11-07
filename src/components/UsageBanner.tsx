import { Sparkles, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUsageLimit } from '../contexts/UsageLimitContext';
import { useLanguage } from '../contexts/LanguageContext';

interface UsageBannerProps {
  feature: 'textPlagiarism' | 'codePlagiarism' | 'audioTranscription' | 'textSummary';
  guestLimit: number;
  freeLimit: number;
}

export function UsageBanner({ feature, guestLimit, freeLimit }: UsageBannerProps) {
  const { user } = useAuth();
  const { limits, isUnlimited } = useUsageLimit();
  const { t } = useLanguage();

  if (isUnlimited) {
    return (
      <div className="mb-6 p-4 bg-gray-50 border border-gray-300 rounded-lg flex items-start gap-3">
        <Crown className="w-5 h-5 text-gray-900 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-gray-900">
          <p className="font-medium mb-1">{t.usageBanner.premiumAccount}</p>
          <p className="text-gray-700">
            {t.usageBanner.unlimitedAccess}
          </p>
        </div>
      </div>
    );
  }

  if (limits[feature] === 0) {
    return null;
  }

  return (
    <div className="mb-6 p-4 bg-gray-50 border border-gray-300 rounded-lg flex items-start gap-3">
      <Sparkles className="w-5 h-5 text-gray-900 flex-shrink-0 mt-0.5" />
      <div className="text-sm text-gray-900">
        <p className="font-medium mb-1">
          {user ? t.usageBanner.freeAccount : t.usageBanner.guestMode}
        </p>
        <p className="text-gray-700">
          {user
            ? `${limits[feature]} ${t.usageBanner.remainingUses}`
            : `${limits[feature]} ${t.usageBanner.remainingUses}`
          } {t.usageBanner.upgradeMessage}
        </p>
      </div>
    </div>
  );
}
