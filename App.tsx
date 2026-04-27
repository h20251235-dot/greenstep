/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cloud, 
  Sun, 
  Droplets, 
  Navigation, 
  X, 
  CheckCircle2, 
  Wind,
  Sparkles,
  TreeDeciduous,
  Flower2,
  ChevronRight
} from 'lucide-react';
import { 
  TransportType, 
  TRANSPORT_OPTIONS, 
  GardenState, 
  GardenItem, 
  GardenItemType 
} from './types';

// Growth stage mapping
const STAGES = [
  { flower: '🌱', tree: '🌱' },
  { flower: '🌷', tree: '🌿' },
  { flower: '🌸', tree: '🌳' }
];

export default function App() {
  // --- State ---
  const [garden, setGarden] = useState<GardenState>({
    items: [],
    carbonTotal: 0,
    sunlight: 5,
    water: 5,
    smogLevel: 0,
    fConsecutive: 0
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransport, setSelectedTransport] = useState<TransportType | null>(null);
  const [distance, setDistance] = useState<string>('');
  const [showReward, setShowReward] = useState<{sun: number, water: number} | null>(null);

  // --- Actions ---
  const handleStartTrip = () => {
    if (!selectedTransport || !distance) return;

    const transport = TRANSPORT_OPTIONS.find(t => t.id === selectedTransport)!;
    const distNum = parseFloat(distance);
    const emissionTotal = transport.emission * distNum;

    setGarden(prev => {
      let newFConsecutive = prev.fConsecutive;
      let newSmogLevel = prev.smogLevel;

      if (transport.grade === 'F') {
        newFConsecutive += 1;
        if (newFConsecutive >= 2) {
          newSmogLevel = Math.min(100, newSmogLevel + 30);
        }
      } else if (transport.grade === 'A') {
        newFConsecutive = 0;
        newSmogLevel = Math.max(0, newSmogLevel - 20);
      } else {
        newFConsecutive = 0;
      }

      // Random Rewards
      const sunReward = Math.floor(Math.random() * 3) + 1;
      const waterReward = Math.floor(Math.random() * 3) + 1;
      setShowReward({ sun: sunReward, water: waterReward });

      // Create new life based on trip
      // Higher chance if eco-friendly
      const spawnChance = (transport.grade === 'A' || transport.grade === 'B') ? 1.0 : 0.4;
      const newItems = [...prev.items];
      
      if (Math.random() < spawnChance) {
        const type: GardenItemType = Math.random() > 0.5 ? 'flower' : 'tree';
        newItems.push({
          id: Date.now().toString(),
          type,
          stage: 0,
          experience: 0,
          position: { 
            x: 10 + Math.random() * 80, 
            y: 45 + Math.random() * 35 
          }
        });
      }

      return {
        ...prev,
        items: newItems,
        carbonTotal: prev.carbonTotal + (emissionTotal / 1000),
        sunlight: prev.sunlight + sunReward,
        water: prev.water + waterReward,
        fConsecutive: newFConsecutive,
        smogLevel: newSmogLevel
      };
    });

    setIsModalOpen(false);
    setSelectedTransport(null);
    setDistance('');
  };

  const nurtureItem = (itemId: string, resource: 'sun' | 'water') => {
    if (garden.smogLevel >= 50) return;
    
    setGarden(prev => {
      if (resource === 'sun' && prev.sunlight <= 0) return prev;
      if (resource === 'water' && prev.water <= 0) return prev;

      return {
        ...prev,
        sunlight: resource === 'sun' ? prev.sunlight - 1 : prev.sunlight,
        water: resource === 'water' ? prev.water - 1 : prev.water,
        items: prev.items.map(item => {
          if (item.id !== itemId) return item;
          
          let newExp = item.experience + 25;
          let newStage = item.stage;
          if (newExp >= 100) {
            newExp = 0;
            newStage = Math.min(2, newStage + 1);
          }
          return { ...item, stage: newStage, experience: newExp };
        })
      };
    });
  };

  return (
    <div className="relative w-full h-screen overflow-hidden font-sans">
      {/* Background Gradient */}
      <div 
        className="absolute inset-0 transition-colors duration-1000"
        style={{
          background: `linear-gradient(135deg, 
            ${garden.smogLevel > 50 ? '#9ca3af' : '#E9D5FF'} 0%, 
            ${garden.smogLevel > 50 ? '#4b5563' : '#D1FAE5'} 100%)`
        }}
      />

      {/* Floating Particles */}
      <AnimatePresence>
        {garden.smogLevel < 50 && Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: [0, 0.4, 0], y: -100, x: Math.sin(i) * 50 }}
            transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "linear", delay: i * 1.5 }}
            className="absolute w-2 h-2 bg-white rounded-full blur-[1px]"
            style={{ left: `${10 + i * 12}%`, bottom: '-5%' }}
          />
        ))}
      </AnimatePresence>

      {/* Smog Layer */}
      {garden.smogLevel > 0 && <div className="smog-layer" style={{ opacity: garden.smogLevel / 100 }} />}

      {/* --- UI Header --- */}
      <div className="relative z-10 p-6 flex justify-between items-start pt-12">
        <div className="glass rounded-3xl p-4 flex flex-col gap-1 min-w-[150px]">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-600">
            <Cloud className="w-4 h-4" /> 탄소 배출량
          </div>
          <div className="text-2xl font-display font-bold">
            {garden.carbonTotal.toFixed(2)} <span className="text-sm font-normal">kg</span>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="glass rounded-full px-4 py-2 flex items-center gap-2">
            <Sun className="w-4 h-4 text-orange-400" />
            <span className="font-bold">{garden.sunlight}</span>
          </div>
          <div className="glass rounded-full px-4 py-2 flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-400" />
            <span className="font-bold">{garden.water}</span>
          </div>
        </div>
      </div>

      {/* --- Garden View --- */}
      <div className="absolute inset-0 flex items-center justify-center pt-24 pointer-events-none">
        {garden.items.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} className="text-center">
            <p className="font-display italic text-gray-500 text-lg">당신의 첫 걸음으로 숲을 완성해보세요.</p>
          </motion.div>
        )}
        <div className="relative w-full h-full max-w-2xl mx-auto">
          {garden.items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1, filter: garden.smogLevel > 70 ? 'grayscale(0.8) contrast(0.8)' : 'none' }}
              style={{ left: `${item.position.x}%`, top: `${item.position.y}%` }}
              className="absolute cursor-pointer pointer-events-auto group"
              onClick={() => nurtureItem(item.id, garden.sunlight >= garden.water ? 'sun' : 'water')}
            >
              <div className="relative">
                <div className="text-6xl animate-float transition-all duration-500 hover:scale-110">
                  {item.type === 'flower' ? STAGES[item.stage].flower : STAGES[item.stage].tree}
                </div>
                {garden.smogLevel < 50 && (
                  <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 2, repeat: Infinity }} className="absolute -inset-4 bg-white/20 blur-xl rounded-full -z-10" />
                )}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-white/20 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-400 transition-all duration-300" style={{ width: `${item.experience}%` }} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Smog Warning */}
      <AnimatePresence>
        {garden.smogLevel >= 50 && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="absolute top-32 left-1/2 -translate-x-1/2 z-20 px-6 py-2 bg-gray-800/80 text-white rounded-full flex items-center gap-2 backdrop-blur-sm">
            <Wind className="w-4 h-4 text-gray-300 animate-pulse" />
            <span className="text-sm font-medium">강한 매연으로 정원이 성장을 멈췄습니다.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Bottom Controls --- */}
      <div className="absolute bottom-12 left-0 w-full flex flex-col items-center gap-6 px-6">
        <button onClick={() => setIsModalOpen(true)} className="glass hover:bg-white/40 transition-all rounded-full px-12 py-5 flex items-center gap-3 active:scale-95 group">
          <div className="bg-mystic-deep p-2 rounded-full text-white shadow-lg shadow-mystic-deep/20 group-hover:rotate-12 transition-transform">
            <Navigation className="w-6 h-6 fill-current" />
          </div>
          <span className="text-xl font-display font-bold tracking-tight">지금 출발하기</span>
        </button>
      </div>

      {/* --- Modals --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass p-8 rounded-[40px] w-full max-w-md relative z-10"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-display font-bold">어디로 가시나요?</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-black/5 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Transport Grid */}
              <div className="grid grid-cols-4 gap-3 mb-8">
                {TRANSPORT_OPTIONS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedTransport(item.id)}
                    className={`flex flex-col items-center p-3 rounded-2xl transition-all ${
                      selectedTransport === item.id 
                        ? 'bg-mystic-deep text-white shadow-lg' 
                        : 'bg-white/40 hover:bg-white/60'
                    }`}
                  >
                    <span className="text-2xl mb-1">{item.emoji}</span>
                    <span className="text-[10px] whitespace-nowrap font-medium">{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2 px-1">이동 거리 (km)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                      placeholder="얼마나 가시나요?"
                      className="w-full bg-white/50 border border-white/20 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-mystic-deep/30 transition-all font-display text-lg"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-gray-400">km</span>
                  </div>
                </div>

                <button
                  disabled={!selectedTransport || !distance}
                  onClick={handleStartTrip}
                  className="w-full bg-mystic-deep text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-mystic-deep/20 flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50 disabled:grayscale"
                >
                  출발하기 <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- Reward Notification --- */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: -20 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-[60] glass px-8 py-4 rounded-3xl flex flex-col items-center gap-2"
            onAnimationComplete={() => setTimeout(() => setShowReward(null), 3000)}
          >
            <div className="flex items-center gap-2 text-green-600 font-bold mb-1">
              <CheckCircle2 className="w-5 h-5" /> 정원 선물을 받았어요!
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-lg font-bold">
                <Sun className="w-6 h-6 text-orange-400" /> +{showReward.sun}
              </div>
              <div className="flex items-center gap-2 text-lg font-bold">
                <Droplets className="w-6 h-6 text-blue-400" /> +{showReward.water}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-0 opacity-10 pointer-events-none">
        <h1 className="text-8xl font-display font-black whitespace-nowrap">GREEN STEP</h1>
      </div>
    </div>
  );
}
