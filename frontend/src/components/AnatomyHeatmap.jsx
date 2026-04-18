import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineExternalLink } from 'react-icons/hi';
import Model from 'react-body-highlighter';

// Mocked precise recovery data
const MUSCLE_DATA = {
  chest: { name: 'Pectoralis Major', recovery: 85 },
  abs: { name: 'Rectus Abdominis', recovery: 100 },
  'front-deltoids': { name: 'Front Deltoids', recovery: 60 },
  'back-deltoids': { name: 'Rear Deltoids', recovery: 60 },
  biceps: { name: 'Biceps Brachii', recovery: 92 },
  forearm: { name: 'Forearms', recovery: 80 },
  quadriceps: { name: 'Quadriceps', recovery: 65 },
  trapezius: { name: 'Trapezius', recovery: 30 },
  'upper-back': { name: 'Latissimus Dorsi', recovery: 30 },
  'lower-back': { name: 'Lower Back', recovery: 50 },
  triceps: { name: 'Triceps Brachii', recovery: 88 },
  gluteal: { name: 'Gluteus Maximus', recovery: 95 },
  hamstring: { name: 'Hamstrings', recovery: 90 },
  calves: { name: 'Gastrocnemius', recovery: 50 },
};

const TOP_EXERCISES = {
  chest: ['Bench Press', 'Incline DB Press', 'Push-ups'],
  abs: ['Cable Crunches', 'Planks', 'Leg Raises'],
  'front-deltoids': ['Overhead Press', 'Lateral Raises'],
  'back-deltoids': ['Face Pulls', 'Reverse Pec Deck'],
  biceps: ['Barbell Curls', 'Hammer Curls'],
  forearm: ['Wrist Curls', 'Farmers Walk'],
  quadriceps: ['Back Squat', 'Leg Extensions', 'Lunges'],
  trapezius: ['Barbell Shrugs', 'Upright Rows'],
  'upper-back': ['Pull-ups', 'Lat Pulldowns', 'Barbell Rows'],
  'lower-back': ['Deadlifts', 'Back Extensions'],
  triceps: ['Tricep Pushdowns', 'Skull Crushers', 'Dips'],
  gluteal: ['Hip Thrusts', 'RDLs', 'Squats'],
  hamstring: ['RDLs', 'Lying Leg Curls'],
  calves: ['Standing Calf Raises', 'Seated Calf Raises'],
};

