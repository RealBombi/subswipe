import React, { useState } from 'react';
import { MOCK_CHANNELS } from './services/mockData';
import { SwipeCard } from './components/SwipeCard';
import { StatsView } from './components/StatsView';
import { LandingPage } from './components/LandingPage';
import { YouTubeService } from './services/youtubeApi';
import { Channel, SwipeStats } from './types';
import { RotateCcw, Trash2, Heart, Check, X, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [view, setView] = useState<'landing' | 'app' | 'finished'>('landing');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [youtubeService, setYoutubeService] = useState<YouTubeService | null>(null);
  
  const [channels, setChannels] = useState<Channel[]>([]);
  const [removedChannels, setRemovedChannels] = useState<Channel[]>([]);
  const [keptCount, setKeptCount] = useState(0);
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);

  // Stats for the dashboard
  const stats: SwipeStats = {
    kept: keptCount,
    removed: removedChannels.length,
    total: channels.length + keptCount + removedChannels.length // Approximate total based on session
  };

  const startDemo = () => {
    setChannels(MOCK_CHANNELS);
    setView('app');
  };

  const startReal = async (clientId: string) => {
    setLoading(true);
    setError(null);
    try {
      const service = new YouTubeService(clientId);
      await service.login();
      const realChannels = await service.getSubscriptions();
      
      if (realChannels.length === 0) {
        setError("No subscriptions found on this account.");
        setLoading(false);
        return;
      }

      setYoutubeService(service);
      setChannels(realChannels);
      setView('app');
    } catch (err: any) {
        console.error(err);
        let msg = "Failed to connect. Check Client ID and Origins.";
        if (err.error === 'popup_closed_by_user') msg = "Login cancelled.";
        if (err.message) msg = err.message;
        setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    // Current top card
    const currentChannel = channels[0];
    
    // Optimistic UI Update: Move to next card immediately visually
    // We delay the data removal slightly to let animation play
    setTimeout(async () => {
      const newChannels = channels.slice(1);
      setChannels(newChannels);

      if (direction === 'left') {
        setRemovedChannels(prev => [currentChannel, ...prev]);

        // Execute Real API call if service exists
        if (youtubeService && currentChannel.subscriptionId) {
            try {
                console.log(`[UNSUBSCRIBE] Starting: ${currentChannel.name} (ID: ${currentChannel.subscriptionId})`);
                const success = await youtubeService.unsubscribe(currentChannel.subscriptionId);
                if (success) {
                    console.log(`[UNSUBSCRIBE] Success: ${currentChannel.name}`);
                } else {
                    console.error(`[UNSUBSCRIBE] Failed (API returned false): ${currentChannel.name}`);
                }
            } catch (e) {
                console.error(`[UNSUBSCRIBE] Error for ${currentChannel.name}:`, e);
                // In a real app, we might revert the UI or show a toast
            }
        }

      } else {
        setKeptCount(prev => prev + 1);
      }

      if (newChannels.length === 0) {
        setView('finished');
      }
    }, 200);
  };

  const handleUndo = (channelId: string) => {
    // Note: We cannot "Re-Subscribe" via API easily without user interaction due to anti-abuse policies usually,
    // or it requires a different write scope.
    // For this app, "Undo" is best treated as "Stop the pending deletion" or just visual if we did it instantly.
    // Since we did the API call instantly above, we actually can't easily undo via API without asking user to re-sub.
    // So for "Real Mode", we should probably warn the user or batch deletions.
    // FOR THIS DEMO: We will just move it back to stack visually.

    const channelToRestore = removedChannels.find(c => c.id === channelId);
    if (channelToRestore) {
      setRemovedChannels(prev => prev.filter(c => c.id !== channelId));
      setChannels(prev => [channelToRestore, ...prev]);
      setView('app');
    }
  };

  const handleBulkUnsubscribe = async () => {
    if (!youtubeService || removedChannels.length === 0 || isUnsubscribing) return;

    const confirmed = confirm(`Are you sure you want to unsubscribe from ${removedChannels.length} channels? This cannot be undone.`);
    if (!confirmed) return;

    setIsUnsubscribing(true);
    let successCount = 0;
    let failCount = 0;

    for (const channel of removedChannels) {
      if (channel.subscriptionId) {
        try {
          console.log(`Unsubscribing from ${channel.name}...`);
          const success = await youtubeService.unsubscribe(channel.subscriptionId);
          if (success) {
            successCount++;
          } else {
            failCount++;
            console.error(`Failed to unsubscribe from ${channel.name}`);
          }
        } catch (e) {
          failCount++;
          console.error(`Error unsubscribing from ${channel.name}:`, e);
        }
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    setIsUnsubscribing(false);
    alert(`Unsubscribed from ${successCount} channels. ${failCount > 0 ? `Failed: ${failCount}` : 'All successful!'}`);
  };

  // Render Landing
  if (view === 'landing') {
      return (
          <div className="min-h-screen bg-[#0f0f0f] text-white font-sans">
            <LandingPage 
                onStartDemo={startDemo} 
                onLogin={startReal} 
                isLoading={loading}
                error={error}
            />
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white overflow-hidden flex flex-col items-center relative font-sans">
      
      {/* Header */}
      <header className="w-full p-4 flex justify-between items-center max-w-md z-10">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('landing')}>
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <RotateCcw className="text-white transform -scale-x-100" size={20} />
            </div>
            <h1 className="font-bold text-xl tracking-tight">SubSwipe</h1>
        </div>
        <button 
            onClick={() => setShowRecycleBin(!showRecycleBin)}
            className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition relative"
        >
            <Trash2 size={20} className={showRecycleBin ? "text-red-400" : "text-gray-400"} />
            {removedChannels.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                    {removedChannels.length}
                </span>
            )}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-md flex flex-col items-center justify-center relative p-4">
        
        {/* Recycle Bin Overlay */}
        <AnimatePresence>
            {showRecycleBin && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute inset-0 z-50 bg-[#0f0f0f] p-4 flex flex-col"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Unsubscribed ({removedChannels.length})</h2>
                        <button onClick={() => setShowRecycleBin(false)} className="text-gray-400 hover:text-white">Close</button>
                    </div>

                    {youtubeService && removedChannels.length > 0 && (
                        <button
                            onClick={handleBulkUnsubscribe}
                            disabled={isUnsubscribing}
                            className="w-full mb-4 bg-red-600 disabled:bg-gray-700 disabled:text-gray-500 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                        >
                            {isUnsubscribing ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Unsubscribing...
                                </>
                            ) : (
                                <>
                                    <Trash2 size={18} />
                                    Unsubscribe from All ({removedChannels.length})
                                </>
                            )}
                        </button>
                    )}
                    
                    {removedChannels.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                            <Trash2 size={48} className="mb-4 opacity-50" />
                            <p>Bin is empty. Start swiping left!</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto space-y-3 pb-20">
                            {removedChannels.map(channel => (
                                <div key={channel.id} className="bg-gray-800 p-3 rounded-xl flex items-center gap-3">
                                    <img src={channel.avatar} className="w-10 h-10 rounded-full bg-gray-700 object-cover" alt="" />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold truncate">{channel.name}</h4>
                                        <p className="text-xs text-gray-400">
                                            {youtubeService ? "Deleted from YouTube" : "Moved to bin"}
                                        </p>
                                    </div>
                                    {!youtubeService && (
                                        <button 
                                            onClick={() => handleUndo(channel.id)}
                                            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs font-medium text-blue-300 transition"
                                        >
                                            Undo
                                        </button>
                                    )}
                                </div>
                            ))}
                            {youtubeService && (
                                <p className="text-xs text-red-400 text-center mt-4">
                                    Note: Undo is not available in Real Mode as actions are instant.
                                </p>
                            )}
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>

        {/* Empty State / Finished */}
        {view === 'finished' ? (
            <div className="text-center w-full">
                <div className="mb-8 flex justify-center">
                    <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center animate-pulse">
                        <Check size={48} className="text-green-500" />
                    </div>
                </div>
                <h2 className="text-3xl font-bold mb-2">All Caught Up!</h2>
                <p className="text-gray-400 mb-8">You've cleaned up your subscription feed.</p>
                <div className="flex justify-center mb-8">
                    <StatsView stats={stats} />
                </div>
                <button 
                    onClick={() => window.location.reload()}
                    className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition"
                >
                    Start Over
                </button>
            </div>
        ) : (
            <>
                {/* Progress Indicator */}
                <div className="absolute top-2 left-0 w-full px-8 flex justify-between text-xs font-medium text-gray-500 uppercase tracking-widest">
                    <span>Stack: {channels.length}</span>
                    <span>Session: {keptCount + removedChannels.length}</span>
                </div>

                {/* Card Stack */}
                <div className="w-full h-[520px] relative flex justify-center items-center mt-4">
                    <AnimatePresence>
                        {channels.slice(0, 2).map((channel, index) => (
                            <SwipeCard 
                                key={channel.id} 
                                channel={channel} 
                                index={index}
                                onSwipe={handleSwipe}
                            />
                        )).reverse()}
                    </AnimatePresence>
                </div>

                {/* Action Buttons */}
                <div className="w-full flex justify-center items-center gap-8 mt-8">
                    <button 
                        className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-red-500 shadow-lg border border-red-500/20 hover:scale-110 hover:bg-red-500/10 transition active:scale-95"
                        onClick={() => handleSwipe('left')}
                    >
                        <X size={32} />
                    </button>
                    
                    <button 
                         className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-blue-400 shadow-lg hover:bg-blue-500/10 transition"
                    >
                        <Filter size={20} />
                    </button>

                    <button 
                        className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-green-500 shadow-lg border border-green-500/20 hover:scale-110 hover:bg-green-500/10 transition active:scale-95"
                        onClick={() => handleSwipe('right')}
                    >
                        <Heart size={32} />
                    </button>
                </div>

                <p className="mt-8 text-xs text-gray-600 hidden md:block">
                    {youtubeService ? 'REAL MODE: Actions are permanent.' : 'DEMO MODE: No real changes.'}
                </p>
            </>
        )}
      </main>
    </div>
  );
}