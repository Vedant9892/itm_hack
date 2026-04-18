import React, { useState } from 'react';
import AnatomyHeatmap from '../components/AnatomyHeatmap';
import { HiOutlineSearch, HiOutlineFilter, HiOutlineBell } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import NeuralSidebar from '../components/dashboard/NeuralSidebar';
import { useSelector } from 'react-redux';

// Mock list of global exercises
const EXERCISE_LIBRARY = [
  { name: 'Bench Press', muscle: 'chest', difficulty: 'Intermediate', tags: ['Barbell', 'Compound'] },
  { name: 'Incline DB Press', muscle: 'chest', difficulty: 'Intermediate', tags: ['Dumbbell', 'Compound'] },
  { name: 'Push-ups', muscle: 'chest', difficulty: 'Beginner', tags: ['Bodyweight', 'Compound'] },
  { name: 'Overhead Press', muscle: 'shoulders', difficulty: 'Advanced', tags: ['Barbell', 'Compound'] },
  { name: 'Lateral Raises', muscle: 'shoulders', difficulty: 'Beginner', tags: ['Dumbbell', 'Isolation'] },
  { name: 'Face Pulls', muscle: 'shoulders', difficulty: 'Intermediate', tags: ['Cable', 'Isolation'] },
  { name: 'Barbell Curls', muscle: 'biceps', difficulty: 'Beginner', tags: ['Barbell', 'Isolation'] },
  { name: 'Hammer Curls', muscle: 'biceps', difficulty: 'Beginner', tags: ['Dumbbell', 'Isolation'] },
  { name: 'Tricep Pushdowns', muscle: 'triceps', difficulty: 'Beginner', tags: ['Cable', 'Isolation'] },
  { name: 'Skull Crushers', muscle: 'triceps', difficulty: 'Intermediate', tags: ['EZ Bar', 'Isolation'] },
  { name: 'Pull-ups', muscle: 'lats', difficulty: 'Advanced', tags: ['Bodyweight', 'Compound'] },
  { name: 'Lat Pulldowns', muscle: 'lats', difficulty: 'Beginner', tags: ['Cable', 'Compound'] },
  { name: 'Back Squat', muscle: 'quads', difficulty: 'Advanced', tags: ['Barbell', 'Compound'] },
  { name: 'Leg Extensions', muscle: 'quads', difficulty: 'Beginner', tags: ['Machine', 'Isolation'] },
  { name: 'RDLs', muscle: 'hamstrings', difficulty: 'Intermediate', tags: ['Barbell', 'Compound'] },
  { name: 'Standing Calf Raises', muscle: 'calves', difficulty: 'Beginner', tags: ['Machine', 'Isolation'] },
  { name: 'Cable Crunches', muscle: 'abs', difficulty: 'Intermediate', tags: ['Cable', 'Isolation'] },
];

/* ── SHARED DASHBOARD UI COMPONENTS ── */
const TileCard = ({ children, className = '' }) => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
    className={`bg-white rounded-2xl border border-slate-100/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col ${className}`}>
    {children}
  </motion.div>
);

const TileHeader = ({ title, sub, icon }) => (
  <div className="px-5 pt-5 pb-3 flex justify-between items-start border-b border-slate-50">
    <div>
      <h3 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-2">
        {title}
      </h3>
      {sub && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{sub}</p>}
    </div>
    {icon && <div className="text-slate-400 text-lg bg-slate-50 p-1.5 rounded-lg border border-slate-100">{icon}</div>}
  </div>
);

