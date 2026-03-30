"use client";
import React, { useState } from 'react';

interface Card {
  rank: string;
  suit: string;
}

const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
const suits = ['h', 'd', 'c', 's'];
const allPositions = ['SB', 'BB', 'UTG', 'UTG+1', 'MP', 'HJ', 'CO', 'BTN'];

const getSuitInfo = (s: string) => {
  if (s === 'h') return { color: 'text-[#ef4444]', symbol: '♥' };
  if (s === 'd') return { color: 'text-[#ef4444]', symbol: '♦' };
  if (s === 'c') return { color: 'text-[#3b82f6]', symbol: '♣' };
  return { color: 'text-slate-200', symbol: '♠' };
};

export default function GtoLeakTrainerFinal() {
  const [heroPos, setHeroPos] = useState<string>('BTN');
  const [heroStack, setHeroStack] = useState<number>(100.0);
  const [currentHand, setCurrentHand] = useState<Card[]>([
    { rank: 'A', suit: 's' },
    { rank: 'A', suit: 'h' }
  ]);
  
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [lastResult, setLastResult] = useState<'CORRECT' | 'WRONG' | null>(null);

  const checkAction = (action: string) => {
    const isPair = currentHand[0].rank === currentHand[1].rank;
    const hasAce = currentHand[0].rank === 'A' || currentHand[1].rank === 'A';
    
    let isCorrect = false;
    if (action === 'RAISE' && (isPair || hasAce)) isCorrect = true;
    else if (action === 'FOLD' && (!isPair && !hasAce)) isCorrect = true;
    else if (action === 'CALL') isCorrect = Math.random() > 0.5; 

    if (isCorrect) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
      setLastResult("CORRECT");
    } else {
      setScore(prev => ({ ...prev, wrong: prev.wrong + 1 }));
      setLastResult("WRONG");
    }

    setTimeout(() => {
      setLastResult(null);
      nextHand();
    }, 500);
  };

  const nextHand = () => {
    const randomPos = allPositions[Math.floor(Math.random() * allPositions.length)];
    setHeroPos(randomPos);

    const newCards: Card[] = []; 
    while (newCards.length < 2) {
      const r = ranks[Math.floor(Math.random() * ranks.length)];
      const s = suits[Math.floor(Math.random() * suits.length)];
      if (!newCards.some(c => c.rank === r && c.suit === s)) {
        newCards.push({ rank: r, suit: s });
      }
    }
    setCurrentHand(newCards);
    setHeroStack(parseFloat((Math.random() * (100 - 20) + 20).toFixed(1)));
  };

  const players = (() => {
    const heroIdx = allPositions.indexOf(heroPos);
    const layout = [];
    for (let i = 0; i < 6; i++) {
      layout.push(allPositions[(heroIdx + i) % allPositions.length]);
    }
    return layout;
  })();

  return (
    <main className="min-h-screen bg-[#020205] text-white flex flex-col items-center justify-center p-4 font-sans italic relative">
      
      {/* Score UI */}
      <div className="absolute top-6 left-6 flex gap-3 z-50 not-italic">
        <div className="bg-black/60 border border-emerald-500/30 px-4 py-1.5 rounded-lg">
          <span className="text-[10px] text-emerald-400 font-black uppercase mr-2">CORRECT</span>
          <span className="text-xl font-black">{score.correct}</span>
        </div>
        <div className="bg-black/60 border border-red-500/30 px-4 py-1.5 rounded-lg">
          <span className="text-[10px] text-red-400 font-black uppercase mr-2">WRONG</span>
          <span className="text-xl font-black">{score.wrong}</span>
        </div>
      </div>

      {/* Main Table Container - ปรับ Max Width ให้แคบลงเพื่อลดความกว้างขอบ */}
      <div className="relative w-full max-w-4xl aspect-[1.8/1] flex items-center justify-center mb-12">
        
        {/* Table Background Layers */}
        <div className="absolute inset-0 border-[10px] border-[#16172b] rounded-[150px] shadow-[0_0_50px_rgba(0,0,0,0.8)] z-0"></div>
        <div className="absolute inset-2 bg-gradient-to-b from-[#0d0e21] to-[#010105] rounded-[140px] border border-white/5 z-0 shadow-inner"></div>
        
        {/* Neon Border */}
        <div className="absolute inset-2 rounded-[140px] border-[2px] border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/4 h-[2px] bg-red-600/80 shadow-[0_0_10px_rgba(220,38,38,0.6)]"></div>
        </div>

        {/* Center Content */}
        <div className="text-center z-10 select-none">
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase opacity-90">Leak Training</h2>
          <p className="text-lg font-bold text-slate-500 tracking-widest mt-1 uppercase">Pot: 1.5</p>
          
          {lastResult && (
            <div className={`mt-4 font-black text-2xl tracking-widest animate-bounce ${lastResult === 'CORRECT' ? 'text-emerald-400' : 'text-red-400'}`}>
              {lastResult}
            </div>
          )}
        </div>

        {/* Players Loop */}
        {players.map((pos, i) => {
          const isHero = pos === heroPos;
          const coords = [
            "bottom-[-10%] left-1/2 -translate-x-1/2", // HERO
            "bottom-[15%] left-[-5%]",                 // LB
            "top-[15%] left-[-5%]",                    // LT
            "top-[-10%] left-1/2 -translate-x-1/2",    // TOP
            "top-[15%] right-[-5%]",                   // RT
            "bottom-[15%] right-[-5%]",                // RB
          ];

          return (
            <div key={pos} className={`absolute ${coords[i]} z-20 flex flex-col items-center`}>
              {isHero && (
                <div className="flex gap-1.5 mb-4 scale-100 drop-shadow-[0_15px_30px_rgba(0,0,0,1)]">
                  {currentHand.map((c, idx) => {
                    const { color, symbol } = getSuitInfo(c.suit);
                    return (
                      <div key={idx} className="w-14 h-20 bg-white rounded-md flex flex-col justify-between p-1.5 border-b-4 border-slate-300">
                        <span className={`text-lg font-black leading-none ${color}`}>{c.rank}</span>
                        <span className={`text-3xl self-center ${color}`}>{symbol}</span>
                        <span className={`text-lg font-black leading-none rotate-180 ${color}`}>{c.rank}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <div className="relative">
                {pos === 'BTN' && <div className="absolute -right-2 -top-2 w-7 h-7 bg-yellow-500 rounded-full text-black flex items-center justify-center font-black text-[10px] border-2 border-black shadow-lg z-30">D</div>}
                <div className={`w-28 py-2 rounded-full border-2 flex flex-col items-center transition-all ${isHero ? 'bg-blue-600/30 border-blue-400 scale-110 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'bg-black/80 border-slate-800 opacity-70'}`}>
                  <span className={`text-[9px] font-black tracking-tighter ${isHero ? 'text-blue-300' : 'text-slate-500'}`}>{pos}</span>
                  <span className="text-lg font-black text-white leading-tight">{isHero ? heroStack.toFixed(1) : '100.0'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Control Buttons */}
      <div className="grid grid-cols-3 gap-5 w-full max-w-lg px-4 z-50 not-italic">
        <button onClick={() => checkAction('FOLD')} className="py-5 bg-[#0f101a] hover:bg-slate-800 border border-slate-800 rounded-xl font-black text-xl text-slate-500 shadow-xl active:scale-95 transition-all uppercase tracking-widest">Fold</button>
        <button onClick={() => checkAction('CALL')} className="py-5 bg-blue-900/10 hover:bg-blue-600 border border-blue-500/50 rounded-xl font-black text-xl text-blue-400 hover:text-white shadow-xl active:scale-95 transition-all uppercase tracking-widest">Call</button>
        <button onClick={() => checkAction('RAISE')} className="py-5 bg-emerald-900/10 hover:bg-emerald-600 border border-emerald-500/50 rounded-xl font-black text-xl text-emerald-400 hover:text-white shadow-xl active:scale-95 transition-all uppercase tracking-widest">Raise</button>
      </div>

    </main>
  );
}

 