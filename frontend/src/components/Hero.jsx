import { motion } from 'framer-motion';
import { HiArrowRight, HiShieldCheck } from 'react-icons/hi2';
import heroImg from '../assets/hero_bg.png';

const Hero = () => {
  return (
    <section className="relative pt-12 pb-24 md:pt-24 md:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Content */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-brand-primary text-sm font-bold mb-6">
              <HiShieldCheck className="text-lg" />
              <span>Next-Gen Health Intelligence</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] mb-8 tracking-tight">
              Precision Care for a <br />
              <span className="text-gradient">Healthier Future.</span>
            </h1>
            
            <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-lg">
              Unlock personalized health insights powered by AI. We bridge the gap between complex biometric data and actionable clinical reasoning.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="btn-primary text-lg px-8 py-4">
                Start Your Analysis <HiArrowRight />
              </button>
              <button className="btn-secondary text-lg px-8 py-4">
                View Demo
              </button>
            </div>
            
            <div className="mt-12 flex items-center gap-4 text-sm text-brand-muted">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
                ))}
              </div>
              <span>Trusted by <strong>10,000+</strong> users worldwide</span>
            </div>
          </motion.div>
        </div>

        {/* Right Content - Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white">
            <img 
              src={heroImg} 
              alt="Health Tech Hero" 
              className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700" 
            />
          </div>
          
          {/* Decorative Blooms */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl -z-10" />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-brand-secondary/10 rounded-full blur-3xl -z-10" />
          
          {/* Floating Stat Card */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 -left-8 glass-card p-4 rounded-2xl flex items-center gap-4 animate-pulse"
          >
            <div className="w-10 h-10 bg-brand-secondary rounded-lg flex items-center justify-center text-white">
              <HiShieldCheck className="text-xl" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Health Score</p>
              <p className="text-lg font-bold">98.2%</p>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;