export default function AnatomyPage() {
  const [filterMuscle, setFilterMuscle] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useSelector(s => s.auth);

  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });

  const filteredExercises = filterMuscle 
    ? EXERCISE_LIBRARY.filter(ex => ex.muscle === filterMuscle)
    : EXERCISE_LIBRARY;

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden" style={{ zoom: 1.05 }}>
      <NeuralSidebar isCollapsed={collapsed} onToggle={() => setCollapsed(p => !p)} />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Unified Dashboard Header */}
        <header className="bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-lg font-extrabold text-slate-900">Anatomical Command Center</h1>
            <p className="text-xs text-slate-400 font-medium">{dayName}, {now.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-brand-primary hover:border-brand-primary transition-all">
              <HiOutlineBell className="text-lg" />
            </button>
            <div className="flex items-center gap-4 pl-4 border-l border-slate-100">
              <button onClick={() => setFilterMuscle(null)} className="px-4 py-1.5 rounded-lg text-[10px] font-bold text-slate-50 border border-brand-primary bg-brand-primary hover:bg-indigo-700 transition-colors uppercase tracking-widest shadow-sm shadow-indigo-200">
                Reset Filters
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-primary flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  {user?.name?.[0] ?? 'U'}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 leading-tight">{user?.name ?? 'Athlete'}</p>
                  <p className="text-[10px] text-slate-400">Pro Plan</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ── MAIN CONTENT AREA ── */}
        <div className="flex-1 overflow-y-auto bg-slate-50 relative">
          <div className="absolute top-0 w-full h-64 bg-gradient-to-b from-white to-transparent pointer-events-none" />
          <div className="p-6 relative z-10 max-w-7xl mx-auto h-[1000px] xl:h-[800px] flex flex-col gap-6">
            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
              
              {/* Left Col: The Interactive Heatmap */}
              <TileCard className="xl:col-span-2 h-full">
                <TileHeader title="Interactive Form Model" sub="Live Symmetry & Soreness Map" icon={<HiOutlineSearch />} />
                <div className="flex-1 relative overflow-hidden bg-white">
                  <AnatomyHeatmap onMuscleSelect={(muscle) => setFilterMuscle(muscle)} />
                </div>
              </TileCard>

              {/* Right Col: The Exercise Library strictly linked via Filter Event */}
              <TileCard className="h-full">
                <TileHeader title="Targeted Exercise Matrix" sub="Auto-filtered protocols" icon={<HiOutlineFilter />} />
                <div className="px-5 pb-3 pt-2">
                  {filterMuscle ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-brand-primary bg-indigo-50 px-2.5 py-1 rounded-md uppercase tracking-wider border border-indigo-100 shadow-sm">
                        FILTERED: {filterMuscle}
                      </span>
                      <button onClick={() => setFilterMuscle(null)} className="text-[10px] font-bold text-slate-400 hover:text-rose-500 hover:bg-rose-50 px-2 py-1 rounded-md transition-colors">Clear</button>
                    </div>
                  ) : (
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Showing all available movements</p>
                  )}

                  {/* Search Bar mimic */}
                  <div className="mt-3 relative flex items-center transition-all bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-primary/20 rounded-xl px-3 py-2 border border-slate-200 focus-within:border-brand-primary shadow-inner shadow-slate-100/50">
                    <HiOutlineSearch className="text-slate-400 mr-2" />
                    <input type="text" placeholder="Search operations..." className="bg-transparent border-none outline-none text-xs w-full font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-medium" />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-2 relative">
                <AnimatePresence mode="popLayout">
                  {filteredExercises.map((ex, i) => (
                    <motion.div 
                      key={ex.name + i}
                      layout
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                      className="group p-3 rounded-xl border border-slate-100 hover:border-brand-primary/30 hover:shadow-sm transition-all cursor-pointer bg-white"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-xs font-bold text-slate-800">{ex.name}</h4>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${ex.difficulty === 'Beginner' ? 'bg-emerald-50 text-emerald-600' : ex.difficulty === 'Intermediate' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
                          {ex.difficulty}
                        </span>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {ex.tags.map(tag => (
                          <span key={tag} className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                  {filteredExercises.length === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                      <div className="w-12 h-12 rounded-full bg-slate-50 mb-3 flex items-center justify-center border border-slate-100">
                        <HiOutlineFilter className="text-slate-300 text-xl" />
                      </div>
                      <p className="text-slate-400 text-xs font-bold">No active exercises found for '{filterMuscle}'.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </TileCard>

          </div>
        </div>
      </div>
      </main>
    </div>
  );
}
