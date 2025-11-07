import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface UsageLimits {
  textPlagiarism: number;
  codePlagiarism: number;
  audioTranscription: number;
  textSummary: number;
}

interface UsageLimitContextType {
  limits: UsageLimits;
  canUseFeature: (feature: keyof UsageLimits) => boolean;
  useFeature: (feature: keyof UsageLimits) => void;
  resetLimits: () => void;
  isUnlimited: boolean;
}

const GUEST_LIMITS = {
  textPlagiarism: 3,
  codePlagiarism: 2,
  audioTranscription: 1,
  textSummary: 5,
};

const FREE_USER_LIMITS = {
  textPlagiarism: 10,
  codePlagiarism: 5,
  audioTranscription: 3,
  textSummary: 15,
};

const UsageLimitContext = createContext<UsageLimitContextType | undefined>(undefined);

export function UsageLimitProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const [limits, setLimits] = useState<UsageLimits>(GUEST_LIMITS);
  const [lastReset, setLastReset] = useState<string>(new Date().toDateString());

  const isUnlimited = profile?.has_subscription || false;

  useEffect(() => {
    const today = new Date().toDateString();
    const storedLastReset = localStorage.getItem('lastReset');

    if (storedLastReset !== today) {
      resetLimits();
      setLastReset(today);
      localStorage.setItem('lastReset', today);
    } else {
      loadLimits();
    }
  }, [user, profile]);

  function loadLimits() {
    if (isUnlimited) {
      return;
    }

    const storageKey = user ? `limits_${user.id}` : 'limits_guest';
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      try {
        setLimits(JSON.parse(stored));
      } catch (e) {
        resetLimits();
      }
    } else {
      resetLimits();
    }
  }

  function resetLimits() {
    const defaultLimits = user ? FREE_USER_LIMITS : GUEST_LIMITS;
    setLimits(defaultLimits);
    saveLimits(defaultLimits);
  }

  function saveLimits(newLimits: UsageLimits) {
    if (isUnlimited) return;

    const storageKey = user ? `limits_${user.id}` : 'limits_guest';
    localStorage.setItem(storageKey, JSON.stringify(newLimits));
  }

  function canUseFeature(feature: keyof UsageLimits): boolean {
    if (isUnlimited) return true;
    return limits[feature] > 0;
  }

  function useFeature(feature: keyof UsageLimits) {
    if (isUnlimited) return;

    const newLimits = {
      ...limits,
      [feature]: Math.max(0, limits[feature] - 1),
    };
    setLimits(newLimits);
    saveLimits(newLimits);
  }

  return (
    <UsageLimitContext.Provider value={{ limits, canUseFeature, useFeature, resetLimits, isUnlimited }}>
      {children}
    </UsageLimitContext.Provider>
  );
}

export function useUsageLimit() {
  const context = useContext(UsageLimitContext);
  if (context === undefined) {
    throw new Error('useUsageLimit must be used within a UsageLimitProvider');
  }
  return context;
}
