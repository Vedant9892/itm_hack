import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setWorkoutLoading, setTodayWorkout, setTodayReadiness } from '../store/slices/workoutSlice';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineUser, HiOutlineScale, HiOutlineLightningBolt,
  HiOutlineShieldCheck, HiOutlineBeaker, HiOutlineCheckCircle,
  HiChevronRight, HiChevronLeft, HiOutlineX, HiPlus, HiTrash, HiOutlineHeart
} from 'react-icons/hi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai'; // For loading state
import { onBoarding } from '../services/onboardingService'; // Import your service
import { toast } from 'sonner';


const theme = {
  bg: 'bg-brand-bg',
  surface: 'bg-brand-surface',
  primary: 'text-brand-primary',
  primaryBg: 'bg-brand-primary',
  border: 'border-slate-200',
  muted: 'text-slate-500'
};

const STEPS = [
  { id: 'identity', title: 'Identity', icon: <HiOutlineUser /> },
  { id: 'biometrics', title: 'Biometrics', icon: <HiOutlineScale /> },
  { id: 'physical', title: 'Physical Status', icon: <HiOutlineShieldCheck /> },
  { id: 'context', title: 'Environment', icon: <HiOutlineBeaker /> },
  { id: 'assessment', title: 'Strength', icon: <HiOutlineLightningBolt /> },
  { id: 'readiness', title: 'Readiness', icon: <HiOutlineHeart /> }
];

