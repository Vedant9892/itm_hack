import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineUser, HiOutlineScale, HiOutlineLightningBolt,
  HiOutlineShieldCheck, HiOutlineBeaker, HiOutlineCheckCircle,
  HiChevronRight, HiChevronLeft, HiOutlineX, HiPlus, HiTrash
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
  { id: 'assessment', title: 'Strength', icon: <HiOutlineLightningBolt /> }
];

export default function StartupOnboarding({ isOpen, onClose, userId }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

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
    }
  });

  const [tempInput, setTempInput] = useState("");

  const handleNext = async () => {
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
        weight: Number(formData.weight),
        height: Number(formData.height),
        strengthAssessment: {
          pushups: Number(formData.strengthAssessment.pushups),
          squats: Number(formData.strengthAssessment.squats),
          plankSeconds: Number(formData.strengthAssessment.plankSeconds),
        }
      };

      const result = await onBoarding(cleanData);
      console.log("Data:", formData);
      toast.success("Profile created successfully!");
      onClose(); // Close modal on success
    } catch (err) {
      setError("Failed to save profile. Please try again.");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`relative flex flex-col md:flex-row w-full max-w-5xl h-[700px] overflow-hidden rounded-[2.5rem] ${theme.surface} shadow-2xl border ${theme.border}`}
      >
        {/* --- Progress Sidebar --- */}
        <div className="w-full md:w-72 bg-slate-50/50 border-r border-slate-100 p-10 hidden md:flex flex-col">
          <div className="flex items-center gap-3 mb-12">
            <div className={`w-10 h-10 rounded-2xl ${theme.primaryBg} flex items-center justify-center shadow-lg shadow-blue-200`}>
              <HiOutlineLightningBolt className="text-white text-xl" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">
              Precision<span className="text-brand-primary">Health</span>
            </span>
          </div>

          <nav className="flex-1 space-y-6">
            {STEPS.map((step, idx) => (
              <div key={step.id} className={`flex items-center gap-4 transition-all ${idx <= currentStep ? 'opacity-100' : 'opacity-30'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${idx === currentStep ? 'bg-white shadow-md text-brand-primary' : 'text-slate-400'}`}>
                  {idx < currentStep ? <HiOutlineCheckCircle size={24} className="text-emerald-500" /> : step.icon}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Step 0{idx + 1}</p>
                  <p className={`text-sm font-bold ${idx === currentStep ? 'text-slate-900' : 'text-slate-500'}`}>{step.title}</p>
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* --- Content Area --- */}
        <div className="flex-1 flex flex-col bg-white">
          <header className="p-8 flex justify-between items-center">
            <div className="md:hidden flex items-center gap-2">
              <span className="font-bold text-brand-primary">Forge AI</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 text-sm">Step {currentStep + 1}</span>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 ml-auto"><HiOutlineX size={20} /></button>
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
                    <ArrayInput
                      label="Available Equipment"
                      placeholder="e.g. Dumbbells, Bench"
                      items={formData.equipment}
                      onAdd={() => addItem('equipment')}
                      onRemove={(i) => removeItem('equipment', i)}
                      tempValue={tempInput}
                      setTemp={setTempInput}
                    />
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
              </motion.div>
            </AnimatePresence>
          </main>

          <footer className="p-8 border-t border-slate-100 flex justify-between bg-slate-50/30">
            <button
              onClick={handleBack}
              disabled={isSubmitting}
              className={`px-6 py-3 font-bold text-slate-400 hover:text-slate-800 transition-all ${currentStep === 0 || isSubmitting ? 'opacity-0 pointer-events-none' : ''}`}
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className="min-w-[160px] flex justify-center items-center px-10 py-4 bg-brand-primary text-white font-bold rounded-2xl shadow-xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all disabled:opacity-70 disabled:scale-100"
            >
              {isSubmitting ? (
                <AiOutlineLoading3Quarters className="animate-spin text-xl" />
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
  <div className="mb-8">
    <h2 className="text-3xl font-black text-slate-900 tracking-tight">{title}</h2>
    <p className="text-slate-500 font-medium">{subtitle}</p>
  </div>
);

const InputGroup = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div className="space-y-2 flex-1">
    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 focus:border-brand-primary focus:ring-4 focus:ring-blue-50 outline-none transition-all font-semibold"
    />
  </div>
);

const SelectButton = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`py-4 px-6 rounded-2xl border-2 font-bold text-sm capitalize transition-all
      ${active ? 'border-brand-primary bg-blue-50 text-brand-primary shadow-sm' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'}`}
  >
    {label}
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
        <span key={idx} className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold border border-slate-200">
          {item}
          <HiOutlineX className="cursor-pointer text-slate-400 hover:text-red-500" onClick={() => onRemove(idx)} />
        </span>
      ))}
    </div>
  </div>
);