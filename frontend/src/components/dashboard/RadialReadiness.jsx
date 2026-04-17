import { motion } from 'framer-motion';

const RadialReadiness = ({ score = 82 }) => {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm h-full hover:shadow-lg hover:scale-[1.01] transition-all duration-500 overflow-hidden group">
      
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-brand-primary/5 rounded-full blur-3xl -z-10 group-hover:bg-brand-primary/10 transition-colors" />

      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">Intelligence Readiness</h3>
      
      <div className="relative w-48 h-48">
        <svg className="w-full h-full -rotate-90">
          {/* Background Circle */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth="12"
          />
          {/* Progress Circle */}
          <motion.circle
            cx="96"
            cy="96"
            r={radius}
            fill="transparent"
            stroke="url(#readinessGradientLight)"
            strokeWidth="12"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 2, ease: "easeOut" }}
            strokeLinecap="round"
            className="drop-shadow-[0_0_8px_rgba(37,99,235,0.2)]"
          />
          <defs>
            <linearGradient id="readinessGradientLight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </svg>

        {/* Score Text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <motion.span 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="text-5xl font-extrabold text-slate-900 tracking-tighter"
          >
            {score}%
          </motion.span>
          <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest mt-1">Optimal State</p>
        </div>

        {/* Secondary Rings Info */}
        <div className="absolute -left-12 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group/sleep">
           <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Sleep</p>
           <p className="text-sm font-extrabold text-slate-800">92%</p>
           <div className="w-1.5 h-1.5 bg-brand-primary rounded-full" />
        </div>
        <div className="absolute -right-12 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
           <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Recov</p>
           <p className="text-sm font-extrabold text-brand-secondary">85%</p>
           <div className="w-1.5 h-1.5 bg-brand-secondary rounded-full" />
        </div>
      </div>

      <div className="mt-10 p-4 bg-slate-50 rounded-2xl border border-slate-100 w-full">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse" />
          Daily Directive
        </p>
        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          You are primed for high-intensity. We have increased your target volume by 10%.
        </p>
      </div>

    </div>
  );
};

export default RadialReadiness;
