import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Channel, SwipeDirection } from '../types';
import { Youtube, Calendar, Users, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SwipeCardProps {
  channel: Channel;
  onSwipe: (direction: SwipeDirection) => void;
  index: number; // To handle stacking z-index
}

export const SwipeCard: React.FC<SwipeCardProps> = ({ channel, onSwipe, index }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  
  // Color overlays based on swipe position
  const rightOpacity = useTransform(x, [0, 150], [0, 1]);
  const leftOpacity = useTransform(x, [-150, 0], [1, 0]);
  
  const [exitX, setExitX] = useState<number | null>(null);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 100) {
      setExitX(200);
      onSwipe('right');
    } else if (info.offset.x < -100) {
      setExitX(-200);
      onSwipe('left');
    } else {
      // Reset position
    }
  };

  return (
    <motion.div
      style={{
        x,
        rotate,
        opacity,
        zIndex: 100 - index,
        position: 'absolute',
        top: 0,
        cursor: 'grab',
      }}
      drag={index === 0 ? "x" : false} // Only top card is draggable
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={exitX !== null ? { x: exitX, opacity: 0 } : { x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-sm h-[500px] bg-white rounded-3xl shadow-2xl overflow-hidden relative select-none"
    >
      {/* Swipe Overlay Indicators */}
      <motion.div 
        style={{ opacity: rightOpacity }}
        className="absolute top-8 left-8 border-4 border-green-500 text-green-500 rounded-lg px-4 py-2 font-bold text-3xl z-50 transform -rotate-12 bg-white/80"
      >
        KEEP
      </motion.div>
      <motion.div 
        style={{ opacity: leftOpacity }}
        className="absolute top-8 right-8 border-4 border-red-500 text-red-500 rounded-lg px-4 py-2 font-bold text-3xl z-50 transform rotate-12 bg-white/80"
      >
        UNSUB
      </motion.div>

      {/* Card Content */}
      <div className="h-full flex flex-col">
        {/* Banner/Image Area */}
        <div className="h-1/2 relative bg-gray-100">
            <img 
                src={channel.avatar} 
                alt={channel.name} 
                className="w-full h-full object-cover"
                draggable={false}
            />
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
                <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-1 rounded-full text-xs font-medium mb-1 border border-white/30">
                   <Youtube size={12} /> {channel.category}
                </span>
                <h2 className="text-2xl font-bold shadow-black drop-shadow-md">{channel.name}</h2>
            </div>
        </div>

        {/* Stats & Description */}
        <div className="h-1/2 p-6 flex flex-col justify-between text-gray-800">
            
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                    <Users size={18} />
                    <span className="font-medium">{channel.subscribers}</span>
                </div>
                
                {channel.isInactive ? (
                    <div className="flex items-center gap-1 text-red-500 bg-red-50 px-3 py-1 rounded-full text-sm font-semibold border border-red-100">
                        <AlertCircle size={14} />
                        Inactive
                    </div>
                ) : (
                    <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-semibold border border-green-100">
                        <CheckCircle2 size={14} />
                        Active
                    </div>
                )}
            </div>

            <div className="space-y-3">
                <div className="flex items-start gap-2">
                    <Calendar className="mt-1 text-gray-400 shrink-0" size={16} />
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Last Upload</p>
                        <p className={`font-medium ${channel.isInactive ? 'text-red-600' : 'text-gray-900'}`}>
                            {channel.lastUpload}
                        </p>
                    </div>
                </div>
                
                <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">About</p>
                    <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                        {channel.description}
                    </p>
                </div>
            </div>

            <div className="text-center text-xs text-gray-400 mt-auto pt-4 border-t border-gray-100">
                Subscribed since 2012
            </div>
        </div>
      </div>
    </motion.div>
  );
};