export default function StartupOnboarding({ isOpen, onClose }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { userId } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    userId: userId || "",
    fullName: '',
    weight: 0,
    height: 0,
    gender: 'male',
    injuries: [],
    workoutType: 'home',
    equipment: [],
    goal: 'muscle_gain',
    strengthAssessment: {
      pushups: 0,
      squats: 0,
      plankSeconds: 0
    },
    todayReadiness: {
      stress: 1,
      energy: 1,
      soreness: 1,
      sleepDuration: 8
    }
  });

  const [tempInput, setTempInput] = useState("");

  const handleNext = async () => {
    // Step-by-step validations
    if (currentStep === 0 && !formData.fullName.trim()) {
      return toast.error("Please enter your formal processing name.");
    }
    if (currentStep === 1 && (!formData.weight || formData.weight <= 0 || !formData.height || formData.height <= 0)) {
      return toast.error("Please enter valid biometric telemetry (height/weight).");
    }
    if (currentStep === 5 && (!formData.todayReadiness.sleepDuration || formData.todayReadiness.sleepDuration <= 0)) {
      return toast.error("Please enter a valid sleep duration.");
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      // Ensure numeric fields are actually numbers before sending
      const cleanData = {
        ...formData,
        equipment: formData.workoutType === 'gym' ? ['Full Gym Facility'] : formData.equipment,
        weight: Number(formData.weight),
        height: Number(formData.height),
        strengthAssessment: {
          pushups: Number(formData.strengthAssessment.pushups),
          squats: Number(formData.strengthAssessment.squats),
          plankSeconds: Number(formData.strengthAssessment.plankSeconds),
        },
        todayReadiness: {
          stress: Number(formData.todayReadiness.stress),
          energy: Number(formData.todayReadiness.energy),
          soreness: Number(formData.todayReadiness.soreness),
          sleepDuration: Number(formData.todayReadiness.sleepDuration)
        }
      };

      toast.success("Profile created! AI is generating your personalized plan...");
      
      onClose(); // Close modal instantly
      dispatch(setWorkoutLoading(true));
      navigate('/dashboard'); // Take user to dashboard immediately

      // Fire off API request in the background
      onBoarding(cleanData)
        .then(result => {
          // Push locally sourced telemetry as backend only responds with a single combined readiness score integer
          dispatch(setTodayReadiness(cleanData.todayReadiness));
          
          if (result && result.aiAnalysis) {
            dispatch(setTodayWorkout(result.aiAnalysis));
          }
        })
        .catch(err => {
          console.error("Delayed API generation failed", err);
          toast.error("Failed to generate AI plan. Please refresh or retry.");
        })
        .finally(() => {
          dispatch(setWorkoutLoading(false));
        });

    } catch (err) {
      setError("Data preparation failed. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => currentStep > 0 && setCurrentStep(s => s - 1);

  const addItem = (field) => {
    if (!tempInput.trim()) return;
    setFormData(prev => ({ ...prev, [field]: [...prev[field], tempInput.trim()] }));
    setTempInput("");
  };

  const removeItem = (field, index) => {
    setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative flex flex-col md:flex-row w-full max-w-5xl h-[700px] overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_rgb(0,0,0,0.12)] border border-slate-100/60"
      >
        {/* --- Progress Sidebar --- */}
        <div className="w-full md:w-72 bg-[#f8fafc] border-r border-slate-100 p-8 hidden md:flex flex-col relative">
          <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-white to-transparent pointer-events-none" />

          <div className="flex items-center gap-3 mb-12 relative z-10">
            <div className={`w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center shadow-lg shadow-blue-500/20`}>
              <HiOutlineLightningBolt className="text-white text-xl" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-800">
              Precision<span className="text-brand-primary">AI</span>
            </span>
          </div>

          <nav className="flex-1 space-y-4 relative z-10 mt-6">
            {STEPS.map((step, idx) => {
              const isActive = idx === currentStep;
              const isPast = idx < currentStep;
              return (
                <div key={step.id} className={`flex items-center gap-4 p-3 rounded-2xl transition-all ${isActive ? 'bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100/60' : isPast ? 'opacity-70' : 'opacity-40'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-brand-primary/5 text-brand-primary' : 'bg-slate-50 text-slate-400'}`}>
                    {isPast ? <HiOutlineCheckCircle size={24} className="text-emerald-500" /> : step.icon}
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Step 0{idx + 1}</p>
                    <p className={`text-sm font-bold leading-tight ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>{step.title}</p>
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* --- Content Area --- */}
        <div className="flex-1 flex flex-col bg-white">
          <header className="p-6 md:p-8 flex justify-between items-center border-b border-slate-50">
            <div className="md:hidden flex items-center gap-2">
              <span className="font-black text-slate-800 tracking-tight">PrecisionAI</span>
              <span className="text-slate-200">|</span>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Step 0{currentStep + 1}</span>
            </div>
            <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-slate-400 ml-auto transition-colors"><HiOutlineX size={18} /></button>
          </header>

          <main className="flex-1 px-8 md:px-16 overflow-y-auto pb-10">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {/* Step Components Mapping */}
                {currentStep === 0 && (
                  <div className="space-y-8">
                    <SectionHeader title="Let's build your profile" subtitle="This helps us calibrate your AI coach." />
                    <InputGroup label="Full Name" placeholder="John Doe" value={formData.fullName} onChange={(v) => setFormData({ ...formData, fullName: v })} />
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Gender</label>
                      <div className="grid grid-cols-3 gap-3">
                        {['male', 'female', 'other'].map(g => (
                          <SelectButton key={g} label={g} active={formData.gender === g} onClick={() => setFormData({ ...formData, gender: g })} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-8">
                    <SectionHeader title="Body Stats" subtitle="Used for calculating volume and intensity." />
                    <div className="grid grid-cols-2 gap-6">
                      <InputGroup label="Weight (kg)" placeholder="80" type="number" value={formData.weight} onChange={(v) => setFormData({ ...formData, weight: v })} />
                      <InputGroup label="Height (cm)" placeholder="180" type="number" value={formData.height} onChange={(v) => setFormData({ ...formData, height: v })} />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Primary Goal</label>
                      <div className="grid grid-cols-2 gap-3">
                        {['muscle_gain', 'fat_loss', 'longevity', 'strength'].map(goal => (
                          <SelectButton key={goal} label={goal.replace('_', ' ')} active={formData.goal === goal} onClick={() => setFormData({ ...formData, goal: goal })} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-8">
                    <SectionHeader title="Injuries & Limits" subtitle="We'll modify exercises to keep you safe." />
                    <ArrayInput
                      label="Active Injuries"
                      placeholder="Add injury (e.g. Lower back pain)"
                      items={formData.injuries}
                      onAdd={() => addItem('injuries')}
                      onRemove={(i) => removeItem('injuries', i)}
                      tempValue={tempInput}
                      setTemp={setTempInput}
                    />
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-8">
                    <SectionHeader title="Training Environment" subtitle="Where are we working out?" />
                    <div className="flex gap-4">
                      {['home', 'gym', 'outdoor'].map(type => (
                        <SelectButton key={type} label={type} active={formData.workoutType === type} onClick={() => setFormData({ ...formData, workoutType: type })} />
                      ))}
                    </div>
                    
                    <AnimatePresence>
                      {formData.workoutType !== 'gym' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                          <ArrayInput
                            label="Available Equipment"
                            placeholder="e.g. Dumbbells, Bench"
                            items={formData.equipment}
                            onAdd={() => addItem('equipment')}
                            onRemove={(i) => removeItem('equipment', i)}
                            tempValue={tempInput}
                            setTemp={setTempInput}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-8">
                    <SectionHeader title="Baseline Assessment" subtitle="Current maximums for calibration." />
                    <div className="grid grid-cols-1 gap-6">
                      <InputGroup label="Max Pushups" placeholder="0" type="number" value={formData.strengthAssessment.pushups} onChange={(v) => setFormData({ ...formData, strengthAssessment: { ...formData.strengthAssessment, pushups: v } })} />
                      <InputGroup label="Max Squats" placeholder="0" type="number" value={formData.strengthAssessment.squats} onChange={(v) => setFormData({ ...formData, strengthAssessment: { ...formData.strengthAssessment, squats: v } })} />
                      <InputGroup label="Plank (Seconds)" placeholder="0" type="number" value={formData.strengthAssessment.plankSeconds} onChange={(v) => setFormData({ ...formData, strengthAssessment: { ...formData.strengthAssessment, plankSeconds: v } })} />
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-8">
                    <SectionHeader title="Daily Readiness" subtitle="Data for your personalized Day 1 plan." />

                    <div className="grid grid-cols-1 gap-6">
                      <SliderGroup label="Stress Level" value={formData.todayReadiness.stress} onChange={(v) => setFormData({ ...formData, todayReadiness: { ...formData.todayReadiness, stress: v } })} min={1} max={10} leftLabel="Zen" rightLabel="Overwhelmed" />
                      <SliderGroup label="Energy Level" value={formData.todayReadiness.energy} onChange={(v) => setFormData({ ...formData, todayReadiness: { ...formData.todayReadiness, energy: v } })} min={1} max={10} leftLabel="Exhausted" rightLabel="Limitless" />
                      <SliderGroup label="Muscle Soreness" value={formData.todayReadiness.soreness} onChange={(v) => setFormData({ ...formData, todayReadiness: { ...formData.todayReadiness, soreness: v } })} min={1} max={10} leftLabel="None" rightLabel="Severe" />
                      <InputGroup label="Sleep Duration (Hours)" placeholder="8" type="number" value={formData.todayReadiness.sleepDuration} onChange={(v) => setFormData({ ...formData, todayReadiness: { ...formData.todayReadiness, sleepDuration: v } })} />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </main>

          <footer className="p-6 px-8 md:px-16 border-t border-slate-100 flex justify-between bg-slate-50/50">
            <button
              onClick={handleBack}
              disabled={isSubmitting}
              className={`px-6 py-2.5 font-bold text-sm text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all ${currentStep === 0 || isSubmitting ? 'opacity-0 pointer-events-none' : ''}`}
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className="min-w-[150px] flex justify-center items-center px-8 py-3 bg-brand-primary text-white text-sm font-bold rounded-xl shadow-[0_8px_20px_rgba(99,102,241,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:scale-100"
            >
              {isSubmitting ? (
                <AiOutlineLoading3Quarters className="animate-spin text-lg" />
              ) : (
                currentStep === STEPS.length - 1 ? 'Finish Initialization' : 'Continue'
              )}
            </button>
          </footer>
        </div>
      </motion.div>
    </div>
  );
}

// Subcomponents remain the same as your current code...
const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-8 pt-4">
    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{subtitle}</p>
  </div>
);

const InputGroup = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div className="space-y-1.5 flex-1">
    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{label}</label>
    <div className="relative flex items-center bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-primary/20 rounded-xl px-4 py-3.5 border border-slate-200 focus-within:border-brand-primary shadow-inner shadow-slate-100/50 transition-all">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-transparent border-none outline-none text-sm w-full font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-medium"
      />
    </div>
  </div>
);

const SliderGroup = ({ label, value, onChange, min, max, leftLabel, rightLabel }) => (
  <div className="space-y-3 flex-1">
    <div className="flex justify-between items-center px-1">
      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</label>
      <span className="text-sm font-black text-brand-primary bg-indigo-50 px-3 py-1 rounded-lg">{value}</span>
    </div>
    <div className="px-1 relative">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-primary"
      />
      <div className="flex justify-between mt-2 px-1">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{leftLabel}</span>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{rightLabel}</span>
      </div>
    </div>
  </div>
);

const SelectButton = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`py-3.5 px-6 rounded-xl border text-xs font-bold capitalize transition-all
      ${active ? 'border-brand-primary bg-indigo-50 text-brand-primary shadow-sm' : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:bg-white'}`}
  >
    {label.replace('_', ' ')}
  </button>
);

const ArrayInput = ({ label, placeholder, items, onAdd, onRemove, tempValue, setTemp }) => (
  <div className="space-y-4">
    <div className="flex gap-2 items-end">
      <InputGroup label={label} placeholder={placeholder} value={tempValue} onChange={setTemp} />
      <button onClick={onAdd} className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all mb-[2px]"><HiPlus /></button>
    </div>
    <div className="flex flex-wrap gap-2">
      {items.map((item, idx) => (
        <span key={idx} className="flex items-center gap-1.5 bg-white border border-slate-200 shadow-sm text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold">
          {item}
          <div className="w-px h-3 bg-slate-200 mx-0.5" />
          <HiOutlineX className="cursor-pointer text-slate-400 hover:text-rose-500" onClick={() => onRemove(idx)} />
        </span>
      ))}
    </div>
  </div>
);