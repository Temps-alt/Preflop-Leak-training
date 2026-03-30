"use client";
import React, { useState } from 'react';

// --- Constants ---
const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
const suits = ['h', 'd', 'c', 's'];
const allPositions = ['BTN', 'SB', 'BB', 'UTG', 'UTG+1', 'LJ', 'HJ', 'CO'];

interface Card { rank: string; suit: string; }
interface ChipAnim { id: number; }

const getSuitInfo = (s: string) => {
  if (s === 'h') return { color: 'text-[#d00000]', symbol: '♥' };
  if (s === 'd') return { color: 'text-[#d00000]', symbol: '♦' };
  if (s === 'c') return { color: 'text-[#0055d4]', symbol: '♣' };
  return { color: 'text-[#1a1a1a]', symbol: '♠' };
};

const getGtoAction = (r1: string, r2: string, suited: boolean) => {
  if (r1 === r2) return { action: 'RAISE', color: 'bg-emerald-500' };
  if (r1 === 'A' || r2 === 'A') return { action: 'RAISE', color: 'bg-emerald-500/80' };
  if (suited && (['K', 'Q', 'J'].includes(r1) || ['K', 'Q', 'J'].includes(r2))) return { action: 'CALL', color: 'bg-blue-600' };
  return { action: 'FOLD', color: 'bg-slate-800' };
};

