import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineHeart,
  HiOutlineArrowTrendingUp,
  HiOutlineBeaker,
  HiOutlineWifi,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineArrowPath,
  HiOutlineChevronRight,
  HiOutlineDevicePhoneMobile,
  HiOutlineBolt,
  HiOutlineClock,
  HiOutlineSignal,
  HiMiniArrowLeftOnRectangle,
} from 'react-icons/hi2';
import NeuralSidebar from '../components/dashboard/NeuralSidebar';

// ─── Constants ────────────────────────────────────────────────────────────────
const API_BASE = 'http://localhost:5000/api/googlefit';
const STEP_GOAL = 10000;

// ─── Utility Helpers ──────────────────────────────────────────────────────────
function estimateBloodPressure(heartRate, respiratoryRate) {
  if (!heartRate) return { systolic: '--', diastolic: '--' };
  // Simplified estimation model (NOT medical grade — for display only)
  const systolic = Math.round(70 + heartRate * 0.6 + (respiratoryRate || 16) * 1.2);
  const diastolic = Math.round(40 + heartRate * 0.3 + (respiratoryRate || 16) * 0.6);
  return {
    systolic: Math.min(Math.max(systolic, 90), 160),
    diastolic: Math.min(Math.max(diastolic, 55), 100),
  };
}

function getHeartRateZone(bpm) {
  if (!bpm) return { label: '—', color: 'text-slate-400' };
  if (bpm < 60) return { label: 'Resting', color: 'text-blue-500' };
  if (bpm < 100) return { label: 'Normal', color: 'text-brand-secondary' };
  if (bpm < 130) return { label: 'Moderate', color: 'text-amber-500' };
  return { label: 'High', color: 'text-rose-500' };
}

function getSpO2Status(spo2) {
  if (!spo2) return { label: '—', color: 'text-slate-400' };
  if (spo2 >= 95) return { label: 'Normal', color: 'text-brand-secondary' };
  if (spo2 >= 90) return { label: 'Low', color: 'text-amber-500' };
  return { label: 'Critical', color: 'text-rose-500' };
}

function timeAgo(dateStr) {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  return `${Math.floor(secs / 3600)}h ago`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PulseRing({ active, color = '#2563eb' }) {
  return active ? (
    <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: color }} />
  ) : null;
}

function AnimatedNumber({ value, unit = '' }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    if (!value || value === '--') return;
    const target = Number(value);
    const duration = 800;
    const step = 16;
    const steps = duration / step;
    const increment = (target - displayed) / steps;
    let current = displayed;
    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
        setDisplayed(target);
        clearInterval(timer);
      } else {
        setDisplayed(Math.round(current));
      }
    }, step);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{displayed || value}{unit}</span>;
}

function SparkLine({ data = [], color = '#2563eb', height = 40 }) {
  if (!data.length) return <div style={{ height }} className="flex items-center text-slate-300 text-xs">No data</div>;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 120;
  const h = height;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1 || 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle
        cx={data.length > 1 ? ((data.length - 1) / (data.length - 1)) * w : 0}
        cy={h - ((data[data.length - 1] - min) / range) * (h - 4) - 2}
        r="3" fill={color}
      />
    </svg>
  );
}

function CircularProgress({ value, max, color = '#2563eb', size = 80 }) {
  const pct = Math.min(value / max, 1);
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth="6" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s ease' }}
      />
    </svg>
  );
}

// ─── Connect Screen ─────────────────────────────────────────────────────────

