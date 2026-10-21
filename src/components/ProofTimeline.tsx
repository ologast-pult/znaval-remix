import React from 'react';
import { Proof } from '../types';
import { Clock } from 'lucide-react';

interface ProofTimelineProps {
  proofs: Proof[];
}

export const ProofTimeline: React.FC<ProofTimelineProps> = ({ proofs = [] }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold border-b border-black pb-1 mb-4">Таймлайн доказательств</h3>
      <div className="relative border-l border-black ml-2 pl-6 space-y-6">
        {(proofs || []).map((proof) => (
          <div key={proof.id} className="relative">
            <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 bg-black rounded-full border-2 border-paper" />
            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase text-gray-500 flex items-center gap-1">
                <Clock size={10} />
                {proof.date}
              </span>
              <span className="font-bold text-xs uppercase tracking-tighter">{proof.type}</span>
              <p className="text-xs text-gray-700 leading-tight italic mt-0.5">
                "{proof.description}"
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
