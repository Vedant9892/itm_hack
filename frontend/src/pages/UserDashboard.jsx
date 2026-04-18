import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import {
  HiOutlineUserCircle, HiOutlineBell, HiOutlineFire, HiOutlineLightBulb,
  HiOutlineChartBar, HiOutlineCalendar, HiOutlineHeart, HiOutlineTrophy,
  HiOutlineArrowTrendingUp, HiOutlineBolt, HiOutlineBeaker, HiOutlineMagnifyingGlass,
  HiOutlineArrowDownTray, HiOutlineCheckCircle, HiMiniPlay,
} from 'react-icons/hi2';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import NeuralSidebar from '../components/dashboard/NeuralSidebar';

/* ── TINY SHARED COMPONENTS ─────────────────────────── */
const TileCard = ({ children, className = '', span = '' }) => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
    className={`bg-white rounded-2xl border border-slate-100/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden ${span} ${className}`}>
    {children}
  </motion.div>
);
const TileHeader = ({ title, sub, icon }) => (
  <div className="flex items-start justify-between p-5 pb-3">
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-0.5">{sub}</p>
      <h3 className="text-sm font-extrabold text-slate-800">{title}</h3>
    </div>
    {icon && <div className="text-brand-primary text-lg">{icon}</div>}
  </div>
);

/* ── SVG RADIAL GAUGE ──────────────────────────────── */
const RadialGauge = ({ value = 72 }) => {
  const r = 70, cx = 90, cy = 90;
  const total = Math.PI * r; // half-circle circumference
  const offset = total - (value / 100) * total;
  const color = value >= 80 ? '#10b981' : value >= 50 ? '#2563eb' : '#f43f5e';
  const label = value >= 80 ? 'Primed for Strength' : value >= 50 ? 'Ready to Train' : 'Active Recovery';
  return (
    <div className="flex flex-col items-center py-4">
      <svg width="180" height="110" viewBox="0 0 180 110">
        <path d={`M20,90 A70,70 0 0,1 160,90`} fill="none" stroke="#f1f5f9" strokeWidth="14" strokeLinecap="round" />
        <path d={`M20,90 A70,70 0 0,1 160,90`} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
          strokeDasharray={total} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 1s ease' }} />
        <text x="90" y="80" textAnchor="middle" fontSize="28" fontWeight="800" fill="#0f172a">{value}%</text>
        <text x="90" y="98" textAnchor="middle" fontSize="9" fill="#94a3b8" fontWeight="600">READINESS</text>
      </svg>
      <span className="text-xs font-bold px-3 py-1 rounded-full mt-1" style={{ background: `${color}15`, color }}>{label}</span>
    </div>
  );
};

/* ── RECOVERY BARS ─────────────────────────────────── */
const Parameters = ({ readiness }) => {
  const muscles = readiness ? [
    { name: 'Sleep', pct: Math.min((readiness.sleepHours / 8) * 100, 100).toFixed(0), color: '#6366f1' },
    { name: 'Soreness', pct: (readiness.soreness * 10).toFixed(0), color: '#2563eb' },
    { name: 'Stress', pct: (readiness.stress * 10).toFixed(0), color: '#f43f5e' },
    { name: 'Energy', pct: (readiness.energetic * 10).toFixed(0), color: '#10b981' },
  ] : [
    { name: 'Sleep', pct: 85, color: '#6366f1' }, { name: 'Soreness', pct: 62, color: '#2563eb' },
    { name: 'Stress', pct: 40, color: '#f43f5e' }, { name: 'Energy', pct: 90, color: '#10b981' },
  ];
  return (
    <div className="px-5 pb-5 space-y-2">
      {muscles.map(m => (
        <div key={m.name} className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-slate-400 w-16">{m.name}</span>
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${m.pct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full" style={{ background: m.color }} />
          </div>
          <span className="text-[10px] font-bold text-slate-500 w-8 text-right">{m.pct}%</span>
        </div>
      ))}
    </div>
  );
};

/* ── DYNAMIC READINESS CONTENT ─────────────────────── */
const ReadinessTileContent = ({ aiWorkout, todayReadiness, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-[250px]">
        <AiOutlineLoading3Quarters className="animate-spin text-3xl text-brand-primary mb-3" />
        <h3 className="text-sm font-extrabold text-slate-700">Calculating Readiness...</h3>
        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest text-center">Analyzing biometrics</p>
      </div>
    );
  }

  const score = aiWorkout?.readinessScore ?? aiWorkout?.strengthScore ?? 78;

  return (
    <>
      <RadialGauge value={score} />
      <div className="border-t border-slate-50 pt-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-5 mb-2">Parameters</p>
        <Parameters readiness={todayReadiness} />
      </div>
    </>
  );
};

