import React, { useState } from 'react';
import { Youtube, Play, ShieldAlert, Key } from 'lucide-react';
import { motion } from 'framer-motion';

interface LandingPageProps {
  onStartDemo: () => void;
  onLogin: (clientId: string) => void;
  isLoading: boolean;
  error: string | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartDemo, onLogin, isLoading, error }) => {
  const [clientId, setClientId] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleLoginClick = () => {
    if (clientId.trim().length > 10) {
      onLogin(clientId);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-6 max-w-2xl mx-auto">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8 relative"
      >
        <div className="w-24 h-24 bg-red-600 rounded-3xl flex items-center justify-center shadow-red-900/50 shadow-2xl rotate-3">
            <Youtube size={48} className="text-white" />
        </div>
        <div className="absolute -top-4 -right-4 bg-white text-black font-bold px-3 py-1 rounded-full text-sm rotate-12 shadow-lg">
            v1.0
        </div>
      </motion.div>

      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-5xl font-bold mb-4 tracking-tight"
      >
        SubSwipe
      </motion.h1>

      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xl text-gray-400 mb-12 leading-relaxed"
      >
        The Tinder-style cleaner for your 12-year-old YouTube account. <br/>
        <span className="text-white font-medium">Swipe Left to Unsub. Swipe Right to Keep.</span>
      </motion.p>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col gap-4 w-full max-w-sm"
      >
        {/* Real Mode Section */}
        <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
            {!showInput ? (
                <button 
                    onClick={() => setShowInput(true)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-red-900/20"
                >
                    <Youtube size={20} />
                    Connect Real Account
                </button>
            ) : (
                <div className="space-y-4">
                    <div className="text-left">
                        <label className="text-xs text-gray-400 font-semibold uppercase ml-1">Google Client ID</label>
                        <div className="relative mt-1">
                            <Key className="absolute left-3 top-3 text-gray-500" size={16} />
                            <input 
                                type="text" 
                                value={clientId}
                                onChange={(e) => setClientId(e.target.value)}
                                placeholder="Enter your GCP Client ID..."
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-red-500 transition text-white"
                            />
                        </div>
                        <p className="text-[10px] text-gray-500 mt-2 leading-tight">
                            Requires a Google Cloud Project with <strong>YouTube Data API v3</strong> enabled and <code>http://localhost:3000</code> (or your domain) added to Authorized JavaScript Origins.
                        </p>
                    </div>
                    <button 
                        onClick={handleLoginClick}
                        disabled={isLoading || clientId.length < 5}
                        className="w-full bg-red-600 disabled:bg-gray-700 disabled:text-gray-500 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            "Launch App"
                        )}
                    </button>
                    {error && (
                        <div className="flex items-center gap-2 text-red-400 text-xs bg-red-900/20 p-2 rounded-lg">
                            <ShieldAlert size={14} />
                            {error}
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Divider */}
        <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0f0f0f] px-2 text-gray-500">Or</span>
            </div>
        </div>

        {/* Demo Button */}
        <button 
            onClick={onStartDemo}
            className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2"
        >
            <Play size={20} fill="currentColor" />
            Try Demo Mode
        </button>
      </motion.div>

      <div className="mt-12 text-xs text-gray-600 max-w-sm">
        <p>No data is stored on our servers. All API requests happen directly from your browser to YouTube.</p>
      </div>
    </div>
  );
};