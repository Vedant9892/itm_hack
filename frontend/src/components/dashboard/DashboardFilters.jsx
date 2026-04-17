import { motion } from 'framer-motion';

const DashboardFilters = ({ activeRange, setRange }) => {
  const ranges = ['Daily', 'Weekly', 'Monthly'];

  return (
    <div className="flex items-center gap-1 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200 w-fit">
      {ranges.map((range) => (
        <button
          key={range}
          onClick={() => setRange(range)}
          className={`relative px-6 py-2 rounded-xl text-xs font-bold transition-all ${
            activeRange === range ? 'text-white' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {activeRange === range && (
            <motion.div
              layoutId="activeRange"
              className="absolute inset-0 bg-slate-900 rounded-xl shadow-lg shadow-slate-900/10"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">{range}</span>
        </button>
      ))}
    </div>
  );
};

export default DashboardFilters;