export default function RfiPreflopTrainerLearningMode() {
  const [heroPos, setHeroPos] = useState<string>('LJ');
  const [heroStack, setHeroStack] = useState<number>(38.2);
  const [currentHand, setCurrentHand] = useState<Card[]>([{ rank: '7', suit: 'h' }, { rank: 'K', suit: 'd' }]);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [lastResult, setLastResult] = useState<'CORRECT' | 'WRONG' | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFolding, setIsFolding] = useState(false);
  const [chips, setChips] = useState<ChipAnim[]>([]);

  const nextHand = () => {
    setIsFolding(false);
    const randomPos = allPositions[Math.floor(Math.random() * allPositions.length)];
    setHeroPos(randomPos);
    const deck: Card[] = []; 
    ranks.forEach(r => suits.forEach(s => deck.push({ rank: r, suit: s })));
    const newCards: Card[] = []; 
    while (newCards.length < 2) {
      newCards.push(deck.splice(Math.floor(Math.random() * deck.length), 1)[0]);
    }
    setCurrentHand(newCards);
    setHeroStack(parseFloat((Math.random() * 80 + 20).toFixed(1)));
  };

  const checkAction = (action: string) => {
    if (isFolding || lastResult === 'WRONG') return; // ล็อคไม่ให้กดซ้ำถ้าตอบผิดแล้วยังไม่ปิด Modal

    if (action === 'FOLD') { setIsFolding(true); } 
    else if (action === 'RAISE' || action === 'CALL') {
      setChips([{ id: Date.now() }]);
      setTimeout(() => setChips([]), 600);
    }

    const suited = currentHand[0].suit === currentHand[1].suit;
    const gto = getGtoAction(currentHand[0].rank, currentHand[1].rank, suited);
    
    if (action === gto.action) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
      setLastResult("CORRECT");
      // ถ้าถูก ให้รอ 0.8 วิแล้วขึ้นแฮนด์ใหม่
      setTimeout(() => {
        setLastResult(null);
        nextHand();
      }, 800);
    } else {
      setScore(prev => ({ ...prev, wrong: prev.wrong + 1 }));
      setLastResult("WRONG");
      // ถ้าผิด ให้หยุดแฮนด์นี้ไว้ และเปิด Pop-up ทันที
      setTimeout(() => {
        setIsModalOpen(true);
      }, 400);
    }
  };

  // ฟังก์ชันสำหรับปิด Modal และเริ่มแฮนด์ใหม่ (เฉพาะกรณีที่ตอบผิด)
  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (lastResult === 'WRONG') {
      setLastResult(null);
      nextHand();
    }
  };

  const heroIdx = allPositions.indexOf(heroPos);
  const players = [];
  for (let i = 0; i < 8; i++) { players.push(allPositions[(heroIdx + i) % allPositions.length]); }

  return (
    <main className="min-h-screen bg-[#050508] text-white flex flex-col items-center p-4 md:p-6 italic font-sans overflow-hidden relative">
      
      {/* Header HUD */}
      <div className="w-full max-w-[1400px] flex justify-between items-start z-50 not-italic">
        <div className="flex gap-3">
          <div className="bg-black/60 border border-emerald-500/50 px-4 py-2 rounded-xl">
            <span className="text-[10px] text-emerald-400 font-black uppercase block tracking-widest mb-1">PROFIT</span>
            <span className="text-2xl font-black text-emerald-400 leading-none">{score.correct}</span>
          </div>
          <div className="bg-black/60 border border-red-500/50 px-4 py-2 rounded-xl">
            <span className="text-[10px] text-red-400 font-black uppercase block tracking-widest mb-1">LEAKS</span>
            <span className="text-2xl font-black text-red-400 leading-none">{score.wrong}</span>
          </div>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-cyan-500/20 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white px-5 py-3 rounded-2xl font-black uppercase tracking-tighter transition-all"
        >
          SHOW RANGE
        </button>
      </div>

      {/* Arena Table */}
      <div className="relative w-full max-w-6xl aspect-[2.2/1] flex items-center justify-center mt-12 mb-28">
        <div className="absolute inset-0 bg-[#0a0a1f] border-[10px] border-white/5 rounded-[120px] md:rounded-[180px] shadow-2xl" />

        <div className="relative z-10 flex flex-col items-center justify-center select-none pointer-events-none">
          <div className="h-20 flex items-end">
             {lastResult && (
                <span className={`text-5xl md:text-6xl font-black tracking-widest uppercase animate-in fade-in zoom-in duration-300 ${lastResult === 'CORRECT' ? 'text-emerald-400' : 'text-red-500'}`}>
                    {lastResult}
                </span>
             )}
          </div>
          <h2 className="text-[50px] md:text-[75px] font-black text-white/10 uppercase italic leading-none text-center mt-2">
            RFI Preflop <br />
            <span className="text-[35px] md:text-[55px] opacity-60">Training</span>
          </h2>
        </div>

        {chips.map(chip => (
          <div key={chip.id} className="absolute z-[60] w-10 h-10 bg-yellow-500 rounded-full border-4 border-yellow-600 shadow-xl"
            style={{ animation: 'chipToPot 0.5s forwards ease-in-out', bottom: '15%', left: '50%', transform: 'translateX(-50%)' }} />
        ))}

        {players.map((pos, i) => {
          const isHero = i === 0;
          const angle = (Math.PI / 2) + (i * (Math.PI * 2) / 8);
          const rx = 52; const ry = 46;
          const left = 50 + rx * Math.cos(angle); const top = 50 + ry * Math.sin(angle);
          return (
            <div key={pos} style={{ left: `${left}%`, top: `${top}%`, transform: 'translate(-50%, -50%)' }} className="absolute z-20 flex flex-col items-center">
              {isHero && (
                <div className={`flex gap-2 mb-4 scale-110 md:scale-125 transition-all duration-500 ${isFolding ? 'opacity-0 scale-75 -translate-y-32 rotate-12' : 'opacity-100'}`}>
                  {currentHand.map((c, idx) => {
                    const suit = getSuitInfo(c.suit);
                    return (
                      <div key={idx} className="w-12 h-18 md:w-14 md:h-20 bg-white rounded-lg flex flex-col justify-between p-1.5 md:p-2 border-b-4 border-slate-300 shadow-2xl">
                        <span className={`text-lg md:text-xl font-black leading-none ${suit.color}`}>{c.rank}</span>
                        <span className={`text-3xl md:text-4xl self-center ${suit.color}`}>{suit.symbol}</span>
                        <span className="opacity-0">.</span>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className={`w-28 md:w-32 py-2 md:py-3 rounded-xl border-2 flex flex-col items-center ${isHero ? 'bg-blue-600 border-white shadow-lg scale-110 z-30' : 'bg-black/90 border-white/20'}`}>
                <span className="text-[10px] font-black uppercase tracking-wider">{pos}</span>
                <span className="text-lg md:text-xl font-bold">{isHero ? heroStack.toFixed(1) : '100.0'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="mt-auto mb-10 grid grid-cols-3 gap-4 md:gap-6 w-full max-w-xl not-italic z-40">
        <button onClick={() => checkAction('FOLD')} disabled={isFolding || lastResult === 'WRONG'} className="py-6 md:py-7 bg-[#0a0a0a] border border-white/10 rounded-2xl md:rounded-3xl text-xl md:text-2xl font-black text-slate-500 hover:text-white transition-all active:scale-95 disabled:opacity-30">Fold</button>
        <button onClick={() => checkAction('CALL')} disabled={isFolding || lastResult === 'WRONG'} className="py-6 md:py-7 bg-[#0a0a0a] border-2 border-blue-500/40 rounded-2xl md:rounded-3xl text-xl md:text-2xl font-black text-blue-400 hover:bg-blue-500 active:scale-95 transition-all disabled:opacity-30">Call</button>
        <button onClick={() => checkAction('RAISE')} disabled={isFolding || lastResult === 'WRONG'} className="py-6 md:py-7 bg-[#0a0a0a] border-2 border-emerald-500/40 rounded-2xl md:rounded-3xl text-xl md:text-2xl font-black text-emerald-400 hover:bg-emerald-500 active:scale-95 transition-all disabled:opacity-30">Raise</button>
      </div>

      {/* --- GTO RANGE POPUP MODAL (Learning Mode) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 not-italic">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={handleCloseModal}></div>
          <div className="relative bg-[#0a0a15] border-2 border-cyan-500/30 p-6 md:p-8 rounded-[32px] md:rounded-[40px] shadow-2xl max-w-2xl w-full animate-in zoom-in duration-200">
            <button onClick={handleCloseModal} className="absolute -top-3 -right-3 w-10 h-10 bg-red-500 text-white rounded-full font-black text-xl flex items-center justify-center border-4 border-[#050508]">×</button>
            
            <p className={`text-center font-black tracking-tighter text-3xl md:text-4xl mb-4 uppercase leading-none ${lastResult === 'WRONG' ? 'text-red-500' : 'text-cyan-400'}`}>
                {lastResult === 'WRONG' ? 'LEAK DETECTED! REVIEW RANGE' : 'GTO Strategy Range'}
            </p>
            
            <div className="overflow-x-auto pb-4">
                <div className="grid grid-cols-13 gap-0.5 md:gap-1 min-w-[300px]">
                {ranks.map((r1, i) => ranks.map((r2, j) => {
                    const isCurrent = (currentHand[0].rank === r1 && currentHand[1].rank === r2) || (currentHand[0].rank === r2 && currentHand[1].rank === r1);
                    const gto = getGtoAction(r1, r2, i < j);
                    return (
                        <div key={`${r1}${r2}`} className={`aspect-square flex items-center justify-center text-[7px] md:text-[8px] font-bold rounded-sm ${gto.color} ${isCurrent ? 'ring-2 ring-white scale-125 z-10 shadow-[0_0_10px_white] opacity-100' : 'opacity-40'}`}>
                        {r1}{r2}
                        </div>
                    );
                    }))}
                </div>
            </div>
            
            <div className="flex justify-around text-[10px] font-black text-slate-400 uppercase tracking-widest pt-6 border-t border-white/5 mb-4">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-emerald-500 rounded"></div> RAISE</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-600 rounded"></div> CALL</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-slate-800 rounded"></div> FOLD</div>
            </div>

            <button 
                onClick={handleCloseModal}
                className="w-full py-4 bg-cyan-500 text-black font-black rounded-2xl hover:bg-cyan-400 transition-all uppercase tracking-widest"
            >
                Continue Training
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes chipToPot {
          0% { bottom: 15%; opacity: 1; transform: translateX(-50%) scale(1); }
          100% { bottom: 45%; opacity: 0; transform: translateX(-50%) scale(1.5); }
        }
      `}</style>
    </main>
  );
}
