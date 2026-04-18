import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineArrowLeft, HiOutlineFire, HiOutlineCheckCircle,
  HiOutlineClock, HiOutlineArrowPath, HiCheckCircle,
  HiOutlineLightBulb, HiOutlineSparkles,
} from 'react-icons/hi2';
import NeuralSidebar from '../components/dashboard/NeuralSidebar';
import BodyMap from '../components/soreness/BodyMap';
import { fetchSorenessPlan, submitSorenessFeedback } from '../services/sorenessService';

const MUSCLE_LABELS = {
  chest: 'Chest', left_shoulder: 'L. Shoulder', right_shoulder: 'R. Shoulder',
  left_bicep: 'L. Bicep', right_bicep: 'R. Bicep', abs: 'Abs',
  obliques: 'Obliques', quadriceps: 'Quadriceps', left_calf: 'L. Calf',
  right_calf: 'R. Calf', forearms: 'Forearms', traps: 'Traps',
  rear_delts: 'Rear Delts', lats: 'Lats', lower_back: 'Lower Back',
  triceps: 'Triceps', glutes: 'Glutes', hamstrings: 'Hamstrings',
};

const LoadingPhase = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center h-full gap-8"
  >
    <div className="relative w-24 h-24">
      <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-ping" />
      <div className="absolute inset-2 rounded-full border-4 border-t-brand-primary border-brand-primary/20 animate-spin" />
      <HiOutlineFire className="absolute inset-0 m-auto text-brand-primary text-3xl" />
    </div>
    <div className="text-center">
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Generating Your Plan</h2>
      <p className="text-slate-500 text-sm">AI is crafting a targeted recovery programme…</p>
    </div>
    <div className="flex gap-2">
      {['Analysing muscles', 'Building exercises', 'Optimising stretches'].map((s, i) => (
        <motion.div key={s} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.6, repeat: Infinity, repeatType: 'reverse', duration: 0.8 }}
          className="px-3 py-1.5 bg-blue-50 rounded-full text-[11px] font-bold text-brand-primary border border-blue-100"
        >{s}</motion.div>
      ))}
    </div>
  </motion.div>
);

const PlanCard = ({ item, completed, onToggle, index }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.07 }} onClick={onToggle}
    className={`relative p-5 rounded-2xl border cursor-pointer transition-all duration-300 group
      ${completed ? 'bg-brand-secondary/5 border-brand-secondary/30' : 'bg-white border-slate-100 hover:border-brand-primary/30 hover:shadow-md'}`}
  >
    <div className="flex items-start gap-4">
      <div className={`mt-0.5 text-2xl flex-shrink-0 transition-colors ${completed ? 'text-brand-secondary' : 'text-slate-300 group-hover:text-brand-primary'}`}>
        {completed ? <HiCheckCircle /> : <HiOutlineCheckCircle />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h4 className={`font-bold text-sm ${completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>{item.name}</h4>
          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold uppercase tracking-wide">{item.muscle}</span>
        </div>
        <p className="text-[12px] text-slate-500 leading-relaxed">{item.description}</p>
        <div className="flex gap-3 mt-2.5 flex-wrap">
          {item.sets && <span className="flex items-center gap-1 text-[11px] font-bold text-brand-primary"><HiOutlineArrowPath /> {item.sets} sets</span>}
          {item.reps && <span className="text-[11px] font-bold text-slate-600">× {item.reps} reps</span>}
          {item.duration && <span className="flex items-center gap-1 text-[11px] font-bold text-slate-600"><HiOutlineClock /> {item.duration}</span>}
        </div>
        {item.tips && <p className="mt-2 text-[11px] text-amber-600 font-medium">💡 {item.tips}</p>}
      </div>
    </div>
  </motion.div>
);

const FeedbackPhase = ({ onSubmit }) => {
  const [score, setScore] = useState(7);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => { await onSubmit(score); setSubmitted(true); };

  if (submitted) return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center h-full gap-6 text-center"
    >
      <div className="w-20 h-20 bg-brand-secondary/10 rounded-full flex items-center justify-center">
        <HiOutlineSparkles className="text-4xl text-brand-secondary" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900">Great work! 🎉</h2>
      <p className="text-slate-500 text-sm max-w-xs">Your feedback helps us improve future recovery plans. Keep it up!</p>
      <div className="px-6 py-2 bg-brand-secondary text-white rounded-xl font-bold text-sm">Score: {score}/10</div>
    </motion.div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center h-full gap-8 max-w-lg mx-auto text-center px-4"
    >
      <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center">
        <HiOutlineLightBulb className="text-3xl text-brand-primary" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Plan Complete!</h2>
        <p className="text-slate-500 text-sm">How much relief do you feel after completing this plan?</p>
      </div>
      <div className="text-6xl font-extrabold text-brand-primary">{score}<span className="text-2xl text-slate-400">/10</span></div>
      <div className="w-full">
        <input type="range" min="1" max="10" value={score}
          onChange={(e) => setScore(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{ background: `linear-gradient(to right, #2563eb ${score * 10}%, #e2e8f0 ${score * 10}%)` }}
        />
        <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2">
          <span>No relief</span><span>Complete relief</span>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-2 w-full">
        {[1,2,3,4,5,6,7,8,9,10].map(n => (
          <button key={n} onClick={() => setScore(n)}
            className={`h-9 rounded-xl text-xs font-bold border transition-all
              ${score === n ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-blue-500/20' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-brand-primary/40'}`}
          >{n}</button>
        ))}
      </div>
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmit}
        className="px-10 py-4 bg-slate-900 text-white font-bold rounded-2xl text-sm shadow-xl hover:shadow-slate-900/20 transition-all"
      >Submit Feedback</motion.button>
    </motion.div>
  );
};

