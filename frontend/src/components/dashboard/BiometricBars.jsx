import { motion } from 'framer-motion';

const BiometricBars = () => {
  const metrics = [
    { label: 'Deep Sleep', score: 92, color: 'bg-brand-primary', glow: 'shadow-[0_0_15px_rgba(37,99,235,0.1)]' },
    { label: 'Stress Index', score: 18, color: 'bg-brand-secondary', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.1)]' },
    { label: 'CNS Fatigue', score: 45, color: 'bg-slate-400', glow: 'shadow-[0_0_15px_rgba(100,116,139,0.1)]' },
  ];

  return (
    <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm h-full hover:shadow-lg transition-all duration-500 flex flex-col justify-between">
      <div>
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">Biometric Pulse</h3>
        <div className="space-y-8">
          {metrics.map((m) => (
            <div key={m.label}>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-3">
                <span className="text-slate-900">{m.label}</span>
                <span className="text-slate-400">{m.score}%</span>
              </div>
              <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${m.score}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={`h-full rounded-full ${m.color} ${m.glow}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
             <span className="animate-pulse font-bold text-lg">●</span>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">System Prediction</p>
            <p className="text-xs text-slate-900 font-bold">Autonomic stability reached in 4h 12m.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiometricBars;
