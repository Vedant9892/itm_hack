import { motion } from 'framer-motion';

const ActivityIntensity = () => {
  const data = [
    { day: 'Mon', value: 45, intensity: 'high' },
    { day: 'Tue', value: 80, intensity: 'peak' },
    { day: 'Wed', value: 30, intensity: 'low' },
    { day: 'Thu', value: 65, intensity: 'high' },
    { day: 'Fri', value: 90, intensity: 'peak' },
    { day: 'Sat', value: 40, intensity: 'low' },
    { day: 'Sun', value: 20, intensity: 'recovery' },
  ];

  const getColor = (intensity) => {
    switch (intensity) {
      case 'peak': return 'bg-brand-primary';
      case 'high': return 'bg-brand-primary/60';
      case 'low': return 'bg-brand-secondary/60';
      case 'recovery': return 'bg-slate-200';
      default: return 'bg-slate-100';
    }
  };

  return (
    <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm h-full flex flex-col hover:shadow-lg transition-all duration-500 overflow-hidden relative group">
      
      <div className="flex justify-between items-start mb-10">
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Activity Analytics</h3>
          <p className="text-sm font-bold text-slate-900">Weekly Intensity Distribution</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-brand-primary">3,420</p>
          <p className="text-[9px] font-bold text-slate-400 uppercase">Kcal / Week</p>
        </div>
      </div>

      <div className="flex-1 flex items-end justify-between gap-2 px-2">
        {data.map((d, i) => (
          <div key={d.day} className="flex-1 flex flex-col items-center gap-3">
             <div className="w-full relative group/bar">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${d.value}%` }}
                  transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                  className={`w-full rounded-t-xl ${getColor(d.intensity)} transition-all hover:brightness-110 cursor-pointer relative`}
                >
                   {/* Value Tooltip Hover */}
                   <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20">
                      {d.value} min
                   </div>
                </motion.div>
             </div>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{d.day}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
               <div className="w-2 h-2 rounded-full bg-brand-primary" />
               <span className="text-[9px] font-bold text-slate-500 uppercase">High</span>
            </div>
            <div className="flex items-center gap-1.5">
               <div className="w-2 h-2 rounded-full bg-slate-200" />
               <span className="text-[9px] font-bold text-slate-500 uppercase">Low</span>
            </div>
         </div>
         <button className="text-[10px] font-bold text-brand-primary hover:underline">Full Report</button>
      </div>

    </div>
  );
};

export default ActivityIntensity;
