import { useEffect, useState } from 'react';
import { Users, FileText, FileBarChart } from 'lucide-react';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useLanguage } from '../../contexts/LanguageContext';

interface Stats {
  totalUsers: number;
  totalAnalyses: number;
  totalReports: number;
}

export function Dashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalAnalyses: 0,
    totalReports: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const [usersSnapshot, analysesSnapshot, reportsSnapshot] = await Promise.all([
        getCountFromServer(collection(db, 'profiles')),
        getCountFromServer(collection(db, 'analyses')),
        getCountFromServer(collection(db, 'reports')),
      ]);

      setStats({
        totalUsers: usersSnapshot.data().count,
        totalAnalyses: analysesSnapshot.data().count,
        totalReports: reportsSnapshot.data().count,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    {
      title: t.dashboard.totalUsers,
      value: stats.totalUsers,
      icon: Users,
    },
    {
      title: t.dashboard.totalAnalyses,
      value: stats.totalAnalyses,
      icon: FileText,
    },
    {
      title: t.dashboard.totalReports,
      value: stats.totalReports,
      icon: FileBarChart,
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
            <div className="h-12 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statCards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-700 font-semibold text-lg">{card.title}</h3>
            <div className="bg-black p-3 rounded-xl shadow-md">
              <card.icon className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-4xl font-bold text-gray-900">
            {card.value.toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