export default function AnatomyHeatmap({ onMuscleSelect }) {
  const [hoveredGroup, setHoveredGroup] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [view, setView] = useState('both'); // 'both' | 'front' | 'back'
  const containerRef = useRef(null);

  // Generate 'heatmap' frequency data for pre-filled soreness tint
  const heatmapData = Object.entries(MUSCLE_DATA).filter(([k, v]) => v.recovery <= 65).map(([k, v]) => ({
    name: 'Soreness',
    muscles: [k],
    frequency: v.recovery <= 40 ? 2 : 1 // 2 = Severe (Red), 1 = Moderate (Amber)
  }));

  // Append any currently hovered muscle to give it the maximum frequency (Indigo glow)
  if (hoveredGroup) {
    heatmapData.push({
      name: 'Hovered',
      muscles: [hoveredGroup],
      frequency: 3
    });
  }

  // Bind custom DOM events to react-body-highlighter paths for the "Scrubber" symmetry Logic!
  useEffect(() => {
    if (!containerRef.current) return;
    
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    
    // We bind universally to window moving to update tooltip pos smoothly
    window.addEventListener('mousemove', handleMouseMove);

    const checkHoverIn = (e) => {
      // react-body-highlighter embeds the muscle name in paths className, e.g. "chest" or "left-soleus"
      // or we can read the muscle onClick if clicked. But for hover:
      const rawClass = e.target.getAttribute('class');
      if (!rawClass) return;
      
      // Some muscles are 'left-biceps' or 'right-biceps'. Determine base muscle group for Symmetry!
      let cleanMuscleName = rawClass.replace('left-', '').replace('right-', '').split(' ')[0];
      if (TOP_EXERCISES[cleanMuscleName]) setHoveredGroup(cleanMuscleName);
    };

    const checkHoverOut = () => setHoveredGroup(null);

    const paths = containerRef.current.querySelectorAll('svg path');
    paths.forEach(p => {
      p.addEventListener('mouseenter', checkHoverIn);
      p.addEventListener('mouseleave', checkHoverOut);
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      paths.forEach(p => {
        p.removeEventListener('mouseenter', checkHoverIn);
        p.removeEventListener('mouseleave', checkHoverOut);
      });
    };
  }, [view]);

  return (
    <div className="relative w-full h-full p-5 bg-white rounded-2xl border border-slate-100/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden" ref={containerRef}>
      
      {/* Mobile Toggle */}
      <div className="flex justify-center mb-6 xl:hidden z-10 relative">
        <div className="bg-slate-100 p-1 rounded-xl inline-flex shadow-sm">
          <button onClick={() => setView('front')} className={`px-5 py-2 rounded-lg text-sm font-extrabold transition-all ${view==='front' ? 'bg-white shadow-sm text-brand-primary' : 'text-slate-400'}`}>Front</button>
          <button onClick={() => setView('back')} className={`px-5 py-2 rounded-lg text-sm font-extrabold transition-all ${view==='back' ? 'bg-white shadow-sm text-brand-primary' : 'text-slate-400'}`}>Back</button>
        </div>
      </div>

      {/* Main SVG Area using react-body-highlighter */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 h-full pb-20 justify-items-center relative">
        {(view === 'both' || view === 'front') && (
          <div className="flex flex-col items-center w-full max-w-[280px]">
            <h3 className="text-sm font-bold text-slate-400 mb-2 tracking-widest uppercase">Anterior View</h3>
            <Model
              data={heatmapData}
              style={{ width: '100%', padding: '0', cursor: 'pointer' }}
              bodyColor="#F1F5F9"
              highlightedColors={['#fcd34d', '#fca5a5', '#5C6BC0']}
              type="anterior"
              onClick={(ex) => onMuscleSelect(ex.muscle)}
            />
          </div>
        )}
        
        {(view === 'both' || view === 'back') && (
          <div className="flex flex-col items-center w-full max-w-[280px]">
            <h3 className="text-sm font-bold text-slate-400 mb-2 tracking-widest uppercase">Posterior View</h3>
            <Model
              data={heatmapData}
              style={{ width: '100%', padding: '0', cursor: 'pointer' }}
              bodyColor="#F1F5F9"
              highlightedColors={['#fcd34d', '#fca5a5', '#5C6BC0']}
              type="posterior"
              onClick={(ex) => onMuscleSelect(ex.muscle)}
            />
          </div>
        )}
      </div>

      {/* The Scrubber Tooltip */}
      <AnimatePresence>
        {hoveredGroup && MUSCLE_DATA[hoveredGroup] && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{ left: mousePos.x + 30, top: mousePos.y - 50 }}
            className="fixed z-50 pointer-events-none flex items-center"
          >
            {/* The Thin Lead-Line */}
            <div className="w-8 border-t border-slate-400 shrink-0" />
            
            {/* Floating Data Card */}
            <div className="bg-white/95 backdrop-blur-xl rounded-xl p-[12px] shadow-[0_20px_40px_rgb(0,0,0,0.12)] border border-white min-w-[220px]">
              <div className="flex flex-col mb-2">
                <h4 className="font-semibold text-slate-800 tracking-tight text-sm">
                  {MUSCLE_DATA[hoveredGroup].name}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-sm font-extrabold ${MUSCLE_DATA[hoveredGroup].recovery < 50 ? 'text-red-500' : MUSCLE_DATA[hoveredGroup].recovery < 70 ? 'text-amber-500' : 'text-[#5C6BC0]'}`}>
                    {MUSCLE_DATA[hoveredGroup].recovery}% Recovered
                  </span>
                </div>
              </div>
              
              <div className="h-px w-full bg-slate-100 my-2" />
              
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Top Corrective Exercises</p>
              <ul className="space-y-1 mt-1.5">
                {TOP_EXERCISES[hoveredGroup]?.map((ex, i) => (
                  <li key={i} className="text-xs text-slate-600 font-medium flex items-center gap-2 before:content-[''] before:w-1 before:h-1 before:bg-brand-primary before:rounded-full">
                    {ex}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute bottom-5 left-5 flex gap-5 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-100">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#F1F5F9] border border-slate-200" /><span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Recovered</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#fcd34d]" /><span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Fatigued</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#fca5a5]" /><span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Sore</span></div>
      </div>
    </div>
  );
}
