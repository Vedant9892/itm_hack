import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { 
  HiOutlineUserCircle, 
  HiOutlineBell,
  HiOutlineChevronRight,
  HiOutlineFire,
  HiOutlineArrowPathRoundedSquare,
  HiOutlineLightBulb,
  HiOutlineMagnifyingGlass
} from 'react-icons/hi2';

// High-Density Analytics Components
import NeuralSidebar from '../components/dashboard/NeuralSidebar';
import RadialReadiness from '../components/dashboard/RadialReadiness';
import BiometricBars from '../components/dashboard/BiometricBars';
import RecoveryWireframe from '../components/dashboard/RecoveryWireframe';
import PredictiveChart from '../components/dashboard/PredictiveChart';
import DashboardFilters from '../components/dashboard/DashboardFilters';
import ActivityIntensity from '../components/dashboard/ActivityIntensity';
import MetabolicHealth from '../components/dashboard/MetabolicHealth';

const UserDashboard = () => {
  const [isCollapsed, setCollapsed] = useState(false);
  const [activeRange, setRange] = useState('Weekly');
  const { user } = useSelector((state) => state.auth);

  const smartSwaps = [
    { from: 'Barbell Squat', to: 'Hack Squat', reason: 'Lower Back Fatigue detected' },
    { from: 'Flat Bench', to: 'Incline Dumbbell', reason: 'Shoulder stability optimization' },
  ];

  return (
    <div className="flex h-screen bg-brand-bg text-slate-600 overflow-hidden font-sans">
      
      <NeuralSidebar isCollapsed={isCollapsed} setCollapsed={setCollapsed} />

      {/* Main Experience Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Industry-Grade Header */}
        <header className="h-20 px-10 flex items-center justify-between bg-white border-b border-slate-100 z-40 shrink-0">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
               Intelligence Dashboard
            </h1>
            <div className="hidden xl:flex items-center bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl text-slate-400 gap-3 w-80">
               <HiOutlineMagnifyingGlass className="text-lg" />
               <input type="text" placeholder="Search analytics..." className="bg-transparent border-none outline-none text-xs font-medium w-full" />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-3 pr-6 border-r border-slate-100">
               <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                       <img src={`https://i.pravatar.cc/150?u=${i+10}`} alt="team" />
                    </div>
                  ))}
               </div>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">+12 Online</span>
            </div>

            <button className="relative p-2.5 hover:bg-slate-50 rounded-xl transition-colors group">
              <HiOutlineBell className="text-xl text-slate-400 group-hover:text-brand-primary" />
              <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-brand-primary rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-4 pl-4">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/10 flex items-center justify-center text-brand-primary text-xl">
                 <HiOutlineUserCircle />
              </div>
            </div>
          </div>
        </header>

        {/* Filters & Subheader */}
        <div className="px-10 py-6 bg-white border-b border-slate-50 flex flex-wrap items-center justify-between gap-4 shrink-0">
           <DashboardFilters activeRange={activeRange} setRange={setRange} />
           
           <div className="flex items-center gap-4">
              <div className="text-right">
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Last Update</p>
                 <p className="text-xs font-bold text-slate-900 leading-none">Just Now</p>
              </div>
              <button className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 transition-all">
                 Download Report
              </button>
           </div>
        </div>

        {/* High-Density Bento Grid Content */}
        <main className="flex-1 overflow-y-auto p-10 custom-scrollbar relative z-10 bg-[#fbfcfd]">
          <div className="max-w-[1600px] mx-auto space-y-8">
            
            {/* Executive Summary Card */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
               <div className="lg:col-span-1 bg-white p-6 rounded-[2rem] border border-slate-100 flex flex-col justify-between shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-6">
                     <HiOutlineLightBulb className="text-xl" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-2">Executive Summary</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                     Your autonomic stability has increased by <span className="text-brand-primary font-bold">8.4%</span> this week. Recommend maintaining current recovery protocols.
                  </p>
                  <button className="text-[10px] font-bold text-brand-primary flex items-center gap-1 group">
                     Detail Insight <HiOutlineChevronRight className="group-hover:translate-x-1 transition-transform" />
                  </button>
               </div>

               <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Energy Burned</p>
                     <h2 className="text-3xl font-extrabold text-slate-900">12,450 <span className="text-sm font-medium text-slate-400">kcal</span></h2>
                     <div className="mt-4 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-50 rounded-full overflow-hidden">
                           <div className="h-full bg-brand-primary w-[75%]" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-900">75%</span>
                     </div>
                  </div>
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Training Load</p>
                     <h2 className="text-3xl font-extrabold text-brand-secondary">Optimal <span className="text-sm font-medium text-slate-400">Range</span></h2>
                     <div className="mt-4 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-50 rounded-full overflow-hidden">
                           <div className="h-full bg-brand-secondary w-[85%]" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-900">85%</span>
                     </div>
                  </div>
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Distance</p>
                     <h2 className="text-3xl font-extrabold text-slate-900">42.8 <span className="text-sm font-medium text-slate-400">km</span></h2>
                     <div className="mt-4 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-50 rounded-full overflow-hidden">
                           <div className="h-full bg-amber-500 w-[60%]" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-900">60%</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Main Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left & Middle Column (Span 2) */}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="md:col-span-2">
                    <RadialReadiness />
                 </div>
                 <div className="md:col-span-1">
                    <MetabolicHealth />
                 </div>
                 <div className="md:col-span-1">
                    <ActivityIntensity />
                 </div>
                 <div className="md:col-span-2">
                    <RecoveryWireframe />
                 </div>
              </div>

              {/* Right Column (Span 1) */}
              <div className="lg:col-span-1 space-y-8">
                 <BiometricBars />
                 
                 {/* Adaptation Log */}
                 <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-500">
                    <div className="flex justify-between items-center mb-6">
                       <h3 className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.2em] flex items-center gap-2">
                         <HiOutlineArrowPathRoundedSquare /> Adaptation Log
                       </h3>
                    </div>
                    <div className="space-y-4">
                      {smartSwaps.map((swap) => (
                        <div key={swap.from} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:border-brand-primary/20 transition-all">
                          <div className="flex items-center justify-between mb-2">
                             <span className="text-xs font-bold text-slate-400 line-through">{swap.from}</span>
                             <HiOutlineChevronRight className="text-brand-primary" />
                             <span className="text-xs font-bold text-slate-900">{swap.to}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">Reason: {swap.reason}</p>
                        </div>
                      ))}
                    </div>
                 </div>

                 <PredictiveChart />
              </div>

            </div>

            {/* Tactical Action Bar */}
            <div className="flex justify-center py-6">
                <motion.button 
                   whileHover={{ scale: 1.02, y: -2 }}
                   whileTap={{ scale: 0.98 }}
                   className="px-10 py-5 bg-slate-900 rounded-2xl text-white font-bold uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-slate-900/20 hover:shadow-slate-900/30 transition-all flex items-center gap-4 group"
                 >
                   <HiOutlineFire className="text-xl text-brand-secondary group-hover:animate-bounce" />
                   Initiate High-Performance Protocol
                   <HiOutlineChevronRight className="group-hover:translate-x-1 transition-transform" />
                 </motion.button>
            </div>

          </div>
        </main>

      </div>
    </div>
  );
};

export default UserDashboard;
