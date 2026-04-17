import { motion } from 'framer-motion';
import wireframeImg from '../../assets/human_wireframe.png';

const RecoveryWireframe = () => {
  return (
    <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm h-full hover:shadow-lg transition-all duration-500 relative overflow-hidden flex flex-col">
      
      <div className="flex justify-between items-start z-10">
        <div>
          <h3 className="text-[10px] font-bold text-brand-secondary uppercase tracking-[0.2em] mb-2">Anatomical Recovery</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Structural Intelligence</p>
        </div>
        <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-6 h-6 rounded-full bg-slate-50 border border-slate-200" />
            ))}
        </div>
      </div>

      <div className="flex-1 relative flex items-center justify-center py-4">
        {/* The Medical Wireframe Image - adjusted for light theme */}
        <img 
          src={wireframeImg} 
          alt="Anatomical Wireframe" 
          className="h-full object-contain opacity-80 invert grayscale brightness-125 hover:grayscale-0 hover:invert-0 transition-all duration-700"
        />

        {/* Dynamic Highlight Overlays */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Example: Highlighted Quads (Amber/Fatigued) */}
          <motion.div 
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-[60%] w-12 h-16 bg-amber-500/20 blur-xl rounded-full"
          />
          {/* Example: Highlighted Chest (Emerald/Recovered) */}
          <motion.div 
            animate={{ opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-[35%] w-16 h-12 bg-emerald-500/20 blur-xl rounded-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6 z-10">
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
           <p className="text-[9px] font-bold text-brand-secondary uppercase tracking-widest mb-1">Recovered</p>
           <p className="text-xs text-slate-900 font-bold">Chest, Triceps</p>
        </div>
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
           <p className="text-[9px] font-bold text-amber-600 uppercase tracking-widest mb-1">Fatigued</p>
           <p className="text-xs text-slate-900 font-bold">Quadriceps</p>
        </div>
      </div>

    </div>
  );
};

export default RecoveryWireframe;