function ConnectScreen() {
  const handleConnect = () => {
    window.location.href = `http://localhost:5000/api/auth/google`;
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-10 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-40 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center max-w-lg"
      >
        {/* Smartwatch Icon */}
        <div className="relative inline-block mb-8">
          <div className="w-28 h-28 rounded-[2.5rem] bg-gradient-to-br from-brand-primary to-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/30 mx-auto">
            <HiOutlineDevicePhoneMobile className="text-white text-5xl" />
          </div>
          <motion.div
            className="absolute -top-2 -right-2 w-8 h-8 bg-brand-secondary rounded-full flex items-center justify-center shadow-lg"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <HiOutlineHeart className="text-white text-base" />
          </motion.div>
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 mb-3 font-['Outfit']">
          Connect Your Smart Device
        </h1>
        <p className="text-sm text-slate-500 mb-2 leading-relaxed">
          Link your Google Fit account to pull live biometric data — heart rate, SpO₂, steps, respiratory rate, and more.
        </p>
        <p className="text-xs text-slate-400 mb-8">
          Data is securely fetched via Google OAuth 2.0. We never store your credentials.
        </p>

        {/* Feature Pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {['Heart Rate', 'Blood Oxygen', 'Daily Steps', 'Respiratory Rate', 'Est. Blood Pressure'].map((f) => (
            <span key={f} className="text-[11px] font-bold px-3 py-1.5 bg-brand-primary/5 text-brand-primary rounded-full border border-brand-primary/10">
              {f}
            </span>
          ))}
        </div>

        <motion.button
          onClick={handleConnect}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.97 }}
          className="group inline-flex items-center gap-3 px-8 py-4 bg-brand-primary text-white rounded-2xl font-bold text-sm shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" className="flex-shrink-0">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Connect with Google Fit
          <HiOutlineChevronRight className="group-hover:translate-x-1 transition-transform" />
        </motion.button>

        <p className="text-[10px] text-slate-400 mt-4 font-medium uppercase tracking-widest">
          Secured by Google OAuth 2.0
        </p>
      </motion.div>
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  const shimmer = "animate-pulse bg-slate-100 rounded-2xl";
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#fbfcfd]">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className={`h-16 w-64 ${shimmer}`} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`h-44 ${shimmer}`} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`h-56 lg:col-span-2 ${shimmer}`} />
          <div className={`h-56 ${shimmer}`} />
        </div>
      </div>
    </div>
  );
}

// ─── Metric Card ──────────────────────────────────────────────────────────────

function MetricCard({ icon, label, value, unit, sub, subColor, history, ringColor, pulse, extra }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden"
    >
      {/* Subtle gradient shimmer on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem]`}
        style={{ background: `radial-gradient(ellipse at top left, ${ringColor}10 0%, transparent 70%)` }} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: `${ringColor}15`, color: ringColor }}>
                {icon}
              </div>
              {pulse && <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
                style={{ background: ringColor }}>
                <PulseRing active color={ringColor} />
              </span>}
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{label}</p>
          </div>
          {history?.length > 1 && (
            <SparkLine data={history} color={ringColor} height={32} />
          )}
        </div>

        <div className="mb-1">
          <span className="text-4xl font-extrabold text-slate-900">
            {value !== undefined && value !== 0 ? <AnimatedNumber value={value} /> : <span className="text-slate-300">--</span>}
          </span>
          {value ? <span className="text-sm font-medium text-slate-400 ml-1">{unit}</span> : null}
        </div>

        {sub && (
          <p className={`text-[11px] font-bold uppercase tracking-widest ${subColor || 'text-slate-400'}`}>
            {sub}
          </p>
        )}
        {extra}
      </div>
    </motion.div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

function HealthDashboard({ data, history, summary, onDisconnect }) {
  const hrZone = getHeartRateZone(data?.heartRate);
  const spo2Status = getSpO2Status(data?.oxygenSaturation);
  const bp = estimateBloodPressure(data?.heartRate, data?.respiratoryRate);
  const stepPct = Math.min(((summary?.totalSteps || data?.steps || 0) / STEP_GOAL) * 100, 100);

  const hrHistory = history.map(h => h.heartRate).filter(Boolean);
  const spo2History = history.map(h => h.oxygenSaturation).filter(Boolean);
  const rrHistory = history.map(h => h.respiratoryRate).filter(Boolean);
  const stepHistory = history.map(h => h.steps).filter(Boolean);

  const totalSteps = summary?.totalSteps || data?.steps || 0;

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#fbfcfd] custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 font-['Outfit']">Live Health Data</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-secondary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-secondary" />
              </span>
              <p className="text-xs text-slate-400 font-medium">
                Live • Google Fit • Last sync: {timeAgo(data?.timestamp)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-brand-secondary/5 border border-brand-secondary/10 rounded-xl">
              <HiOutlineCheckCircle className="text-brand-secondary" />
              <span className="text-xs font-bold text-brand-secondary">Google Fit Connected</span>
            </div>
            <button
              onClick={onDisconnect}
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-500 hover:border-rose-100 hover:bg-rose-50 transition-all"
            >
              <HiMiniArrowLeftOnRectangle />
              Disconnect
            </button>
          </div>
        </div>

        {/* ── Source Badge ── */}
        {data?.source === 'mock' && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl text-xs font-bold text-amber-600 w-fit">
            <HiOutlineSignal />
            Showing estimated data — Google Fit returned empty results. Sync with a device for live metrics.
          </div>
        )}

        {/* ── Primary Metric Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Heart Rate */}
          <MetricCard
            icon={<HiOutlineHeart />}
            label="Heart Rate"
            value={data?.heartRate}
            unit="bpm"
            sub={hrZone.label}
            subColor={hrZone.color}
            history={hrHistory}
            ringColor="#ef4444"
            pulse={!!data?.heartRate}
          />

          {/* SpO2 */}
          <MetricCard
            icon={<HiOutlineBeaker />}
            label="Blood Oxygen"
            value={data?.oxygenSaturation}
            unit="%"
            sub={spo2Status.label}
            subColor={spo2Status.color}
            history={spo2History}
            ringColor="#6366f1"
          />

          {/* Respiratory Rate */}
          <MetricCard
            icon={<HiOutlineWifi />}
            label="Respiratory Rate"
            value={data?.respiratoryRate}
            unit="br/min"
            sub={data?.respiratoryRate ? (data.respiratoryRate < 12 ? 'Low' : data.respiratoryRate > 20 ? 'Elevated' : 'Normal') : '—'}
            subColor={!data?.respiratoryRate ? 'text-slate-400' : data.respiratoryRate < 12 || data.respiratoryRate > 20 ? 'text-amber-500' : 'text-brand-secondary'}
            history={rrHistory}
            ringColor="#0ea5e9"
          />

          {/* Estimated Blood Pressure */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden group"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem]"
              style={{ background: 'radial-gradient(ellipse at top left, #f43f5e10 0%, transparent 70%)' }} />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: '#f43f5e15', color: '#f43f5e' }}>
                  <HiOutlineBolt />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Est. Blood Pressure</p>
              </div>
              <p className="text-4xl font-extrabold text-slate-900 mb-1">
                {data?.heartRate ? (
                  <><AnimatedNumber value={bp.systolic} /><span className="text-slate-300 font-medium">/</span><AnimatedNumber value={bp.diastolic} /></>
                ) : <span className="text-slate-300">--/--</span>}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">mmHg (Estimated)</p>
              <p className="text-[9px] text-slate-300 mt-1 leading-tight">Derived metric. Not medical grade.</p>
            </div>
          </motion.div>
        </div>

        {/* ── Steps + Summary Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Steps Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Daily Steps</p>
                <h3 className="text-3xl font-extrabold text-slate-900">
                  <AnimatedNumber value={totalSteps} />
                  <span className="text-sm font-medium text-slate-400 ml-2">/ {STEP_GOAL.toLocaleString()} goal</span>
                </h3>
              </div>
              <div className="relative flex items-center justify-center">
                <CircularProgress value={totalSteps} max={STEP_GOAL} color="#10b981" size={90} />
                <div className="absolute text-center">
                  <p className="text-sm font-extrabold text-brand-secondary">{Math.round(stepPct)}%</p>
                </div>
              </div>
            </div>

            {/* Step progress bar */}
            <div className="space-y-2">
              <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stepPct}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-brand-secondary to-emerald-400"
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>0</span>
                <span>{STEP_GOAL.toLocaleString()} steps</span>
              </div>
            </div>

            {stepPct >= 100 && (
              <div className="mt-4 flex items-center gap-2 text-brand-secondary text-xs font-bold">
                <HiOutlineCheckCircle className="text-base" /> Goal reached today!
              </div>
            )}

            {/* Step sparkline */}
            {stepHistory.length > 1 && (
              <div className="mt-4 pt-4 border-t border-slate-50">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Recent Readings</p>
                <SparkLine data={stepHistory.slice(-20)} color="#10b981" height={40} />
              </div>
            )}
          </motion.div>

          {/* Today's Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 space-y-5"
          >
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Today's Summary</p>

            {[
              {
                label: 'Avg Heart Rate',
                value: summary?.avgHeartRate ? `${summary.avgHeartRate} bpm` : '--',
                color: 'text-rose-500',
              },
              {
                label: 'Max Heart Rate',
                value: summary?.maxHeartRate ? `${summary.maxHeartRate} bpm` : '--',
                color: 'text-rose-400',
              },
              {
                label: 'Total Steps',
                value: summary?.totalSteps ? summary.totalSteps.toLocaleString() : '--',
                color: 'text-brand-secondary',
              },
              {
                label: 'Data Records',
                value: summary?.records ?? '--',
                color: 'text-brand-primary',
              },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</span>
                <span className={`text-sm font-extrabold ${item.color}`}>{item.value}</span>
              </div>
            ))}

            <div className="flex items-center gap-2 pt-2">
              <HiOutlineClock className="text-slate-300 text-base" />
              <span className="text-[10px] text-slate-400">Refreshes every 15s</span>
            </div>
          </motion.div>
        </div>

        {/* ── History Table ── */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm"
          >
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
              Recent Readings ({history.length})
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-50">
                    {['Time', 'HR (bpm)', 'SpO₂ (%)', 'Steps', 'Resp. Rate', 'Source'].map((h) => (
                      <th key={h} className="text-left py-3 px-4 font-bold text-slate-400 uppercase tracking-widest text-[9px]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...history].reverse().slice(0, 10).map((row, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-500">{timeAgo(row.timestamp)}</td>
                      <td className="py-3 px-4 font-bold text-rose-500">{row.heartRate || '--'}</td>
                      <td className="py-3 px-4 font-bold text-indigo-500">{row.oxygenSaturation || '--'}</td>
                      <td className="py-3 px-4 font-bold text-brand-secondary">{row.steps?.toLocaleString() || '--'}</td>
                      <td className="py-3 px-4 font-bold text-sky-500">{row.respiratoryRate || '--'}</td>
                      <td className="py-3 px-4">
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          row.source === 'google_fit'
                            ? 'bg-brand-secondary/10 text-brand-secondary'
                            : 'bg-amber-100 text-amber-600'
                        }`}>
                          {row.source === 'google_fit' ? 'Google Fit' : 'Mock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const SmartDevices = () => {
  const [isCollapsed, setCollapsed] = useState(false);
  const [status, setStatus] = useState('checking'); // checking | disconnected | loading | connected
  const [liveData, setLiveData] = useState(null);
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);
  const pollRef = useRef(null);

  // Check URL params on mount (after OAuth redirect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const auth = params.get('auth');
    if (auth === 'success') {
      // Clean URL
      window.history.replaceState({}, '', '/smart-devices');
      setStatus('loading');
      loadData();
    } else if (auth === 'error') {
      setError(`Google Fit authorization failed: ${params.get('reason') || 'unknown error'}`);
      window.history.replaceState({}, '', '/smart-devices');
      setStatus('disconnected');
    } else {
      checkConnection();
    }
  }, []);

  async function checkConnection() {
    try {
      const res = await fetch(`http://localhost:5000/api/auth/status`);
      const json = await res.json();
      if (json.connected) {
        setStatus('loading');
        loadData();
      } else {
        setStatus('disconnected');
      }
    } catch {
      setStatus('disconnected');
    }
  }

  async function loadData() {
    try {
      const [latestRes, historyRes, summaryRes] = await Promise.all([
        fetch(`${API_BASE}/data/latest`),
        fetch(`${API_BASE}/data/history?limit=50`),
        fetch(`${API_BASE}/data/summary/today`),
      ]);

      const latestJson = await latestRes.json();
      const historyJson = await historyRes.json();
      const summaryJson = await summaryRes.json();

      setLiveData(latestJson.data);
      setHistory(historyJson.data || []);
      setSummary(summaryJson);
      setStatus('connected');

      // Set up Socket.IO for live updates
      setupSocket();
      // Also poll REST every 15s as fallback
      setupPoll();
    } catch (err) {
      setError('Failed to load health data: ' + err.message);
      setStatus('disconnected');
    }
  }

  function setupSocket() {
    // Dynamically import socket.io-client
    import('socket.io-client').then(({ io }) => {
      if (socketRef.current) return;
      const socket = io('http://localhost:5000', { transports: ['websocket', 'polling'] });
      socketRef.current = socket;

      socket.on('googlefit_update', (data) => {
        setLiveData(data);
        setHistory(prev => {
          const updated = [...prev, data];
          return updated.slice(-50);
        });
      });
    }).catch(() => {
      // Socket.IO not available, use polling fallback
    });
  }

  function setupPoll() {
    if (pollRef.current) return;
    pollRef.current = setInterval(async () => {
      try {
        const [latestRes, summaryRes] = await Promise.all([
          fetch(`${API_BASE}/data/latest`),
          fetch(`${API_BASE}/data/summary/today`),
        ]);
        const latestJson = await latestRes.json();
        const summaryJson = await summaryRes.json();
        if (latestJson.data) setLiveData(latestJson.data);
        setSummary(summaryJson);
      } catch {}
    }, 15000);
  }

  async function handleDisconnect() {
    try {
      await fetch(`http://localhost:5000/api/auth/disconnect`, { method: 'DELETE' });
      if (socketRef.current) { socketRef.current.disconnect(); socketRef.current = null; }
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
      setLiveData(null);
      setHistory([]);
      setSummary(null);
      setStatus('disconnected');
    } catch (err) {
      console.error('Disconnect failed:', err);
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  return (
    <div className="flex h-screen bg-brand-bg text-slate-900 overflow-hidden font-sans">
      <NeuralSidebar isCollapsed={isCollapsed} setCollapsed={setCollapsed} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 px-10 flex items-center justify-between bg-white border-b border-slate-100 z-40 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary text-xl">
              <HiOutlineDevicePhoneMobile />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Smart Devices</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Google Fit Integration</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {status === 'connected' && (
              <motion.button
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
                onClick={loadData}
                className="p-2.5 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-brand-primary"
              >
                <HiOutlineArrowPath className="text-lg" />
              </motion.button>
            )}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold ${
              status === 'connected'
                ? 'bg-brand-secondary/10 text-brand-secondary'
                : status === 'disconnected'
                ? 'bg-slate-100 text-slate-400'
                : 'bg-amber-50 text-amber-500'
            }`}>
              {status === 'connected' ? <HiOutlineCheckCircle /> : 
               status === 'disconnected' ? <HiOutlineXCircle /> : 
               <HiOutlineArrowPath className="animate-spin" />}
              {status === 'connected' ? 'Connected' : status === 'disconnected' ? 'Disconnected' : 'Connecting...'}
            </div>
          </div>
        </header>

        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-rose-50 border-b border-rose-100 px-10 py-3 flex items-center justify-between"
            >
              <p className="text-xs font-bold text-rose-500">{error}</p>
              <button onClick={() => setError(null)} className="text-rose-300 hover:text-rose-500 text-lg leading-none">×</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {status === 'checking' || status === 'loading' ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LoadingSkeleton />
            </motion.div>
          ) : status === 'disconnected' ? (
            <motion.div key="connect" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex">
              <ConnectScreen />
            </motion.div>
          ) : (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col overflow-hidden">
              <HealthDashboard
                data={liveData}
                history={history}
                summary={summary}
                onDisconnect={handleDisconnect}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SmartDevices;

