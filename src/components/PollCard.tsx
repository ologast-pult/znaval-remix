import React, { useState } from 'react';
import { Poll } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Vote, CheckCircle2, TrendingUp, Users, AlertTriangle, Share2, UserCheck } from 'lucide-react';

interface PollCardProps {
  poll: Poll;
  onVote: (pollId: string, optionId: string) => void;
  onAction?: (msg: string) => void;
}

export const PollCard: React.FC<PollCardProps> = ({ poll, onVote, onAction }) => {
  const [votedId, setVotedId] = useState<string | null>(null);

  const handleVote = (optionId: string) => {
    if (votedId) return;
    setVotedId(optionId);
    onVote(poll.id, optionId);
  };

  return (
    <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col h-full relative overflow-hidden group">
      {/* Newspaper Header Style */}
      <div className="flex justify-between items-start mb-3 border-b border-black/10 pb-2">
        <span className="text-[8px] font-black uppercase tracking-widest bg-black text-white px-1.5 py-0.5">
          Голосование
        </span>
        <span className="text-[8px] font-bold uppercase opacity-40">
          {poll.category} • {(() => {
            const date = poll.createdAt;
            if (!date) return '';
            if (date instanceof Date) return date.toLocaleDateString();
            if (typeof (date as any).toDate === 'function') return (date as any).toDate().toLocaleDateString();
            if ((date as any).seconds) return new Date((date as any).seconds * 1000).toLocaleDateString();
            return String(date);
          })()}
        </span>
      </div>

      <h3 className="text-sm font-black uppercase tracking-tight leading-tight mb-4 min-h-[2.5rem]">
        {poll.question}
      </h3>

      <div className="space-y-3 flex-grow">
        {(poll.options || []).map((option) => {
          const totalVotes = poll.totalVotes || 1;
          const percentage = Math.round((option.votes / totalVotes) * 100);
          const isWinner = option.votes === Math.max(...(poll.options || []).map(o => o.votes), 0);

          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={!!votedId}
              className={`w-full text-left relative group/opt transition-all btn-newspaper-hover ${
                votedId ? 'cursor-default' : 'hover:translate-x-1'
              }`}
            >
              <div className="flex justify-between items-end mb-1">
                <span className={`text-[10px] font-black uppercase tracking-tight ${
                  votedId === option.id ? 'text-red-600' : 'text-black'
                }`}>
                  {option.label}
                  {votedId === option.id && <CheckCircle2 size={10} className="inline ml-1" />}
                </span>
                {votedId && (
                  <span className="text-[10px] font-black font-mono">
                    {percentage}%
                  </span>
                )}
              </div>

              <div className="h-2 bg-gray-100 border border-black/10 relative overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: votedId ? `${percentage}%` : '0%' }}
                  className={`absolute inset-y-0 left-0 ${
                    votedId === option.id ? 'bg-red-600' : isWinner ? 'bg-black' : 'bg-gray-400'
                  }`}
                />
              </div>

              {option.imageUrl && !votedId && (
                <div className="mt-2 h-20 overflow-hidden border border-black/10 grayscale group-hover/opt:grayscale-0 transition-all">
                  <img 
                    src={option.imageUrl} 
                    alt={option.label} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t-2 border-dotted border-black/10 flex justify-between items-center">
        <div className="flex items-center gap-1.5 opacity-60">
          <Users size={12} />
          <span className="text-[9px] font-bold uppercase">
            {(poll.totalVotes || 0).toLocaleString()} голосов
          </span>
        </div>
        <div className="flex items-center gap-1 text-red-600">
          <TrendingUp size={12} />
          <span className="text-[9px] font-black uppercase tracking-tighter">
            Активно
          </span>
        </div>
      </div>

      {/* Decorative Corner */}
      <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-black rotate-45 opacity-5" />
    </div>
  );
};
