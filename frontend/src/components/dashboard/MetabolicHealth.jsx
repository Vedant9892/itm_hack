import { 
  HiOutlineHeart, 
  HiOutlineChartBar, 
  HiOutlineSun,
  HiOutlineScale
} from 'react-icons/hi2';

const MetabolicHealth = () => {
  const stats = [
    { label: 'HRV', value: '64 ms', trend: '+12%', status: 'optimal', icon: <HiOutlineHeart />, color: 'text-brand-primary', bg: 'bg-brand-primary/5' },
    { label: 'SpO2', value: '98%', trend: 'stable', status: 'normal', icon: <HiOutlineChartBar />, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
    { label: 'Body Temp', value: '36.6 C', trend: '-0.1', status: 'optimal', icon: <HiOutlineSun />, color: 'text-amber-500', bg: 'bg-amber-500/5' },
    { label: 'Metabolism', value: 'BMR+', trend: '+200', status: 'active', icon: <HiOutlineScale />, color: 'text-indigo-500', bg: 'bg-indigo-500/5' },
  ];

  return (
    <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm h-full hover:shadow-lg transition-all duration-500">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">Metabolic Intelligence</h3>
      
      <div className="grid grid-cols-2 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="group">
             <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center text-xl transition-transform group-hover:scale-110`}>
                   {stat.icon}
                </div>
                <div>
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                   <p className="text-lg font-extrabold text-slate-900 leading-none">{stat.value}</p>
                </div>
             </div>
             <div className="flex items-center justify-between">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-lg bg-slate-50 ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-slate-400'}`}>
                   {stat.trend}
                </span>
                <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">{stat.status}</span>
             </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
         <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Your HRV trend is <span className="text-brand-primary font-bold">12% higher</span> than your baseline. CNS recovery is proceeding better than expected.
         </p>
      </div>
    </div>
  );
};

export default MetabolicHealth;