const Soreness = () => {
  const navigate = useNavigate();
  const [isCollapsed, setCollapsed] = useState(false);
  const [view, setView] = useState('front');
  const [selected, setSelected] = useState([]);
  const [phase, setPhase] = useState('select');
  const [plan, setPlan] = useState(null);
  const [completed, setCompleted] = useState(new Set());
  const [error, setError] = useState(null);

  const allItems = plan ? [...(plan.exercises || []), ...(plan.stretches || [])] : [];
  const progress = allItems.length > 0 ? Math.round((completed.size / allItems.length) * 100) : 0;
  const allDone = allItems.length > 0 && completed.size >= allItems.length;

  const toggleMuscle = (id) =>
    setSelected(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);

  const toggleItem = (id) =>
    setCompleted(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const handleGeneratePlan = async () => {
    if (!selected.length) return;
    setPhase('loading'); setError(null);
    try {
      const names = selected.map(id => MUSCLE_LABELS[id] || id);
      const data = await fetchSorenessPlan(names);
      setPlan(data); setPhase('plan');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate plan. Make sure backend and n8n are running.');
      setPhase('select');
    }
  };

  const handleFeedback = async (score) => {
    try {
      await submitSorenessFeedback({
        sore_muscles: selected.map(id => MUSCLE_LABELS[id] || id),
        relief_score: score, plan_title: plan?.plan_title,
      });
    } catch (_) {}
  };

  return (
    <div className="flex h-screen bg-brand-bg overflow-hidden font-sans">
      <NeuralSidebar isCollapsed={isCollapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="h-20 px-8 flex items-center justify-between bg-white border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-900">
              <HiOutlineArrowLeft className="text-xl" />
            </button>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Soreness Relief</h1>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                {phase === 'select' && 'Select sore muscle groups'}
                {phase === 'loading' && 'Generating AI plan…'}
                {phase === 'plan' && `${plan?.plan_title || 'Recovery Plan'} · ${plan?.estimated_duration || ''}`}
                {phase === 'feedback' && 'Submit your feedback'}
              </p>
            </div>
          </div>
          {phase === 'plan' && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress</p>
                <p className="text-sm font-extrabold text-slate-900">{progress}%</p>
              </div>
              <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div className="h-full bg-brand-secondary rounded-full"
                  animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
              </div>
              {allDone && (
                <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }}
                  onClick={() => setPhase('feedback')}
                  className="px-5 py-2.5 bg-brand-secondary text-white rounded-xl text-xs font-bold shadow-lg transition-all"
                >Complete ✓</motion.button>
              )}
            </div>
          )}
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#fbfcfd]">

          {/* ── SELECT ── */}
          {phase === 'select' && (
            <div className="flex h-full">
              <div className="w-[320px] flex-shrink-0 bg-white border-r border-slate-100 flex flex-col p-6 gap-4">
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  {['front', 'back'].map(v => (
                    <button key={v} onClick={() => setView(v)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all
                        ${view === v ? 'bg-white text-slate-900 shadow' : 'text-slate-400 hover:text-slate-600'}`}
                    >{v}</button>
                  ))}
                </div>
                <div className="flex-1 min-h-0">
                  <BodyMap selectedMuscles={selected} onToggle={toggleMuscle} view={view} />
                </div>
                <p className="text-center text-[11px] text-slate-400 font-medium">
                  Click muscles to select · Toggle front / back
                </p>
              </div>

              <div className="flex-1 p-8 flex flex-col gap-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">Where are you sore?</h2>
                  <p className="text-slate-500 text-sm">Select muscle groups on the body map. We'll build a targeted recovery plan.</p>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">{error}</div>
                )}

                <div className="flex flex-wrap gap-2 min-h-[48px]">
                  {selected.length === 0
                    ? <p className="text-slate-300 text-sm italic">No muscles selected yet…</p>
                    : selected.map(id => (
                        <motion.span key={id} initial={{ scale: 0 }} animate={{ scale: 1 }}
                          className="flex items-center gap-2 px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-full text-xs font-bold border border-brand-primary/20"
                        >
                          {MUSCLE_LABELS[id] || id}
                          <button onClick={() => toggleMuscle(id)} className="hover:text-red-500 transition-colors leading-none">×</button>
                        </motion.span>
                      ))
                  }
                </div>

                <div className="grid grid-cols-2 gap-3 mt-auto">
                  {['Select multiple areas', 'Toggle front/back view', 'AI creates personalised plan', 'Mark each task complete'].map((tip, i) => (
                    <div key={i} className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center gap-3">
                      <HiOutlineLightBulb className="text-amber-400 text-lg flex-shrink-0" />
                      <span className="text-[12px] text-slate-600 font-medium">{tip}</span>
                    </div>
                  ))}
                </div>

                <motion.button whileHover={{ scale: selected.length ? 1.02 : 1 }} whileTap={{ scale: 0.98 }}
                  onClick={handleGeneratePlan} disabled={!selected.length}
                  className={`w-full py-5 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3
                    ${selected.length ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/20' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                >
                  <HiOutlineFire className={`text-xl ${selected.length ? 'text-brand-secondary' : ''}`} />
                  Reduce Soreness ({selected.length} muscle{selected.length !== 1 ? 's' : ''})
                </motion.button>
              </div>
            </div>
          )}

          {/* ── LOADING ── */}
          {phase === 'loading' && (
            <div className="flex items-center justify-center h-full"><LoadingPhase /></div>
          )}

          {/* ── PLAN ── */}
          {phase === 'plan' && plan && (
            <div className="p-8 max-w-4xl mx-auto space-y-8">
              {plan.recovery_tips?.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="p-5 bg-amber-50 border border-amber-200 rounded-2xl flex gap-4 items-start"
                >
                  <HiOutlineLightBulb className="text-amber-500 text-2xl flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-bold text-amber-600 uppercase tracking-widest mb-1">Recovery Tips</p>
                    <ul className="text-sm text-amber-800 space-y-0.5">
                      {plan.recovery_tips.map((tip, i) => <li key={i}>• {tip}</li>)}
                    </ul>
                  </div>
                </motion.div>
              )}

              {plan.exercises?.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-brand-primary/10 rounded-xl flex items-center justify-center">
                      <HiOutlineArrowPath className="text-brand-primary text-lg" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      Rehabilitation Exercises
                      <span className="ml-2 text-[11px] font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full">
                        {plan.exercises.filter(e => completed.has(e.id)).length}/{plan.exercises.length}
                      </span>
                    </h3>
                  </div>
                  <div className="grid gap-3">
                    {plan.exercises.map((ex, i) => (
                      <PlanCard key={ex.id} item={ex} index={i}
                        completed={completed.has(ex.id)} onToggle={() => toggleItem(ex.id)} />
                    ))}
                  </div>
                </section>
              )}

              {plan.stretches?.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-brand-secondary/10 rounded-xl flex items-center justify-center">
                      <HiOutlineSparkles className="text-brand-secondary text-lg" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      Targeted Stretches
                      <span className="ml-2 text-[11px] font-bold text-brand-secondary bg-brand-secondary/10 px-2 py-0.5 rounded-full">
                        {plan.stretches.filter(s => completed.has(s.id)).length}/{plan.stretches.length}
                      </span>
                    </h3>
                  </div>
                  <div className="grid gap-3">
                    {plan.stretches.map((st, i) => (
                      <PlanCard key={st.id} item={st} index={(plan.exercises?.length || 0) + i}
                        completed={completed.has(st.id)} onToggle={() => toggleItem(st.id)} />
                    ))}
                  </div>
                </section>
              )}

              {allDone && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-brand-secondary/5 border border-brand-secondary/30 rounded-2xl text-center"
                >
                  <p className="text-brand-secondary font-bold mb-3">🎉 All tasks completed!</p>
                  <button onClick={() => setPhase('feedback')}
                    className="px-8 py-3 bg-brand-secondary text-white font-bold rounded-xl text-sm hover:bg-emerald-600 transition-colors">
                    Rate Your Relief →
                  </button>
                </motion.div>
              )}
            </div>
          )}

          {/* ── FEEDBACK ── */}
          {phase === 'feedback' && (
            <div className="flex items-center justify-center h-full p-8">
              <FeedbackPhase onSubmit={handleFeedback} />
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default Soreness;
