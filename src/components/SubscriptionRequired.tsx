import { Lock, Star } from 'lucide-react';

export function SubscriptionRequired() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="bg-gradient-to-br from-orange-500 to-amber-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-white" />
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Subscription Required
        </h2>

        <p className="text-gray-600 mb-8">
          Upgrade to a premium subscription to unlock all PlagDetect features including plagiarism detection, code analysis, audio transcription, and text summarization.
        </p>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 mb-8 border border-blue-200">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Star className="w-5 h-5 text-blue-600 fill-blue-600" />
            <h3 className="text-xl font-bold text-gray-900">Premium Features</h3>
            <Star className="w-5 h-5 text-blue-600 fill-blue-600" />
          </div>
          <ul className="text-left space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
              AI-powered text plagiarism detection
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
              Advanced code similarity analysis
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-violet-600 rounded-full"></div>
              Audio to text transcription
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-orange-600 rounded-full"></div>
              Intelligent text summarization
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-gray-600 rounded-full"></div>
              Unlimited analyses and reports
            </li>
          </ul>
        </div>

        <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all">
          Upgrade to Premium
        </button>

        <p className="text-xs text-gray-500 mt-4">
          Contact support for subscription options
        </p>
      </div>
    </div>
  );
}
