import React, { useState } from 'react';
import { Radio, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { NewsItem } from '../types';
import { generateDailyNewsBriefing } from '../services/geminiService';

interface NewsTickerProps {
  news: NewsItem[];
  onSelectNews: (item: NewsItem) => void;
}

export const NewsTicker: React.FC<NewsTickerProps> = ({ news, onSelectNews }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [briefingText, setBriefingText] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const handleToggleBroadcast = async () => {
    if (isPlaying) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      return;
    }

    setIsSynthesizing(true);
    const titles = news.map(n => n.title);
    const text = await generateDailyNewsBriefing(titles);
    setBriefingText(text);
    setIsSynthesizing(false);

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 0.95;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    } else {
      setIsPlaying(true);
    }
  };

  return (
    <div className="bg-[#080809] border-b border-[#262626] px-4 sm:px-8 py-2.5 flex items-center justify-between gap-4 text-xs shrink-0 overflow-hidden">
      
      {/* Ticker Tag */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF41] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FF41]"></span>
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white flex items-center gap-1.5">
          <Radio className="w-3 h-3 text-[#00FF41]" />
          <span>DAILY INTELLIGENCE</span>
        </span>
      </div>

      {/* Marquee or Headlines */}
      <div className="flex-1 overflow-hidden relative text-ellipsis whitespace-nowrap">
        {briefingText ? (
          <p className="text-white font-mono text-[11px] animate-pulse truncate">
            <span className="text-[#00FF41] font-bold mr-2">[AI BRIEFING]:</span>
            {briefingText}
          </p>
        ) : (
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
            {news.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => onSelectNews(item)}
                className="flex items-center gap-2 text-[#888888] hover:text-white transition-colors shrink-0 text-[11px]"
              >
                <span className="text-[9px] font-mono text-[#555] uppercase">[{item.category}]</span>
                <span className="truncate max-w-xs sm:max-w-md font-medium text-white">{item.title}</span>
                {idx < news.length - 1 && <span className="text-[#262626] ml-2">•</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Audio Briefing Synth Control */}
      <div className="shrink-0 flex items-center gap-2">
        <button
          onClick={handleToggleBroadcast}
          disabled={isSynthesizing}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider border transition-all ${
            isPlaying
              ? 'bg-[#00FF41] text-black border-[#00FF41]'
              : 'bg-[#121214] text-white border-[#262626] hover:border-[#555]'
          }`}
          title="Synthesize and play Daily AI News briefing"
        >
          {isSynthesizing ? (
            <Sparkles className="w-3 h-3 animate-spin text-[#00FF41]" />
          ) : isPlaying ? (
            <VolumeX className="w-3 h-3 text-black" />
          ) : (
            <Volume2 className="w-3 h-3 text-[#00FF41]" />
          )}
          <span>{isSynthesizing ? 'SYNTHESIZING' : isPlaying ? 'STOP BRIEFING' : 'AUDIO BRIEFING'}</span>
        </button>
      </div>

    </div>
  );
};