/* ── VITALITY RINGS ────────────────────────────────── */
const VitalityRings = () => {
  const rings = [
    { label: 'Steps', current: 5000 , target: 10000, unit: 'steps', color: '#6366f1', r: 60 },
    { label: 'Active Mins', current: 48, target: 60, unit: 'min', color: '#f43f5e', r: 44 },
  ];
  return (
    <div className="flex items-center gap-6 px-5 pb-5">
      <svg width="150" height="150" viewBox="0 0 150 150">
        {rings.map(({ color, r, current, target }) => {
          const circ = 2 * Math.PI * r;
          const pct = Math.min(current / target, 1);
          return (
            <g key={r}>
              <circle cx="75" cy="75" r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
              <circle cx="75" cy="75" r={r} fill="none" stroke={color} strokeWidth="10"
                strokeLinecap="round" strokeDasharray={circ}
                strokeDashoffset={circ - pct * circ} transform="rotate(-90 75 75)"
                style={{ transition: 'stroke-dashoffset 1s ease' }} />
            </g>
          );
        })}
        <text x="75" y="79" textAnchor="middle" fontSize="12" fontWeight="800" fill="#0f172a">Today</text>
      </svg>
      <div className="space-y-3 flex-1">
        {rings.map(({ label, current, target, unit, color }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
            <div className="flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
              <p className="text-sm font-extrabold text-slate-900">{current}<span className="text-[10px] text-slate-400 font-medium ml-1">/ {target} {unit}</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── TODAY'S SESSION CARD ──────────────────────────── */
const MUSCLE_IMG_MAP = {
  'back-biceps':  new URL('../assets/back-biceps.avif',   import.meta.url).href,
  'back':         new URL('../assets/back.jpg',           import.meta.url).href,
  'bicep':        new URL('../assets/bicep.avif',         import.meta.url).href,
  'chest-tricep': new URL('../assets/chest-tricep.jpg',   import.meta.url).href,
  'chest':        new URL('../assets/chest.png',          import.meta.url).href,
  'legs':         new URL('../assets/legs.jpg',           import.meta.url).href,
  'shoulders':    new URL('../assets/shoulders.webp',     import.meta.url).href,
};

const getSessionImg = (name) => {
  const n = name.toLowerCase();
  if (n.includes('back') && (n.includes('bicep') || n.includes('pull'))) return MUSCLE_IMG_MAP['back-biceps'];
  if (n.includes('chest') && (n.includes('tricep') || n.includes('push'))) return MUSCLE_IMG_MAP['chest-tricep'];
  if (n.includes('chest')) return MUSCLE_IMG_MAP['chest'];
  if (n.includes('back'))  return MUSCLE_IMG_MAP['back'];
  if (n.includes('bicep')) return MUSCLE_IMG_MAP['bicep'];
  if (n.includes('leg') || n.includes('quad') || n.includes('squat')) return MUSCLE_IMG_MAP['legs'];
  if (n.includes('shoulder') || n.includes('overhead')) return MUSCLE_IMG_MAP['shoulders'];
  return null;
};

const TodaySession = ({ aiWorkout, isLoading }) => {
  if (isLoading) {
    return (
      <div className="relative overflow-hidden m-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-10 flex flex-col items-center justify-center text-white h-[320px]">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #6366f130 0%, transparent 60%)' }} />
        <AiOutlineLoading3Quarters className="animate-spin text-4xl text-brand-primary mb-4 relative z-10" />
        <h3 className="text-sm font-extrabold text-white relative z-10">Generating Day 1 Plan...</h3>
        <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest relative z-10">Running inference via LPU</p>
      </div>
    );
  }

  const sessionName = aiWorkout ? aiWorkout.title : 'Back & Biceps — Pull B';
  const muscleImg   = getSessionImg(sessionName);
  
  const exercises = aiWorkout && aiWorkout.day1Workout
    ? aiWorkout.day1Workout.map(ex => ({
        name: ex.exercise,
        sets: ex.sets,
        reps: ex.reps,
        last: '-',
        today: ex.reason || 'AI Generated'
      }))
    : [
        { name: 'Barbell Row',  sets: 4, reps: '6–8',  last: '95 kg',  today: '100 kg'  },
        { name: 'Pull-up',      sets: 3, reps: '8–10', last: 'BW+15',  today: 'BW+17.5' },
        { name: 'Barbell Curl', sets: 3, reps: '10–12',last: '30 kg',  today: '32.5 kg' },
        { name: 'Hammer Curl',  sets: 3, reps: '12',   last: '18 kg',  today: '18 kg'   },
      ];

  const estTime = aiWorkout?.estimatedDuration ? `~${aiWorkout.estimatedDuration} min` : '~52 min';
  const totalSets = exercises.reduce((acc, curr) => acc + (parseInt(curr.sets) || 0), 0);

  return (
    <div className="relative overflow-hidden m-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white">
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 85% 20%, #6366f140 0%, transparent 55%)' }} />
      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Muscle image thumbnail */}
            {muscleImg && (
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 flex-shrink-0"
                style={{ background: '#ffffff10' }}>
                <img src={muscleImg} alt={sessionName}
                  className="w-full h-full object-cover opacity-90" />
              </div>
            )}
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-0.5">Today's Session {aiWorkout && <span className="text-brand-primary">(AI Gen)</span>}</p>
              <h3 className="text-base font-extrabold text-white">{sessionName}</h3>
            </div>
          </div>
        </div>


        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: '⚖️', label: 'Difficulty', value: aiWorkout ? aiWorkout.experienceLevel : 'Intermediate' },
            { icon: '⏱',  label: 'Est. Time', value: estTime },
            { icon: '🔁',  label: 'Sets',     value: `${totalSets} total` },
          ].map(({ icon, label, value }) => (
            <div key={label} className="bg-white/5 rounded-xl p-2.5 text-center border border-white/5">
              <p className="text-base">{icon}</p>
              <p className="text-xs font-extrabold text-white mt-0.5 max-w-full overflow-hidden text-ellipsis whitespace-nowrap">{value}</p>
              <p className="text-[9px] text-slate-500 uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>

        {/* Exercise list */}
        <div className="space-y-1.5">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500 mb-1">Exercise Plan</p>
          {exercises.map((ex, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2 bg-white/5 border border-white/5">
              <div className="flex items-center gap-2 max-w-[65%]">
                <span className="text-[9px] font-bold text-slate-600 w-4 flex-shrink-0">{i + 1}</span>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">{ex.name}</p>
                  <p className="text-[9px] text-slate-500">{ex.sets} × {ex.reps}</p>
                </div>
              </div>
              <div className="text-right max-w-[32%] pl-1">
                {aiWorkout ? (
                  <p className="text-[8px] text-indigo-300 font-medium leading-tight truncate">{ex.today}</p>
                ) : (
                  <>
                    <p className="text-xs font-extrabold text-white">{ex.today}</p>
                    <p className="text-[9px] text-slate-600">was {ex.last}</p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Volume progress vs last session */}
        <div>
          <div className="flex justify-between text-[9px] font-bold mb-1">
            <span className="text-slate-500 uppercase tracking-wider">Volume vs Last Session</span>
            <span className="text-emerald-400">+7.2% ↑</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: '72%' }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400" />
          </div>
        </div>

        {/* CTA */}
        <motion.button
          animate={{ boxShadow: ['0 0 0 0 rgba(99,102,241,0.5)', '0 0 0 10px rgba(99,102,241,0)', '0 0 0 0 rgba(99,102,241,0)'] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white text-xs font-bold py-2.5 rounded-xl">
          <HiMiniPlay /> Launch Workout
        </motion.button>
      </div>
    </div>
  );
};

/* ── LINE CHART (1RM) ──────────────────────────────── */
const OneRMChart = () => {
  const data = {
    Squat:     [95, 100, 102, 105, 107, 112],
    Bench:     [70,  72,  75,  78,  78,  82],
    Deadlift:  [120, 125, 128, 132, 135, 140],
    Predicted: [null, null, null, null, null, 115], // future
  };
  const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
  const W = 360, H = 140, pad = 30;
  const allVals = [70, 140];
  const xScale = i => pad + (i / (months.length - 1)) * (W - pad * 2);
  const yScale = v => H - pad - ((v - allVals[0]) / (allVals[1] - allVals[0])) * (H - pad * 2);
  const line = (pts, offset = 0) => pts
    .map((v, i) => v !== null ? `${i === 0 || pts[i - 1] === null ? 'M' : 'L'}${xScale(i + offset)},${yScale(v)}` : '')
    .join(' ');
  const series = [
    { key: 'Squat', color: '#6366f1' }, { key: 'Bench', color: '#f43f5e' },
    { key: 'Deadlift', color: '#10b981' },
  ];
  return (
    <div className="px-5 pb-5">
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
        {[80, 100, 120, 140].map(v => (
          <line key={v} x1={pad} x2={W - pad} y1={yScale(v)} y2={yScale(v)}
            stroke="#f1f5f9" strokeWidth="1" />
        ))}
        {months.map((m, i) => (
          <text key={m} x={xScale(i)} y={H - 8} textAnchor="middle" fontSize="9" fill="#94a3b8" fontWeight="600">{m}</text>
        ))}
        {series.map(({ key, color }) => (
          <path key={key} d={line(data[key])} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        ))}
        {/* Predicted dotted line */}
        <line x1={xScale(4)} x2={xScale(5)} y1={yScale(107)} y2={yScale(115)}
          stroke="#6366f1" strokeWidth="2" strokeDasharray="4 3" opacity="0.6" />
      </svg>
      <div className="flex gap-4 mt-1 flex-wrap">
        {series.map(({ key, color }) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className="w-3 h-1 rounded-full" style={{ background: color }} />
            <span className="text-[10px] font-bold text-slate-500">{key}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded-full bg-indigo-300" style={{ borderTop: '2px dashed #6366f1' }} />
          <span className="text-[10px] font-bold text-slate-400">AI Predicted</span>
        </div>
      </div>
    </div>
  );
};

/* ── RADAR CHART ───────────────────────────────────── */
const RadarChart = () => {
  const labels = ['Chest', 'Back', 'Quads', 'Shoulders', 'Arms', 'Posterior'];
  const values = [85, 70, 90, 55, 65, 40]; // normalized 0-100
  const N = labels.length;
  const cx = 100, cy = 100, R = 75;
  const angle = i => (Math.PI * 2 * i) / N - Math.PI / 2;
  const pt = (val, i) => {
    const r = (val / 100) * R;
    return [cx + r * Math.cos(angle(i)), cy + r * Math.sin(angle(i))];
  };
  const polygon = values.map((v, i) => pt(v, i)).map(([x, y]) => `${x},${y}`).join(' ');
  const gridPolygon = pct => Array.from({ length: N }, (_, i) => pt(pct, i)).map(([x, y]) => `${x},${y}`).join(' ');
  return (
    <div className="flex flex-col items-center pb-3">
      <svg width="220" height="220" viewBox="0 0 200 200">
        {[25, 50, 75, 100].map(pct => (
          <polygon key={pct} points={gridPolygon(pct)} fill="none" stroke="#f1f5f9" strokeWidth="1" />
        ))}
        {Array.from({ length: N }, (_, i) => {
          const [x, y] = pt(100, i);
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#e2e8f0" strokeWidth="1" />;
        })}
        <polygon points={polygon} fill="#6366f120" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round" />
        {values.map((v, i) => {
          const [x, y] = pt(v, i);
          return <circle key={i} cx={x} cy={y} r="3.5" fill="#6366f1" />;
        })}
        {labels.map((label, i) => {
          const [x, y] = pt(115, i);
          return <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="8.5" fontWeight="700" fill="#64748b">{label}</text>;
        })}
      </svg>
      <p className="text-[10px] text-slate-400 font-medium mt-1">Posterior chain undertrained — consider adding RDLs</p>
    </div>
  );
};

/* ── BODY COMP CHART ───────────────────────────────── */
const BodyCompChart = () => {
  const weight = [84, 83.5, 83, 82.5, 82, 81.5];
  const bf = [18, 17.5, 17.2, 16.8, 16.5, 16.1];
  const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
  const W = 340, H = 130, pad = 28;
  const xS = i => pad + (i / (months.length - 1)) * (W - pad * 2);
  const yW = v => H - pad - ((v - 80) / 6) * (H - pad * 2);
  const yB = v => H - pad - ((v - 15) / 5) * (H - pad * 2);
  const wLine = weight.map((v, i) => `${i === 0 ? 'M' : 'L'}${xS(i)},${yW(v)}`).join(' ');
  const bArea = bf.map((v, i) => `${i === 0 ? 'M' : 'L'}${xS(i)},${yB(v)}`).join(' ') +
    ` L${xS(months.length - 1)},${H - pad} L${xS(0)},${H - pad} Z`;
  return (
    <div className="px-5 pb-5">
      <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <linearGradient id="bfGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {months.map((m, i) => (
          <text key={m} x={xS(i)} y={H - 8} textAnchor="middle" fontSize="9" fill="#94a3b8" fontWeight="600">{m}</text>
        ))}
        <path d={bArea} fill="url(#bfGrad)" />
        <path d={bf.map((v, i) => `${i === 0 ? 'M' : 'L'}${xS(i)},${yB(v)}`).join(' ')}
          fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
        <path d={wLine} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <div className="flex gap-5 mt-1">
        <div className="flex items-center gap-1.5"><div className="w-4 h-0.5 rounded bg-blue-500" /><span className="text-[10px] font-bold text-slate-500">Weight (kg)</span></div>
        <div className="flex items-center gap-1.5"><div className="w-4 h-2 rounded" style={{ background: '#f43f5e40', border: '1.5px solid #f43f5e' }} /><span className="text-[10px] font-bold text-slate-500">Body Fat %</span></div>
      </div>
    </div>
  );
};

/* ── TRAINING CALENDAR ─────────────────────────────── */
const TrainingCalendar = ({ onSelectDay, selectedDay }) => {
  const today = new Date();
  const year  = today.getFullYear();
  const month = today.getMonth();

  // First day of month and total days
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const totalDays = new Date(year, month + 1, 0).getDate();
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthName = today.toLocaleString('default', { month: 'long' });

  // Stable: only re-compute when the month changes, not on every render
  const mockStatus = useMemo(() => {
    const status = {};
    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month, d);
      if (date > today) { status[d] = 'future'; continue; }
      const dow = date.getDay();
      if (dow === 0 || dow === 6) { status[d] = 'rest'; continue; }
      status[d] = Math.random() > 0.25 ? 'done' : 'missed';
    }
    return status;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]); // stable for the whole month

  const statusStyle = {
    done:   { bg: '#dcfce7', border: '#22c55e', text: '#15803d', icon: '✓' },
    missed: { bg: '#fee2e2', border: '#f87171', text: '#dc2626', icon: '✗' },
    rest:   { bg: '#f8fafc', border: '#e2e8f0', text: '#94a3b8', icon: '·' },
    future: { bg: '#f8fafc', border: '#f1f5f9', text: '#cbd5e1', icon: ''  },
  };

  // Pad start with empty cells
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)];

  return (
    <div className="px-5 pb-5">
      {/* Month + Year */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-extrabold text-slate-800">{monthName} {year}</p>
        <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest">
          {[
            { label: 'Done',   color: '#22c55e', bg: '#dcfce7' },
            { label: 'Missed', color: '#f87171', bg: '#fee2e2' },
            { label: 'Rest',   color: '#94a3b8', bg: '#f1f5f9' },
          ].map(({ label, color, bg }) => (
            <div key={label} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm border" style={{ background: bg, borderColor: color }} />
              <span className="text-slate-400">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayLabels.map(d => (
          <div key={d} className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-wider py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} />;
          const isToday = day === today.getDate();
          const status  = mockStatus[day] || 'future';
          const st = statusStyle[status];
          return (
            <motion.div key={day} whileHover={{ scale: 1.08 }}
              onClick={() => onSelectDay && onSelectDay(selectedDay === day ? null : day)}
              className="relative flex flex-col items-center justify-center rounded-xl py-1.5 cursor-pointer transition-all"
              style={{
                background: selectedDay === day ? '#0f172a' : isToday ? '#2563eb' : st.bg,
                border: `1.5px solid ${selectedDay === day ? '#0f172a' : isToday ? '#2563eb' : st.border}`,
                boxShadow: selectedDay === day ? '0 0 0 3px #0f172a30' : isToday ? '0 0 0 3px #2563eb30' : 'none',
              }}>
              <span className="text-[11px] font-extrabold leading-none"
                style={{ color: (isToday || selectedDay === day) ? '#fff' : status === 'future' ? '#cbd5e1' : '#0f172a' }}>
                {day}
              </span>
              {status !== 'future' && (
                <span className="text-[9px] font-bold mt-0.5 leading-none"
                  style={{ color: (isToday || selectedDay === day) ? 'rgba(255,255,255,0.8)' : st.text }}>
                  {st.icon}
                </span>
              )}
              {isToday && (
                <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[7px] font-black uppercase tracking-wider text-white bg-brand-primary px-1 rounded-full leading-none py-0.5">TODAY</span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Stats row */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {(() => {
          const statuses = Object.values(mockStatus);
          const done   = statuses.filter(s => s === 'done').length;
          const missed = statuses.filter(s => s === 'missed').length;
          const rest   = statuses.filter(s => s === 'rest').length;
          return [
            { label: 'Completed', value: done,   color: '#22c55e', bg: '#dcfce7' },
            { label: 'Missed',    value: missed,  color: '#f87171', bg: '#fee2e2' },
            { label: 'Rest Days', value: rest,    color: '#94a3b8', bg: '#f1f5f9' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className="flex items-center gap-2 p-2.5 rounded-xl" style={{ background: bg }}>
              <span className="text-lg font-extrabold" style={{ color }}>{value}</span>
              <span className="text-[10px] font-bold text-slate-500">{label}</span>
            </div>
          ));
        })()}
      </div>
    </div>
  );
};


/* ── SCATTER PLOT ──────────────────────────────────── */
const StressScatter = () => {
  const points = [
    { stress: 2, sleep: 8.2 }, { stress: 3, sleep: 7.8 }, { stress: 5, sleep: 6.5 },
    { stress: 7, sleep: 5.8 }, { stress: 4, sleep: 7.1 }, { stress: 8, sleep: 4.9 },
    { stress: 1, sleep: 8.5 }, { stress: 6, sleep: 6.1 }, { stress: 3, sleep: 7.5 },
    { stress: 9, sleep: 4.2 }, { stress: 2, sleep: 8.1 }, { stress: 5, sleep: 6.8 },
  ];
  const W = 320, H = 140, pad = 32;
  const xS = v => pad + ((v - 1) / 8) * (W - pad * 2);
  const yS = v => H - pad - ((v - 4) / 5) * (H - pad * 2);
  return (
    <div className="px-5 pb-5">
      <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
        <line x1={pad} x2={pad} y1={pad / 2} y2={H - pad} stroke="#e2e8f0" strokeWidth="1" />
        <line x1={pad} x2={W - pad / 2} y1={H - pad} y2={H - pad} stroke="#e2e8f0" strokeWidth="1" />
        {[1, 3, 5, 7, 9].map(v => (
          <text key={v} x={xS(v)} y={H - 10} textAnchor="middle" fontSize="8" fill="#94a3b8">{v}</text>
        ))}
        {[5, 6, 7, 8].map(v => (
          <text key={v} x={16} y={yS(v)} dominantBaseline="middle" fontSize="8" fill="#94a3b8">{v}h</text>
        ))}
        {/* Trend line */}
        <line x1={xS(1)} y1={yS(8.4)} x2={xS(9)} y2={yS(4.5)} stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
        {points.map((p, i) => (
          <circle key={i} cx={xS(p.stress)} cy={yS(p.sleep)} r="4" fill="#6366f1" opacity="0.75" />
        ))}
        <text x={W / 2} y={H - 1} textAnchor="middle" fontSize="8" fill="#94a3b8" fontWeight="600">Stress Level (1–10)</text>
        <text x="6" y={H / 2} textAnchor="middle" fontSize="8" fill="#94a3b8" fontWeight="600" transform={`rotate(-90 6 ${H / 2})`}>Sleep</text>
      </svg>
      <p className="text-[10px] text-slate-400 font-medium mt-1 text-center">High-stress days correlate with 1.8h less sleep on average</p>
    </div>
  );
};

/* ── STACKED MACRO BARS ────────────────────────────── */
const MacroBars = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const data = [
    { c: 220, f: 65, p: 145 }, { c: 180, f: 55, p: 162 }, { c: 250, f: 80, p: 138 },
    { c: 210, f: 60, p: 170 }, { c: 195, f: 70, p: 155 }, { c: 260, f: 90, p: 130 }, { c: 228, f: 68, p: 148 },
  ];
  const maxCalc = d => d.c + d.f * 9 + d.p * 4;
  const maxTotal = Math.max(...data.map(maxCalc));
  return (
    <div className="px-5 pb-5">
      <div className="flex items-end gap-2 h-24">
        {data.map((d, i) => {
          const total = maxCalc(d);
          const pct = total / maxTotal;
          return (
            <div key={i} className="flex-1 flex flex-col justify-end gap-0.5" title={`${days[i]}: C${d.c}g F${d.f}g P${d.p}g`}>
              <div className="rounded-sm" style={{ height: `${pct * 40}px`, background: '#10b981' }} />
              <div className="rounded-sm" style={{ height: `${pct * 20}px`, background: '#f59e0b' }} />
              <div className="rounded-sm" style={{ height: `${pct * 28}px`, background: '#6366f1' }} />
              <p className="text-[9px] text-center text-slate-400 font-bold mt-1">{days[i]}</p>
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 mt-3">
        {[{ c: '#6366f1', l: 'Carbs' }, { c: '#f59e0b', l: 'Fat' }, { c: '#10b981', l: 'Protein' }].map(({ c, l }) => (
          <div key={l} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: c }} />
            <span className="text-[10px] font-bold text-slate-500">{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── WORKOUT LOGS (dummy data for 3 days) ──────────── */
const today = new Date();
const fmt = (d) => {
  const dd = new Date(today.getFullYear(), today.getMonth(), d);
  return dd.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};
const WORKOUT_LOGS = {
  [today.getDate() - 2]: {
    session: 'Push A: Hypertrophy',
    rows: [
      { exercise: 'Bench Press',   weight: '85 kg',     reps: 8,  sets: 4, delta: '+2.5 kg' },
      { exercise: 'Incline DB',    weight: '30 kg',     reps: 10, sets: 3, delta: '+0 kg' },
      { exercise: 'Lateral Raise', weight: '14 kg',     reps: 15, sets: 4, delta: '+1 kg'   },
      { exercise: 'Tricep Push',   weight: 'Cable 40',  reps: 12, sets: 3, delta: '+5 kg'   },
    ],
  },
  [today.getDate() - 4]: {
    session: 'Pull B: Strength',
    rows: [
      { exercise: 'Deadlift',     weight: '175 kg',    reps: 3,  sets: 4, delta: '+5 kg'  },
      { exercise: 'Barbell Row',  weight: '100 kg',    reps: 6,  sets: 4, delta: '+2.5 kg'},
      { exercise: 'Pull-up',      weight: 'BW +15 kg', reps: 6,  sets: 3, delta: '+2.5 kg'},
      { exercise: 'Face Pull',    weight: 'Cable 22',  reps: 15, sets: 3, delta: '+0 kg'  },
    ],
  },
  [today.getDate() - 6]: {
    session: 'Legs: Volume',
    rows: [
      { exercise: 'Barbell Squat', weight: '120 kg',   reps: 8,  sets: 4, delta: '+5 kg' },
      { exercise: 'Leg Press',     weight: '200 kg',   reps: 12, sets: 3, delta: '+10 kg'},
      { exercise: 'Romanian DL',   weight: '90 kg',    reps: 10, sets: 3, delta: '+5 kg' },
      { exercise: 'Calf Raise',    weight: '60 kg',    reps: 20, sets: 4, delta: '+0 kg' },
    ],
  },
};

const ALL_PRS = [
  { exercise: 'Barbell Squat',  weight: '142 kg',     reps: 3, date: '15 Mar 2025', delta: '+12 kg' },
  { exercise: 'Bench Press',    weight: '102 kg',     reps: 2, date: '28 Feb 2025', delta: '+8 kg'  },
  { exercise: 'Deadlift',       weight: '180 kg',     reps: 1, date: '01 Apr 2025', delta: '+15 kg' },
  { exercise: 'Overhead Press', weight: '72 kg',      reps: 4, date: '20 Mar 2025', delta: '+5 kg'  },
  { exercise: 'Pull-up',        weight: 'BW +20 kg',  reps: 5, date: '10 Apr 2025', delta: '+5 kg'  },
];

/* ── PR TABLE ──────────────────────────────────────── */
const PRTable = ({ selectedDay }) => {
  const log = selectedDay ? WORKOUT_LOGS[selectedDay] : null;
  const rows = log
    ? log.rows.map(r => ({ ...r, date: fmt(selectedDay) }))
    : ALL_PRS;
  const isEmpty = selectedDay && !log;

  return (
    <div className="px-5 pb-5">
      {/* Context banner */}
      {selectedDay && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="mb-3 flex items-center justify-between p-3 rounded-xl"
          style={{ background: log ? '#eff6ff' : '#fff7ed', border: `1px solid ${log ? '#bfdbfe' : '#fed7aa'}` }}>
          <div className="flex items-center gap-2">
            <span className="text-base">{log ? '🏋️' : '😴'}</span>
            <div>
              <p className="text-xs font-extrabold text-slate-800">
                {log ? log.session : 'No workout logged'} — Day {selectedDay}
              </p>
              <p className="text-[10px] text-slate-400">{fmt(selectedDay)}</p>
            </div>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full"
            style={{ background: log ? '#dbeafe' : '#ffedd5', color: log ? '#2563eb' : '#c2410c' }}>
            {log ? `${log.rows.length} exercises` : 'Rest / No data'}
          </span>
        </motion.div>
      )}

      {isEmpty ? (
        <div className="py-10 text-center text-slate-400 text-sm font-medium">
          No workout data for this day.
        </div>
      ) : (
        <div className="overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Exercise</th>
                <th className="text-right py-2 font-bold text-slate-400 text-[10px] uppercase tracking-widest">{log ? 'Weight' : 'Best'}</th>
                <th className="text-right py-2 font-bold text-slate-400 text-[10px] uppercase tracking-widest">{log ? 'Sets' : 'Reps'}</th>
                <th className="text-right py-2 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Reps</th>
                <th className="text-right py-2 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence>
                {rows.map((p, i) => (
                  <motion.tr key={`${selectedDay}-${i}`}
                    initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        {!log && i === 0 && <HiOutlineTrophy className="text-amber-400 text-base flex-shrink-0" />}
                        {p.exercise}
                      </div>
                    </td>
                    <td className="py-2.5 text-right font-extrabold text-slate-900">{p.weight}</td>
                    <td className="py-2.5 text-right text-slate-500">{log ? p.sets : p.reps}</td>
                    <td className="py-2.5 text-right text-slate-500">{p.reps}</td>
                    <td className="py-2.5 text-right">
                      <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[9px]">{p.delta}</span>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/* ── MONTHLY REPORT CARD ───────────────────────────── */
const MonthlyReport = () => (
  <div className="px-5 pb-5 space-y-3">
    {[
      { icon: '🏋️', label: 'Total Volume', value: '45.2 tons', sub: 'You lifted 45 tons this month!' },
      { icon: '✅', label: 'Consistency', value: '87%', sub: '13 of 15 planned sessions' },
      { icon: '🏆', label: 'Top Lift', value: '180 kg Deadlift', sub: 'All-time PR — April 1' },
    ].map(({ icon, label, value, sub }) => (
      <div key={label} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
        <span className="text-xl">{icon}</span>
        <div className="flex-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="text-sm font-extrabold text-slate-900">{value}</p>
          <p className="text-[10px] text-slate-500">{sub}</p>
        </div>
      </div>
    ))}
    <button className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:border-brand-primary hover:text-brand-primary transition-all">
      <HiOutlineArrowDownTray /> Download PDF Report
    </button>
  </div>
);

/* ── TABS CONFIG ───────────────────────────────────── */
const TABS = [
  { id: 'glance',    label: 'At a Glance',        icon: <HiOutlineBolt /> },
  { id: 'analytics', label: 'Analytics & Progress', icon: <HiOutlineChartBar /> },
  { id: 'history',  label: 'History & Reports',   icon: <HiOutlineCalendar /> },
  { id: 'biofeed',  label: 'Bio-Feedback',         icon: <HiOutlineHeart /> },
];

/* ══════════════════════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════════════════════ */
const UserDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [tab, setTab] = useState('glance');
  const [selDay, setSelDay] = useState(null);
  const { user } = useSelector(s => s.auth);
  const { todayWorkout, todayReadiness, isLoadingWorkout } = useSelector(s => s.workout || {});

  console.log(todayWorkout);

  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden" style={{ zoom: 1.05 }}>
      <NeuralSidebar isCollapsed={collapsed} onToggle={() => setCollapsed(p => !p)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ── TOP BAR ── */}
        <header className="bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-lg font-extrabold text-slate-900">Dashboard</h1>
            <p className="text-xs text-slate-400 font-medium">{dayName}, {now.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-brandprimary hover:border-brand-primary transition-all">
              <HiOutlineBell className="text-lg" />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-brand-primary flex items-center justify-center text-white text-sm font-bold">
                {user?.name?.[0] ?? 'U'}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">{user?.name ?? 'Athlete'}</p>
                <p className="text-[10px] text-slate-400">Pro Plan</p>
              </div>
            </div>
          </div>
        </header>

        {/* ── TABS ── */}
        <div className="bg-white border-b border-slate-100 px-6 shrink-0">
          <div className="flex gap-0">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-3.5 text-xs font-bold border-b-2 transition-all -mb-[1px] ${
                  tab === t.id ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}>
                <span className="text-sm">{t.icon}</span>{t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── CONTENT AREA ── */}
        <div className="flex-1 overflow-y-auto p-5">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

              {/* ─── TAB 1: AT A GLANCE ─── */}
              {tab === 'glance' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 xl:grid-rows-2">
                  {/* Col 1 Row 1 — Readiness Score */}
                  <TileCard>
                    <TileHeader title="Readiness Score" sub="Daily Command" icon={<HiOutlineBolt />} />
                    <ReadinessTileContent aiWorkout={todayWorkout} todayReadiness={todayReadiness} isLoading={isLoadingWorkout} />
                  </TileCard>

                  {/* Col 2 — Today's Session spans both rows */}
                  <TileCard className="xl:row-span-2">
                    <TileHeader title="Today's Session" sub="Training Plan" icon={<HiOutlineFire />} />
                    <TodaySession aiWorkout={todayWorkout} isLoading={isLoadingWorkout} />
                  </TileCard>

                  {/* Col 3 — AI Insight spans both rows */}
                  <TileCard className="xl:row-span-2">
                    <TileHeader title="AI Coach Insight" sub="Personalized" icon={<HiOutlineLightBulb />} />
                    <div className="px-5 pb-5 grid grid-cols-1 gap-3">
                      {[
                        { emoji: '🧠', text: 'Your sleep dropped to 6.1h Mon–Wed. Increase magnesium intake before bed for better deep sleep.', tag: 'Sleep' },
                        { emoji: '📈', text: 'Your bench press increased 4.5% last week — you are trending toward a 105 kg 1RM by end of May.', tag: 'Strength' },
                        { emoji: '⚖️', text: 'Posterior chain volume is 40% below optimal. Add Romanian Deadlifts on your next lower body session.', tag: 'Volume' },
                        { emoji: '💧', text: 'You averaged only 5.2 glasses of water last week. Dehydration degrades performance by up to 8%.', tag: 'Recovery' },
                      ].map(({ emoji, text, tag }) => (
                        <div key={tag} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span>{emoji}</span>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-brand-primary">{tag}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed">{text}</p>
                        </div>
                      ))}
                    </div>
                  </TileCard>

                  {/* Col 1 Row 2 — Vitality Rings */}
                  <TileCard>
                    <TileHeader title="Vitality Rings" sub="Activity Snapshot" icon={<HiOutlineCheckCircle />} />
                    <VitalityRings />
                  </TileCard>
                </div>
              )}


              {/* ─── TAB 2: ANALYTICS ─── */}
              {tab === 'analytics' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <TileCard className="xl:col-span-2">
                    <TileHeader title="Progressive Overload — 1RM Trend" sub="Big 3 Lifts" icon={<HiOutlineArrowTrendingUp />} />
                    <div className="px-5 pb-2 flex gap-4 flex-wrap">
                      {[
                        { label: 'Squat 1RM', value: '112 kg', delta: '+17 kg', color: '#6366f1' },
                        { label: 'Bench 1RM', value: '82 kg',  delta: '+12 kg', color: '#f43f5e' },
                        { label: 'Deadlift 1RM', value: '140 kg', delta: '+20 kg', color: '#10b981' },
                      ].map(({ label, value, delta, color }) => (
                        <div key={label} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="w-2 h-8 rounded-full" style={{ background: color }} />
                          <div>
                            <p className="text-[10px] font-bold text-slate-400">{label}</p>
                            <p className="text-base font-extrabold text-slate-900">{value}</p>
                            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">{delta} in 6mo</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <OneRMChart />
                  </TileCard>

                  <TileCard>
                    <TileHeader title="Volume Distribution" sub="Muscle Group Radar" icon={<HiOutlineBeaker />} />
                    <RadarChart />
                  </TileCard>

                  <TileCard>
                    <TileHeader title="Body Composition" sub="Weight vs Body Fat %" icon={<HiOutlineArrowTrendingUp />} />
                    <div className="px-5 pt-2 pb-1 grid grid-cols-2 gap-3">
                      {[
                        { label: 'Current Weight', value: '81.5 kg', delta: '-2.5 kg', good: true },
                        { label: 'Body Fat', value: '16.1%', delta: '-1.9%', good: true },
                      ].map(({ label, value, delta, good }) => (
                        <div key={label} className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-[10px] font-bold text-slate-400">{label}</p>
                          <p className="text-lg font-extrabold text-slate-900">{value}</p>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${good ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'}`}>{delta}</span>
                        </div>
                      ))}
                    </div>
                    <BodyCompChart />
                  </TileCard>
                </div>
              )}

              {/* ─── TAB 3: HISTORY ─── */}
              {tab === 'history' && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                  <TileCard className="xl:col-span-2">
                    <TileHeader title="Training Calendar"
                      sub={selDay ? `Viewing Day ${selDay}` : 'Click a day to inspect'}
                      icon={<HiOutlineCalendar />} />
                    <TrainingCalendar onSelectDay={setSelDay} selectedDay={selDay} />
                  </TileCard>

                  <TileCard>
                    <TileHeader title="Monthly Report" sub="April 2025" icon={<HiOutlineTrophy />} />
                    <MonthlyReport />
                  </TileCard>

                  <TileCard className="xl:col-span-3">
                    <div className="flex items-center justify-between px-5 pt-5 pb-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-0.5">
                          {selDay ? 'Session Log' : 'Personal Records'}
                        </p>
                        <h3 className="text-sm font-extrabold text-slate-800">
                          {selDay ? `Day ${selDay} Workout` : 'Exercise Library PRs'}
                        </h3>
                      </div>
                      {selDay ? (
                        <button onClick={() => setSelDay(null)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-[10px] font-bold text-slate-500 transition-all">
                          ✕ Clear filter
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-400">
                          <HiOutlineMagnifyingGlass /> Search exercises…
                        </div>
                      )}
                    </div>
                    <PRTable selectedDay={selDay} />
                  </TileCard>
                </div>
              )}


              {/* ─── TAB 4: BIO-FEEDBACK ─── */}
              {tab === 'biofeed' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <TileCard>
                    <TileHeader title="Sleep–Stress Correlation" sub="Bio-Feedback" icon={<HiOutlineHeart />} />
                    <StressScatter />
                  </TileCard>

                  <TileCard>
                    <TileHeader title="Calories Burned" sub="This Week" icon={<HiOutlineFire />} />
                    <div className="px-5 pt-1 pb-2 grid grid-cols-3 gap-2">
                      {[
                        { label: 'Total',   value: '14,820', color: '#f43f5e' },
                        { label: 'Avg/Day', value: '2,117',  color: '#6366f1' },
                        { label: 'Peak Day', value: 'Wed',   color: '#f59e0b' },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="p-3 bg-slate-50 rounded-xl text-center">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                          <p className="text-base font-extrabold" style={{ color }}>{value}</p>
                        </div>
                      ))}
                    </div>
                    {/* Weekly calories bar chart */}
                    <div className="px-5 pb-5">
                      {/* container is 96px tall, we reserve ~16px for label+day text = 80px for bars */}
                      <div className="flex items-end gap-2" style={{ height: '80px' }}>
                        {[
                          { day: 'Mon', cal: 1980, type: 'Rest' },
                          { day: 'Tue', cal: 2240, type: 'Train' },
                          { day: 'Wed', cal: 2580, type: 'Train' },
                          { day: 'Thu', cal: 1850, type: 'Rest' },
                          { day: 'Fri', cal: 2310, type: 'Train' },
                          { day: 'Sat', cal: 2200, type: 'Train' },
                          { day: 'Sun', cal: 1660, type: 'Rest' },
                        ].map(({ day, cal, type }) => {
                          const barH = Math.round((cal / 2580) * 68);
                          const color = type === 'Train' ? '#f43f5e' : '#94a3b8';
                          return (
                            <div key={day} className="flex-1 flex flex-col items-center justify-end gap-1">
                              <span className="text-[9px] font-bold text-slate-400 leading-none">
                                {cal >= 2000 ? `${(cal / 1000).toFixed(1)}k` : cal}
                              </span>
                              <motion.div
                                initial={{ height: 0 }} animate={{ height: barH }}
                                transition={{ duration: 0.55, ease: 'easeOut' }}
                                className="w-full rounded-md"
                                style={{ background: color, opacity: 0.75, minHeight: '4px' }}
                              />
                              <span className="text-[9px] text-slate-400 font-bold leading-none">{day}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#f43f5e] opacity-70" /><span className="text-[10px] font-bold text-slate-500">Training Day</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-slate-300" /><span className="text-[10px] font-bold text-slate-500">Rest Day</span></div>
                      </div>
                    </div>
                  </TileCard>


                  {/* Readiness trend */}
                  <TileCard className="xl:col-span-2">
                    <TileHeader title="Weekly Readiness Trend" sub="AI Engine Score" icon={<HiOutlineBolt />} />
                    <div className="px-5 pb-5">
                      <div className="relative flex items-end gap-3 h-32 pt-4">
                        {/* Threshold Lines */}
                        <div className="absolute top-4 left-0 w-full border-t-2 border-dashed border-emerald-300 opacity-60 z-0">
                          <span className="absolute -top-4 left-0 text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-sm">75% Optimal</span>
                        </div>
                        <div className="absolute top-[45%] left-0 w-full border-t-2 border-dashed border-blue-300 opacity-60 z-0">
                          <span className="absolute -top-4 left-0 text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-sm">55% Ready</span>
                        </div>

                        {[72, 65, 80, 58, 75, 82, 78].map((v, i) => {
                          const isToday = i === 6;
                          const isPrimed = v >= 75;
                          const isReady = v >= 55;
                          
                          const colors = isPrimed 
                            ? { from: '#34d399', to: '#059669', shadow: 'rgba(16, 185, 129, 0.4)' }
                            : isReady 
                              ? { from: '#60a5fa', to: '#2563eb', shadow: 'rgba(59, 130, 246, 0.4)' }
                              : { from: '#fb7185', to: '#e11d48', shadow: 'rgba(244, 63, 94, 0.4)' };

                          return (
                            <div key={i} className="relative z-10 flex-1 flex flex-col items-center gap-1 group">
                              <span className={`text-xs font-black transition-all ${isToday ? 'text-slate-800 scale-110 mb-0.5' : 'text-slate-500 group-hover:text-slate-700'}`}>{v}%</span>
                              <motion.div initial={{ height: 0 }} animate={{ height: `${v}%` }}
                                transition={{ delay: i * 0.05, duration: 0.5, type: 'spring', stiffness: 120 }}
                                className={`w-full rounded-lg transition-all ${isToday ? 'opacity-100' : 'opacity-85 group-hover:opacity-100 group-hover:-translate-y-1'}`}
                                style={{ 
                                  background: `linear-gradient(180deg, ${colors.from} 0%, ${colors.to} 100%)`, 
                                  minHeight: '6px',
                                  boxShadow: isToday ? `0 4px 14px 0 ${colors.shadow}, inset 0 2px 0 0 rgba(255,255,255,0.2)` : `inset 0 2px 0 0 rgba(255,255,255,0.2)`
                                }} />
                              <span className={`text-[10px] font-black mt-1 transition-all ${isToday ? 'text-brand-primary bg-blue-50 px-2.5 rounded-full py-1 shadow-sm' : 'text-slate-500 py-1'}`}>
                                {isToday ? 'Today' : ['M','T','W','T','F','S','S'][i]}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Legend */}
                      <div className="flex items-center gap-5 mt-5 pt-4 border-t border-slate-50 justify-center">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-emerald-500" /><span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Primed</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-blue-500" /><span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Standard</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-rose-500" /><span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Recovery</span></div>
                      </div>
                    </div>
                  </TileCard>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
