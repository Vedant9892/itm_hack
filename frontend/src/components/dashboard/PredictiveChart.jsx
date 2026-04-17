import { motion } from 'framer-motion';

const PredictiveChart = () => {
  // Simple Path for the Strength vs Fatigue Trend
  const strengthPath = "M 0 60 Q 40 40, 80 50 T 160 30 T 240 40 T 320 10 T 400 20";
  const fatiguePath = "M 0 80 Q 40 90, 80 70 T 160 85 T 240 75 T 320 90 T 400 95";

  return (
    <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm h-full hover:shadow-lg transition-all duration-500 flex flex-col justify-between overflow-hidden relative group">
      
      <div className="z-10">
        <h3 className="text-[10px] font-bold text-brand-primary uppercase tracking-[0.2em] mb-1">Predictive Analytics</h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Strength vs Fatigue 7-Day Trend</p>
      </div>

      <div className="flex-1 py-10 relative">
        <svg viewBox="0 0 400 100" className="w-full h-full overflow-visible">
          {/* Grid Lines */}
          <line x1="0" y1="25%" x2="400" y2="25%" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="0" y1="50%" x2="400" y2="50%" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="0" y1="75%" x2="400" y2="75%" stroke="#f1f5f9" strokeWidth="1" />

          {/* Fatigue Line */}
          <motion.path
            d={fatiguePath}
            fill="transparent"
            stroke="#f43f5e"
            strokeWidth="3"
            strokeOpacity="0.2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2 }}
          />
          {/* Strength Line */}
          <motion.path
            d={strengthPath}
            fill="transparent"
            stroke="url(#chartGradientLight)"
            strokeWidth="4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 0.5 }}
            className="drop-shadow-[0_4px_8px_rgba(37,99,235,0.1)]"
          />
          <defs>
            <linearGradient id="chartGradientLight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 z-10">
        <div className="flex justify-between items-center mb-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Projection</p>
          <span className="text-[10px] text-brand-secondary font-bold">+12Kg Gain</span>
        </div>
        <p className="text-xs text-slate-900 font-bold">Predicted 100kg Bench Press: 14 Days Remaining.</p>
      </div>

      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl -z-10 group-hover:bg-brand-primary/10 transition-colors" />
    </div>
  );
};

export default PredictiveChart;
